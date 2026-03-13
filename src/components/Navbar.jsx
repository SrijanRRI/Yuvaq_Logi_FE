import React, { useState } from "react";
import { User, LogOut, Menu, X } from "lucide-react";
import logo from "/assets/LogiYatraIcon1.png";

const Navbar = ({
  title,
  userName,
  actions = [],
  extraActions = [],
  onLogout,
  onProfileClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainButtons = (Array.isArray(actions) ? actions : [actions]).filter(Boolean);
  const adminButtons = (Array.isArray(extraActions) ? extraActions : [extraActions]).filter(Boolean);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleMobileButtonClick = (btn) => {
    setMobileMenuOpen(false);
    if (typeof btn?.props?.onClick === "function") {
      btn.props.onClick();
    }
  };

  const handleProfileClick = () => {
    setMobileMenuOpen(false);
    if (typeof onProfileClick === "function") {
      onProfileClick();
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
                src={logo}
                alt="Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="text-xs text-slate-500">Welcome, {userName}</p>
            </div>
          </div>

          {/* Hamburger Menu for Mobile */}
          <button
            className="md:hidden p-2 rounded-md text-slate-700 hover:bg-slate-100 transition-all duration-200"
            onClick={toggleMobileMenu}
            type="button"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop View */}
          <div className="hidden md:flex items-center gap-3">
            {/* Clickable User Info */}
            <button
              type="button"
              onClick={handleProfileClick}
              className="flex items-center gap-2 bg-gradient-to-r from-slate-200 to-emerald-200 px-3 py-2 rounded-lg border border-slate-200 shadow-sm hover:shadow transition-all duration-200 hover:scale-[1.02]"
              title="Open Profile"
            >
              <div className="bg-white p-1.5 rounded-full shadow-sm">
                <User className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-slate-900">{userName}</div>
                <div className="text-[11px] text-slate-600">View Profile</div>
              </div>
            </button>

            {mainButtons.map((btn, idx) => (
              <React.Fragment key={`main-${idx}`}>{btn}</React.Fragment>
            ))}

            {adminButtons.map((btn, idx) => (
              <React.Fragment key={`admin-${idx}`}>{btn}</React.Fragment>
            ))}

            <button
              onClick={onLogout}
              type="button"
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
            <button
              type="button"
              onClick={handleProfileClick}
              className="w-full flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-lg mx-1 mb-3 hover:bg-emerald-50 transition"
            >
              <div className="bg-white p-1.5 rounded-full shadow-sm">
                <User className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-slate-700">{userName}</div>
                <div className="text-[11px] text-slate-500">View Profile</div>
              </div>
            </button>

            <div className="space-y-1.5 px-1">
              {[...mainButtons, ...adminButtons].map((btn, idx) =>
                React.isValidElement(btn)
                  ? React.cloneElement(btn, {
                      key: `mobile-${idx}`,
                      className: "w-full justify-center rounded-lg " + (btn.props.className || ""),
                      onClick: () => handleMobileButtonClick(btn),
                    })
                  : null
              )}

              <button
                onClick={onLogout}
                type="button"
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