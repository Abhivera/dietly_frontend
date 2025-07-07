import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../api/auth";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No token provided.");
      return;
    }
    setStatus("loading");
    verifyEmail(token)
      .then((data) => {
        if (!data.detail) {
          setStatus("success");
          setMessage(
            `Email verified! Welcome, ${
              data.full_name || data.username || data.email
            }. Redirecting to login...`
          );
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.detail?.[0]?.msg || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Network error. Please try again later.");
      });
  }, [searchParams, navigate]);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow text-center">
      <h2 className="text-2xl font-bold mb-4">Verify Email</h2>
      {status === "loading" && <p>Verifying your email...</p>}
      {status !== "loading" && (
        <div
          className={status === "success" ? "text-green-600" : "text-red-500"}
        >
          {message}
        </div>
      )}
    </div>
  );
}
