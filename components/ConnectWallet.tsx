import { Button, Container, TextField } from "@material-ui/core"

import {
  useMetamask,
  useWalletConnect,
  useCoinbaseWallet,
  useNetwork,
  useAddress,
  useDisconnect
} from "@thirdweb-dev/react"
import axios from "axios"
import { ethers, utils } from "ethers"
import { useEffect, useState } from "react"

import EIP712Domain from "eth-typed-data"
import * as ethUtil from 'ethereumjs-util'
import BigNumber from "bignumber.js"
import Web3Modal from 'web3modal';
import GNOSIS_SAFE_ABI from "../abis/gnosis-safe"

export const ConnectWallet = () => {
  const connectWithCoinbaseWallet = useCoinbaseWallet()
  const connectWithMetamask = useMetamask()
  const connectWithWalletConnect = useWalletConnect()
  const disconnectWallet = useDisconnect()
  const address = useAddress()
  const network = useNetwork()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState(0)

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

  const gnosisEstimateTransaction = async (safe: string, tx: any) => {
    try {
      const res = await axios.post(`https://safe-relay.rinkeby.gnosis.pm/api/v2/safes/${safe}/transactions/estimate/`, tx)
      return res.data
    } catch (err) {
      console.log(err)
    }
    return null
  }
/*
  const gnosisSubmitTx = async (safe: string, tx: any): Promise<any> => {
    try {
      const resp = await axios.post(`https://safe-relay.rinkeby.gnosis.pm/api/v1/safes/${safe}/transactions/`, tx)
      console.log(resp.data)
      return resp.data
    } catch (err) {
      console.log(err)
    }
  }
  
  const execute = async (safe: string, privateKey: string) => {
    const safeDomain = new EIP712Domain({
      verifyingContract: safe,
    });

    const SafeTx = safeDomain.createType('SafeTx', [
      { type: "address", name: "to" },
      { type: "uint256", name: "value" },
      { type: "bytes", name: "data" },
      { type: "uint8", name: "operation" },
      { type: "uint256", name: "safeTxGas" },
      { type: "uint256", name: "baseGas" },
      { type: "uint256", name: "gasPrice" },
      { type: "address", name: "gasToken" },
      { type: "address", name: "refundReceiver" },
      { type: "uint256", name: "nonce" },
    ]);
  
    const baseTxn = {
      to: recipient,
      value: amount,
      data: "0x",
      operation: 0,
    };
  
    const { safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, lastUsedNonce } = await gnosisEstimateTransaction(
      safe,
      baseTxn,
    );
  
    const txn = {
      ...baseTxn,
      safeTxGas,
      baseGas,
      gasPrice,
      gasToken,
      refundReceiver: refundReceiver || "0x0000000000000000000000000000000000000000",
      nonce: lastUsedNonce === undefined ? 0 : lastUsedNonce + 1,
    };
  
    const safeTx = new SafeTx({ 
      ...txn,
      data: utils.arrayify(txn.data)
    });

    console.log("safeTx", safeTx)

    const signer = async (data: any) => {
      let { r, s, v } = ethUtil.ecsign(data, ethUtil.toBuffer(privateKey));
      return {
        r: new BigNumber(r.toString('hex'), 16).toString(10),
        s: new BigNumber(s.toString('hex'), 16).toString(10),
        v
      }
    }
    const signature = await safeTx.sign(signer);
  
    console.log({ signature });
  
    const toSend = {
      ...txn,
      dataGas: baseGas,
      signatures: [signature],
    };
  
    console.log(JSON.stringify({ toSend }));
  
    const { data } = await gnosisSubmitTx(safe, toSend);
    console.log({data})
    console.log("Done?");
  }

  */

  const gnosisProposeTx = async (safe: string, tx: any) => {
    try {
      const res = await axios.post(`https://safe-transaction.rinkeby.gnosis.io/api/v1/safes/${safe}/transactions/`, tx)
      return res.data
    } catch(err) {
      console.log(err)
    }
  }

  const submit = async (safe: string, sender: string, privateKey: string) => {
    const safeDomain = new EIP712Domain({
      verifyingContract: safe,
    });
  
    const SafeTx = safeDomain.createType('SafeTx', [
      { type: "address", name: "to" },
      { type: "uint256", name: "value" },
      { type: "bytes", name: "data" },
      { type: "uint8", name: "operation" },
      { type: "uint256", name: "safeTxGas" },
      { type: "uint256", name: "baseGas" },
      { type: "uint256", name: "gasPrice" },
      { type: "address", name: "gasToken" },
      { type: "address", name: "refundReceiver" },
      { type: "uint256", name: "nonce" },
    ]);

    const baseTxn = {
      to: recipient,
      value: amount,
      data: "0x",
      operation: 0
    }

    const { safeTxGas, lastUsedNonce } = await gnosisEstimateTransaction(safe, baseTxn)

    const txn = {
      ...baseTxn,
      safeTxGas: safeTxGas,
      nonce: lastUsedNonce === undefined ? 0 : lastUsedNonce + 1,
      baseGas: 0,
      gasPrice: 0,
      gasToken: "0x0000000000000000000000000000000000000000",
      refundReceiver: "0x0000000000000000000000000000000000000000",
    }

    const safeTx = new SafeTx({ 
      ...txn,
      data: utils.arrayify(txn.data)
    });

    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer1 = provider.getSigner()
    const contract = new ethers.Contract(safe, GNOSIS_SAFE_ABI, signer1)

    // const contractTransactionHash = "0x" + safeTx.signHash().toString('hex')
    const contractTransactionHash = await contract.getTransactionHash(
      recipient, 
      amount, 
      utils.arrayify(txn.data), 
      safeTx.operation, 
      safeTx.safeTxGas, 
      safeTx.baseGas, 
      safeTx.gasPrice, 
      safeTx.gasToken, 
      safeTx.refundReceiver, 
      safeTx.nonce
    )
    
    const getSignature = async (data: any) => {
      let {r, s, v} = ethUtil.ecsign(data, ethUtil.toBuffer(privateKey))
      return ethUtil.toRpcSig(v, r, s)
    }

    // const signature = await safeTx.sign(getSignature)
    const signature = await getSignature(ethUtil.toBuffer(contractTransactionHash))

    const toSend = {
      ...txn,
      sender,
      contractTransactionHash,//"0x" + safeTx.signHash().toString('hex'),
      signature,
    }

    const data = await gnosisProposeTx(safe, toSend)
  }

  const handleTransfer = async (): Promise<void> => {
    const safe = await getSafe()
    const signer = '0x6a2EB7F6734F4B79104A38Ad19F1c4311e5214c8'
    const privateKey = '0x66e91912f68828c17ad3fee506b7580c4cd19c7946d450b4b0823ac73badc878'

//    await execute(address ?? '', privateKey)
    await submit(address ?? '', signer, privateKey)
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