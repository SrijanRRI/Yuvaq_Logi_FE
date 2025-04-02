import React from 'react';

const UserToggle = ({ userType, setUserType }) => (
  <div className="flex justify-center gap-4 mb-6">
    <button
      onClick={() => setUserType('RR')}
      className={`px-4 py-2 rounded-full border ${userType === 'RR' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
    >
      RR User
    </button>
    <button
      onClick={() => setUserType('Customer')}
      className={`px-4 py-2 rounded-full border ${userType === 'Customer' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
    >
      Customer
    </button>
  </div>
);

export default UserToggle;
