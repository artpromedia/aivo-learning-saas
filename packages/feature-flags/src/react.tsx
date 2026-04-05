import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface FeatureFlagContextValue {
  flags: Record<string, unknown>;
  loading: boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue>({
  flags: {},
  loading: true,
});

interface FeatureFlagProviderProps {
  children: ReactNode;
  endpoint: string;
  refreshInterval?: number;
}

export function FeatureFlagProvider({
  children,
  endpoint,
  refreshInterval = 60_000,
}: FeatureFlagProviderProps): React.JSX.Element {
  const [flags, setFlags] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  const fetchFlags = useCallback(async () => {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = (await response.json()) as Record<string, unknown>;
        setFlags(data);
      }
    } catch {
      // silently fail - keep existing flags
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void fetchFlags();

    const interval = setInterval(() => {
      void fetchFlags();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchFlags, refreshInterval]);

  const value = useMemo(() => ({ flags, loading }), [flags, loading]);

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlag(
  key: string,
  defaultValue: boolean = false,
): boolean {
  const { flags } = useContext(FeatureFlagContext);
  const value = flags[key];
  if (value === undefined) return defaultValue;
  return Boolean(value);
}

export function useFeatureFlags(keys: string[]): Record<string, unknown> {
  const { flags } = useContext(FeatureFlagContext);
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    result[key] = flags[key] ?? false;
  }
  return result;
}
