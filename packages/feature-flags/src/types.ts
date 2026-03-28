export interface EvalContext {
  tenantId?: string;
  userId?: string;
  attributes?: Record<string, unknown>;
}

export interface FlagDefinition {
  key: string;
  type: "BOOLEAN" | "PERCENTAGE" | "TENANT_LIST";
  defaultValue: unknown;
  enabled: boolean;
}

export interface FlagChangeEvent {
  key: string;
  type: "BOOLEAN" | "PERCENTAGE" | "TENANT_LIST";
  enabled: boolean;
  defaultValue: unknown;
  overrideTenantId?: string;
  changedBy: string;
  changedAt: string;
}
