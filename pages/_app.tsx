import type { AppProps } from 'next/app';
import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react';
import SafeProvider from '@gnosis.pm/safe-apps-react-sdk';

// This is the chainId your dApp will work on.
const activeChainId = ChainId.Rinkeby;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SafeProvider>
      <ThirdwebProvider desiredChainId={activeChainId} >
        <Component {...pageProps} />
      </ThirdwebProvider>
    </SafeProvider>
  );
}

export default MyApp;
