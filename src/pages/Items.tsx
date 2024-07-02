import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAPI } from '../apiContext';
import Card from '../components/Card';
import Spinner from '../components/Spinner'; // Import Spinner component

interface Product {
  media_gallery_entries: { file: string }[];
  name: string;
  price: number;
  id: number;
}

const Items: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { getCategoryProducts } = useAPI();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(24);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { items: fetchedProducts, total_count: totalCount } = await getCategoryProducts(categoryId, pageSize, currentPage);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const imgSrc = product.media_gallery_entries?.[0]?.file
            ? `https://cryptrovia.com/pub/media/catalog/product${product.media_gallery_entries[0].file}`
            : 'https://via.placeholder.com/400';
          return (
            <Card
              key={product.id}
              imgSrc={imgSrc}
              title={product.name}
              price={product.price}
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
        {Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 rounded-md ${
              currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
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
