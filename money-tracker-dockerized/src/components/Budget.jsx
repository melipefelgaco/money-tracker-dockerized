import React, { useState, useContext } from 'react';
import Cookies from 'js-cookie';
import { UserContext } from '../UserContext';
import { formatter } from '../utils/formatter';

const Budget = () => {
  const token = Cookies.get('token');
  const { user } = useContext(UserContext);
  const [inputValue, setInputValue] = useState(0);
  const [budget, setBudget] = useState(user.budget);
  const url = process.env.REACT_APP_LOCAL_API_URL;

  const updateBudget = async (inputValue) => {
    try {
      const budget = parseInt(inputValue);
      const response = await fetch(`${url}/api/user-budget`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ budget })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.success) {
        setBudget(data.budget);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // TODO: change this based on total of expenses (not yet implemented)
  const getProgressBarColor = () => {
    const progressBarWidth = (budget / 100) * 100;
    if (progressBarWidth <= 33) {
      return 'bg-green-500'; // green if it's less than or equal to 1/3 of the maximum value
    } else if (progressBarWidth <= 66) {
      return 'bg-yellow-500'; // yellow if it's less than or equal to 2/3 of the maximum value
    } else {
      return 'bg-red-500'; // red if it's more than 2/3 of the maximum value
    }
  };

  return (
    <div className="mt-10 mx-auto max-w-md">
      <p className="text-center font-bold text-xl mb-4">Budget: {formatter.format(budget)}</p>
      <div className="relative w-full h-4 bg-gray-400 rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full ${getProgressBarColor()} transition-all ease-linear duration-500`}
          style={{ width: `${(budget / 100) * 100}%` }}></div>
      </div>
      <div className="flex items-center space-x-4 mt-6">
        <input
          type="number"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          className="border border-gray-400 py-2 px-4 rounded-md focus:outline-none focus:border-green-500"
        />
        <button
          type="button"
          onClick={() => updateBudget(inputValue)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-all ease-linear duration-500">
          Update budget
        </button>
      </div>
    </div>
  );
};

export default Budget;
