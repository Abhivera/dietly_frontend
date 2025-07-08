import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { User, UserPlus, Home as HomeIcon, Menu, X } from "lucide-react";

export default function PublicNavbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActiveRoute = (path) => location.pathname === path;

  const navigationItems = [

    {
      path: "/login",
      label: "Sign Up / Log In",
      icon: (
        <span className="border border-gray-300 rounded-md p-1 mr-2">
          <User className="w-5 h-5" />
        </span>
      ),
    },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-40 w-full">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between relative">
        {/* Mobile Hamburger - left */}
        <div className="md:hidden flex-shrink-0">
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
        {/* Logo - centered on mobile, left on desktop */}
        <Link
          to="/"
          className="flex items-center gap-1 md:static md:left-0 md:translate-x-0 absolute left-1/2 -translate-x-1/2 md:relative"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            ...(window.innerWidth >= 768
              ? { position: "relative", left: "0", transform: "none" }
              : {}),
          }}
        >
          <img
            src="https://myabhibucket30june2025.s3.ap-south-1.amazonaws.com/default_media/one_leaf.svg"
            alt="Dietly Logo"
            className="w-8 h-8 rounded-lg object-contain"
          />
          <span className="font-bold text-emerald-700 text-lg">Dietly</span>
        </Link>
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 ml-auto">
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
