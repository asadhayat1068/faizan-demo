import React from 'react';

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center min-h-screen">
    <button
      type="button"
      className="bg-yellow-500 text-white font-bold py-2 px-4 rounded inline-flex items-center"
      disabled
    >
      <svg
        className="animate-spin h-5 w-5 mr-3"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z"
        ></path>
      </svg>
      loading...
    </button>
  </div>
);

export default Spinner;
