import { useAddress, useDisconnect, useMetamask } from '@thirdweb-dev/react';
import type { NextPage } from 'next';
import { ConnectWallet } from '../components/ConnectWallet';
import styled from 'styled-components'
import { Button, TextField, Title } from '@gnosis.pm/safe-react-components';
import BalancesTable from '../components/BalancesTable';
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import { useSafeBalances } from '../hooks/useSafeBalances';
import { getTransferTransaction } from '../api/transfers';
import { useState } from 'react';
import SafeAppsSDK, { TokenBalance } from '@gnosis.pm/safe-apps-sdk';

const Container = styled.div`
  padding: 1rem;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Home: NextPage = () => {
  return(
    <div>
      <ConnectWallet />
    </div>
  )
};

export default Home;
