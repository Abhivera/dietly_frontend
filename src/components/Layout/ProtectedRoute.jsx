// src/components/Layout/ProtectedRoute.jsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useSelector((state) => state.auth);
  if (loading) return null;
  return token ? children : <Navigate to="/login" />;
}
