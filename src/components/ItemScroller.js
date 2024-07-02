import React, { useRef } from 'react';
import ProductCard from '../components/Card';

const ItemScroller = ({  products  }) => {
  const scrollerRef = useRef(null);

  const scrollLeft = () => {
    scrollerRef.current.scrollBy({ left: -240, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
  };
  
  return (
    <div className="my-8">
      <div className="flex items-center mb-4">
        <button 
          className="p-2 bg-gray-300 rounded-full hover:bg-gray-400 focus:outline-none" 
          onClick={scrollLeft}
        >
          {"<"}
        </button>
        <div 
          className="flex space-x-4 overflow-x-auto scrollbar-hide" 
          ref={scrollerRef}
        >
          {products.map((product, index) => (
            <ProductCard key={index} product={product} />
          ))}
        </div>
        <button 
          className="p-2 bg-gray-300 rounded-full hover:bg-gray-400 focus:outline-none" 
          onClick={scrollRight}
        >
          {">"}
        </button>
      </div>
    </div>
  );
};

export default ItemScroller;
