import type { NatsConnection, RetentionPolicy, StorageType, OrderedConsumerOptions } from "nats";
import { StringCodec } from "nats";
import type { z } from "zod";
import { SUBJECTS, type EventName } from "./subjects.js";
import { JETSTREAM_STREAMS } from "./jetstream.js";
import {
  ASSESSMENT_SCHEMAS,
  BRAIN_SCHEMAS,
  TUTOR_SCHEMAS,
  HOMEWORK_SCHEMAS,
  LEARNING_SCHEMAS,
  ENGAGEMENT_SCHEMAS,
  BILLING_SCHEMAS,
  COMMS_SCHEMAS,
  IDENTITY_SCHEMAS,
  ADMIN_SCHEMAS,
  INTEGRATIONS_SCHEMAS,
  STATUS_SCHEMAS,
  RESEARCH_SCHEMAS,
  FEATURE_FLAG_SCHEMAS,
} from "./schemas/index.js";

const sc = StringCodec();

function resolveStreamForSubject(subject: string): string {
  for (const stream of JETSTREAM_STREAMS) {
    for (const pattern of stream.subjects) {
      if (pattern === subject) return stream.name;
      if (pattern.endsWith(">") && subject.startsWith(pattern.slice(0, -1))) {
        return stream.name;
      }
    }
  }
  throw new Error(`No JetStream stream found for subject: ${subject}`);
}

export async function provisionStreams(nc: NatsConnection): Promise<void> {
  let jsm;
  try {
    jsm = await nc.jetstreamManager();
  } catch {
    return;
  }
  for (const def of JETSTREAM_STREAMS) {
    try {
      await jsm.streams.info(def.name);
    } catch {
      await jsm.streams.add({
        name: def.name,
        subjects: def.subjects,
        retention: def.retention as RetentionPolicy,
        storage: def.storage as StorageType,
        max_age: def.maxAge,
        max_bytes: def.maxBytes,
        duplicate_window: def.duplicateWindow,
      });
    }
  }
}

const ALL_SCHEMAS: Record<string, z.ZodType> = {
  ...ASSESSMENT_SCHEMAS,
  ...BRAIN_SCHEMAS,
  ...TUTOR_SCHEMAS,
  ...HOMEWORK_SCHEMAS,
  ...LEARNING_SCHEMAS,
  ...ENGAGEMENT_SCHEMAS,
  ...BILLING_SCHEMAS,
  ...COMMS_SCHEMAS,
  ...IDENTITY_SCHEMAS,
  ...ADMIN_SCHEMAS,
  ...INTEGRATIONS_SCHEMAS,
  ...STATUS_SCHEMAS,
  ...RESEARCH_SCHEMAS,
  ...FEATURE_FLAG_SCHEMAS,
};

function getSchema(eventName: string): z.ZodType {
  const schema = ALL_SCHEMAS[eventName];
  if (!schema) {
    throw new Error(`Unknown event: ${eventName}`);
  }
  return schema;
}

export async function publishEvent<T extends EventName>(
  nc: NatsConnection,
  eventName: T,
  data: z.infer<ReturnType<typeof getSchema>>,
): Promise<void> {
  const schema = getSchema(eventName);
  const validated = schema.parse(data);
  const subject = SUBJECTS[eventName];
  const js = nc.jetstream();
  await js.publish(subject, sc.encode(JSON.stringify(validated)));
}

export type EventHandler<S extends z.ZodType> = (data: z.infer<S>) => Promise<void>;

export interface Subscription {
  unsubscribe(): void;
}

export async function subscribeEvent<S extends z.ZodType>(
  nc: NatsConnection,
  eventName: EventName,
  schema: S,
  handler: EventHandler<S>,
): Promise<Subscription> {
  const subject = SUBJECTS[eventName];
  const streamName = resolveStreamForSubject(subject);
  const js = nc.jetstream();
  const consumer = await js.consumers.get(streamName, {
    filterSubjects: [subject],
  } as OrderedConsumerOptions);
  const messages = await consumer.consume();

  // Fire-and-forget: do NOT await the loop
  (async () => {
    for await (const msg of messages) {
      try {
        const raw = JSON.parse(sc.decode(msg.data));
        const validated = schema.parse(raw);
        await handler(validated);
        msg.ack();
      } catch (err) {
        msg.nak();
      }
    }
  })();

  return {
    unsubscribe() {
      messages.stop();
    },
  };
}
