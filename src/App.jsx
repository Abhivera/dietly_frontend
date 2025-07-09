import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Layout/Navbar";
import PublicNavbar from "./components/Layout/PublicNavbar";
import ProtectedRoute from "./components/Layout/ProtectedRoute";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Images from "./pages/Images";
import MealSummary from "./pages/MealSummary";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import GoogleCallback from "./pages/GoogleCallback";
import GoogleSuccess from "./pages/GoogleSuccess";
import { useSelector } from "react-redux";

export default function App() {
  const { token } = useSelector((state) => state.auth);
  return (
    <Router>
      {token ? <Navbar /> : <PublicNavbar />}
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/auth/google/success" element={<GoogleSuccess />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/images"
            element={
              <ProtectedRoute>
                <Images />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meal-summary"
            element={
              <ProtectedRoute>
                <MealSummary />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}
