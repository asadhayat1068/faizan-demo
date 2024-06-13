import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient } from "@tanstack/react-query";
import { mainnet } from "wagmi/chains";

export const defaultConfig = getDefaultConfig({
  appName: "Cryptrovia",
  projectId: (process.env.REACT_APP_PROJECT_ID || "").toString(),
  chains: [mainnet],
  ssr: false,
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
