import axios from "axios";

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
  items: itemSelected[];
}

interface itemSelected {
  id: number;
  name: string;
  price: number;
  quantity: number;
  productImageUrl: string;
}


interface HomeProductsResponse {
  categories: Category[];
}

interface ProductDetails {
  id: number;
  name: string;
  sku: string;
  description: string;
  price_eth: number;
  price_usd: number;
  imageUrl: string;
  custom_attributes: CustomAttribute[];
  conversionRate: number;
  media_gallery_entries: Array<{ file: string }>;
}

const tokenURL = "https://cryptrovia.com/api/token.php";
const categoryURL = "https://cryptrovia.com/api/category.php";
const categoryproducts = "https://cryptrovia.com/api/category_products.php";
const homeItems = "https://cryptrovia.com/api/homeitems.php";
const productDetailsURL = "https://cryptrovia.com/api/getproductdetails.php";
const redeemProductURL = "https://cryptrovia.com/api/redeem_product_api.php";
const searchUrl = "https://cryptrovia.com/api/itmsearch.php";
const AddUserUrl = "https://cryptrovia.com/api/adduser.php";
const checkoutProductURL = "https://cryptrovia.com/api/createorder.php";
const redeemURL = "https://cryptrovia.com/api/redeem.php";

// FedEx API credentials
const FEDEX_API_URL = "https://apis.fedex.com/rate/v1/rates/quotes";
const FEDEX_API_KEY = "h05q3f0SKRIkKfgu"; // Replace with your actual API Key
const FEDEX_PASSWORD = "SZgGtQkBlyV3ezRPs2guRKkDA"; // Replace with your actual Password
const ACCOUNT_NUMBER = "629970495"; // Replace with your Account Number
const METER_NUMBER = "250813035"; // Replace with your Meter Number

const FEDEX_CLIENT_ID = "h05q3f0SKRIkKfgu"; // Replace with your FedEx Client ID
const FEDEX_CLIENT_SECRET = "SZgGtQkBlyV3ezRPs2guRKkDA"; // Replace with your FedEx Client Secret

const fetchToken = async (): Promise<string> => {
  try {
    const cachedToken = localStorage.getItem("token");
    const cachedExpiration = localStorage.getItem("tokenExpiration");
    console.log(cachedToken);
    if (cachedToken && cachedExpiration) {
      const currentTime = new Date().getTime();
      if (currentTime < parseInt(cachedExpiration, 10)) {
        return cachedToken;
      }
    }

    const response = await axios.get<string>(tokenURL);
    const token: string = response.data;

    if (!token || typeof token !== "string") {
      throw new Error("Token received from server is null, undefined, or not a string");
    }

    const TOKEN_EXPIRATION_TIME = 3 * 60 * 60 + 50 * 60;
    const expirationTime = new Date().getTime() + TOKEN_EXPIRATION_TIME * 1000;

    localStorage.setItem("token", token);
    localStorage.setItem("tokenExpiration", expirationTime.toString());

    return token;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching token:", error.response ? error.response.data : error.message);
    } else {
      console.error("Error fetching token:", error);
    }
    throw error;
  }
};

const fetchCategories = async (token: string): Promise<any> => {
  try {
    const headers = {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    };
    const response = await axios.post(categoryURL, {}, { headers });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        throw new Error("TOKEN_EXPIRED");
      }
      throw error;
    } else {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }
};

const fetchCategoryProducts = async (
  token: string,
  categoryId: number,
  pageSize = 10,
  currentPage = 1,
  color?: string, // Optional color filter
  minPrice?: number, // Optional minimum price filter
  maxPrice?: number // Optional maximum price filter
): Promise<any> => {
  try {
    const headers = {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    };

    const data: Record<string, any> = {
      categoryId,
      pageSize,
      currentPage,
    };

    // Add color filter if provided
    if (color) {
      data.color = color;
    }

    // Add price range filter if provided
    if (minPrice !== undefined) {
      data.minPrice = minPrice;
    }
    if (maxPrice !== undefined) {
      data.maxPrice = maxPrice;
    }

    const response = await axios.post(categoryproducts, data, { headers });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        throw new Error("TOKEN_EXPIRED");
      }
      throw error;
    } else {
      console.error("Error fetching category products:", error);
      throw error;
    }
  }
};


// Function to fetch home products
const fetchHomeProducts = async (
  token: string,
  pageSize: number,
  currentPage: number
): Promise<Category[]> => {
  const categoryIds = [3577, 4189, 4188, 3578, 3581, 3582, 3583, 3572, 3579];

  try {
    const headers = {
      Authorization: `${token}`,
      "Content-Type": "application/json",
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
      throw new Error("Invalid data structure");
    }

    const structuredData: Category[] = response.data.categories.map(
      (category: any) => ({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        conversionRate: category.conversion_rate,
        products: category.items.map((item: any) => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          price_eth: item.price_eth,
          price_usd: item.price_usd,
          description:
            item.custom_attributes.find(
              (attr: any) => attr.attribute_code === "description"
            )?.value || "",
          usd:
            item.custom_attributes.find(
              (attr: any) => attr.attribute_code === "usd"
            )?.value || "",
          price: item.price,
          imageUrl: item.media_gallery_entries?.[0]?.file
            ? `https://cryptrovia.com/pub/media/catalog/product${item.media_gallery_entries[0].file}`
            : "https://via.placeholder.com/400",
        })),
      })
    );

    return structuredData;
  } catch (error) {
    console.error("Error fetching home products:", error);
    throw error;
  }
};


const fetchProductDetails = async (
  token: string,
  productId: number
): Promise<ProductDetails> => {
  try {
    const headers = {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    };

    const data = {
      productId,
    };

    const response = await axios.post(productDetailsURL, data, { headers });
    const item = response.data.items[0];

    return {
      id: item.id,
      name: item.name,
      sku: item.sku,
      description: item.custom_attributes.find(
        (attr: CustomAttribute) => attr.attribute_code === "description"
      )?.value || "",
      price_eth: item.price_eth,
      price_usd: item.price_usd,
      conversionRate: response.data.conversion_rate,
      custom_attributes: item.custom_attributes,
      media_gallery_entries: item.media_gallery_entries,
      imageUrl: item.media_gallery_entries?.[0]?.file
        ? `https://cryptrovia.com/pub/media/catalog/product${item.media_gallery_entries[0].file}`
        : "https://via.placeholder.com/400",
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        throw new Error("TOKEN_EXPIRED");
      }
      throw error;
    } else {
      console.error("Error fetching product details:", error);
      throw error;
    }
  }
};

const sendWalletId = async (walletId: string): Promise<any> => {
  try {
    const response = await axios.post(redeemProductURL, null, {
      headers: {
        Authorization: `${walletId}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: unknown) {
    console.error("Error sending wallet ID:", error);
    throw error;
  }
};

const searchProducts = async (
  token: string,
  searchQuery: string,
  pageSize = 10,
  currentPage = 1,
  color?: string, // Optional color filter
  minPrice?: number, // Optional minimum price
  maxPrice?: number // Optional maximum price
): Promise<any> => {
  try {
    const headers = {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    };

    // Construct the request payload
    const data: any = {
      searchQuery,
      pageSize,
      currentPage,
    };

    // Add filters for color and price if provided
    if (color) {
      data.color = color;
    }
    if (minPrice !== undefined && maxPrice !== undefined) {
      data.minPrice = minPrice;
      data.maxPrice = maxPrice;
    }

    // Make the API call
    const response = await axios.post(searchUrl, data, { headers });

    // Return raw response data
    return response.data;
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
};


const getMintPriceAndSignature = async (
  token: string,
  walletAddress: string,
  paymentToken: string,
  productSKU: string
) => {
  try {
    const headers = {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    };

    const data = {
      usrAdd: walletAddress,
      sku: productSKU,
      paymentToken: paymentToken,
    };

    const response = await axios.post(
      "https://cryptrovia.com/itemsign.php",
      data,
      { headers }
    );
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw new Error("TOKEN_EXPIRED");
    }
    throw error;
  }
};

const addUser = async (
  firstName: string,
  lastName: string,
  email: string,
  walletAddress: string,
  token: string
): Promise<any> => {
  try {
    const data = {
      firstName,
      lastName,
      email,
      walletAddress
    };

    const response = await axios.post(AddUserUrl, data, {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

const createNewOrder = async (
  token: string,
  userwalletId: string, // Ensure wallet ID is passed as a string
  selectedProducts: itemSelected[], // Pass selected products as an array of itemSelected
  shippingDetails: any, // Shipping details object
  billingDetails: any // Billing details object
) => {
  try {
    // Prepare the order data payload
    const orderData = {
      walletId: userwalletId, // Include wallet ID
      products: selectedProducts, // Selected products
      shipping: shippingDetails, // Shipping details
      billing: billingDetails // Billing details
    };

    // Make the POST request using axios
    const response = await axios.post(checkoutProductURL, orderData, {
      headers: {
        Authorization: `Bearer ${token}`, // Include Bearer token in headers
        'Content-Type': 'application/json' // Ensure the content type is JSON
      },
    });

    // Return the response data
    return response.data;
  } catch (error) {
    console.error('Error creating new order:', error);
    throw error;
  }
};

const redeemProduct = async (
orderId: string, paymentToken: string, walletId: string): Promise<any> => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    const data = {
      orderId,
      paymentToken,
      walletId,
    };

    const response = await axios.post(redeemURL, data, { headers });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 401) {
        throw new Error("TOKEN_EXPIRED");
      }
      console.error("Error redeeming product:", error.response?.data || error.message);
      throw error;
    } else {
      console.error("Error redeeming product:", error);
      throw error;
    }
  }
};


const getShippingRates = async (
  origin: string,
  destination: string,
  weight: number
): Promise<any> => {
  try {
    const headers = {
      "Content-Type": "application/json",
      "X-locale": "en_US", // Set locale for response language
    };

    const requestPayload = {
      accountNumber: { value: ACCOUNT_NUMBER }, // Your FedEx Account Number
      requestedShipment: {
        shipper: { 
          address: { postalCode: origin, countryCode: "US" } 
        },
        recipient: { 
          address: { postalCode: destination, countryCode: "US" } 
        },
        packages: [
          {
            weight: { 
              units: "LB", // Weight unit: LB (Pounds)
              value: weight, // Weight value
            },
          },
        ],
        serviceType: "FEDEX_GROUND", // FedEx Service Type (Adjust if needed)
        packagingType: "YOUR_PACKAGING", // Packaging Type (Adjust if needed)
      },
    };

    console.log("Sending FedEx API request with payload:", requestPayload);

    // Make the API request to FedEx
    const response = await axios.post(FEDEX_API_URL, requestPayload, {
      headers,
      auth: {
        username: FEDEX_API_KEY, // FedEx API Key
        password: FEDEX_PASSWORD, // FedEx API Password
      },
    });

    // Log and return the response data
    console.log("Received FedEx API response:", response.data);
    return response.data;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "FedEx API error:",
        error.response?.status || "Unknown status",
        error.response?.data || error.message
      );
    } else {
      console.error("Unexpected error while fetching FedEx rates:", error);
    }
    throw new Error("Failed to fetch FedEx rates. Please try again later.");
  }
};



export {
  fetchToken,
  fetchCategories,
  fetchCategoryProducts,
  fetchHomeProducts,
  fetchProductDetails,
  sendWalletId,
  searchProducts,
  getMintPriceAndSignature,
  addUser,
  createNewOrder,redeemProduct,getShippingRates, type itemSelected,
};
