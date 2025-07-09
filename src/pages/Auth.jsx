import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { passwordResetRequest } from "../api/auth";
import {
  login,
  getCurrentUser,
  clearError,
  register,
  clearRegisterSuccess,
} from "../slices/authSlice";
// Google login no longer needs API call

// Validation schemas
const loginSchema = Yup.object().shape({
  username: Yup.string()
    .required("Username or email is required")
    .min(3, "Username must be at least 3 characters"),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const registerSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  username: Yup.string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  full_name: Yup.string()
    .required("Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must be less than 50 characters"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export default function Auth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, loading, error, registerSuccess } = useSelector(
    (state) => state.auth
  );
  const [mode, setMode] = useState("register"); // 'login' or 'register'
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState(null); // { type: 'success'|'error', message: string }
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearRegisterSuccess());
    if (token) {
      dispatch(getCurrentUser(token));
      navigate("/");
    }
  }, [token, dispatch, navigate]);

  const handleLoginSubmit = (values, { setSubmitting }) => {
    dispatch(clearError());
    dispatch(login(values));
    setSubmitting(false);
  };

  const handleRegisterSubmit = (values, { setSubmitting }) => {
    dispatch(clearError());
    dispatch(clearRegisterSuccess());
    dispatch(register(values));
    setSubmitting(false);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotStatus(null);
    try {
      const res = await passwordResetRequest(forgotEmail);
      if (res && res.success) {
        setForgotStatus({
          type: "success",
          message: res.message || "Password reset email sent!",
        });
      } else {
        setForgotStatus({
          type: "error",
          message: res.message || "Failed to send reset email.",
        });
      }
    } catch {
      setForgotStatus({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    }
    setForgotLoading(false);
  };

  const toggleMode = (newMode) => {
    if (newMode !== mode) {
      setMode(newMode);
      dispatch(clearError());
      dispatch(clearRegisterSuccess());
      setShowForgot(false);
      setForgotStatus(null);
    }
  };

  // Google Login handler: just redirect
  const handleGoogleLogin = () => {
    window.location.href = `${
      import.meta.env.VITE_API_BASE_URL
    }/auth/google/login`;
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      {/* Toggle Switch */}
      <div className="relative mb-8">
        <div className="flex bg-gray-100 rounded-full p-1 relative">
          {/* Sliding background */}
          <div
            className={`absolute top-1 bottom-1 w-1/2 bg-emerald-600 rounded-full transition-transform duration-300 ease-in-out ${
              mode === "register" ? "translate-x-full" : "translate-x-0"
            }`}
          />

          {/* Toggle buttons */}
          <button
            className={`relative z-10 flex-1 py-2 px-4 text-sm font-medium rounded-full transition-colors duration-300 ${
              mode === "login"
                ? "text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => toggleMode("login")}
          >
            Log In
          </button>
          <button
            className={`relative z-10 flex-1 py-2 px-4 text-sm font-medium rounded-full transition-colors duration-300 ${
              mode === "register"
                ? "text-white"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => toggleMode("register")}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Form Container with Slide Animation */}
      <div className="relative overflow-hidden">
        <div
          className={`flex transition-transform duration-500 ease-in-out ${
            mode === "login" ? "-translate-x-1/2" : "translate-x-0"
          }`}
          style={{ width: "200%" }}
        >
          {/* Register Form */}
          <div className="w-1/2 pr-4">
            <Formik
              initialValues={{
                email: "",
                username: "",
                full_name: "",
                password: "",
              }}
              validationSchema={registerSchema}
              onSubmit={handleRegisterSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="flex flex-col gap-4">
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Create Account
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Sign up for a new account
                    </p>
                  </div>

                  {/* Google Sign Up Button */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm mb-2"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 48 48">
                      <g>
                        <path
                          fill="#4285F4"
                          d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.91 2.54 30.28 0 24 0 14.82 0 6.73 5.82 2.69 14.09l7.98 6.19C12.13 13.6 17.56 9.5 24 9.5z"
                        />
                        <path
                          fill="#34A853"
                          d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.02l7.19 5.59C43.98 37.13 46.1 31.3 46.1 24.55z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M10.67 28.28A14.5 14.5 0 019.5 24c0-1.49.26-2.93.72-4.28l-7.98-6.19A23.93 23.93 0 000 24c0 3.77.9 7.34 2.49 10.47l8.18-6.19z"
                        />
                        <path
                          fill="#EA4335"
                          d="M24 48c6.28 0 11.56-2.08 15.41-5.67l-7.19-5.59c-2.01 1.35-4.59 2.16-8.22 2.16-6.44 0-11.87-4.1-13.83-9.77l-8.18 6.19C6.73 42.18 14.82 48 24 48z"
                        />
                        <path fill="none" d="M0 0h48v48H0z" />
                      </g>
                    </svg>
                    <span>Sign up with Google</span>
                  </button>
                  {/* OR Separator */}
                  <div className="flex items-center my-2">
                    <div className="flex-grow h-px bg-gray-300" />
                    <span className="mx-2 text-gray-400 text-xs font-semibold">
                      OR
                    </span>
                    <div className="flex-grow h-px bg-gray-300" />
                  </div>

                  <div>
                    <Field
                      type="email"
                      name="email"
                      placeholder="Email"
                      className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                        errors.email && touched.email
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Field
                      type="text"
                      name="username"
                      placeholder="Username"
                      className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                        errors.username && touched.username
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <ErrorMessage
                      name="username"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Field
                      type="text"
                      name="full_name"
                      placeholder="Full Name"
                      className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                        errors.full_name && touched.full_name
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <ErrorMessage
                      name="full_name"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Field
                      type="password"
                      name="password"
                      placeholder="Password"
                      className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                        errors.password && touched.password
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                      {error}
                    </div>
                  )}

                  {registerSuccess && (
                    <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
                      {registerSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || isSubmitting}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        Creating account...
                      </span>
                    ) : (
                      "Sign Up"
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          </div>

          {/* Login Form */}
          <div className="w-1/2 pl-4">
            {showForgot ? (
              <form
                className="flex flex-col gap-4"
                onSubmit={handleForgotSubmit}
              >
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Forgot Password
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Enter your email to reset your password.
                  </p>
                </div>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 border-gray-300"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
                {forgotStatus && (
                  <div
                    className={`text-sm p-3 rounded-lg border ${
                      forgotStatus.type === "success"
                        ? "text-green-600 bg-green-50 border-green-200"
                        : "text-red-500 bg-red-50 border-red-200"
                    }`}
                  >
                    {forgotStatus.message}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? "Sending..." : "Send Reset Email"}
                  </button>
                  <button
                    type="button"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-medium transition-colors duration-200 flex-1"
                    onClick={() => {
                      setShowForgot(false);
                      setForgotStatus(null);
                    }}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
              <Formik
                initialValues={{
                  username: "",
                  password: "",
                }}
                validationSchema={loginSchema}
                onSubmit={handleLoginSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="flex flex-col gap-4">
                    <div className="text-center mb-4">
                      <h2 className="text-2xl font-bold text-gray-800">
                        Welcome Back
                      </h2>
                      <p className="text-gray-600 text-sm">
                        Log In to your account
                      </p>
                    </div>

                    {/* Google Sign In Button */}
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm mb-2"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 48 48">
                        <g>
                          <path
                            fill="#4285F4"
                            d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.91 2.54 30.28 0 24 0 14.82 0 6.73 5.82 2.69 14.09l7.98 6.19C12.13 13.6 17.56 9.5 24 9.5z"
                          />
                          <path
                            fill="#34A853"
                            d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.02l7.19 5.59C43.98 37.13 46.1 31.3 46.1 24.55z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M10.67 28.28A14.5 14.5 0 019.5 24c0-1.49.26-2.93.72-4.28l-7.98-6.19A23.93 23.93 0 000 24c0 3.77.9 7.34 2.49 10.47l8.18-6.19z"
                          />
                          <path
                            fill="#EA4335"
                            d="M24 48c6.28 0 11.56-2.08 15.41-5.67l-7.19-5.59c-2.01 1.35-4.59 2.16-8.22 2.16-6.44 0-11.87-4.1-13.83-9.77l-8.18 6.19C6.73 42.18 14.82 48 24 48z"
                          />
                          <path fill="none" d="M0 0h48v48H0z" />
                        </g>
                      </svg>
                      <span>Sign in with Google</span>
                    </button>
                    {/* OR Separator */}
                    <div className="flex items-center my-2">
                      <div className="flex-grow h-px bg-gray-300" />
                      <span className="mx-2 text-gray-400 text-xs font-semibold">
                        OR
                      </span>
                      <div className="flex-grow h-px bg-gray-300" />
                    </div>

                    <div>
                      <Field
                        type="text"
                        name="username"
                        placeholder="Email or Username"
                        className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                          errors.username && touched.username
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      <ErrorMessage
                        name="username"
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>

                    <div>
                      <Field
                        type="password"
                        name="password"
                        placeholder="Password"
                        className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 ${
                          errors.password && touched.password
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>

                    {/* Forgot Password Link */}
                    <div className="text-right">
                      <button
                        type="button"
                        className="text-emerald-600 hover:text-emerald-700 text-xs font-medium"
                        onClick={() => {
                          setShowForgot(true);
                          setForgotStatus(null);
                        }}
                      >
                        Forgot Password?
                      </button>
                    </div>

                    {error && (
                      <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading || isSubmitting}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                          Signing in...
                        </span>
                      ) : (
                        "Log In"
                      )}
                    </button>
                  </Form>
                )}
              </Formik>
            )}
          </div>
        </div>
      </div>

      {/* Alternative toggle text */}
      <div className="mt-6 text-center text-sm text-gray-600">
        {mode === "register" ? (
          <span>
            Already have an account?{" "}
            <button
              className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200"
              onClick={() => toggleMode("login")}
            >
              Log In here
            </button>
          </span>
        ) : (
          <span>
            Don't have an account?{" "}
            <button
              className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200"
              onClick={() => toggleMode("register")}
            >
              Sign up here
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
