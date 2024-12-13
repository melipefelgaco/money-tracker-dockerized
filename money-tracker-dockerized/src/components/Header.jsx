import React, { useContext, useEffect } from 'react';
import { UserContext } from '../UserContext';
import { useNavigate, Link } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(UserContext);
  const { handleLogout } = useContext(UserContext);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const signOut = () => {
    handleLogout();
    navigate('/');
  };

  return (
    <div className="flex flex-row justify-center items-center bg-gray-800 text-white p-6 text-3xl w-full">
      <Link to="/login">
        <button className="bg-green-500 text-gray-800 px-4 py-2 rounded-md border-none cursor-pointer text-xl hover:bg-gray-300">
          Sign In
        </button>
      </Link>
      <Link to="/dashboard">
        <button className="bg-purple-500 text-gray-800 px-4 py-2 rounded-md border-none cursor-pointer text-xl hover:bg-gray-300 ml-4">
          Dashboard
        </button>
      </Link>
      <Link to="/">
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-gray-800 px-4 py-2 rounded-md border-none cursor-pointer text-xl hover:bg-gray-300 ml-4">
          Sign Out
        </button>
      </Link>
    </div>
  );
};

export default Header;
