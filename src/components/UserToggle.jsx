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
      onClick={() => setUserType('Transporter')}
      className={`px-4 py-2 rounded-full border ${userType === 'Transporter' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
    >
      Transporter
    </button>
  </div>
);

export default UserToggle;
