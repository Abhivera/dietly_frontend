// src/components/Layout/Navbar.jsx
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../slices/authSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  return (
    <nav className="bg-white shadow px-4 py-2 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-bold text-lg text-blue-600">
          Dietly
        </Link>
        {token && (
          <Link to="/images" className="text-gray-700">
            Images
          </Link>
        )}
        {token && (
          <Link to="/meal-summary" className="text-gray-700">
            Meal Summary
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        {token ? (
          <>
            <span className="text-gray-700">
              {user?.full_name || user?.username}
            </span>
            <Link to="/profile" className="text-gray-700">
              Profile
            </Link>
            <button onClick={() => dispatch(logout())} className="text-red-500">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-blue-600">
              Login
            </Link>
            <Link to="/register" className="text-blue-600">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
