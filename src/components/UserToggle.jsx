import React from 'react';

const UserToggle = ({ userType, setUserType }) => (
  <div className="flex justify-center gap-4 mb-6">
    <button
      onClick={() => setUserType('RR')}
      className={`px-4 py-2 rounded-full border ${userType === 'RR' ? 'bg-[#c4000e] text-white' : 'bg-white text-gray-700'}`}
    >
      RRI User
    </button>
    <button
      onClick={() => setUserType('Transporter')}
      className={`px-4 py-2 rounded-full border ${userType === 'Transporter' ? 'bg-[#c4000e] text-white' : 'bg-white text-gray-700'}`}
    >
      Transporter User
    </button>
  </div>
);

export default UserToggle;
