import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { googleCallback } from "../api/auth";
import { getCurrentUser } from "../slices/authSlice";

export default function GoogleCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const queryString = location.search;
        const res = await googleCallback(queryString);
        if (res && res.access_token) {
          localStorage.setItem("access_token", res.access_token);
          dispatch(getCurrentUser(res.access_token));
          navigate("/");
        } else {
          setError(res?.detail || "Google authentication failed.");
        }
      } catch (err) {
        setError("Google authentication failed.");
      }
    };
    handleCallback();
    // eslint-disable-next-line
  }, [location.search]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2">Authentication Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex items-center gap-2 text-emerald-600">
        <svg
          className="animate-spin h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span className="text-lg font-medium">
          Signing you in with Google...
        </span>
      </div>
    </div>
  );
}
