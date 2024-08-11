import React, { useState } from "react";
import { useAccount, useConfig, useWriteContract } from "wagmi";
import { useCurrencySelector } from "../providers/CurrencySelector/currencySelectorProvider";
import { getMintPriceAndSignature } from "../services/apiService";
import { CrossmintPayButton } from "@crossmint/client-sdk-react-ui";
import { BigNumber, ethers } from "ethers";
import { formatEther, isAddress } from "ethers/lib/utils";
import {
  CryptroviaABI,
  CryptroviaAddress,
  ERC20ABI,
  USDTABI,
} from "../providers/Contract/abi";
import { Address, getAddress, parseEther, zeroAddress } from "viem";
import { simulateContract } from "@wagmi/core";
import ReactModal from "react-modal";
import MintModal from "./Modal/MintModal";

interface MintButtonProps {
  sku: string;
  quantity: number;
  price_eth: number;
  price_usd: number;
}

const USD_TRESHOLD = 10;

const MintButton: React.FC<MintButtonProps> = ({
  sku,
  quantity,
  price_usd,
  price_eth,
}) => {
  const account = useAccount();
  const { currency } = useCurrencySelector();
  const config = useConfig();
  const { writeContractAsync, writeContract } = useWriteContract();
  const [showMintModal, setShowMintModal] = useState<boolean>(false);

  const handleMint = async () => {
    // setShowMintModal(true);
    // check if account is connected
    // if (!account.isConnected || !account.address) {
    //   return;
    // }

    setShowMintModal(true);
    // const paymentToken = currency.address;
    // const walletAddress = account.address;

    // if (getAddress(paymentToken) === zeroAddress) {
    //   console.log("Minting with ETH");
    //   // Mint with ETH
    //   try {
    //     const mintDetails = await getMintPriceAndSignature(
    //       "",
    //       account.address,
    //       paymentToken,
    //       sku
    //     );

    //     await mintWithETH(
    //       walletAddress,
    //       quantity,
    //       sku,
    //       paymentToken,
    //       mintDetails.price,
    //       mintDetails.timestamp,
    //       mintDetails.signature
    //     );
    //   } catch (error) {
    //     console.error("Error minting with ETH", error);
    //   }
    // } else if (isAddress(paymentToken) && paymentToken !== zeroAddress) {
    //   console.log("Minting with ERC20");
    //   // Mint with ERC20
    //   const mintDetails = await getMintPriceAndSignature(
    //     "",
    //     paymentToken,
    //     account.address,
    //     sku
    //   );
    //   console.log("Mint Details", mintDetails);
    //   approveTokens(paymentToken, mintDetails.price).then(() => {
    //     mintWithERC20(
    //       walletAddress,
    //       quantity,
    //       sku,
    //       paymentToken,
    //       mintDetails.price,
    //       mintDetails.timestamp,
    //       mintDetails.signature
    //     )
    //       .then(() => {
    //         console.log("Minted with ERC20");
    //       })
    //       .catch((error) => {
    //         console.error("Error minting with ERC20", error);
    //       });
    //   });

    //   return;
    // }
  };

  const mintWithETH = async (
    to: Address,
    quantity: number,
    sku: string,
    currencyAddress: string,
    price_eth: number,
    timestamp: string,
    signature: string
  ) => {
    // Mint with ETH
    console.log("... Minting with ETH ...", {
      to,
      quantity,
      sku,
      currencyAddress,
      price_eth,
      timestamp,
      signature,
    });
    // const result = await simulateContract(config.getClient(), {
    //   abi: CryptroviaABI,
    //   address: CryptroviaAddress,
    //   functionName: "mintBatch",
    //   args: [
    //     to,
    //     [sku],
    //     currencyAddress,
    //     [price],
    //     [quantity],
    //     [timestamp],
    //     [signature],
    //   ],
    //   value: price.mul(quantity).toBigInt(),
    // });

    // const result = await writeContractAsync({
    //   abi: CryptroviaABI,
    //   address: CryptroviaAddress,
    //   functionName: "mint",
    //   args: [
    //     to,
    //     sku,
    //     currencyAddress,
    //     BigInt(parseEther(price_eth.toString())),
    //     quantity,
    //     timestamp,
    //     signature,
    //   ],
    //   value: BigInt(parseEther(price_eth.toString())),
    // });

    // console.log("Simulate Result", result);
  };

  const approveTokens = async (tokenAddress: Address, amount: number) => {
    console.log("Approving Tokens", { tokenAddress, amount });
    // amount = amount * 10 ** 6;
    const result = await simulateContract(config, {
      abi: USDTABI,
      address: tokenAddress,
      functionName: "approve",
      args: [CryptroviaAddress, amount],
      value: BigInt("0"),
    });
    console.log("Approve Tokens", result);

    const response = await writeContractAsync({
      abi: ERC20ABI,
      address: tokenAddress,
      functionName: "approve",
      args: [CryptroviaAddress, amount],
      value: BigInt("0"),
    });
    console.log("Approve Tokens Response", response);
  };

  const mintWithERC20 = async (
    to: Address,
    quantity: number,
    sku: string,
    currencyAddress: string,
    price: number,
    timestamp: string,
    signature: string
  ) => {
    // Mint with ERC20
    console.log("... Minting with ERC20 ...", {
      to,
      quantity,
      sku,
      currencyAddress,
      price,
      timestamp,
      signature,
    });
    const result = await simulateContract(config, {
      abi: CryptroviaABI,
      address: CryptroviaAddress,
      functionName: "mintBatch",
      args: [
        to,
        [sku],
        currencyAddress,
        [price],
        [quantity],
        [timestamp],
        [signature],
      ],
      value: BigInt("0"),
    });

    console.log("Simulate Result", result);

    const mintResult = await writeContractAsync({
      abi: CryptroviaABI,
      address: CryptroviaAddress,
      functionName: "mint",
      args: [to, sku, currencyAddress, price, quantity, timestamp, signature],
      value: BigInt(0),
    });

    console.log("Simulate Result", result);
  };

  return (
    <>
      {price_usd > USD_TRESHOLD ? (
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
      {showMintModal && (
        <MintModal
          setShowMintModal={setShowMintModal}
          showMintModal={showMintModal}
          walletAddress={account.address ?? zeroAddress}
          sku={sku}
          quantity={quantity}
          paymentToken={currency.address}
        />
      )}
    </>
  );
};

export default MintButton;
