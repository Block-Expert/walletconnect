import { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk"
import SafeAppsSDK from "@gnosis.pm/safe-apps-sdk/dist/src/sdk"
import { useSafeAppConnection, SafeAppConnector } from '@gnosis.pm/safe-apps-web3-react'
import { Button, Container, TextField } from "@material-ui/core"

import {
  useMetamask,
  useWalletConnect,
  useCoinbaseWallet,
  useNetwork,
  useAddress,
  useGnosis,
  useSigner,
  useDisconnect
} from "@thirdweb-dev/react"
import BigNumber from "bignumber.js"
import { useEffect, useState } from "react"
import { getTransferTransaction } from "../api/transfers"
import { useSafeBalances } from "../hooks/useSafeBalances"

const safeMultisigConnector = new SafeAppConnector();

export const ConnectWallet = () => {
  const connectWithCoinbaseWallet = useCoinbaseWallet()
  const connectWithMetamask = useMetamask()
  const connectWithWalletConnect = useWalletConnect()
  const disconnectWallet = useDisconnect()
  const address = useAddress()
  const network = useNetwork()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState(0)
  const [balance, setBalance] = useState(0)
//  const gnosis = useGnosis()
//  const signer = useSigner()
//  const { sdk, safe } = useSafeAppsSDK();

  const getSafe = async () => {
    try {
      const res = await fetch(`https://safe-transaction.rinkeby.gnosis.io/api/v1/safes/${address}/`)
      if(res.ok)
        return res.json()
      else
        return null
    } catch(err) {
      console.log(err)
    }
  }

  const getBalances = async(addr: string) => {
    try {
      const res = await fetch(`https://safe-transaction.rinkeby.gnosis.io/api/v1/safes/${addr}/balances/?trusted=false&exclude_spam=false`)
      if(res.ok)
        return res.json()
      else
        return null
    } catch(err) {
      console.log(err)
    }
  }

  const getGasEstimation = async (safe: string, to: string, value: BigNumber) => {
    const url = `https://safe-relay.rinkeby.gnosis.io/api/v2/safes/${address}/transactions/estimate/`
    const data: any = {
      safe: safe,
      to: recipient,
      value: value,
      data: null,
      operation: 0,
      gasToken: null
    }

    const param = {
      headers: {
        "content-type": "application/json; charset=UFT-8"
      },
      body: JSON.stringify(data),
      method: "POST"
    }
    try {
      const res = await fetch(url, param)
      if(res.ok)
        return res.json()
      else 
        return null
    } catch(err) {
      console.log(err)
    }
  }

  useEffect(() => {
    async function fetchData() {
      // You can await here
      const balances = await getBalances(address ?? '');
      if(balances) {
        setBalance(balances[0].balance)
      }
    }
    fetchData()

  }, [address])
//  const [balances] = useSafeBalances(sdk);
  
  const handleTransfer = async (): Promise<void> => {
    const safe = await getSafe()
    const toAddress = '0x50D8FBA20218Ae0a91f48bbA0CE53229133Af2EF'
    console.log("safe", safe);
    if(safe === null)
      return
    // 0.01 eth
    // recipient 0x50D8FBA20218Ae0a91f48bbA0CE53229133Af2EF
    const gasEstimation = await getGasEstimation(safe.address, toAddress, new BigNumber(amount))
    console.log("gasEstimation", gasEstimation)
    if(gasEstimation === null)
      return
  };

  // If a wallet is connected, show address, chainId and disconnect button
  if(address) {
    return (
      <div>
        <Container>
          Safe Address: {address}
          <br />
          Chain ID: {network[0].data.chain && network[0].data.chain.id}
          <br />
          Balance: {balance}
          <br />

          <TextField 
            label="Recipient"
            onChange={(e) => {
              setRecipient(e.target.value)
            }}
            value={recipient}
            required={true}
            margin="normal"
          />
          <br />
          <TextField 
            label="Amount(ETH)"
            onChange={(e) => {
              setAmount(Number(e.target.value))
            }}
            value={amount}
            required={true}
            margin="normal"
          />
          <br />
          <br />
          <Button size="medium" color="primary" onClick={disconnectWallet}>Disconnect</Button>
          <Button size="medium" color="primary" onClick={()=>handleTransfer()}>Send Txs</Button>
        </Container>
      </div>
    )
  }

  // If no wallet is connected, show connect wallet options
  return (
    <div>
      <button onClick={() => connectWithCoinbaseWallet()}>
        Connect Coinbase Wallet
      </button>
      <button onClick={() => connectWithMetamask()}>Connect Metamask</button>
      <button onClick={() => connectWithWalletConnect()}>
        Connect WalletConnect
      </button>
    </div>
  )
}