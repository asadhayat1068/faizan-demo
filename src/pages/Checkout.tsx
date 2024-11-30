import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAPI } from '../apiContext';
import { useAccount } from "wagmi";
import Spinner from "../components/Spinner";

const states = [
  { name: 'Alabama', code: 'AL' }, { name: 'Alaska', code: 'AK' }, { name: 'Arizona', code: 'AZ' },
  { name: 'Arkansas', code: 'AR' }, { name: 'California', code: 'CA' }, { name: 'Colorado', code: 'CO' },
  { name: 'Connecticut', code: 'CT' }, { name: 'Delaware', code: 'DE' }, { name: 'Florida', code: 'FL' },
  { name: 'Georgia', code: 'GA' }, { name: 'Hawaii', code: 'HI' }, { name: 'Idaho', code: 'ID' },
  { name: 'Illinois', code: 'IL' }, { name: 'Indiana', code: 'IN' }, { name: 'Iowa', code: 'IA' },
  { name: 'Kansas', code: 'KS' }, { name: 'Kentucky', code: 'KY' }, { name: 'Louisiana', code: 'LA' },
  { name: 'Maine', code: 'ME' }, { name: 'Maryland', code: 'MD' }, { name: 'Massachusetts', code: 'MA' },
  { name: 'Michigan', code: 'MI' }, { name: 'Minnesota', code: 'MN' }, { name: 'Mississippi', code: 'MS' },
  { name: 'Missouri', code: 'MO' }, { name: 'Montana', code: 'MT' }, { name: 'Nebraska', code: 'NE' },
  { name: 'Nevada', code: 'NV' }, { name: 'New Hampshire', code: 'NH' }, { name: 'New Jersey', code: 'NJ' },
  { name: 'New Mexico', code: 'NM' }, { name: 'New York', code: 'NY' }, { name: 'North Carolina', code: 'NC' },
  { name: 'North Dakota', code: 'ND' }, { name: 'Ohio', code: 'OH' }, { name: 'Oklahoma', code: 'OK' },
  { name: 'Oregon', code: 'OR' }, { name: 'Pennsylvania', code: 'PA' }, { name: 'Rhode Island', code: 'RI' },
  { name: 'South Carolina', code: 'SC' }, { name: 'South Dakota', code: 'SD' }, { name: 'Tennessee', code: 'TN' },
  { name: 'Texas', code: 'TX' }, { name: 'Utah', code: 'UT' }, { name: 'Vermont', code: 'VT' },
  { name: 'Virginia', code: 'VA' }, { name: 'Washington', code: 'WA' }, { name: 'West Virginia', code: 'WV' },
  { name: 'Wisconsin', code: 'WI' }, { name: 'Wyoming', code: 'WY' }
];

const countries = [
  { code: 'US', name: 'United States' },
  // Add other countries here
];

function Checkout() {
  const location = useLocation();
  const { selectedProducts } = location.state || { selectedProducts: [] };
  const { createOrder,getFedExShippingRates } = useAPI();
  const { address: walletId } = useAccount();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    address: '',
    state: '',
    city: '',
    zip: '',
    country: 'US',
  });
  const [billingAddress, setBillingAddress] = useState({
    name: '',
    address: '',
    state: '',
    city: '',
    zip: '',
    country: 'US',
  });
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [shippingError, setShippingError] = useState<string | null>(null);
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
        country: 'US',
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
      setLoading(false);
      return;
    }
  
    const regionIdMapping: { [key: string]: number } = {
      'AL': 1,  // Alabama
      'AK': 2,  // Alaska
      'AZ': 4,  // Arizona
      'AP': 11, // Armed Forces Pacific
      'CA': 12, // California
      'CO': 13, // Colorado
      'CT': 14, // Connecticut
      'DE': 15, // Delaware
      'DC': 16, // District of Columbia
      'FM': 17, // Federated States Of Micronesia
      'FL': 18, // Florida
      'GA': 19, // Georgia
      'GU': 20, // Guam
      'HI': 21, // Hawaii
      'ID': 22, // Idaho
      'IL': 23, // Illinois
      'IN': 24, // Indiana
      'IA': 25, // Iowa
      'KS': 26, // Kansas
      'KY': 27, // Kentucky
      'LA': 28, // Louisiana
      'ME': 29, // Maine
      'MH': 30, // Marshall Islands
      'MD': 31, // Maryland
      'MA': 32, // Massachusetts
      'MI': 33, // Michigan
      'MN': 34, // Minnesota
      'MS': 35, // Mississippi
      'MO': 36, // Missouri
      'MT': 37, // Montana
      'NE': 38, // Nebraska
      'NV': 39, // Nevada
      'NH': 40, // New Hampshire
      'NJ': 41, // New Jersey
      'NM': 42, // New Mexico
      'NY': 43, // New York
      'NC': 44, // North Carolina
      'ND': 45, // North Dakota
      'MP': 46, // Northern Mariana Islands
      'OH': 47, // Ohio
      'OK': 48, // Oklahoma
      'OR': 49, // Oregon
      'PW': 50, // Palau
      'PA': 51, // Pennsylvania
      'PR': 52, // Puerto Rico
      'RI': 53, // Rhode Island
      'SC': 54, // South Carolina
      'SD': 55, // South Dakota
      'TN': 56, // Tennessee
      'TX': 57, // Texas
      'UT': 58, // Utah
      'VT': 59, // Vermont
      'VI': 60, // Virgin Islands
      'VA': 61, // Virginia
      'WA': 62, // Washington
      'WV': 63, // West Virginia
      'WI': 64, // Wisconsin
      'WY': 65  // Wyoming
    };
    
  
    const shippingRegionId = regionIdMapping[shippingAddress.state] || 0;
    const billingRegionId = regionIdMapping[billingAddress.state] || 0;
  
    const updatedShippingAddress = {
      ...shippingAddress,
      region_id: shippingRegionId,
    };
  
    const updatedBillingAddress = {
      ...billingAddress,
      region_id: billingRegionId,
    };
  
    try {
      console.log('Sending order data:', {
        walletId,
        selectedProducts,
        shippingAddress: updatedShippingAddress,
        billingAddress: updatedBillingAddress
      });
  
      const response = await createOrder(walletId, selectedProducts, updatedShippingAddress, updatedBillingAddress);
  
      console.log('Order response:', response);
  
      if (response && response.status === 'success') {
        navigate('/success', { state: { orderId: response.orderId } });
      } else {
        setError(response.message || 'Order failed. Please try again.');
      }
  
      setLoading(false);
    } catch (err) {
      setError('Error creating order');
      console.error('Error during order creation:', err);
      setLoading(false);
    }
  };
  const handleShippingChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));

    if (name === 'zip' && value.length === 5) {console.log(value);
      try {
        setShippingError(null); // Reset error state
        setShippingOptions([]); // Reset shipping options state

        const origin = "20723"; // Replace with your predefined origin postal code
        const weight = 5; // Replace with your desired weight (can be dynamic based on selected products)
        const rates = await getFedExShippingRates(origin, value, weight);

        if (rates && rates.rateReplyDetails) {
          const options = rates.rateReplyDetails.map((rate: any) => ({
            serviceType: rate.serviceType,
            deliveryDate: rate.commit.dateDetail,
            cost: rate.ratedShipmentDetails[0].totalNetCharge.amount,
          }));
          setShippingOptions(options);
        }
      } catch (err) {
        console.error('Error fetching shipping rates:', err);
        setShippingError('Unable to fetch shipping rates. Please try again later.');
      }
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
              <button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-300 p-2 hover:bg-gray-400"
                onClick={scrollLeft}
              >
                &#9664;
              </button>

              <div
                className="flex overflow-x-auto space-x-4 px-12"
                ref={scrollContainerRef}
                style={{ scrollSnapType: 'x mandatory' }}
              >
                {selectedProducts.map((product: { productImageUrl: string | undefined; productName: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; price_eth: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; price_usd: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, index: React.Key | null | undefined) => (
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

              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-300 p-2 hover:bg-gray-400"
                onClick={scrollRight}
              >
                &#9654;
              </button>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  name="name"
                  value={shippingAddress.name}
                  onChange={handleShippingChange}
                  placeholder="Name"
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleShippingChange}
                  placeholder="Address"
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleShippingChange}
                  placeholder="City"
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  name="zip"
                  value={shippingAddress.zip}
                  onChange={handleShippingChange}
                  placeholder="ZIP Code"
                  className="p-2 border rounded"
                />
                <select
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleShippingChange}
                  className="p-2 border rounded"
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
                <select
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleShippingChange}
                  className="p-2 border rounded"
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label>
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={handleCheckboxChange}
                />
                Same as shipping address
              </label>
              {!sameAsShipping && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Billing Information</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      type="text"
                      name="name"
                      value={billingAddress.name}
                      onChange={handleBillingChange}
                      placeholder="Name"
                      className="p-2 border rounded"
                    />
                    <input
                      type="text"
                      name="address"
                      value={billingAddress.address}
                      onChange={handleBillingChange}
                      placeholder="Address"
                      className="p-2 border rounded"
                    />
                    <input
                      type="text"
                      name="city"
                      value={billingAddress.city}
                      onChange={handleBillingChange}
                      placeholder="City"
                      className="p-2 border rounded"
                    />
                    <input
                      type="text"
                      name="zip"
                      value={billingAddress.zip}
                      onChange={handleBillingChange}
                      placeholder="ZIP Code"
                      className="p-2 border rounded"
                    />
                    <select
                      name="state"
                      value={billingAddress.state}
                      onChange={handleBillingChange}
                      className="p-2 border rounded"
                    >
                      <option value="">Select State</option>
                      {states.map((state) => (
                        <option key={state.code} value={state.code}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                    <select
                      name="country"
                      value={billingAddress.country}
                      onChange={handleBillingChange}
                      className="p-2 border rounded"
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
 {/* Shipping Options */}
 {shippingOptions.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-bold">Shipping Options:</h3>
            <ul className="list-disc pl-5">
              {shippingOptions.map((option, index) => (
                <li key={index}>
                  <strong>{option.serviceType}</strong> - {option.deliveryDate} - ${option.cost}
                </li>
              ))}
            </ul>
          </div>
        )}

        {shippingError && <p className="text-red-500 mt-2">{shippingError}</p>}
            <div className="flex justify-end">
              <button
                onClick={handleOrderCreation}
                className="bg-blue-500 text-white p-2 rounded"
              >
                Proceed to Checkout
              </button>
            </div>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </div>
        ) : (
          <div className="text-center">
            <p>No products selected for checkout.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Checkout;
