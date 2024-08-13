import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../asserts/images/logo.svg";
import ethimg from "../../asserts/images/Etherium.svg";
import discord from "../../asserts/images/discord.svg";
import opensea from "../../asserts/images/opensea.svg";
import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import CategoryMenu from "./CategoryMenu";
import {
  CURRENCY,
  useCurrencySelector,
} from "../../providers/CurrencySelector/currencySelectorProvider";

function Header() {
  const { currency, updateCurrency } = useCurrencySelector();
  const handleCurrencyChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateCurrency(event.target.value as CURRENCY);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header>
      <nav className="w-full h-10 bg-secondary-2 flex justify-between px-5 items-center">
        <div className="flex items-center space-x-3 max-h-4 justify-center">
          <Link to="/">
            <img src={ethimg} alt="Ethereum" />
          </Link>
          <Link to="/">
            <img src={discord} alt="Discord" />
          </Link>
          <Link to="/">
            <img src={opensea} alt="OpenSea" />
          </Link>
        </div>
        <div className="flex items-center text-sm space-x-5 font-medium">
          <div className="currency-switcher">
            <select
              id="currency-switcher-select"
              onChange={handleCurrencyChange}
              value={currency.symbol}
            >
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
            </select>
          </div>
          <span>Current Currency: {currency.symbol}</span>
          <Link to="/about">About Us</Link>
          <Link to="/contact">FAQs</Link>
        </div>
      </nav>
      <nav className="md:flex w-full h-20 px-5 justify-between items-center shadow-md bg-white">
        <ul className="toplink flex space-x-4 lg:space-x-16 text-lg text-black-2 items-end">
          <Link to="/">
            <img src={logo} alt="Logo" className="w-44 h-8 clogo" />
          </Link>
          <Link to="/">Mint it now</Link>
          <Link to="/redeem">Redeem</Link>
          <Link to="/">Drops</Link>
        </ul>
        <div className="w-1/2">
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-4xl mx-auto py-6"
          >
            <label htmlFor="search-input" className="sr-only">
              Search
            </label>
            <div className="relative">
              <div className="absolute px-4 py-2 inset-y-0 left-6 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="search"
                id="search-input"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Watch, Jewellery, Sports Memorabilia, Trading Card..."
                className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-white bg-yellow-500 text-white rounded-lg shadow-lg focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
              >
                Search
              </button>
            </div>
          </form>
        </div>
        <div className="flex items-center space-x-8 walletblock">
          <ConnectButton
            showBalance={{
              smallScreen: true,
              largeScreen: true,
            }}
          />
        </div>
      </nav>
      <div>
        <CategoryMenu />
      </div>
    </header>
  );
}

export default Header;
