import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAPI } from '../apiContext';
import { useAccount } from "wagmi";
import Spinner from "../components/Spinner";
import { useNavigate } from 'react-router-dom';
const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

function Checkout() {
  const location = useLocation();
  const { selectedProducts } = location.state || { selectedProducts: [] }; // Safely extract selected products
  const { createOrder } = useAPI(); // Use createOrder from APIContext
  const { address: walletId } = useAccount(); // Fetch walletId (address) from useAccount in wagmi
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    address: '',
    state: '',
    city: '',
    zip: '',
  });
  const [billingAddress, setBillingAddress] = useState({
    name: '',
    address: '',
    state: '',
    city: '',
    zip: '',
  });
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [error, setError] = useState<string | null>(null); // Error state
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBillingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSameAsShipping(e.target.checked);
    if (e.target.checked) {
      setBillingAddress(shippingAddress);
    } else {
      setBillingAddress({
        name: '',
        address: '',
        state: '',
        city: '',
        zip: '',
      });
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleOrderCreation = async () => {
    setLoading(true);
    if (!walletId || selectedProducts.length === 0) {
      setError('Missing required information');
      setLoading(false); // Make sure to stop the loading indicator in case of error
      return;
    }
  
    try {
      const response = await createOrder(walletId, selectedProducts, shippingAddress, billingAddress);
      
      if (response && response.status === 'success') {
        // Navigate to the Success page and pass the orderId
        navigate('/success', { state: { orderId: response.orderId } });
      } else {
        setError('Order failed. Please try again.');
      }
  
      setLoading(false);
    } catch (err) {
      setError('Error creating order');
      console.error('Error during order creation:', err);
      setLoading(false);
    }
  };
  if (loading) return <Spinner />;
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>

        {selectedProducts.length > 0 ? (
          <div>
            <div className="relative">
              {/* Left Arrow */}
              <button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-300 p-2 hover:bg-gray-400"
                onClick={scrollLeft}
              >
                &#9664;
              </button>

              {/* Scrollable Product List */}
              <div
                className="flex overflow-x-auto space-x-4 px-12"
                ref={scrollContainerRef}
                style={{ scrollSnapType: 'x mandatory' }}
              >
                {selectedProducts.map((product: { productImageUrl: string | undefined; productName: string; price_eth: string; price_usd: string }, index: React.Key | null | undefined) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-64 border rounded-lg p-4 shadow-lg"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <div className="w-24 h-24 bg-gray-100 p-2 flex-shrink-0">
                      <img
                        src={product.productImageUrl}
                        alt="Product"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-serif text-xs">{product.productName}</h3>
                      <p className="mt-1 text-xs">
                        Price: {product.price_eth} ETH (&#8773; ${product.price_usd})
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Arrow */}
              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-300 p-2 hover:bg-gray-400"
                onClick={scrollRight}
              >
                &#9654;
              </button>
            </div>

            {/* Shipping Information Form */}
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  name="name"
                  value={shippingAddress.name}
                  onChange={handleShippingChange}
                  placeholder="Full Name"
                  className="border p-2 rounded w-full"
                />
                <input
                  type="text"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleShippingChange}
                  placeholder="Address"
                  className="border p-2 rounded w-full"
                />
                <select
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleShippingChange}
                  className="border p-2 rounded w-full"
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleShippingChange}
                  placeholder="City"
                  className="border p-2 rounded w-full"
                />
                <input
                  type="text"
                  name="zip"
                  value={shippingAddress.zip}
                  onChange={handleShippingChange}
                  placeholder="ZIP Code"
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>

            {/* Checkbox to copy Shipping Address to Billing Address */}
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="sameAsShipping"
                checked={sameAsShipping}
                onChange={handleCheckboxChange}
                className="mr-2"
              />
              <label htmlFor="sameAsShipping" className="text-sm">
                Same as shipping address
              </label>
            </div>

            {/* Billing Information Form */}
            {!sameAsShipping && (
              <div className="mt-4">
                <h2 className="text-xl font-bold mb-4">Billing Information</h2>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    name="name"
                    value={billingAddress.name}
                    onChange={handleBillingChange}
                    placeholder="Full Name"
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="text"
                    name="address"
                    value={billingAddress.address}
                    onChange={handleBillingChange}
                    placeholder="Address"
                    className="border p-2 rounded w-full"
                  />
                  <select
                    name="state"
                    value={billingAddress.state}
                    onChange={handleBillingChange}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="city"
                    value={billingAddress.city}
                    onChange={handleBillingChange}
                    placeholder="City"
                    className="border p-2 rounded w-full"
                  />
                  <input
                    type="text"
                    name="zip"
                    value={billingAddress.zip}
                    onChange={handleBillingChange}
                    placeholder="ZIP Code"
                    className="border p-2 rounded w-full"
                  />
                </div>
              </div>
            )}

            {/* Proceed to Payment Button */}
            <div className="mt-8">
              <button
                onClick={handleOrderCreation}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 float-right"
              >
                Proceed to Payment
              </button>
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        ) : (
          <p>No products selected for checkout.</p>
        )}
      </div>
    </div>
  );
}

export default Checkout;
