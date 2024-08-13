import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useCurrencySelector } from "../providers/CurrencySelector/currencySelectorProvider";
import { CrossmintPayButton } from "@crossmint/client-sdk-react-ui";
import { parseEther, zeroAddress } from "viem";
import MintModal from "./Modal/MintModal";
import MintWithERC20Modal from "./Modal/MintWithERC20Modal";

interface MintButtonProps {
  sku: string;
  quantity: number;
  price_eth: number;
  price_usd: number;
}

const USD_THRESHOLD = 10;

const MintButton: React.FC<MintButtonProps> = ({
  sku,
  quantity,
  price_usd,
  price_eth,
}) => {
  const account = useAccount();
  const { currency } = useCurrencySelector();
  const [showMintModal, setShowMintModal] = useState<boolean>(false);

  const handleMint = async () => {
    setShowMintModal(true);
  };

  return (
    <>
      {price_usd > USD_THRESHOLD ? (
        <button
          disabled={!account.isConnected}
          type="button"
          onClick={handleMint}
          className={`${account.isConnected ? "bg-yellow-500" : "bg-gray-500"}
        h-11 w-40 text-white  rounded-lg shadow-lg hover:bg-yellow-600 transition duration-300 ease-in-out`}
        >
          Mint Now
        </button>
      ) : (
        <CrossmintPayButton
          collectionId="ff91bb00-26b8-4208-9585-12334cf9ec84"
          projectId="ea7fb246-7226-4867-abce-e05335c2f8a9"
          className="bg-yellow-500 h-11 w-40 text-white  rounded-lg shadow-lg hover:bg-yellow-600 transition duration-300 ease-in-out"
          getButtonText={() => "Mint Now"}
          mintConfig={{
            totalPrice: parseEther(price_eth.toString()),
            skus: [sku],
            paymentToken: currency.address,
            prices: [price_usd],
            amounts: [1],
            timestamps: ["timestamp"],
            signatures: ["signature"],
          }}
          checkoutProps={{ paymentMethods: ["fiat", "ETH", "SOL"] }}
        />
      )}
      {showMintModal &&
        (currency.address === zeroAddress ? (
          <MintModal
            setShowMintModal={setShowMintModal}
            showMintModal={showMintModal}
            walletAddress={account.address ?? zeroAddress}
            sku={sku}
            quantity={quantity}
            paymentToken={currency.address}
          />
        ) : (
          <MintWithERC20Modal
            setShowMintModal={setShowMintModal}
            showMintModal={showMintModal}
            walletAddress={account.address ?? zeroAddress}
            sku={sku}
            quantity={quantity}
            paymentToken={currency.address}
          />
        ))}
    </>
  );
};

export default MintButton;
