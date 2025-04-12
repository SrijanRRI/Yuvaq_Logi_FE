const AdminAllUsers = ({ users = [], title = "Users" }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>

      <div className="p-6">
        {users.length === 0 ? (
          <div className="text-center py-10">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No users found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((user, idx) => (
              <div
                key={idx}
                className="p-5 rounded-lg border border-gray-100 bg-white hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-emerald-700 font-bold">{user.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg">{user.name}</h3>
                    <p className="text-gray-500 text-sm mb-2">{user.email}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {user.role}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {user.isApproved ? "Approved" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAllUsers
