import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../UserContext';
import Header from '../components/Header';
import Balance from '../components/Balance';
import Budget from '../components/Budget';
import logo from '../assets/logo.jpeg';
import Expense from '../components/Expense';
import Settings from '../components/Settings';

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [expenseConfig, setExpenseConfig] = useState({
    backgroundColor: localStorage.getItem('backgroundColor') || '#000000'
  });
  const handleConfigChange = (config) => {
    setExpenseConfig(config);
    localStorage.setItem('backgroundColor', config.backgroundColor);
  };
  const handleOpenConfigModal = () => {
    setShowConfigModal(true);
  };
  const handleCloseConfigModal = () => {
    setShowConfigModal(false);
  };

  return (
    <>
      <Header />
      {user && (
        <div className="px-10">
          <h1 className="text-3xl font-bold flex items-center justify-center p-10">{`Welcome, ${user.name}!`}</h1>
          {user && (
            <div className="flex flex-col items-center justify-center">
              <Settings
                isOpen={showConfigModal}
                onClose={handleCloseConfigModal}
                onConfigChange={handleConfigChange}
              />
              <Expense backgroundColor={expenseConfig.backgroundColor} />
              <Balance />
              <Budget />
            </div>
          )}
          <img
            src={logo}
            alt="logo"
            className="mt-10 mx-auto block"
            onClick={handleOpenConfigModal}
            style={{ cursor: 'pointer' }}
          />
        </div>
      )}
    </>
  );
};

export default Dashboard;
