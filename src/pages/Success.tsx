import { useEffect } from "react";
import { useParams } from 'react-router-dom';
import { useAPI } from "../apiContext";
import { useCurrencySelector } from "../providers/CurrencySelector/currencySelectorProvider";
import { useAccount } from "wagmi";

const Success = () => {
  const { orderId } = useParams();
  const { redeemProducts } = useAPI();
  const { currency } = useCurrencySelector();
  const { address: walletId } = useAccount();
  useEffect(() => {
    const handleRedeem = async () => {
      if (orderId) {
        try {
          const paymentToken = currency.address;
          const response = await redeemProducts(orderId, paymentToken, walletId || "");
          console.log("Redeem response:", response);
        } catch (error) {
          console.error("Error redeeming product:", error);
        }
      }
    };

    handleRedeem();
  }, [orderId, redeemProducts, walletId, currency]);
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-green-600">Order Successful!</h1>
        <p className="text-lg">Thank you for your purchase.</p>
        {orderId && (
          <p className="mt-4 text-gray-600">
            Your Order ID: <span className="font-bold">{orderId}</span>
          </p>
        )}
        <button
          onClick={() => window.location.href = '/'} // Replace with your desired action, like redirecting to the homepage
          className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default Success;