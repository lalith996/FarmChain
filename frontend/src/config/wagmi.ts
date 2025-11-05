import { http, createConfig } from 'wagmi';
import { polygonMumbai, polygon, hardhat } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

export const config = createConfig({
  chains: [polygonMumbai, polygon, hardhat],
  connectors: [
    injected(),
    walletConnect({ projectId }),
  ],
  transports: {
    [polygonMumbai.id]: http(),
    [polygon.id]: http(),
    [hardhat.id]: http(),
  },
});
