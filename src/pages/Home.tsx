import React, { useEffect, useState, useRef } from 'react';
import banner from '../asserts/images/Banner.png';
import ItemScroller from '../components/ItemScroller';
import { useAPI } from '../apiContext';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
  products: Product[];
}

interface HomeProductsProps {
  categories: Category[];
}

const Home = () => {
  const { getHomeProducts } = useAPI();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(24);

  // Reference for the horizontal scroll container
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Function to scroll left
  const scrollLeft = (index: number) => {
    scrollRefs.current[index]?.scrollBy({
      left: -200, // Adjust the scroll amount as needed
      behavior: 'smooth'
    });
  };

  // Function to scroll right
  const scrollRight = (index: number) => {
    scrollRefs.current[index]?.scrollBy({
      left: 200, // Adjust the scroll amount as needed
      behavior: 'smooth'
    });
  };


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const structuredData = await getHomeProducts(pageSize, currentPage);
       
        setCategories(structuredData);
        setLoading(false);
      } catch (error) {
        setError(error as Error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [getHomeProducts, pageSize, currentPage]);

  if (loading) return <Spinner />;
  if (error) return <div>Error: {error.message}</div>;
  return (
  <div className="max-w-[1176px] w-full flex flex-col items-center-center mx-auto aos-init aos-animate mt-5 mainbanner">
    <img src={banner} alt="cryptrovia" />
    <div className="flex items-center justify-center text-primary-2 w-full px-2 mt-6">
        <p className="text-4xl">Featured Physically-Backed NFTs</p>
        
    </div>
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {categories.map((category, index) => (
        <div key={category.categoryId} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Category {category.categoryName}</h2>
          <div className="relative">
            <button
              onClick={() => scrollLeft(index)}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-800"
            >
              &lt;
            </button>
            <div
              ref={el => scrollRefs.current[index] = el}
              className="flex flex-no-wrap overflow-x-auto space-x-6 scrollbar-hide py-4 -mx-2"
            >
              {category.products.map(product => (
                <div key={product.id} className="flex-none w-1/3 px-2">
                  <Card
                    imgSrc={product.imageUrl}
                    title={product.name}
                    price={product.price}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => scrollRight(index)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-800"
            >
              &gt;
            </button>
          </div>
        </div>
      ))}
    </div>
    </div>
);
};

export default Home;
