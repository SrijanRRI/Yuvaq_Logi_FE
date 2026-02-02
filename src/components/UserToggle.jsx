// import React from 'react';

// const UserToggle = ({ userType, setUserType }) => (
//   <div className="flex justify-center gap-4 mb-6">
//     <button
//       onClick={() => setUserType('RR')}
//       className={`px-4 py-2 rounded-full border ${userType === 'RR' ? 'bg-[#c4000e] text-white' : 'bg-white text-gray-700'}`}
//     >
//        User
//     </button>
//     <button
//       onClick={() => setUserType('Transporter')}
//       className={`px-4 py-2 rounded-full border ${userType === 'Transporter' ? 'bg-[#c4000e] text-white' : 'bg-white text-gray-700'}`}
//     >
//       Transporter User
//     </button>
//   </div>
// );

// export default UserToggle;

import React from 'react';

const UserToggle = ({ userType, setUserType }) => (
  <div className="mb-6">
    <div className="mx-auto w-full rounded-2xl border border-slate-200 bg-white/70 p-1 shadow-sm">
      <div className="grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setUserType('RR')}
          className={`relative flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-semibold transition
            ${userType === 'RR'
              ? 'bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 text-white shadow-md'
              : 'bg-transparent text-slate-700 hover:bg-slate-50'
            }`}
        >
          User
        </button>

        <button
          type="button"
          onClick={() => setUserType('Transporter')}
          className={`relative flex items-center justify-center rounded-xl px-3 py-2.5 text-sm font-semibold transition
            ${userType === 'Transporter'
              ? 'bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 text-white shadow-md'
              : 'bg-transparent text-slate-700 hover:bg-slate-50'
            }`}
        >
          Transporter User
        </button>
      </div>
    </div>

    {/* subtle helper line (optional UI, no logic change) */}
    <p className="mt-2 text-center text-xs text-slate-500">
      Choose your account type to continue
    </p>
  </div>
);

export default UserToggle;

