import { getAllFlags } from '@/lib/flags';
import { FlagsClientProvider } from '@/lib/flags/client-provider';

type FlagsProviderProps = Readonly<{
  children: React.ReactNode;
}>;

async function FlagsProvider({ children }: FlagsProviderProps): Promise<React.JSX.Element> {
  const flags = await getAllFlags();

  return <FlagsClientProvider flags={flags}>{children}</FlagsClientProvider>;
}

export { FlagsProvider };
