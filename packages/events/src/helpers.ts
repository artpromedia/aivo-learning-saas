import type { NatsConnection, JetStreamClient } from "nats";
import { StringCodec } from "nats";
import type { z } from "zod";
import { SUBJECTS, type EventName } from "./subjects.js";
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
  RESEARCH_SCHEMAS,
  FEATURE_FLAG_SCHEMAS,
} from "./schemas/index.js";

const sc = StringCodec();

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

export async function subscribeEvent<S extends z.ZodType>(
  nc: NatsConnection,
  eventName: EventName,
  schema: S,
  handler: EventHandler<S>,
): Promise<void> {
  const subject = SUBJECTS[eventName];
  const js = nc.jetstream();
  const consumer = await js.consumers.get(subject);
  const messages = await consumer.consume();

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
}
