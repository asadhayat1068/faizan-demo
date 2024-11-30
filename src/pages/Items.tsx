import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAPI } from "../apiContext";
import Card from "../components/Card";
import Spinner from "../components/Spinner"; // Import Spinner component
import { FaFilter, FaTimes, FaCheck } from 'react-icons/fa';

interface Product {
  media_gallery_entries: { file: string }[];
  name: string;
  price_eth: number;
  price_usd: number;
  id: number;
  sku: string;
}
const colors = [
  { name: 'Red', value: '#FF0000' },
  { name: 'Blue', value: '#0000FF' },
  { name: 'Green', value: '#008000' },
  { name: 'Yellow', value: '#FFFF00' },
  { name: 'Orange', value: '#FFA500' },
  { name: 'Purple', value: '#800080' },
  { name: 'Deep Pink', value: '#FF1493' },
  { name: 'Cyan', value: '#00FFFF' },
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Gray', value: '#808080' },
  { name: 'Orange Red', value: '#FF4500' },
  { name: 'Sea Green', value: '#2E8B57' },
  { name: 'Blue Violet', value: '#8A2BE2' },
  { name: 'Cadet Blue', value: '#5F9EA0' },
  { name: 'Chocolate', value: '#D2691E' },
  { name: 'Golden Rod', value: '#DAA520' },
  { name: 'Indigo', value: '#4B0082' },
  { name: 'Tomato', value: '#FF6347' },
  { name: 'Aquamarine', value: '#7FFFD4' },
  { name: 'Bisque', value: '#FFE4C4' },
  { name: 'Lime', value: '#00FF00' },
  { name: 'Steel Blue', value: '#4682B4' },
  { name: 'Pale Violet Red', value: '#DB7093' },
  { name: 'Indian Red', value: '#CD5C5C' },
  { name: 'Thistle', value: '#D8BFD8' },
  { name: 'Hot Pink', value: '#FF69B4' },
  { name: 'Cornflower Blue', value: '#6495ED' },
  { name: 'Light Steel Blue', value: '#B0C4DE' },
  { name: 'Lime Green', value: '#32CD32' }
];

const Items: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { getCategoryProducts } = useAPI();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(24);
  const [totalCount, setTotalCount] = useState(0);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { items: fetchedProducts, total_count: totalCount } =
          await getCategoryProducts(Number(categoryId), pageSize, currentPage);
        setProducts(fetchedProducts);
        setTotalCount(totalCount);
        setLoading(false);
      } catch (error) {
        setError(error as Error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, getCategoryProducts, pageSize, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const startPage = Math.floor((currentPage - 1) / 10) * 10 + 1;
  const endPage = Math.min(startPage + 9, totalPages);

  if (loading) return <Spinner />; // Display Spinner while loading
  if (error) return <div>Error: {error.message}</div>;

  const toggleFilter = () => {
    setIsFilterVisible((prev) => !prev);
  };

  const handleColorSelect = (color: string) => {console.log(color)
    setSelectedColor(color === selectedColor ? '' : color);
  };

  const handleMinPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMinPrice(Number(event.target.value));
  };

  const handleMaxPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(Number(event.target.value));
  };
  const applyFilters = async () => {
    try {
      setLoading(true); // Show loading spinner
      const { items: filteredProducts, total_count: filteredTotalCount } =
        await getCategoryProducts(
          Number(categoryId), // Current category ID
          pageSize, // Number of products per page
          1, // Reset to the first page
          selectedColor, // Selected color filter
          minPrice, // Minimum price
          maxPrice // Maximum price
        );
      setProducts(filteredProducts); // Update products state
      setTotalCount(filteredTotalCount); // Update total count state
      setCurrentPage(1); // Reset to the first page
      setIsFilterVisible(false); // Hide the filter modal after applying
    } catch (error) {
      setError(error as Error); // Capture and set error state
      console.error("Error applying filters:", error);
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };
  
  
  return (
    <div className="container mx-auto px-4 py-8 relative">
      <div className="flex justify-between mb-4">
        <button onClick={toggleFilter} className="flex items-center px-4 py-2 text-white rounded shadow-md" style={{ backgroundColor: '#c27803' }}>
          <FaFilter className="mr-2" />
          Filter & Sort
        </button>
      </div>
      {isFilterVisible && (
        <div className="fixed right-0 top-0 w-1/4 h-full bg-gray-100 p-4 shadow-lg z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Filters</h3>
            <button onClick={toggleFilter} className="text-gray-500 hover:text-gray-700">
              <FaTimes size={24} />
            </button>
          </div>
          {/* Color Filter */}
          <div className="mb-4">
            <label htmlFor="color-filter" className="block mb-2">Color:</label>
            <div className="grid grid-cols-5 gap-2">
              {colors.map((color) => (
                <div
                  key={color.value}
                  className={`w-8 h-8 rounded cursor-pointer relative ${selectedColor === color.value ? 'ring-2 ring-offset-2 ring-yellow-500' : ''}`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  onClick={() => handleColorSelect(color.name)}
                >
                  {selectedColor === color.name && (
                    <FaCheck className="text-white absolute inset-0 flex items-center justify-center" />
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Price Range Filter */}
          <div className="mb-4">
            <label className="block mb-2">Price Range (ETH):</label>
            <div className="flex items-center justify-between mb-2">
              <span>{minPrice.toFixed(3)} ETH</span>
              <span>{maxPrice.toFixed(3)} ETH</span>
            </div>
            <div className="flex justify-between space-x-2">
              <input
                type="range"
                min="0"
                max="10"
                step="0.001"
                value={minPrice}
                onChange={handleMinPriceChange}
                className="w-full range-input"
                style={{ accentColor: '#c27803' }}
              />
              <input
                type="range"
                min="0"
                max="100"
                step="0.001"
                value={maxPrice}
                onChange={handleMaxPriceChange}
                className="w-full range-input"
                style={{ accentColor: '#c27803' }}
              />
            </div>
          </div>
          {/* Apply Filters Button */}
          <button onClick={applyFilters} className="w-full px-4 py-2 text-white rounded shadow-md" style={{ backgroundColor: '#c27803' }}>
            Apply Filters
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const imgSrc = product.media_gallery_entries?.[0]?.file
            ? `https://cryptrovia.com/pub/media/catalog/product${product.media_gallery_entries[0].file}`
            : "https://via.placeholder.com/400";
          return (
            <Card
              id={product.id}
              imgSrc={imgSrc}
              title={product.name}
              price_eth={product.price_eth}
              price_usd={product.price_usd}
              sku={product.sku}
              key={product.id}
            />
          );
        })}
      </div>
      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md disabled:bg-gray-200 disabled:text-gray-500"
        >
          Previous
        </button>
        {Array.from(
          { length: endPage - startPage + 1 },
          (_, index) => startPage + index
        ).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 rounded-md ${
              currentPage === page
                ? "bg-blue-500 text-white"
                : "bg-gray-300 text-gray-700"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md disabled:bg-gray-200 disabled:text-gray-500"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Items;
