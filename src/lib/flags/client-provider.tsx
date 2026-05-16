'use client';

import { createContext, useContext } from 'react';

import type { FeatureFlags } from '@/lib/flags';

const FlagsContext = createContext<FeatureFlags | null>(null);

type FlagsClientProviderProps = Readonly<{
  children: React.ReactNode;
  flags: FeatureFlags;
}>;

function FlagsClientProvider({ children, flags }: FlagsClientProviderProps): React.JSX.Element {
  return <FlagsContext.Provider value={flags}>{children}</FlagsContext.Provider>;
}

function useFlags(): FeatureFlags {
  const flags = useContext(FlagsContext);

  if (!flags) {
    throw new Error('useFlags must be used within FlagsClientProvider.');
  }

  return flags;
}

export { FlagsClientProvider, useFlags };
