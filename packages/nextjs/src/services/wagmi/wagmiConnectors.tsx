import { getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { argentWallet, trustWallet, ledgerWallet } from '@rainbow-me/rainbowkit/wallets';
import { publicProvider } from '@wagmi/core/providers/public';
import { configureChains, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';

export const { chains, publicClient, webSocketPublicClient } = configureChains([sepolia], [publicProvider()]);

const { wallets } = getDefaultWallets({
  appName: 'SOLID-WILL',
  projectId: process.env.WALLET_CONNECT_ID,
  chains,
});

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Other',
    wallets: [
      argentWallet({ projectId: process.env.WALLET_CONNECT_ID, chains }),
      trustWallet({ projectId: process.env.WALLET_CONNECT_ID, chains }),
      ledgerWallet({ projectId: process.env.WALLET_CONNECT_ID, chains }),
    ],
  },
]);

export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});
