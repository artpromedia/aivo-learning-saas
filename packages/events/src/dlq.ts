import type { NatsConnection } from "nats";
import { StringCodec } from "nats";

const sc = StringCodec();

export const DLQ_STREAM = "AIVO_DLQ";
export const DLQ_SUBJECT_PREFIX = "dlq.";
export const MAX_DELIVER = 5;

export interface DlqMessage {
  originalSubject: string;
  originalData: string;
  error: string;
  failedAt: string;
  deliveryCount: number;
  service: string;
}

export async function provisionDlqStream(nc: NatsConnection): Promise<void> {
  let jsm;
  try {
    jsm = await nc.jetstreamManager();
  } catch {
    return;
  }

  try {
    await jsm.streams.info(DLQ_STREAM);
  } catch {
    await jsm.streams.add({
      name: DLQ_STREAM,
      subjects: [`${DLQ_SUBJECT_PREFIX}>`],
      retention: "limits" as never,
      storage: "file" as never,
      max_age: 30 * 24 * 60 * 60 * 1_000_000_000,
      max_bytes: 100 * 1024 * 1024,
    });
  }
}

export async function publishToDlq(
  nc: NatsConnection,
  originalSubject: string,
  originalData: string,
  error: string,
  deliveryCount: number,
  service: string,
): Promise<void> {
  const js = nc.jetstream();
  const dlqMessage: DlqMessage = {
    originalSubject,
    originalData,
    error: error.substring(0, 2000),
    failedAt: new Date().toISOString(),
    deliveryCount,
    service,
  };

  const dlqSubject = `${DLQ_SUBJECT_PREFIX}${originalSubject}`;
  await js.publish(dlqSubject, sc.encode(JSON.stringify(dlqMessage)));
}
