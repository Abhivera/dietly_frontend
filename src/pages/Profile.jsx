// src/pages/Profile.jsx
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as userApi from "../api/user";
import * as authApi from "../api/auth";
import { getCurrentUser } from "../slices/authSlice";

export default function Profile() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    username: user?.username || "",
  });
  const [avatar, setAvatar] = useState(null);
  const [message, setMessage] = useState("");
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) =>
    setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    const res = await userApi.updateUser(token, form);
    if (res.detail) setMessage(res.detail);
    else {
      setMessage("Profile updated");
      dispatch(getCurrentUser(token));
    }
  };

  const handleAvatar = async (e) => {
    e.preventDefault();
    if (!avatar) return;
    setMessage("");
    const res = await userApi.uploadAvatar(token, avatar);
    if (res.detail) setMessage(res.detail);
    else {
      setMessage("Avatar updated");
      dispatch(getCurrentUser(token));
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setMessage("");
    const res = await authApi.changePassword(
      token,
      passwords.current_password,
      passwords.new_password
    );
    if (res.detail) setMessage(res.detail);
    else setMessage("Password changed");
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <form onSubmit={handleUpdate} className="flex flex-col gap-4 mb-6">
        <input
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Full Name"
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Email"
        />
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          className="border p-2 rounded"
          placeholder="Username"
          disabled
        />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded">
          Update Profile
        </button>
      </form>
      <form onSubmit={handleAvatar} className="flex flex-col gap-4 mb-6">
        <input
          type="file"
          onChange={(e) => setAvatar(e.target.files[0])}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded">
          Upload Avatar
        </button>
      </form>
      <form onSubmit={handlePassword} className="flex flex-col gap-4 mb-6">
        <input
          type="password"
          name="current_password"
          value={passwords.current_password}
          onChange={handlePasswordChange}
          className="border p-2 rounded"
          placeholder="Current Password"
        />
        <input
          type="password"
          name="new_password"
          value={passwords.new_password}
          onChange={handlePasswordChange}
          className="border p-2 rounded"
          placeholder="New Password"
        />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded">
          Change Password
        </button>
      </form>
      {message && <div className="text-green-600">{message}</div>}
    </div>
  );
}
