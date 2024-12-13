import React, { useState, useContext } from 'react';
import Cookies from 'js-cookie';
import { UserContext } from '../UserContext';
import { formatter } from '../utils/formatter';

const Balance = () => {
  const token = Cookies.get('token');
  const { user } = useContext(UserContext);
  const [inputValue, setInputValue] = useState(0);
  const [balance, setBalance] = useState(user.balance);
  const url = process.env.REACT_APP_LOCAL_API_URL;

  const updateBalance = async (inputValue) => {
    const newBalance = Number(balance) + Number(inputValue);
    try {
      const response = await fetch(`${url}/api/user-balance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ balance: newBalance })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mx-auto max-w-md mt-10">
      <p className="text-center font-bold text-xl mb-4">
        Your balance: {formatter.format(balance)}
      </p>
      <div className="flex items-center space-x-4">
        <button
          type="button"
          name="subtractBtn"
          onClick={() => updateBalance(-inputValue)}
          className="bg-red-500 border border-red-300 text-white px-3 py-2 rounded-md w-full">
          -
        </button>
        <input
          type="number"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          className="border border-gray-400 py-2 px-4 rounded-md"
        />
        <button
          type="button"
          name="addBtn"
          onClick={() => updateBalance(inputValue)}
          className="bg-green-500 border border-green-300 text-white px-3 py-2 rounded-md w-full mb-2">
          +
        </button>
      </div>
    </div>
  );
};

export default Balance;
