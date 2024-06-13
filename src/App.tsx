import { Outlet } from "react-router-dom";
import Header from "./components/Header/Header";
import "./App.css";
import "./styles/tailwind.css";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import { defaultConfig, queryClient } from "./wallet";
import { QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

function App() {
  return (
    <div className="page-wrapper">
      <WagmiProvider config={defaultConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <div id="header">
              <Header />
            </div>
            <div id="main">
              <Outlet />
            </div>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
}

export default App;
