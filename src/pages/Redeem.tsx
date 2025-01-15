import React, { useState, useEffect } from 'react';
import { useAPI } from '../apiContext';
import { useAccount } from 'wagmi';
import eth from "../asserts/images/Etherium.svg";
import { useNavigate } from 'react-router-dom';

interface Product {
  amount: string;
  productName: string;
  price_eth: number;
  price_usd: number;
  productImageUrl: string;
  stock_status:string;
}

function Redeem() {
  const { handleSendWalletId } = useAPI();
  const { address } = useAccount();
  const navigate = useNavigate(); 
  const [responseMessage, setResponseMessage] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const handleConnect = async () => {
    if (address) {
      try {
        const response = await handleSendWalletId(address);
        console.log(response.products);
        if (response && response.products) {
          // Filter products where product.amount > 0
          const filteredProducts = response.products.filter((product: Product) => parseFloat(product.amount) > 0);
          setProducts(filteredProducts);
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

  const handleProductSelect = (product: Product) => {
    setSelectedProducts((prevSelected) => {
      if (prevSelected.includes(product)) {
        return prevSelected.filter((p) => p !== product);
      } else {
        return [...prevSelected, product];
      }
    });
  };

  const handleProceedToCheckout = () => {
    if (selectedProducts.length > 0) {
      navigate('/checkout', { state: { selectedProducts } });
    } else {
      setResponseMessage('Please select at least one product to proceed to checkout.');
    }
  };

  return (
    <div className="p-4">
      <div className="text-xl font-bold mb-4">Redeem Items</div>
      
      {responseMessage && (
        <div className={`p-4 mb-4 w-1/2 mx-auto shadow-lg rounded-lg ${responseMessage.startsWith('Wallet not connected') ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 'bg-red-100 text-red-800 border-red-300'} border-l-4 border-solid`}>
          <p className="font-semibold">{responseMessage}</p>
        </div>
      )}
      
      {products.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, index) => (
              <div key={index} className="border rounded-lg p-4 shadow-lg">
                <div className="bg-gray-100 p-4">
                  <img
                    src={product.productImageUrl || 'placeholder-image-url'}
                    alt={product.productName}
                    className="w-full h-96 object-contain"
                  />
                </div>
                <h3 className="font-serif text-sm pt-2">{product.productName}</h3>
                <div className="mt-2 flex items-center">
                  <img src={eth} alt="eth" className="w-5 h-5 mr-1" />
                  <span>{product.price_eth.toString()}</span>
                  {product.price_usd && (
                    <span className="text-sm text-gray-500 ml-1">
                      ( &#8773; ${product.price_usd.toString()})
                    </span>
                  )}
                  <span className={`text-sm ml-5 ${product.stock_status === 'In Stock' ? 'text-green-500' : 'text-red-500'}`}>
  {product.stock_status}
</span>

                </div>
                
                {product.stock_status === 'In Stock' && (
                <div className="flex items-center mt-2">
                <input
                type="checkbox"
                checked={selectedProducts.includes(product)}
                onChange={() => handleProductSelect(product)}
                className="mr-2"
                />
                <span>Select Item</span>
                </div>
                )}
                
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button
              onClick={handleProceedToCheckout}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      ) : (
        <div className="text-gray-700"></div>
      )}
    </div>
  );
}

export default Redeem;
