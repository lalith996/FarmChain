import { http, createConfig } from 'wagmi';
import { polygon, hardhat } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';
import { defineChain } from 'viem';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Define Polygon Amoy testnet (replacement for deprecated Mumbai)
export const polygonAmoy = defineChain({
  id: 80002,
  name: 'Polygon Amoy',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-amoy.polygon.technology'],
    },
    public: {
      http: ['https://rpc-amoy.polygon.technology'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PolygonScan',
      url: 'https://www.oklink.com/amoy',
    },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [polygonAmoy, polygon, hardhat],
  connectors: [
    injected(),
    walletConnect({ projectId }),
  ],
  transports: {
    [polygonAmoy.id]: http(),
    [polygon.id]: http(),
    [hardhat.id]: http(),
  },
});
