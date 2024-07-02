import React, { useState, useRef, useEffect } from 'react';
import { Link } from "react-router-dom";
import { useAPI } from '../../apiContext';
import headphones from '../../asserts/images/hphone.png';
import lw from '../../asserts/images/lw.svg';
import luxuryhandbags from '../../asserts/images/luxuryhandbags.svg';
import Sports from '../../asserts/images/Sports.svg';
import jewelry from '../../asserts/images/jewelry.svg';
import tc from '../../asserts/images/tc.svg';
import comics from '../../asserts/images/comics.svg';
import vinyl from '../../asserts/images/vinyl.svg';
import applei from '../../asserts/images/applei.svg';
import gamming from '../../asserts/images/gamming.svg';

const CategoryMenu = () => {
  const { categories } = useAPI();
  
  const [isOpen, setIsOpen] = useState(false);
  const addSpaceBeforeCapital = (str) => {
    return str.replace(/([A-Z])/g, ' $1').trim();
  };
  
  const menuRef = useRef(null);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    console.log('Menu toggled');
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      console.log('Clicked outside menu');
      setIsOpen(false);
    }
  };

  const handleCategoryClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-10 gap-2 pt-5 pl-5 pr-5">
        <img src={headphones} alt="headphones" className="w-full cursor-pointer" onClick={toggleMenu} />
        <Link to={'/items/3577'}><img src={lw} alt="lw" className="w-full cursor-pointer" /></Link>
        <Link to={'/items/4189'}><img src={luxuryhandbags} alt="luxuryhandbags" className="w-full cursor-pointer" /></Link>
        <Link to={'/items/4188'}><img src={Sports} alt="Sports" className="w-full cursor-pointer" /></Link>
        <Link to={'/items/2853'}><img src={jewelry} alt="jewelry" className="w-full cursor-pointer" /></Link>
        <Link to={'/items/3581'}><img src={tc} alt="tc" className="w-full cursor-pointer" /></Link>
        <Link to={'/items/3582'}><img src={comics} alt="comics" className="w-full cursor-pointer" /></Link>
        <Link to={'/items/3583'}><img src={vinyl} alt="vinyl" className="w-full cursor-pointer" /></Link>
        <Link to={'/items/3572'}><img src={applei} alt="applei" className="w-full cursor-pointer" /> </Link>
        <Link to={'/items/3579'}><img src={gamming} alt="gamming" className="w-full cursor-pointer" /></Link>
      </div>
      <div ref={menuRef} className={`absolute left-0 w-full max-w-4xl bg-white shadow-lg rounded-lg ${isOpen ? 'block' : 'hidden'}`} >
        <div className="grid grid-cols-4 gap-2 p-2">
          {categories.map(category => (
            <Link
              key={category.id}
              to={`/items/${category.id}`}
              className="font-sans block px-6 py-1 hover:bg-gray-200 text-sm font-light whitespace-nowrap"
              onClick={handleCategoryClick}
            >
              {addSpaceBeforeCapital(category.name)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryMenu;
