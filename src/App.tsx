import { Outlet } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import "./App.css";
import "./styles/tailwind.css";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import { defaultConfig, queryClient } from "./wallet";
import { QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { CurrencySelectorProvider } from "./providers/CurrencySelector/currencySelectorProvider";
import { APIProvider } from "./apiContext";
function App() {
  return (
    <div className="page-wrapper">
      <WagmiProvider config={defaultConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider modalSize="compact">
            <CurrencySelectorProvider>
              <APIProvider>
                <div id="header">
                  <Header />
                </div>
                <div id="main" className="min-h-screen">
                  <Outlet />
                </div>
                <div id="footer">
                  <Footer />
                </div>
              </APIProvider>
            </CurrencySelectorProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
}

export default App;
