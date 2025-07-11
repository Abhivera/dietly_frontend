import {
  Save,
  User,
  Target,
  Activity,
  TrendingUp,
  Info,
  Pencil,
  Ruler
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import * as userApi from "../api/user";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMealSummary } from "../api/meal";

export default function UserInfo() {
  const { token } = useSelector((state) => state.auth);
  const [editMode, setEditMode] = useState(false);
  const [originalForm, setOriginalForm] = useState(null);
  const [mealSummary, setMealSummary] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        setLoading(true);
        const userData = await userApi.getUser(token);
        const userForm = {
          gender: userData.gender || "",
          age: userData.age || "",
          weight: userData.weight || "",
          height: userData.height || "",
          goal_weight: userData.goal_weight || "",
        };
        setForm(userForm);
        setOriginalForm(userForm);
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  useEffect(() => {
    const fetchMealSummary = async () => {
      if (token) {
        const summary = await getMealSummary(token);
        setMealSummary(summary);
      }
    };
    fetchMealSummary();
  }, [token]);

  const [form, setForm] = useState({
    gender: "",
    age: "",
    weight: "",
    height: "",
    goal_weight: "",
  });
  const [loading, setLoading] = useState(false);

  // BMI calculation
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  // BMI category
  const getBMICategory = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5)
      return {
        category: "Underweight",
        color: "text-blue-600",
        bg: "bg-blue-50 border-blue-200",
      };
    if (bmi < 25)
      return {
        category: "Normal weight",
        color: "text-green-600",
        bg: "bg-green-50 border-green-200",
      };
    if (bmi < 30)
      return {
        category: "Overweight",
        color: "text-yellow-600",
        bg: "bg-yellow-50 border-yellow-200",
      };
    return {
      category: "Obese",
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
    };
  };

  // Recommended weight range
  const getRecommendedWeightRange = (height) => {
    if (!height) return null;
    const heightInMeters = height / 100;
    const minWeight = (18.5 * heightInMeters * heightInMeters).toFixed(1);
    const maxWeight = (24.9 * heightInMeters * heightInMeters).toFixed(1);
    return { min: minWeight, max: maxWeight };
  };

  const getWeightPrediction = (caloriesPerDay = 0) => {
    const kcalPerKg = 7700;
    const daily = caloriesPerDay / kcalPerKg;
    return {
      daily: daily.toFixed(2),
      weekly: (daily * 7).toFixed(2),
      monthly: (daily * 30).toFixed(2),
      yearly: (daily * 365).toFixed(2),
    };
  };

  const weightPrediction = mealSummary
    ? getWeightPrediction(mealSummary.total_calories)
    : null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setEditMode(true);
  };
  const handleCancel = () => {
    setForm(originalForm);
    setEditMode(false);
  };
  const handleSubmit = async () => {
    // Validate
    if (!form.gender || !form.age || !form.weight || !form.height) {
      toast.error("All fields are required except goal weight.");
      return;
    }

    setLoading(true);
    try {
      const res = await userApi.updateUser(token, form);
      if (res && !res.detail) {
        toast.success("User info updated successfully.");
        setEditMode(false);
        setOriginalForm(form);
      } else {
        toast.error(res?.detail || "Failed to update user info.");
      }
    } catch {
      toast.error("Failed to update user info.");
    } finally {
      setLoading(false);
    }
  };

  const currentBMI = calculateBMI(form.weight, form.height);
  const bmiCategory = getBMICategory(currentBMI);
  const recommendedRange = getRecommendedWeightRange(form.height);
  const goalBMI = calculateBMI(form.goal_weight, form.height);

  return (
    <div className="min-h-screen bg-emerald-50 py-6 px-0 sm:px-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="max-w-7xl mx-auto px-0 sm:px-0">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-800 mb-2 flex items-center justify-center gap-3">
            <User className="w-8 h-8" />
            Health Profile
          </h1>
          <p className="text-emerald-600">
            Track your health metrics and goals
          </p>
        </div>

        {/* Cards Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 justify-items-center">
          {/* Personal Information Card */}
          <div className="w-full sm:w-[250px] flex flex-col">
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-emerald-800 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Personal Info
                </h2>
                {!editMode && (
                  <button
                    onClick={handleEdit}
                    className="p-2 rounded-full hover:bg-emerald-100 transition-colors"
                    aria-label="Edit Personal Info"
                  >
                    <Pencil className="w-5 h-5 text-emerald-600" />
                  </button>
                )}
              </div>
              {editMode ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-emerald-700 mb-2">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className="w-full p-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors duration-200 bg-white text-sm"
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
                        className="w-full p-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors duration-200 text-sm"
                        placeholder="Enter age"
                        min="0"
                        max="150"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-emerald-700 mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={form.weight}
                        onChange={handleChange}
                        className="w-full p-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors duration-200 text-sm"
                        placeholder="Weight"
                        min="0"
                        step="0.1"
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
                        className="w-full p-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors duration-200 text-sm"
                        placeholder="Height"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Goal Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="goal_weight"
                      value={form.goal_weight}
                      onChange={handleChange}
                      className="w-full p-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors duration-200 text-sm"
                      placeholder="Goal weight"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex-1"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={loading}
                      className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-emerald-700 font-semibold mb-1">
                        Gender
                      </div>
                      <div className="text-sm text-gray-900 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                        {form.gender
                          ? form.gender.charAt(0).toUpperCase() +
                            form.gender.slice(1)
                          : "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-emerald-700 font-semibold mb-1">
                        Age
                      </div>
                      <div className="text-sm text-gray-900 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                        {form.age || "-"}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-emerald-700 font-semibold mb-1">
                        Weight (kg)
                      </div>
                      <div className="text-sm text-gray-900 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                        {form.weight || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-emerald-700 font-semibold mb-1">
                        Height (cm)
                      </div>
                      <div className="text-sm text-gray-900 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                        {form.height || "-"}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-emerald-700 font-semibold mb-1 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Goal Weight (kg)
                    </div>
                    <div className="text-sm text-gray-900 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                      {form.goal_weight || "-"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BMI Card */}
          {currentBMI && (
            <div className="w-full sm:w-[250px] flex flex-col">
              <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                  <Ruler className="w-5 h-5" />
                  BMI Analysis
                </h3>

                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-emerald-700 mb-1">
                    {currentBMI}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${bmiCategory.bg} ${bmiCategory.color}`}
                  >
                    {bmiCategory.category}
                  </div>
                </div>

                {/* BMI Scale */}
                <div className="space-y-5 text-xs">
                  <div className="flex justify-between items-center p-2 rounded bg-blue-50 border border-blue-200">
                    <span className="font-medium text-blue-700">Underweight</span>
                    <span className="font-medium text-blue-700">&lt; 18.5</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-green-50 border border-green-200">
                    <span className="font-medium text-green-700">Normal</span>
                    <span className="font-medium text-green-700">
                      18.5 - 24.9
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-yellow-50 border border-yellow-200">
                    <span className="font-medium text-yellow-700">Overweight</span>
                    <span className="font-medium text-yellow-700">
                      25 - 29.9
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-red-50 border border-red-200">
                    <span className="font-medium text-red-700">Obese</span>
                    <span className="font-medium text-red-700">≥ 30</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Weight Recommendations */}
          {recommendedRange && (
            <div className="w-full sm:w-[250px] flex flex-col">
              <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Weight Range
                </h3>

                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="text-sm text-emerald-700 font-medium mb-1">
                      Healthy Range
                    </div>
                    <div className="text-lg font-bold text-emerald-800">
                      {recommendedRange.min} - {recommendedRange.max} kg
                    </div>
                  </div>

                  {form.weight && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="text-sm text-gray-700 font-medium mb-1">
                        Current Weight
                      </div>
                      <div className="text-lg font-bold text-gray-800">
                        {form.weight} kg
                      </div>
                    </div>
                  )}

                  {form.goal_weight && goalBMI && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm text-blue-700 font-medium mb-1">
                        Goal Weight
                      </div>
                      <div className="text-lg font-bold text-blue-800">
                        {form.goal_weight} kg
                      </div>
                      <div className="text-sm text-blue-600 mt-1">
                        BMI: {goalBMI}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Weight Prediction Card */}
          {weightPrediction && (
            <div className="w-full sm:w-[250px] flex flex-col">
              <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6 h-full flex flex-col">
                <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Weight Prediction
                </h3>

                {/* Current Weight Reference */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg mb-4">
                  <div className="text-sm text-emerald-700 font-medium mb-1">
                    Current Weight
                  </div>
                  <div className="text-xl font-bold text-emerald-800">
                    {form.weight} kg
                  </div>
                </div>

                {/* Predictions - 2x3 Grid Layout */}
                <div className="space-y-2 flex-1">
                  {/* First Row - 2 columns */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
                      <div className="text-xs font-medium text-emerald-700 mb-1">
                        Daily
                      </div>
                      <div className="text-sm font-bold text-emerald-800">
                        {(
                          parseFloat(form.weight) +
                          parseFloat(weightPrediction.daily)
                        ).toFixed(1)}{" "}
                        kg
                      </div>
                      <div className="text-xs text-emerald-600">
                        +{weightPrediction.daily}
                      </div>
                    </div>

                    <div className="p-2 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg">
                      <div className="text-xs font-medium text-teal-700 mb-1">
                        Weekly
                      </div>
                      <div className="text-sm font-bold text-teal-800">
                        {(
                          parseFloat(form.weight) +
                          parseFloat(weightPrediction.weekly)
                        ).toFixed(1)}{" "}
                        kg
                      </div>
                      <div className="text-xs text-teal-600">
                        +{weightPrediction.weekly}
                      </div>
                    </div>
                  </div>

                  {/* Second Row - 2 columns */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg">
                      <div className="text-xs font-medium text-cyan-700 mb-1">
                        Monthly
                      </div>
                      <div className="text-sm font-bold text-cyan-800">
                        {(
                          parseFloat(form.weight) +
                          parseFloat(weightPrediction.monthly)
                        ).toFixed(1)}{" "}
                        kg
                      </div>
                      <div className="text-xs text-cyan-600">
                        +{weightPrediction.monthly}
                      </div>
                    </div>

                    <div className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                      <div className="text-xs font-medium text-blue-700 mb-1">
                        Yearly
                      </div>
                      <div className="text-sm font-bold text-blue-800">
                        {(
                          parseFloat(form.weight) +
                          parseFloat(weightPrediction.yearly)
                        ).toFixed(1)}{" "}
                        kg
                      </div>
                      <div className="text-xs text-blue-600">
                        +{weightPrediction.yearly}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Footer */}
                <div className="mt-2 border-t border-emerald-100">
                  <div className="flex items-center gap-2 text-xs text-emerald-600">
                    <Info className="w-3 h-3" />
                    <span>Based on daily calories (1kg ≈ 7700 kcal)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}