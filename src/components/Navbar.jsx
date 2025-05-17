import React, { useState } from "react";
import { User, LogOut, Menu, X, Bell, ChevronDown } from 'lucide-react';

import logo from "/assets/LogiYatraIcon1.png"

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
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg overflow-hidden shadow-md">
              <img
                src={logo} // <-- Replace this with the actual path or URL
                alt="Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{title}</h1>
              <p className="text-xs text-slate-500">Welcome, {userName}</p>
            </div>
          </div>

          {/* Hamburger Menu for Mobile */}
          <button
            className="md:hidden p-2 rounded-md text-slate-700 hover:bg-slate-100 transition-all duration-200"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop View */}
          <div className="hidden md:flex items-center gap-3">
            {/* User Info */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-slate-200 to-emerald-200 px-3 py-2 rounded-lg border border-slate-200 shadow-sm hover:shadow transition-all duration-200">
              <div className="bg-white p-1.5 rounded-full shadow-sm">
                <User className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-slate-900">{userName}</span>
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
              className="px-3 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg text-sm hover:from-red-600 hover:to-rose-700 transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 pt-2 pb-3 border-t border-slate-200 space-y-2 animate-fadeIn">
            {/* Mobile User Info */}
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-lg mx-1 mb-3">
              <div className="bg-white p-1.5 rounded-full shadow-sm">
                <User className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">{userName}</span>
            </div>

            {/* All buttons for mobile */}
            <div className="space-y-1.5 px-1">
              {[...mainButtons, ...adminButtons].map((btn, idx) =>
                React.cloneElement(btn, {
                  key: `mobile-${idx}`,
                  className: "w-full justify-center rounded-lg " + (btn.props.className || ""),
                  onClick: () => handleMobileButtonClick(btn),
                })
              )}

              {/* Mobile Logout */}
              <button
                onClick={onLogout}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg text-sm hover:from-red-600 hover:to-rose-700 transition-all duration-200 flex items-center gap-2 justify-center shadow-sm"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;