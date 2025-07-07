import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { User, UserPlus, Home as HomeIcon, Menu, X } from "lucide-react";

export default function PublicNavbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActiveRoute = (path) => location.pathname === path;

  const navigationItems = [
    { path: "/", label: "Home", icon: <HomeIcon className="w-5 h-5 mr-2" /> },
    {
      path: "/login",
      label: "Sign Up / Log In",
      icon:(<span className="border border-gray-300 rounded-md p-1 mr-2">
      <User className="w-5 h-5" />
    </span>),
    },

  ];

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-40 w-full">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center md:justify-between relative">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-1 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
        >
          <img
            src="/src/assets/one_leaf.png"
            alt="Dietly Logo"
            className="w-8 h-8 rounded-lg object-contain"
          />
          <span className="font-bold text-emerald-700 text-lg">Dietly</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                isActiveRoute(item.path)
                  ? "bg-emerald-600 text-white"
                  : "text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
        {/* Mobile Hamburger */}
        <div className="md:hidden ml-auto">
          <button
            className="p-2 rounded-lg text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white/95 border-t border-emerald-100 px-4 pb-4 animate-fade-in">
          <div className="flex flex-col gap-2 mt-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  isActiveRoute(item.path)
                    ? "bg-emerald-600 text-white"
                    : "text-emerald-700 hover:bg-emerald-100"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
