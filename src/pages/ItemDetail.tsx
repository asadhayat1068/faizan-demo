
import React, { useEffect, useState } from "react";
import { useAPI } from "../apiContext";
import { useParams } from "react-router-dom";
import eth from "../asserts/images/Etherium.svg";
import Spinner from "../components/Spinner";
import Seperator from "../asserts/images/Seperator.svg";
import { Link } from "react-router-dom";
import MintButton from "../components/MintButton";
interface ProductDetails {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  custom_attributes: Array<{ attribute_code: string, value: any }>;
  [key: string]: any; // for other attributes
}

const ItemDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { getProductDetails } = useAPI();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1); // Default quantity

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const productDetails = await getProductDetails(productId);
        setProduct({
          ...productDetails,
          imageUrl: productDetails.media_gallery_entries?.[0]?.file
            ? `https://cryptrovia.com/pub/media/catalog/product${productDetails.media_gallery_entries[0].file}`
            : "https://via.placeholder.com/400",
        });
      } catch (err) {
        setError("Failed to fetch product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, getProductDetails]);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleMintNowClick = () => {
    // Implement buy now logic
    alert(`Minting ${quantity} ${product?.name}(s)!`);
  };

  const stripHtmlTags = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">{error}</div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Product not found
      </div>
    );
  }

  const attributesMap: Record<string, string> = {
    short_description: "Short Description",
    image: "Image",
    url_key: "URL Key",
    page_layout: "Page Layout",
    small_image: "Small Image",
    description: "Description",
    thumbnail: "Thumbnail",
    cost: "Cost",
    shippingcost: "Shipping Cost",
    usd: "USD",
    msrp: "MSRP",
    tax_class_id: "Tax Class ID",
    category_ids: "Category IDs",
    required_options: "Required Options",
    has_options: "Has Options",
    length: "Length",
    width: "Width",
    height: "Height",
    brand: "Brand",
  };

  const customAttributes = product.custom_attributes.reduce(
    (acc: Record<string, any>, attr) => {
      acc[attr.attribute_code] = attr.value;
      return acc;
    },
    {}
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-auto object-contain rounded-lg shadow-lg"
          />
        </div>
        <div className="md:w-1/2 md:pl-8 mt-4 md:mt-0">
          <h1 className="text-3xl font-bold mb-1 text-gray-800">
            {product.name}
          </h1>
          <div className="text-gray-500 font-sans flex flex-row space-x-4 mb-1">
            <div>By Cryptovia</div>
            <img src={Seperator} />
            <div>
              <Link
                key="opensea"
                to={`https://opensea.io/collection/cryptrovia`}
              >
                Visit OpenSea store
              </Link>
            </div>
            <img src={Seperator} />
            <div>
              <span className="font-bold">Sku:</span> {product.sku}
            </div>
          </div>
          <div className="mt-2 flex items-center">
            <img src={eth} alt="eth" className="w-5 h-5" />
            <span className="text-green-700">{product.price}</span>
            <span className="pl-2">{"/"}</span>
            <span className="text-red-700 pl-2">
              ${customAttributes["usd"]}
            </span>
          </div>

          <div className="flex items-center mt-4">
            <button
              className="bg-gray-300 text-gray-700 px-4 py-2"
              onClick={() => handleQuantityChange(quantity - 1)}
            >
              -
            </button>
            <input
              type="text"
              value={quantity}
              className="w-16 text-center border border-gray-300 mx-1 rounded"
              readOnly
            />
            <button
              className="bg-gray-300 text-gray-700 px-4 py-2"
              onClick={() => handleQuantityChange(quantity + 1)}
            >
              +
            </button>

            {/* <button
              className="ml-2 h-11 w-32 bg-yellow-500 text-white rounded-lg shadow-lg hover:bg-yellow-600 transition duration-300 ease-in-out"
              onClick={handleMintNowClick}
            >
              Mint Now

            </button> */}
            <span className="ml-2">
              <MintButton
                price_usd={product.price_usd}
                price_eth={product.price_eth}
                sku={product.sku}
                quantity={quantity}
              />
            </span>
          </div>

          <div className="text-sm mt-6 grid grid-cols-2 gap-1 max-w-xs">
            <div className="text-gray-600 flex items-center space-x-0">
              <span className="font-semibold mr-1">ID:</span>
              <span>{product.id}</span>
            </div>
            <div className="text-gray-600 flex items-center space-x-0">
              <span className="font-semibold mr-1">SKU:</span>
              <span className="whitespace-nowrap">{product.sku}</span>
            </div>
            {customAttributes["length"] && (
              <div className="text-gray-600 flex items-center space-x-0">
                <span className="font-semibold mr-1">Length:</span>
                <span>{customAttributes["length"]} cm</span>
              </div>
            )}
            {customAttributes["width"] && (
              <div className="text-gray-600 flex items-center space-x-0">
                <span className="font-semibold mr-1">Width:</span>
                <span>{customAttributes["width"]} cm</span>
              </div>
            )}
            {customAttributes["height"] && (
              <div className="text-gray-600 flex items-center space-x-0">
                <span className="font-semibold mr-1">Height:</span>
                <span>{customAttributes["height"]} cm</span>
              </div>
            )}
            {customAttributes["brand"] && (
              <div className="text-gray-600 flex items-center space-x-0">
                <span className="font-semibold mr-1">Brand:</span>
                <span>{customAttributes["brand"]}</span>
              </div>
            )}
          </div>
          <div className="my-4 border-t border-gray-300 "></div>

          {customAttributes["description"] && (
            <div className="mb-2 font-sans">

              <span className="text-gray-600">
                {stripHtmlTags(customAttributes["description"])}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
