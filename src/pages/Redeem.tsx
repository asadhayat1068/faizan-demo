import React, { useState, useEffect } from 'react';
import { useAPI } from '../apiContext';
import { useAccount } from 'wagmi';

interface Product {
  name: string;
  description: string;
  price: number;
  image_url: string;
}

function Redeem() {
  const { handleSendWalletId } = useAPI();
  const { address } = useAccount();
  const [responseMessage, setResponseMessage] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  const handleConnect = async () => {
    if (address) {
      try {
        const response = await handleSendWalletId(address);
        if (response && response.data && response.data.products) {
          setProducts(response.data.products);
          setResponseMessage('');
        } else {
          setProducts([]);
          setResponseMessage('No products found.');
        }
      } catch (error) {
        if (error instanceof Error) {
          setResponseMessage(`Failed to send Wallet ID: ${error.message}`);
        } else {
          setResponseMessage('Failed to send Wallet ID: An unknown error occurred');
        }
        console.error('Failed to send Wallet ID', error);
      }
    }
  };

  useEffect(() => {
    if (address) {
      handleConnect();
    } else {
      setResponseMessage('Wallet not connected. Please connect your wallet to proceed.');
    }
  }, [address]);

  const handleRedeem = (product: Product) => {
    // Handle redeem logic here
    console.log(`Redeem product: ${product.name}`);
  };

  return (
    <div className="p-4">
      <div className="text-xl font-bold mb-4">Redeem Items</div>
      
      {/* Display response messages with enhanced styling */}
      {responseMessage && (
        <div className={`p-4 mb-4 w-1/2 mx-auto shadow-lg rounded-lg ${responseMessage.startsWith('Wallet not connected') ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-red-100 text-red-800 border-red-300'} border-l-4 border-solid`}>
          <p className="font-semibold">{responseMessage}</p>
        </div>
      )}
      
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product, index) => (
            <div key={index} className="border rounded-lg p-4 shadow-lg">
              <img
                src={product.image_url || 'placeholder-image-url'} // Replace 'placeholder-image-url' with an actual placeholder image URL
                alt={product.name}
                className="w-full h-48 object-cover mb-4"
              />
              <div className="text-lg font-semibold mb-2">{product.name}</div>
              <div className="text-gray-700 mb-2">{product.description}</div>
              <div className="text-blue-500 font-bold mb-2">{`$${product.price}`}</div>
              <button
                onClick={() => handleRedeem(product)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Redeem Now
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-700"></div>
      )}
    </div>
  );
}

export default Redeem;
