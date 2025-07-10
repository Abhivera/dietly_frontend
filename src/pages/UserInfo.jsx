import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import * as userApi from "../api/user";
import { Save } from "lucide-react";

export default function UserInfo() {
  const { token } = useSelector((state) => state.auth);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    gender: "",
    age: "",
    weight: "",
    height: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        setLoading(true);
        const userData = await userApi.getUser(token);
        setUser(userData);
        setForm({
          gender: userData.gender || "",
          age: userData.age || "",
          weight: userData.weight || "",
          height: userData.height || "",
        });
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    // Validate
    if (!form.gender || !form.age || !form.weight || !form.height) {
      setError("All fields are required.");
      return;
    }
    const res = await userApi.updateUser(token, {
      gender: form.gender,
      age: Number(form.age),
      weight: Number(form.weight),
      height: Number(form.height),
    });
    if (res.detail) setError(res.detail);
    else setMessage("User info updated successfully.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <div className="text-emerald-600 text-lg font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 py-2 px-4">
      <div className="max-w-xl mx-auto mt-10 bg-white rounded-lg shadow-sm border border-emerald-100 p-8">
        <h1 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center gap-2">
          User Info
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-emerald-700 mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full p-4 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors duration-200"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-emerald-700 mb-2">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
              className="w-full p-4 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors duration-200"
              placeholder="Enter your age"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-emerald-700 mb-2">
              Weight (kg)
            </label>
            <input
              type="number"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              className="w-full p-4 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors duration-200"
              placeholder="Enter your weight"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-emerald-700 mb-2">
              Height (cm)
            </label>
            <input
              type="number"
              name="height"
              value={form.height}
              onChange={handleChange}
              className="w-full p-4 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors duration-200"
              placeholder="Enter your height"
              min="0"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </form>
        {message && (
          <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
