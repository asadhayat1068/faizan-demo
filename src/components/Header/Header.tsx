import React from "react";

function Header() {
  return (
    <div>
      <header className="page-header">
        <nav className="w-full h-10 bg-secondary-2 flex justify-between px-5 items-center">
          <div className="flex items-center space-x-3 max-h-4 justify-center">
            <a
              href="https://twitter.com/cryptrovia?s=21&amp;t=WLld5Cs_nqsom9trE4dwmw"
              target="_blank"
            >
              <img src="/pub/images/twitter.svg" />
            </a>
            <a href="https://discord.com/invite/8CUAqtkqcU" target="_blank">
              <img src="/pub/images/discord.svg" />
            </a>
            <a href=" https://opensea.io/collection/cryptrovia" target="_blank">
              <img src="/pub/images/opensea.svg" />
            </a>
          </div>
          <div className="flex items-center text-sm space-x-5 font-medium">
            <img className="h-5" src="/pub/images/Etherium.svg" />

            <div className="currency-switcher">
              <select
                id="currency-switcher-select"
                name="currency"
                data-action="currency-switcher"
                data-ajax-url="https://cryptrovia.com/index.php/currencyswitcher/ajax/currency/"
              >
                <option value="ETH" selected>
                  ETH{" "}
                </option>
                <option value="USC">USDC </option>
                <option value="UST">USDT </option>
              </select>
            </div>

            <a
              href="https://cryptrovia.com/index.php/about-us"
              className="text-black-1"
            >
              About us
            </a>
            <a
              href="https://cryptrovia.com/index.php/faq"
              className="text-black-1"
            >
              FAQs
            </a>
          </div>
        </nav>
      </header>
    </div>
  );
}

export default Header;
