import axios, { AxiosError } from 'axios';


// Define types for responses
interface TokenResponse {
  token: string;
}

interface CustomAttribute {
  attribute_code: string;
  value: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
  items: Product[];
}

interface Product {
  id: number;
  name: string;
  price: number;
  media_gallery_entries: Array<{ file: string }>;
  custom_attributes: CustomAttribute[];
}

interface HomeProductsResponse {
  categories: Category[];
}

interface ProductDetails {
  id: number;
  name: string;
  sku:string;
  description: string;
  price_eth: number;
  price_usd: number;
  imageUrl: string;
  custom_attributes: CustomAttribute[];
  conversionRate:number;
  media_gallery_entries: Array<{ file: string }>;
}


const tokenURL = 'https://cryptrovia.com/api/token.php';
const categoryURL = 'https://cryptrovia.com/api/category.php';
const categoryproducts = 'https://cryptrovia.com/api/category_products.php';
const homeItems = 'https://cryptrovia.com/api/homeitems.php';
const productDetailsURL = 'https://cryptrovia.com/api/getproductdetails.php';
const redeemProductURL = 'https://cryptrovia.com/api/redeem_product_api.php';
const searchUrl = 'https://cryptrovia.com/api/itmsearch.php';



const fetchToken = async (): Promise<string> => {
  try {
    const cachedToken = localStorage.getItem('token');
    const cachedExpiration = localStorage.getItem('tokenExpiration');
   
    // Check if the cached token is still valid
    if (cachedToken && cachedExpiration) {
      const currentTime = new Date().getTime();
      if (currentTime < parseInt(cachedExpiration, 10)) {
        //console.log('Returning cached token');
        return cachedToken;
      }
    }

    // Fetch new token from the server
    const response = await axios.get<string>(tokenURL);
    console.log(response);
    const token: string = response.data;

    if (!token || typeof token !== 'string') {
      throw new Error('Token received from server is null, undefined, or not a string');
    }

    // Calculate token expiration time
    const TOKEN_EXPIRATION_TIME = 3 * 60 * 60 + 50 * 60; // Example: 3 hours 50 minutes
    const expirationTime = new Date().getTime() + TOKEN_EXPIRATION_TIME * 1000;

    // Store new token and expiration time in local storage
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpiration', expirationTime.toString());

    //console.log('Fetched and stored new token:', token);
    return token;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching token:', error.response ? error.response.data : error.message);
    } else {
      console.error('Error fetching token:', error);
    }
    throw error;
  }
};



const fetchCategories = async (token: string): Promise<any> => {
  try {
    const headers = {
      Authorization: `${token}`,
      'Content-Type': 'application/json'
    };
    const response = await axios.post(categoryURL, {}, { headers });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        throw new Error('TOKEN_EXPIRED');
      }
      throw error;
    } else {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
};

const fetchCategoryProducts = async (token: string, categoryId: number, pageSize = 10, currentPage = 1): Promise<any> => {
  try {
    const headers = {
      Authorization: `${token}`,
      'Content-Type': 'application/json'
    };

    const data = {
      categoryId,
      pageSize,
      currentPage
    };

    const response = await axios.post(categoryproducts, data, { headers });
   console.log(response.data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        throw new Error('TOKEN_EXPIRED');
      }
      throw error;
    } else {
      console.error('Error fetching category products:', error);
      throw error;
    }
  }
};

// Function to fetch home products
const fetchHomeProducts = async (token: string, pageSize: number, currentPage: number): Promise<Category[]> => {
  const categoryIds = [3577, 4189, 4188, 3578, 3581, 3582, 3583, 3572, 3579];

  try {
    const headers = {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    };

    const data = {
      categoryIds,
      pageSize,
      currentPage,
    };
    //console.log(token);
    const response = await axios.post(homeItems, data, { headers });

    // Ensure response data is in expected format
    if (!response.data || !Array.isArray(response.data.categories)) {
      throw new Error('Invalid data structure');
    }

    const structuredData: Category[] = response.data.categories.map((category: any) => ({
      categoryId: category.categoryId,
      categoryName: category.categoryName,
      conversionRate:category.conversion_rate,
      products: category.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        price_eth: item.price_eth,
        price_usd: item.price_usd,
        description: item.custom_attributes.find((attr: any) => attr.attribute_code === 'description')?.value || '',
        usd: item.custom_attributes.find((attr: any) => attr.attribute_code === 'usd')?.value || '',
        price: item.price,
        imageUrl: item.media_gallery_entries?.[0]?.file
          ? `https://cryptrovia.com/pub/media/catalog/product${item.media_gallery_entries[0].file}`
          : 'https://via.placeholder.com/400',
      })),
    }));

    return structuredData;
  } catch (error) {
    console.error('Error fetching home products:', error);
    throw error;
  }
};

const fetchProductDetails = async (token: string, productId: number): Promise<ProductDetails> => {
  try {
    const headers = {
      Authorization: `${token}`,
      'Content-Type': 'application/json',
    };

    const data = {
      productId,
    };

    const response = await axios.post(productDetailsURL, data, { headers });
    const item = response.data.items[0];
    
    return {
      id: item.id,
      name: item.name,
      sku:item.sku,
      description: item.custom_attributes.find((attr: CustomAttribute) => attr.attribute_code === 'description')?.value || '',
      price_eth: item.price_eth,
      price_usd: item.price_usd,
      conversionRate:response.data.conversion_rate,
      custom_attributes: item.custom_attributes,
      media_gallery_entries: item.media_gallery_entries,
      imageUrl: item.media_gallery_entries?.[0]?.file
        ? `https://cryptrovia.com/pub/media/catalog/product${item.media_gallery_entries[0].file}`
        : 'https://via.placeholder.com/400',
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        throw new Error('TOKEN_EXPIRED');
      }
      throw error;
    } else {
      console.error('Error fetching product details:', error);
      throw error;
    }
  }
};

const sendWalletId = async (walletId: string): Promise<any> => {
  try {
    const response = await axios.post(redeemProductURL, null, {
      headers: {
        'Authorization': `${walletId}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error: unknown) {
    console.error('Error sending wallet ID:', error);
    throw error;
  }
};

const searchProducts = async (token: string, searchQuery: string, pageSize = 10, currentPage = 1): Promise<any> => {
  try {
    const response = await axios.post(
      searchUrl,
      {
        searchQuery,
        pageSize,
        currentPage,
      },
      {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error: unknown) {
    console.error('Error searching products:', error);
    throw error;
  }
};

export { searchProducts, fetchToken, fetchCategories, fetchCategoryProducts, fetchHomeProducts, fetchProductDetails, sendWalletId };
