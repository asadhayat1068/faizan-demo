import React, { useEffect } from "react";
import { Address, zeroAddress } from "viem";
import { redeemProduct } from "../services/apiService";
import RedeemModal from "./Modal/RedeemModal";
import RedeemWithERC20Modal from "./Modal/RedeemWithERC20Modal";

interface RedeemModalProps {
  setShowModal: (show: boolean) => void;
  showModal: boolean;
  walletAddress: Address;
  orderId: string;
  paymentToken: Address;
}

function Redeem({
  setShowModal,
  showModal,
  walletAddress,
  orderId,
  paymentToken,
}: RedeemModalProps) {
  useEffect(() => {
    handleRedeem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRedeem = async () => {
    if (!orderId || !paymentToken || !walletAddress) {
      console.error("Missing required parameters");
      return;
    }
    try {
      const response = await redeemProduct(
        orderId,
        paymentToken,
        walletAddress
      );
      console.log("Redeem response:", response);
    } catch (error) {
      console.error("Error redeeming product:", error);
    }
  };
  return (
    <>
      {paymentToken === zeroAddress ? (
        // Redeem with ETH
        <RedeemModal
          setShowModal={setShowModal}
          showModal={showModal}
          walletAddress={walletAddress}
          orderId={orderId}
          paymentToken={paymentToken}
        />
      ) : (
        <RedeemWithERC20Modal
          setShowModal={setShowModal}
          showModal={showModal}
          walletAddress={walletAddress}
          orderId={orderId}
          paymentToken={paymentToken}
        />
      )}
    </>
  );
}

export default Redeem;
