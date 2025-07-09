import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../slices/authSlice";
import {
  User,
  LogOut,
  Home as HomeIcon,
  Image as ImageIcon,
  BarChart2,
  UserCircle,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { token } = useSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!token) return null;

  const isActiveRoute = (path) => location.pathname === path;

  const navigationItems = [
    { path: "/", label: "Home", icon: <HomeIcon className="w-4 h-4 mr-2" /> },
    ...(token
      ? [
       
          {
            path: "/meal-summary",
            label: "Summary",
            icon: <BarChart2 className="w-4 h-4 mr-2" />,
          },
          {
            path: "/profile",
            label: "Profile",
            icon: <UserCircle className="w-4 h-4 mr-2" />,
          },
        ]
      : []),
  ];

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-emerald-100/50 sticky top-0 z-40 w-full shadow-sm">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Mobile Hamburger */}
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

          {/* Logo - Enhanced styling */}
          <Link
            to="/"
            className="flex items-center  absolute left-1/2 -translate-x-1/2 md:relative md:left-0 md:translate-x-0 z-10 group"
          >
            <div className="w-10 h-10 rounded-xl  p-2">
              <img
                src="https://myabhibucket30june2025.s3.ap-south-1.amazonaws.com/default_media/one_leaf.svg"
                alt="Dietly Logo"
                // className="w-full h-full object-contain filter brightness-0 invert"
              />
            </div>
            <span className="font-bold text-emerald-800 text-xl tracking-tight">Dietly</span>
          </Link>

          {/* Desktop Navigation - Polished design */}
          <div className="hidden md:flex items-center ml-auto">
            {/* Navigation Links */}
            <div className="flex items-center bg-emerald-50/50 rounded-xl p-1 mr-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    isActiveRoute(item.path)
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-emerald-700 hover:bg-white/80 hover:text-emerald-800"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Logout Button */}
            {token && (
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 hover:border-red-300"
              >
                <LogOut className="w-4 h-4 mr-2" /> 
                Logout
              </button>
            )}
          </div>
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
            {/* Logout Button */}
            {token && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center px-4 py-3 rounded-lg font-medium transition-colors duration-200 text-red-600 hover:bg-red-100"
              >
                <LogOut className="w-5 h-5 mr-2" /> Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}