import axios from "axios";

const tokenURL = "https://cryptrovia.com/api/token.php";
const categoryURL = "https://cryptrovia.com/api/category.php";
const categoryproducts = "https://cryptrovia.com/api/category_products.php";
const homeItems = "https://cryptrovia.com/api/homeitems.php";
const productDetailsURL = "https://cryptrovia.com/api/getproductdetails.php";

export const fetchToken = async () => {
  try {
    const cachedToken = localStorage.getItem("token");
    const cachedExpiration = localStorage.getItem("tokenExpiration");

    if (cachedToken && cachedExpiration) {
      const currentTime = new Date().getTime();
      if (currentTime < parseInt(cachedExpiration, 10)) {
        // console.log("Token fetched from local storage:", cachedToken);
        return cachedToken;
      }
    }

    const response = await axios.get(tokenURL);
    const token = response.data;

    const TOKEN_EXPIRATION_TIME = 3 * 60 * 60 + 50 * 60; // Example: 3 hours 50 minutes
    const expirationTime = new Date().getTime() + TOKEN_EXPIRATION_TIME * 1000;

    localStorage.setItem("token", token);
    localStorage.setItem("tokenExpiration", expirationTime.toString());
    // console.log("Token fetched from server:", token);
    return token;
  } catch (error) {
    console.error(
      "Error fetching token:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const fetchCategories = async (token) => {
  try {
    const headers = {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    };
    const data = {};
    const response = await axios.post(categoryURL, data, { headers });

    return response.data;
  } catch (error) {
    // console.log(error + " error");

    if (error.response && error.response.status === 401) {
      throw new Error("TOKEN_EXPIRED");
    }
    throw error;
  }
};

export const fetchCategoryProducts = async (
  token,
  categoryId,
  pageSize = 10,
  currentPage = 1
) => {
  try {
    const headers = {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    };

    const data = {
      categoryId,
      pageSize,
      currentPage,
    };

    const response = await axios.post(categoryproducts, data, { headers });

    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized
      throw new Error("TOKEN_EXPIRED");
    }
    throw error;
  }
};

export const fetchHomeProducts = async (token) => {
  const categoryIds = [3577, 4189, 4188, 3578, 3581, 3582, 3583, 3572, 3579];
  const pageSize = 20; // Number of products per category
  const currentPage = 1; // We are fetching the first page

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

    const response = await axios.post(homeItems, data, { headers });
    // console.log("service");
    // console.log("Home Product Response Data: ", response.data);

    // Log items to debug category_ids
    response.data.categories.forEach((category) => {
      // console.log(
      //   `Category ID: ${category.categoryId}, Items: ${category.items.length}`
      // );
      category.items.forEach((item) => {
        // console.log(`Item ID: ${item.id}, Category IDs: ${item.category_ids}`);
      });
    });

    // Structure the response data into the desired format
    const structuredData = response.data.categories.map((category) => ({
      categoryId: category.categoryId,
      products: category.items.map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        description:
          item.custom_attributes.find(
            (attr) => attr.attribute_code === "description"
          )?.value || "",
        price_eth: item.price_eth,
        price_usd: item.price_usd,
        imageUrl: item.media_gallery_entries?.[0]?.file
          ? `https://cryptrovia.com/pub/media/catalog/product${item.media_gallery_entries[0].file}`
          : "https://via.placeholder.com/400",
      })),
    }));

    return structuredData;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw new Error("TOKEN_EXPIRED");
    }
    throw error;
  }
};

export const fetchProductDetails = async (token, productId) => {
  try {
    const headers = {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    };

    const data = {
      productId,
    };

    const response = await axios.post(productDetailsURL, data, { headers });
    return response.data.items[0];
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw new Error("TOKEN_EXPIRED");
    }
    throw error;
  }
};

export const getMintPriceAndSignature = async (
  token,
  walletAddress,
  paymentToken,
  productSKU
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
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw new Error("TOKEN_EXPIRED");
    }
    throw error;
  }
};
