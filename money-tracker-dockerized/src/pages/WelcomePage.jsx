import React from 'react';
import { Link } from 'react-router-dom';

const WelcomePage = () => {
  return (
    <div className="bg-gray-100 h-screen flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold mb-4">Welcome to the Money Tracker App!</h2>
      <p className="text-lg mb-6">This is the page of the app</p>
      <div className="flex space-x-4">
        <Link to="/login">
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Sign In
          </button>
        </Link>
        <Link to="/signup">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Sign Up
          </button>
        </Link>
        <Link to="/dashboard">
          <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
};

export default WelcomePage;
