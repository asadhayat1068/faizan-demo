// Card.tsx
import React, { useState } from 'react';
import eth from '../asserts/images/Etherium.svg';
import { Link } from "react-router-dom";
type CardProps = {
  imgSrc: string;
  title: string;
  price: number;
  id:number;
};

const Card: React.FC<CardProps> = ({ imgSrc, title, price,id }) => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrease = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const handleDecrease = () => {
    setQuantity((prevQuantity) => Math.max(prevQuantity - 1, 1));
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <Link
                key={id}
                to={`/detail/${id}`}
                
              >
      <div className="bg-gray-100 p-4">
        <img className="w-full h-96 object-contain" src={imgSrc} alt={title} />
      </div>
      </Link>
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
            className="h-11 w-40 bg-yellow-500 text-white  rounded-lg shadow-lg hover:bg-yellow-600 transition duration-300 ease-in-out"
          >
            Mint Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
