import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchToken, fetchCategories, fetchCategoryProducts, fetchHomeProducts, fetchProductDetails, sendWalletId, searchProducts } from './services/apiService';

// Define the types for your API context
type APIContextType = {
  token: string | null;
  categories: any[];
  getCategoryProducts: (categoryId: number, pageSize: number, currentPage: number) => Promise<any>;
  getHomeProducts: (pageSize: number, currentPage: number) => Promise<any>;
  getProductDetails: (productId: number) => Promise<any>;
  handleSendWalletId: (walletId: string) => Promise<any>;
  performSearch: (searchQuery: string, pageSize: number, currentPage: number) => Promise<void>;
  searchResults: any[];
  loading: boolean;
  error: Error | null;
};
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
const APIContext = createContext<APIContextType | undefined>(undefined);

// Define the props type for APIProvider
interface APIProviderProps {
  children: ReactNode;
}

export const APIProvider: React.FC<APIProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    const initialize = async () => {
      try {
        const cachedCategories = localStorage.getItem('categories');
        if (cachedCategories) {
          setCategories(JSON.parse(cachedCategories));
        } else {
          const fetchedToken = await fetchToken();
          setToken(fetchedToken);

          const fetchedCategories = await fetchCategories(fetchedToken);
          setCategories(fetchedCategories);

          localStorage.setItem('categories', JSON.stringify(fetchedCategories));
        }
      } catch (error) {
        console.error('Error initializing API context:', error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const getCategoryProducts = async (categoryId: number, pageSize: number, currentPage: number) => {
    try {
      const token = await fetchToken();
      return await fetchCategoryProducts(token, categoryId, pageSize, currentPage);
    } catch (error) {
      console.error('Error fetching category products:', error);
      throw error;
    }
  };

  const getHomeProducts = async (pageSize: number, currentPage: number) => {
    try {
      const fetchedToken = await fetchToken();
     
      setToken(fetchedToken);
      return await fetchHomeProducts(fetchedToken, pageSize, currentPage);
    } catch (error) {
      console.error('Error fetching home products:', error);
      throw error;
    }
  };

  const getProductDetails = async (productId: number) => {
    try {
      const fetchedToken = await fetchToken();
      setToken(fetchedToken);
      return await fetchProductDetails(fetchedToken, productId);
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw error;
    }
  };

  const handleSendWalletId = async (walletId: string) => {
    try {
      const response = await sendWalletId(walletId);
      return response;
    } catch (error) {
      console.error('API call failed', error);
      throw error;
    }
  };

  const performSearch = async (searchQuery: string, pageSize: number, currentPage: number) => {
    const token = await fetchToken();
    try {
      const response = await searchProducts(token, searchQuery, pageSize, currentPage);
      const conversionRate = response.conversion_rate || 0;
      const items = (response.items || []).map((item: Product) => ({
        ...item,
        conversionRate,
      }));
      setSearchResults(items);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <APIContext.Provider value={{ token, categories, getCategoryProducts, getHomeProducts, getProductDetails, handleSendWalletId, performSearch, searchResults, loading, error }}>
      {children}
    </APIContext.Provider>
  );
};

export const useAPI = () => {
  const context = useContext(APIContext);
  if (context === undefined) {
    throw new Error('useAPI must be used within an APIProvider');
  }
  return context;
};
