import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { passwordResetConfirm } from "../api/auth";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message: string }
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (!password || !confirm) {
      setStatus({ type: "error", message: "Please fill in all fields." });
      return;
    }
    if (password !== confirm) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }
    if (!token) {
      setStatus({ type: "error", message: "Invalid or missing token." });
      return;
    }
    setLoading(true);
    try {
      const res = await passwordResetConfirm(token, password);
      if (res && res.success) {
        setStatus({
          type: "success",
          message:
            res.message || "Password reset successful! You can now log in.",
        });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setStatus({
          type: "error",
          message: res.message || "Failed to reset password.",
        });
      }
    } catch {
      setStatus({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          className="w-full border p-3 rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          className="w-full border p-3 rounded-lg"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {status && (
          <div
            className={`text-sm p-3 rounded-lg border ${
              status.type === "success"
                ? "text-green-600 bg-green-50 border-green-200"
                : "text-red-500 bg-red-50 border-red-200"
            }`}
          >
            {status.message}
          </div>
        )}
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
