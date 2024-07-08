import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchToken, fetchCategories, fetchCategoryProducts, fetchHomeProducts, fetchProductDetails } from './services/apiService';

const APIContext = createContext();

export const APIProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const getCategoryProducts = async (categoryId, pageSize, currentPage) => {
    try {
      const token = await fetchToken();
      
      return await fetchCategoryProducts(token, categoryId, pageSize, currentPage);
    } catch (error) {
      console.error('Error fetching category products:', error);
      throw error;
    }
  };

  const getHomeProducts = async (pageSize, currentPage) => {
    try {
      const fetchedToken = await fetchToken();
      setToken(fetchedToken);
      return await fetchHomeProducts(fetchedToken, pageSize, currentPage);
    } catch (error) {
      console.error('Error fetching home products:', error);
      throw error;
    }
  };

  const getProductDetails = async (productId) => {
    try {
      const fetchedToken = await fetchToken();
      setToken(fetchedToken);
      return await fetchProductDetails(fetchedToken, productId);
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw error;
    }
  };

  return (
    <APIContext.Provider value={{ token, categories, getCategoryProducts, getHomeProducts, getProductDetails, loading, error }}>
      {children}
    </APIContext.Provider>
  );
};

export const useAPI = () => useContext(APIContext);
