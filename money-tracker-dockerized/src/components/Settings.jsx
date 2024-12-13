import React, { useState, useMemo, useEffect } from 'react';
import gearWheelIcon from '../assets/settings-icon.png';

const Settings = ({ onConfigChange, backgroundColor }) => {
  const [localBackgroundColor, setLocalBackgroundColor] = useState(backgroundColor);
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleConfigModal = () => {
    setIsOpen(!isOpen);
  };

  const handleBackgroundColorChange = () => {
    onConfigChange({ backgroundColor: localBackgroundColor });
    handleToggleConfigModal();
  };
  const memoizedBackgroundColor = useMemo(() => localBackgroundColor, [localBackgroundColor]);
  useEffect(() => {
    localStorage.setItem('backgroundColor', memoizedBackgroundColor);
  }, [memoizedBackgroundColor]);
  const savedBackgroundColor = localStorage.getItem('backgroundColor');
  useEffect(() => {
    if (savedBackgroundColor) {
      setLocalBackgroundColor(savedBackgroundColor);
    }
  }, []);

  return (
    <React.Fragment>
      <img
        src={gearWheelIcon}
        alt="gearwheel"
        className="w-12 h-12 cursor-pointer"
        onClick={handleToggleConfigModal}
      />
      {isOpen && (
        <div className="modal-content p-4">
          <h2 className="text-xl font-semibold mb-4">Configurations</h2>
          <label className="block mb-4">
            <span className="text-lg">Background Color:</span>
            <input
              type="color"
              value={localBackgroundColor}
              onChange={(e) => setLocalBackgroundColor(e.target.value)}
              className="mt-2"
            />
          </label>
          <button
            onClick={handleBackgroundColorChange}
            className="bg-blue-500 text-white py-2 px-4 rounded mr-2">
            Apply
          </button>
          <button
            onClick={handleToggleConfigModal}
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded">
            Close
          </button>
        </div>
      )}
    </React.Fragment>
  );
};

export default Settings;
