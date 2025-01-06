import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient } from "@tanstack/react-query";
import { hardhat, mainnet, avalancheFuji } from "wagmi/chains";

const cHardHat = {
  ...hardhat,
  id: 1,
};
export const defaultConfig = getDefaultConfig({
  appName: "Cryptrovia",
  projectId: (process.env.REACT_APP_PROJECT_ID || "").toString(),
  chains: [mainnet, avalancheFuji],
  ssr: false,
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
