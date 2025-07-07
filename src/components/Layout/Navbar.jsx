import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../slices/authSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { token } = useSelector((state) => state.auth);

  if (!token) return null;

  const isActiveRoute = (path) => location.pathname === path;

  const navigationItems = [
    { path: "/", label: "Home", icon: "🏠" },
    ...(token
      ? [
          { path: "/images", label: "Images", icon: "🖼️" },
          { path: "/meal-summary", label: "Summary", icon: "📊" },
          { path: "/profile", label: "Profile", icon: "👤" },
        ]
      : []),
  ];

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="fixed left-0 top-0 h-full w-20 bg-gray-50 border-r border-gray-200 z-50">
      {/* Navigation Items */}
      <div className="flex-1 py-4">
        <div className="space-y-4 px-3">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="group flex flex-col items-center gap-2 transition-all duration-200"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActiveRoute(item.path)
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
              </div>
              <span
                className={`text-xs font-medium transition-all duration-200 ${
                  isActiveRoute(item.path) ? "text-purple-600" : "text-gray-600"
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* User Section */}
      <div className="border-t border-gray-200 p-3">
        {token ? (
          <div className="space-y-4">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex flex-col items-center gap-2 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center hover:bg-red-200 transition-colors">
                <span className="text-red-600 text-lg">🚪</span>
              </div>
              <span className="text-red-600 font-medium text-xs">Logout</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full flex flex-col items-center gap-2 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center hover:bg-blue-200 transition-colors">
                <span className="text-blue-600 text-lg">🔑</span>
              </div>
              <span className="text-blue-600 font-medium text-xs">Login</span>
            </Link>
            <Link
              to="/login"
              className="w-full flex flex-col items-center gap-2 transition-all duration-200 group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center hover:bg-green-200 transition-colors">
                <span className="text-green-600 text-lg">✨</span>
              </div>
              <span className="text-green-600 font-medium text-xs">
                Register
              </span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
