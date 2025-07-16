// src/pages/Profile.jsx
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as userApi from "../api/user";
import * as authApi from "../api/auth";
import { getCurrentUser } from "../slices/authSlice";
import { Popconfirm } from "antd";
import {
  User,
  Mail,
  Calendar,
  Camera,
  Lock,
  Save,
  X,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "../slices/authSlice";

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
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
  });
  const fileInputRef = useRef(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        const userData = await userApi.getUser();
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

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update handleUpdate to only save if username is not changed, otherwise show Popconfirm
  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    if (form.username !== user.username) {
      setShowLogoutConfirm(true); // This line is removed as per the edit hint
      return;
    }
    const res = await userApi.updateUser(form);
    if (res.detail) setMessage(res.detail);
    else {
      setMessage("Profile updated");
      dispatch(getCurrentUser(token));
      // Refresh user data
      const userData = await userApi.getUser();
      setUser(userData);
      setIsEditing(false);
    }
  };

  const handleAvatar = async (e) => {
    e.preventDefault();
    if (!avatar) return;
    setMessage("");
    const res = await userApi.uploadAvatar(avatar);
    if (res.detail) setMessage(res.detail);
    else {
      setMessage("Avatar updated");
      dispatch(getCurrentUser(token));
      // Refresh user data
      const userData = await userApi.getUser();
      setUser(userData);
      setAvatar(null);
      setAvatarPreview(null);
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
    setAvatar(null);
    setAvatarPreview(null);
    setMessage("");
  };

  // Confirm handler for Popconfirm: actually update and then logout
  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    const res = await userApi.updateUser(form);
    if (res.detail) {
      setMessage(res.detail);
      return;
    }
    dispatch(logout());
    navigate("/login");
  };
  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <div className="text-emerald-600 text-lg font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 py-2 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-800 flex items-center gap-3">
            <User className="w-8 h-8" />
            Profile
          </h1>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="text-emerald-600 bg-white border border-emerald-600 px-6 py-3 rounded-lg font-medium hover:text-emerald-700 hover:border-emerald-700 transition-colors duration-200 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Avatar and Basic Info */}
          <div className="lg:col-span-1">
            {/* User Avatar */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-emerald-100 mb-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <img
                    src={
                      avatarPreview ||
                      user.avatar_url ||
                      "https://myabhibucket30june2025.s3.ap-south-1.amazonaws.com/default_media/default_avatar.png"
                    }
                    alt="User Avatar"
                    className={`w-32 h-32 rounded-full object-cover border-4 border-emerald-200 shadow-lg ${
                      isEditing
                        ? "cursor-pointer hover:opacity-80 transition-opacity duration-200"
                        : ""
                    }`}
                    onClick={handleAvatarClick}
                  />
                  {isEditing && (
                    <div className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full shadow-lg">
                      <Camera className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-emerald-800 mb-2">
                  {user.full_name}
                </h3>
                <p className="text-emerald-600 text-sm mb-4">{user.email}</p>

                {/* Upload Avatar Button */}
                {isEditing && (
                  <div className="w-full">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleAvatarChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Change Avatar
                    </button>
                    {avatar && (
                      <button
                        type="button"
                        onClick={handleAvatar}
                        className="w-full mt-2 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Avatar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-emerald-100">
              <h4 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Member Since
              </h4>
              <p className="text-emerald-700 font-medium">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Right Column - Forms */}
          <div className="lg:col-span-2">
            {/* Profile Information Display */}
            {!isEditing ? (
              <div className="bg-white rounded-lg p-8 shadow-sm border border-emerald-100">
                <h3 className="text-xl font-semibold text-emerald-800 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </label>
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <span className="text-emerald-800 font-medium">
                        {user.full_name}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <span className="text-emerald-800 font-medium">
                        {user.email}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Username
                    </label>
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <span className="text-emerald-800 font-medium">
                        {user.username}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Forms */
              <div className="space-y-6">
                {/* Profile Update Form */}
                <div className="bg-white rounded-lg p-8 shadow-sm border border-emerald-100">
                  <h3 className="text-xl font-semibold text-emerald-800 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Update Profile Information
                  </h3>
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Full Name
                      </label>
                      <input
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        className="w-full p-4 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors duration-200"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </label>
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full p-4 border border-emerald-200 rounded-lg bg-emerald-50 text-emerald-600 cursor-not-allowed"
                        placeholder="Enter your email"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Username
                      </label>
                      <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        className="w-full p-4 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors duration-200"
                        placeholder="Enter your username"
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <Popconfirm
                        title="Username changed"
                        description="Your username has been changed. You will be logged out for security reasons. Please log in again with your new username."
                        open={showLogoutConfirm}
                        onConfirm={handleLogoutConfirm}
                        onCancel={handleLogoutCancel}
                        okText="OK"
                        cancelText="Cancel"
                        okButtonProps={{ type: "primary" }}
                        placement="top"
                      >
                        <button
                          type="submit"
                          className="bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-200 flex items-center gap-2"
                          onClick={handleUpdate}
                        >
                          <Save className="w-4 h-4" />
                          Save Changes
                        </button>
                      </Popconfirm>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>

                {/* Password Change Form */}
                <div className="bg-white rounded-lg p-8 shadow-sm border border-emerald-100">
                  <h3 className="text-xl font-semibold text-emerald-800 mb-6 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Change Password
                  </h3>
                  <form onSubmit={handlePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="current_password"
                        value={passwords.current_password}
                        onChange={handlePasswordChange}
                        className="w-full p-4 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors duration-200"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        New Password
                      </label>
                      <input
                        type="password"
                        name="new_password"
                        value={passwords.new_password}
                        onChange={handlePasswordChange}
                        className="w-full p-4 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors duration-200"
                        placeholder="Enter new password"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Change Password
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Message Display */}
            {message && (
              <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
