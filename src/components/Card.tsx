// Card.tsx
import React, { useState } from 'react';
import eth from '../asserts/images/Etherium.svg';

type CardProps = {
  imgSrc: string;
  title: string;
  price: number;
};

const Card: React.FC<CardProps> = ({ imgSrc, title, price }) => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrease = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const handleDecrease = () => {
    setQuantity((prevQuantity) => Math.max(prevQuantity - 1, 1));
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <div className="bg-gray-100 p-4">
        <img className="w-full h-96 object-contain" src={imgSrc} alt={title} />
      </div>
      <div className="p-4">
        <h3 className="font-serif text-sm">{title}</h3>
        <div className="mt-2 flex items-center">
          <img src={eth} alt="eth" className="w-5 h-5 mr-1" />
          <span>{price}</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              className="focus:outline-none bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-l"
              onClick={handleDecrease}
            >
              -
            </button>
            <input
              type="text"
              value={quantity}
              readOnly
              className="w-12 text-center border border-gray-300"
            />
            <button
              type="button"
              className="focus:outline-none bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-r"
              onClick={handleIncrease}
            >
              +
            </button>
          </div>
          <button
            type="button"
            className="focus:outline-none text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:focus:ring-yellow-900"
          >
            Mint Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
