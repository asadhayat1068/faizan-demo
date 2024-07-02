import logo from "../../asserts/images/logo.svg";
import ethimg from "../../asserts/images/Etherium.svg";
import discord from "../../asserts/images/discord.svg";
import opensea from "../../asserts/images/opensea.svg";
import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import CategoryMenu from './CategoryMenu';
import {
  CURRENCY,
  useCurrencySelector,
} from "../../providers/CurrencySelector/currencySelectorProvider";
function Header() {
  const { updateCurrency } = useCurrencySelector();
  const handleCurrencyChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateCurrency(event.target.value as CURRENCY);
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
            >
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
            </select>
          </div>

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
        <div className="flex items-center space-x-8 walletblock">
          <ConnectButton />
        </div>
      </nav>
      <div> 
     
      <CategoryMenu />
   
    </div>
    </header>
  );
}

export default Header;
