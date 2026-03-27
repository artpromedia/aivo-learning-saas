export interface WebhookPayload {
  id: string;
  eventType: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export class PayloadBuilder {
  build(eventType: string, data: Record<string, unknown>): WebhookPayload {
    return {
      id: crypto.randomUUID(),
      eventType,
      timestamp: new Date().toISOString(),
      data,
    };
  }

  buildFromNatsEvent(eventType: string, rawData: unknown): WebhookPayload {
    const data = typeof rawData === "object" && rawData !== null
      ? rawData as Record<string, unknown>
      : { value: rawData };

    return this.build(eventType, data);
  }
}
