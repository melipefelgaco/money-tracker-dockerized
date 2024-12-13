import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { formatter } from '../utils/formatter';

const Expense = ({ backgroundColor }) => {
  const token = Cookies.get('token');
  const url = process.env.REACT_APP_LOCAL_API_URL;
  const [expenseData, setExpenseData] = useState({
    name: '',
    value: 0,
    category: '',
    note: ''
  });
  const [expenses, setExpenses] = useState([]);
  const [formError, setFormError] = useState('');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [borderColor, setBorderColor] = useState('border-gray-300');

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setExpenseData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleExpenseClick = (expense) => {
    setSelectedExpense(expense);
    setShowNoteModal(true);
  };

  const handleNoteModalClose = () => {
    setSelectedExpense(null);
    setShowNoteModal(false);
  };

  const handleAddExpense = async (event) => {
    const date = new Date();
    const formattedDate =
      date.getFullYear() +
      '-' +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      '-' +
      date.getDate().toString().padStart(2, '0');
    const capitalizedExpenseName = expenseData.name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    event.preventDefault();
    if (expenseData.name.trim() === '') {
      setFormError('Please enter a name');
      return;
    }
    if (expenseData.value === '' || isNaN(expenseData.value)) {
      setFormError('Please enter a valid value');
      return;
    } else if (expenseData.value === 0) {
      setFormError('Expense value cannot be 0');
      return;
    }
    setFormError('');
    try {
      const response = await fetch(`${url}/api/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: capitalizedExpenseName,
          value: expenseData.value,
          category: expenseData.category,
          note: expenseData.note,
          expense_date: formattedDate
        })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.success) {
        setExpenseData({
          name: '',
          value: 0,
          category: '',
          note: '',
          expense_date: ''
        });
        await fetchExpenses();
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteExpense = async () => {
    try {
      const response = await fetch(`${url}/api/expenses/${selectedExpense.expense_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.success) {
        setSelectedExpense(null);
        setShowNoteModal(false);
        await fetchExpenses();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await fetch(`${url}/api/expenses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      let totalPrice = 0;
      data.forEach((expense) => {
        expense.formattedExpenseDate = formatDate(expense.expense_date);
        totalPrice += parseFloat(expense.value);
      });
      setTotalValue(totalPrice.toFixed(2));
      setExpenses(data);
    } catch (error) {
      console.error(error);
      setExpenses([]);
    }
  }, [setTotalValue, setExpenses, token, url]);

  const handleDeleteAllExpenses = async () => {
    try {
      const response = await fetch(`${url}/api/expenses`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.success) {
        alert('All expenses deleted successfully');
        await fetchExpenses();
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return (
    <>
      <div className="flex justify-center mt-10 mb-10">
        <form
          onSubmit={handleAddExpense}
          className="bg-black shadow-md rounded-lg p-6 w-1/2 mx-2"
          style={{ backgroundColor }}>
          <label className="block mb-4">
            <span className="text-white">Name:</span>
            <input
              type="text"
              name="name"
              value={expenseData.name}
              onChange={handleInputChange}
              className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full"
            />
          </label>
          <label className="block mb-4">
            <div className="">
              <span className="text-white">Value:</span>
              <input
                type="number"
                name="value"
                value={expenseData.value}
                onChange={handleInputChange}
                onClick={() => setBorderColor('border-gray-300')}
                className={`border ${borderColor} px-3 py-3 rounded-md w-full`}
              />
            </div>
          </label>
          <label className="block mb-4">
            <span className="text-white">Category:</span>
            <select
              name="category"
              value={expenseData.category}
              onChange={handleInputChange}
              className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full">
              <option value="">Select a category</option>
              <option value="food">Food</option>
              <option value="leisure">Leisure</option>
              <option value="fixed-expense">Fixed expense</option>
            </select>
          </label>
          <label className="block mb-4">
            <span className="text-white">Note:</span>
            <textarea
              name="note"
              value={expenseData.note}
              onChange={handleInputChange}
              className="border border-gray-300 px-3 py-2 mt-1 rounded-md w-full "></textarea>
          </label>
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-slate-500 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded mt-4">
              Add new expense
            </button>
          </div>
          {formError && <p className="text-red-500 mt-2">{formError}</p>}
        </form>
        <div className="bg-black shadow-md rounded-lg p-6 w-1/2 mx-2" style={{ backgroundColor }}>
          {expenses && expenses.length > 0 ? (
            <ul className="justify-center text-center p-5">
              {expenses.map((expense) => (
                <li key={expense.expense_id} className="mb-2">
                  <button
                    className="text-white  w-full rounded-md"
                    onClick={() => handleExpenseClick(expense)}>
                    {expense.name}
                    <span className="ml-2 text-yellow-500 ">{formatter.format(expense.value)}</span>
                    <span className="ml-2 text-blue-300">{expense.category}</span>
                  </button>
                  <hr className="mt-1" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white text-center">No expenses found.</p>
          )}
          <p className="text-center mt-4 font-bold text-xl text-yellow-500">
            Total expenses: {formatter.format(totalValue)}
          </p>
          <div className="flex justify-center mt-5">
            <button
              onClick={handleDeleteAllExpenses}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Delete All Expenses
            </button>
          </div>
        </div>
      </div>
      {selectedExpense && showNoteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-h-96 overflow-y-auto w-1/2">
            <h2 className="text-xl font-bold mb-4">{selectedExpense.name}</h2>
            <p className="mb-2">{selectedExpense.note}</p>
            <p className="mb-4">Creation Date: {selectedExpense.formattedExpenseDate}</p>{' '}
            <button
              onClick={handleNoteModalClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4">
              Close
            </button>
            <button
              onClick={handleDeleteExpense}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mt-4">
              DELETE
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Expense;
