import type { Redis } from "ioredis";
import type { NatsConnection, Subscription } from "nats";
import { StringCodec } from "nats";
import { FlagCache } from "./cache.js";
import { evaluateFlag } from "./evaluator.js";
import type { EvalContext, FlagChangeEvent, FlagDefinition } from "./types.js";

const sc = StringCodec();

export interface FeatureFlagClientOptions {
  redis: Redis;
  nats?: NatsConnection;
  serviceName: string;
}

export class FeatureFlagClient {
  private cache: FlagCache;
  private nats?: NatsConnection;
  private subscription?: Subscription;
  private serviceName: string;

  constructor(options: FeatureFlagClientOptions) {
    this.cache = new FlagCache(options.redis);
    this.nats = options.nats;
    this.serviceName = options.serviceName;
  }

  async isEnabled(key: string, context?: EvalContext): Promise<boolean> {
    const result = await this.evaluate(key, context);
    return Boolean(result);
  }

  async getValue<T>(key: string, context?: EvalContext): Promise<T> {
    const result = await this.evaluate(key, context);
    return result as T;
  }

  async evaluateAll(
    keys: string[],
    context?: EvalContext,
  ): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {};
    await Promise.all(
      keys.map(async (key) => {
        results[key] = await this.evaluate(key, context);
      }),
    );
    return results;
  }

  startListening(): void {
    if (!this.nats) return;

    this.subscription = this.nats.subscribe("aivo.featureflag.changed", {
      queue: `ff-listener-${this.serviceName}`,
    });

    void this.processMessages();
  }

  stopListening(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }
  }

  private async processMessages(): Promise<void> {
    if (!this.subscription) return;

    for await (const msg of this.subscription) {
      try {
        const event = JSON.parse(sc.decode(msg.data)) as FlagChangeEvent;
        this.cache.invalidate(event.key);
        if (event.overrideTenantId) {
          this.cache.invalidate(`${event.key}:${event.overrideTenantId}`);
        }
      } catch {
        // ignore malformed messages
      }
    }
  }

  private async evaluate(
    key: string,
    context?: EvalContext,
  ): Promise<unknown> {
    const flag = await this.cache.getFlag(key);
    if (!flag) return false;

    let overrideValue: unknown | undefined;
    if (context?.tenantId) {
      const override = await this.cache.getOverride(key, context.tenantId);
      if (override !== null) {
        overrideValue = override;
      }
    }

    return evaluateFlag(flag, context, overrideValue);
  }
}
