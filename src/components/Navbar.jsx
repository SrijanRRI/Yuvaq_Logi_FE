import React, { useState } from "react"

const Navbar = ({ title, userName, actions, onLogout }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleActionClick = (action) => {
        setMobileMenuOpen(false)
        if (typeof action.props.onClick === "function") {
          action.props.onClick()
        }
      }

    return (
        <nav className="bg-white shadow-md px-4 sm:px-6 py-4 sticky top-0 z-10">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-600">{title}</h1>

                {/* Mobile menu button */}
                <button
                    className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? (
                        // Cross icon
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        // Hamburger icon
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>

                {/* Desktop navigation */}
                <div className="hidden md:flex items-center gap-4">
                    <span className="text-gray-800 font-medium">{userName}</span>
                    {actions}
                    <button onClick={onLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
                        Logout
                    </button>
                </div>
            </div>

            {/* Mobile menu dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden mt-3 pt-3 border-t border-gray-200">
                    <div className="flex flex-col space-y-2 pb-3">
                        <span className="text-gray-800 font-medium px-2">{userName}</span>
                        {React.Children.map(actions, (action) =>
                            React.cloneElement(action, {
                                className: action.props.className + " w-full justify-center",
                                onClick: () => handleActionClick(action),
                            }),
                        )}
                        <button onClick={onLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar