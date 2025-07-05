// src/pages/Register.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  register,
  clearError,
  clearRegisterSuccess,
} from "../slices/authSlice";

export default function Register() {
  const dispatch = useDispatch();
  const { loading, error, registerSuccess } = useSelector(
    (state) => state.auth
  );
  const [form, setForm] = useState({
    email: "",
    username: "",
    full_name: "",
    password: "",
  });

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearRegisterSuccess());
    return () => {
      dispatch(clearError());
      dispatch(clearRegisterSuccess());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(clearRegisterSuccess());
    dispatch(register(form));
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={form.full_name}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        {error && <div className="text-red-500">{error}</div>}
        {registerSuccess && (
          <div className="text-green-600">{registerSuccess}</div>
        )}
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
