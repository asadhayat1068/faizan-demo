import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  fetchToken,
  fetchCategories,
  fetchCategoryProducts,
  fetchHomeProducts,
  fetchProductDetails,
  sendWalletId,
  searchProducts,
  addUser,
  createNewOrder,
  redeemProduct,
  getShippingRates,
} from "./services/apiService";
import { itemSelected } from "./services/apiService"; // Import the itemSelected type

// Define the types for your API context
type APIContextType = {
  token: string | null;
  categories: any[];
  getCategoryProducts: (
    categoryId: number,
    pageSize: number,
    currentPage: number,
    color?: string,
    minPrice?: number,
    maxPrice?: number
  ) => Promise<any>;
  getHomeProducts: (pageSize: number, currentPage: number) => Promise<any>;
  getProductDetails: (productId: number) => Promise<any>;
  handleSendWalletId: (walletId: string) => Promise<any>;
  performSearch: (
    searchQuery: string,
    pageSize: number,
    currentPage: number,
    color?: string,
    minPrice?: number,
    maxPrice?: number
  ) => Promise<void>;
  searchResults: any[];
  loading: boolean;
  error: Error | null;
  handleAddUser: (
    firstName: string,
    lastName: string,
    email: string,
    walletAddress: string
  ) => Promise<any>;
  createOrder: (
    walletId: string,
    selectedProducts: itemSelected[],
    shippingDetails: any,
    billingDetails: any
  ) => Promise<any>;
  redeemProducts: (orderId: string, paymentToken: string,walletId: string) => Promise<any>;
  getFedExShippingRates: (
    origin: string,
    destination: string,
    weight: number
  ) => Promise<any>;
};

// Define the types for product and product details
type CustomAttribute = {
  attribute_code: string;
  value: string | number;
};

type Product = {
  id: number;
  name: string;
  price: number;
  custom_attributes: CustomAttribute[];
  media_gallery_entries: { file: string }[];
  conversionRate?: number; // Optional, as it may not always be present initially
};

// Create a context with a default value of undefined
export const APIContext = createContext<APIContextType | undefined>(undefined);

// Define the props type for APIProvider
interface APIProviderProps {
  children: ReactNode;
}

export const APIProvider: React.FC<APIProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        const cachedCategories = localStorage.getItem("categories");
        if (cachedCategories) {
          setCategories(JSON.parse(cachedCategories));
        } else {
          const fetchedToken = await fetchToken();
          setToken(fetchedToken);

          const fetchedCategories = await fetchCategories(fetchedToken);
          setCategories(fetchedCategories);

          localStorage.setItem("categories", JSON.stringify(fetchedCategories));
        }
      } catch (error) {
        console.error("Error initializing API context:", error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const getCategoryProducts = async (
    categoryId: number,
    pageSize: number,
    currentPage: number,
    color?: string, // Optional color filter
    minPrice?: number, // Optional minimum price filter
    maxPrice?: number // Optional maximum price filter
  ) => {
    try {
      const token = await fetchToken();
      return await fetchCategoryProducts(
        token,
        categoryId,
        pageSize,
        currentPage,
        color,
        minPrice,
        maxPrice
      );
    } catch (error) {
      console.error("Error fetching category products:", error);
      throw error;
    }
  };
  
  

  const getHomeProducts = async (pageSize: number, currentPage: number) => {
    try {
      const fetchedToken = await fetchToken();
      setToken(fetchedToken);
      return await fetchHomeProducts(fetchedToken, pageSize, currentPage);
    } catch (error) {
      console.error("Error fetching home products:", error);
      throw error;
    }
  };

  const getProductDetails = async (productId: number) => {
    try {
      const fetchedToken = await fetchToken();
      setToken(fetchedToken);
      return await fetchProductDetails(fetchedToken, productId);
    } catch (error) {
      console.error("Error fetching product details:", error);
      throw error;
    }
  };

  const handleSendWalletId = async (walletId: string) => {
    try {
      return await sendWalletId(walletId);
    } catch (error) {
      console.error("Error sending wallet ID:", error);
      throw error;
    }
  };

  const performSearch = async (
    searchQuery: string,
    pageSize: number,
    currentPage: number,
    color?: string,
    minPrice?: number,
    maxPrice?: number
  ) => {
    const token = await fetchToken();
    setLoading(true);
    try {
      const response = await searchProducts(
        token,
        searchQuery,
        pageSize,
        currentPage,
        color,
        minPrice,
        maxPrice
      );

      const conversionRate = response.conversion_rate || 0;
      const items = (response.items || []).map((item: Product) => ({
        ...item,
        conversionRate,
      }));

      setSearchResults(items);
    } catch (error) {
      console.error("Error performing search:", error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (
    firstName: string,
    lastName: string,
    email: string,
    walletAddress: string
  ) => {
    const token = await fetchToken();
    try {
      return await addUser(firstName, lastName, email, walletAddress, token);
    } catch (error) {
      console.error("Error adding user:", error);
      throw error;
    }
  };

  const createOrder = async (
    walletId: string,
    selectedProducts: itemSelected[],
    shippingDetails: any,
    billingDetails: any
  ) => {
    if (!walletId) {
      throw new Error("Wallet ID is undefined");
    }

    try {
      const fetchedToken = await fetchToken();
      setToken(fetchedToken);
      return await createNewOrder(
        fetchedToken,
        walletId,
        selectedProducts,
        shippingDetails,
        billingDetails
      );
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  };


  const redeemProducts = async (orderId: string, paymentToken: string, walletId: string) => {
    if (!orderId || !paymentToken) {
      throw new Error("Order ID and Payment Token are required");
    }
  
    try {
      
      return await redeemProduct(orderId, paymentToken,walletId);
    } catch (error) {
      console.error("Error redeeming products:", error);
      throw error;
    }
  };
  const getFedExShippingRates = async (
    origin: string,
    destination: string,
    weight: number
  ) => {
    try {
      return await getShippingRates(origin, destination, weight);
    } catch (error) {
      console.error("Error fetching FedEx shipping rates:", error);
      throw error;
    }
  };
  return (
    <APIContext.Provider
      value={{
        token,
        categories,
        getCategoryProducts,
        getHomeProducts,
        getProductDetails,
        handleSendWalletId,
        performSearch,
        searchResults,
        loading,
        error,
        handleAddUser,
        createOrder,
        redeemProducts,
        getFedExShippingRates,
      }}
    >
      {children}
    </APIContext.Provider>
  );
};

export const useAPI = () => {
  const context = useContext(APIContext);
  if (!context) {
    throw new Error("useAPI must be used within an APIProvider");
  }
  return context;
};
