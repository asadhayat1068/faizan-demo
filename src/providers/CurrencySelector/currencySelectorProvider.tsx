import React, { PropsWithChildren, useContext } from "react";
import { Address, zeroAddress } from "viem";

export enum CURRENCY {
  ETH = "ETH",
  USDC = "USDC",
  USDT = "USDT",
}

export type Currency = {
  symbol: CURRENCY;
  address: Address;
  decimals: number;
  networkId: number;
};

type CurrencyAddressMap = {
  [key in CURRENCY]: Currency;
};

const currencyAddressMap: CurrencyAddressMap = {
  [CURRENCY.ETH]: {
    symbol: CURRENCY.ETH,
    address: zeroAddress,
    decimals: 18,
    networkId: 0x1,
  },
  [CURRENCY.USDC]: {
    symbol: CURRENCY.USDC,
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
    networkId: 0x1,
  },
  [CURRENCY.USDT]: {
    symbol: CURRENCY.USDT,
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 6,
    networkId: 0x1,
  },
};

export const getCurrency = (currency: CURRENCY): Currency =>
  currencyAddressMap[currency];

export interface CurrencyState {
  currency: Currency;
  updateCurrency: (currency: CURRENCY) => void;
}

const defaultCurrencyState: CurrencyState = {
  currency: getCurrency(CURRENCY.ETH),
  updateCurrency: () => {},
};

const currencyContext = React.createContext(defaultCurrencyState);

export const useCurrencySelector = () => useContext(currencyContext);

export const CurrencySelectorProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [currency, setCurrency] = React.useState<Currency>(
    getCurrency(CURRENCY.ETH)
  );
  const updateCurrency = (currency: CURRENCY) => {
    let _currency = getCurrency(currency) ?? getCurrency(CURRENCY.ETH);
    setCurrency(_currency);
  };
  return (
    <currencyContext.Provider value={{ currency, updateCurrency }}>
      {children}
    </currencyContext.Provider>
  );
};
