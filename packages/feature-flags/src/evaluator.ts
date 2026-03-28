import murmur from "murmurhash-js";
import type { EvalContext, FlagDefinition } from "./types.js";

export function evaluateFlag(
  flag: FlagDefinition,
  context?: EvalContext,
  overrideValue?: unknown,
): unknown {
  if (!flag.enabled) {
    return false;
  }

  if (overrideValue !== undefined) {
    return overrideValue;
  }

  switch (flag.type) {
    case "BOOLEAN":
      return flag.defaultValue;

    case "PERCENTAGE": {
      const tenantId = context?.tenantId;
      if (!tenantId) {
        return false;
      }
      const hashInput = `${flag.key}:${tenantId}`;
      const hash = murmur.murmur3(hashInput, 0);
      const bucket = hash % 100;
      const threshold =
        typeof flag.defaultValue === "number" ? flag.defaultValue : 0;
      return bucket < threshold;
    }

    case "TENANT_LIST": {
      const tid = context?.tenantId;
      if (!tid) {
        return false;
      }
      const list = Array.isArray(flag.defaultValue) ? flag.defaultValue : [];
      return list.includes(tid);
    }

    default:
      return false;
  }
}
