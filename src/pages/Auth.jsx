import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  login,
  getCurrentUser,
  clearError,
  register,
  clearRegisterSuccess,
} from "../slices/authSlice";

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

  const toggleMode = (newMode) => {
    if (newMode !== mode) {
      setMode(newMode);
      dispatch(clearError());
      dispatch(clearRegisterSuccess());
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      {/* Toggle Switch */}
      <div className="relative mb-8">
        <div className="flex bg-gray-100 rounded-full p-1 relative">
          {/* Sliding background */}
          <div
            className={`absolute top-1 bottom-1 w-1/2 bg-emerald-600 rounded-full transition-transform duration-300 ease-in-out ${
              mode === "login" ? "translate-x-full" : "translate-x-0"
            }`}
          />

          {/* Toggle buttons */}
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
