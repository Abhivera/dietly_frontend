// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as userApi from "../api/user";
import * as authApi from "../api/auth";
import { getCurrentUser } from "../slices/authSlice";

export default function Profile() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    username: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [message, setMessage] = useState("");
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        const userData = await userApi.getUser(token);
        setUser(userData);
        setForm({
          full_name: userData.full_name || "",
          email: userData.email || "",
          username: userData.username || "",
        });
      }
    };
    fetchUser();
  }, [token]);

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
      // Refresh user data
      const userData = await userApi.getUser(token);
      setUser(userData);
      setIsEditing(false);
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
      // Refresh user data
      const userData = await userApi.getUser(token);
      setUser(userData);
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
    else {
      setMessage("Password changed");
      setPasswords({ current_password: "", new_password: "" });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setForm({
      full_name: user?.full_name || "",
      email: user?.email || "",
      username: user?.username || "",
    });
    setMessage("");
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Profile</h2>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Edit
          </button>
        )}
      </div>

      {/* User Avatar */}
      <div className="flex justify-center mb-6">
        <img
          src={
            user.avatar_url ||
            "https://myabhibucket30june2025.s3.ap-south-1.amazonaws.com/default_media/default_avatar.png"
          }
          alt="User Avatar"
          className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
        />
      </div>

      {/* Profile Information Display */}
      {!isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="mt-1 p-2 bg-gray-50 rounded border">
              {user.full_name}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 p-2 bg-gray-50 rounded border">
              {user.email}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <div className="mt-1 p-2 bg-gray-50 rounded border">
              {user.username}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Member Since
            </label>
            <div className="mt-1 p-2 bg-gray-50 rounded border">
              {new Date(user.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      ) : (
        /* Edit Forms */
        <div className="space-y-6">
          {/* Profile Update Form */}
          <form onSubmit={handleUpdate} className="space-y-4">
            <h3 className="text-lg font-semibold">
              Update Profile Information
            </h3>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              placeholder="Full Name"
            />
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              placeholder="Email"
            />
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              placeholder="Username"
              disabled
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Avatar Upload Form */}
          <form onSubmit={handleAvatar} className="space-y-4">
            <h3 className="text-lg font-semibold">Update Avatar</h3>
            <input
              type="file"
              onChange={(e) => setAvatar(e.target.files[0])}
              className="w-full border p-2 rounded"
              accept="image/*"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Upload Avatar
            </button>
          </form>

          {/* Password Change Form */}
          <form onSubmit={handlePassword} className="space-y-4">
            <h3 className="text-lg font-semibold">Change Password</h3>
            <input
              type="password"
              name="current_password"
              value={passwords.current_password}
              onChange={handlePasswordChange}
              className="w-full border p-2 rounded"
              placeholder="Current Password"
            />
            <input
              type="password"
              name="new_password"
              value={passwords.new_password}
              onChange={handlePasswordChange}
              className="w-full border p-2 rounded"
              placeholder="New Password"
            />
            <button
              type="submit"
              className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            >
              Change Password
            </button>
          </form>
        </div>
      )}

      {message && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}
    </div>
  );
}
