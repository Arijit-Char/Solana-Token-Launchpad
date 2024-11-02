import React from 'react'
import './App.scss'
import TokenLaunchpad from './TokenLaunchpad'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
function App() {

  return (
    <div>
      <ConnectionProvider endpoint={"https://solana-devnet.g.alchemy.com/v2/R9GU0hMRumdyZ1wQvpvDBXHBsGWzJM67"}>
        <WalletProvider wallets={[]} autoConnect>
            <WalletModalProvider>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 20
              }}>
                <WalletMultiButton />
                <WalletDisconnectButton />
              </div>
              <TokenLaunchpad/>
            </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  )
}

export default App
