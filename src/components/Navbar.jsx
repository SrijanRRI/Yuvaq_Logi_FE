import React, { useState } from "react";
import { User, LogOut, Menu, X } from "lucide-react";

const Navbar = ({ title, userName, actions = [], extraActions = [], onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Ensure both actions are always arrays
  const mainButtons = Array.isArray(actions) ? actions : [actions];
  const adminButtons = Array.isArray(extraActions) ? extraActions : [extraActions];

  // Toggle mobile menu open/close
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handles button click in mobile to close menu and call its onClick if defined
  const handleMobileButtonClick = (btn) => {
    setMobileMenuOpen(false);
    if (typeof btn.props.onClick === "function") {
      btn.props.onClick();
    }
  };

  return (
    <nav className="bg-white shadow-md px-4 sm:px-6 py-4 sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-[#c4000e]">{title}</h1>

        {/* Hamburger Menu for Mobile */}
        <button
          className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Desktop View */}
        <div className="hidden md:flex items-center gap-4 flex-wrap">
          {/* User Info */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2.5 rounded-full border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="bg-white p-1.5 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
              <User className="h-4 w-4 text-indigo-600" />
            </div>
            <span className="text-gray-700 font-medium tracking-wide pr-1">{userName}</span>
          </div>

          {/* Main buttons (e.g. View History, Requests etc.) */}
          {mainButtons.map((btn, idx) => (
            <React.Fragment key={`main-${idx}`}>{btn}</React.Fragment>
          ))}

          {/* Extra buttons (e.g. Admin-only) */}
          {adminButtons.map((btn, idx) => (
            <React.Fragment key={`admin-${idx}`}>{btn}</React.Fragment>
          ))}

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-col space-y-2 pb-3">
            {/* Mobile User Info */}
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full mx-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-gray-800 font-medium">{userName}</span>
            </div>

            {/* All buttons for mobile */}
            {[...mainButtons, ...adminButtons].map((btn, idx) =>
              React.cloneElement(btn, {
                key: `mobile-${idx}`,
                className: (btn.props.className || "") + " w-full justify-center",
                onClick: () => handleMobileButtonClick(btn),
              })
            )}

            {/* Mobile Logout */}
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 flex items-center gap-2 justify-center mx-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
