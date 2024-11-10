import React, { useState } from 'react';

type AlertProps = {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
};

const Alert: React.FC<AlertProps> = ({ message, type = 'info' }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  let alertStyles = 'p-4 rounded-md shadow-md mb-4 ';

  switch (type) {
    case 'success':
      alertStyles += 'bg-green-100 text-green-800 border-l-4 border-green-500';
      break;
    case 'error':
      alertStyles += 'bg-red-100 text-red-800 border-l-4 border-red-500';
      break;
    case 'warning':
      alertStyles += 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500';
      break;
    case 'info':
    default:
      alertStyles += 'bg-blue-100 text-blue-800 border-l-4 border-blue-500';
      break;
  }

  return (
    <div className={alertStyles} role="alert">
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => setVisible(false)}
          aria-label="Close"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Alert;
