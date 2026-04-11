import CircuitBreaker from "opossum";

export interface CircuitBreakerOptions {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
  rollingCountTimeout?: number;
  rollingCountBuckets?: number;
  volumeThreshold?: number;
  name?: string;
}

export const TIMEOUT_DEFAULTS = {
  DEFAULT: 5_000,
  BRAIN: 10_000,
  AI: 30_000,
  AI_VISION: 60_000,
} as const;

const CB_DEFAULTS: Required<CircuitBreakerOptions> = {
  timeout: TIMEOUT_DEFAULTS.DEFAULT,
  errorThresholdPercentage: 50,
  resetTimeout: 30_000,
  rollingCountTimeout: 10_000,
  rollingCountBuckets: 10,
  volumeThreshold: 5,
  name: "service-call",
};

export interface ResilientFetchOptions extends RequestInit {
  timeoutMs?: number;
}

export function createCircuitBreaker<T>(
  fn: (...args: unknown[]) => Promise<T>,
  options: CircuitBreakerOptions = {},
): CircuitBreaker<unknown[], T> {
  const merged = { ...CB_DEFAULTS, ...options };
  const breaker = new CircuitBreaker(fn, {
    timeout: merged.timeout,
    errorThresholdPercentage: merged.errorThresholdPercentage,
    resetTimeout: merged.resetTimeout,
    rollingCountTimeout: merged.rollingCountTimeout,
    rollingCountBuckets: merged.rollingCountBuckets,
    volumeThreshold: merged.volumeThreshold,
    name: merged.name,
  });

  return breaker;
}

export async function resilientFetch(
  url: string,
  options: ResilientFetchOptions = {},
): Promise<Response> {
  const { timeoutMs = TIMEOUT_DEFAULTS.DEFAULT, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export interface ServiceCircuitBreaker {
  fire<T>(fn: () => Promise<T>): Promise<T>;
  isOpen(): boolean;
  stats(): { failures: number; successes: number; opens: number; state: string };
}

export function createServiceBreaker(
  serviceName: string,
  options: CircuitBreakerOptions = {},
): ServiceCircuitBreaker {
  const wrappedFn = async (...args: unknown[]) => {
    const fn = args[0] as () => Promise<unknown>;
    return fn();
  };
  const breaker = createCircuitBreaker(
    wrappedFn,
    { ...options, name: serviceName },
  );

  return {
    async fire<T>(fn: () => Promise<T>): Promise<T> {
      return breaker.fire(fn) as Promise<T>;
    },
    isOpen() {
      return breaker.opened;
    },
    stats() {
      const s = breaker.stats;
      return {
        failures: s.failures,
        successes: s.successes,
        opens: 0,
        state: breaker.opened ? "open" : breaker.halfOpen ? "half-open" : "closed",
      };
    },
  };
}

export { CircuitBreaker };
