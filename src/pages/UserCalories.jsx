import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Popconfirm } from "antd";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Flame,
  Activity,
  Footprints,
  Dumbbell,
  BarChart2,
  User,
  Target,
  TrendingUp,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  Calculator,
  Edit3,
} from "lucide-react";
import {
  createUserCalories,
  getUserCalories,
  updateUserCalories,
  deleteUserCalories,
  getRecentCaloriesSummary,
} from "../api/userCalories";
import { getUser } from "../api/user";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- Enhanced Activity Data ---
const ACTIVITIES = {
  running: {
    name: "Running",
    met: 9.8,
    unit: "minutes",
    icon: Footprints,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  walking: {
    name: "Walking",
    met: 3.5,
    unit: "steps",
    icon: Footprints,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  gym: {
    name: "Gym Session",
    met: 5.5,
    unit: "minutes",
    icon: Dumbbell,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  cycling: {
    name: "Cycling",
    met: 7.5,
    unit: "minutes",
    icon: Activity,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  swimming: {
    name: "Swimming",
    met: 8.0,
    unit: "minutes",
    icon: Activity,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
  },
  yoga: {
    name: "Yoga",
    met: 3.0,
    unit: "minutes",
    icon: Activity,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
  basketball: {
    name: "Basketball",
    met: 8.0,
    unit: "minutes",
    icon: Activity,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  tennis: {
    name: "Tennis",
    met: 7.0,
    unit: "minutes",
    icon: Activity,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
};

// --- Enhanced Calorie Calculation ---
const calculateCalories = (activity, value, bodyWeight = 70) => {
  if (!activity || !value || value <= 0) return 0;
  const activityData = ACTIVITIES[activity];
  if (!activityData) return 0;

  const { met, unit } = activityData;
  let calories = 0;

  if (unit === "minutes") {
    calories = ((met * bodyWeight * 3.5) / 200) * value;
  } else if (unit === "steps") {
    calories = value * 0.04; // Common approximation
  }

  return Math.round(calories);
};

const getTodayDateString = () => new Date().toISOString().split("T")[0];

// --- Enhanced UI Components ---
const Card = ({ children, className = "", onClick, hover = true }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${
      hover ? "hover:shadow-lg hover:border-gray-200" : ""
    } ${onClick ? "cursor-pointer" : ""} ${className}`}
  >
    {children}
  </div>
);

const ToggleSwitch = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between">
    <div className="flex-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
        checked ? "bg-emerald-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  icon: Icon,
}) => {
  const baseClasses =
    "font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center";

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl",
  };

  const variants = {
    primary:
      "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-400 text-white transform hover:scale-105 active:scale-95",
    danger:
      "bg-red-600 hover:bg-red-700 focus:ring-red-400 text-white transform hover:scale-105 active:scale-95",
    secondary:
      "bg-gray-100 hover:bg-gray-200 focus:ring-gray-400 text-gray-800 border border-gray-300",
    outline:
      "bg-transparent hover:bg-gray-50 focus:ring-gray-400 text-gray-700 border border-gray-300",
    ghost: "bg-transparent hover:bg-gray-100 focus:ring-gray-400 text-gray-700",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
          Loading...
        </div>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          {children}
        </>
      )}
    </button>
  );
};

const LoadingSpinner = ({ size = "md" }) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex items-center justify-center py-8">
      <div
        className={`animate-spin rounded-full border-2 border-emerald-500 border-t-transparent ${sizes[size]}`}
      ></div>
    </div>
  );
};

// --- Main Component ---
export default function UserCaloriesTracker() {
  const { token } = useSelector((state) => state.auth);
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);

  // Enhanced form state with validation and auto-calculation toggle
  const [formData, setFormData] = useState({
    activityDate: getTodayDateString(),
    activityName: "running",
    activityValue: "",
    bodyWeight: 70,
    manualCalories: "",
    isAutoCalculate: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [activities, setActivities] = useState([]);

  const calculatedCalories = useMemo(
    () =>
      formData.isAutoCalculate
        ? calculateCalories(
            formData.activityName,
            Number(formData.activityValue),
            formData.bodyWeight
          )
        : Number(formData.manualCalories) || 0,
    [
      formData.activityName,
      formData.activityValue,
      formData.bodyWeight,
      formData.isAutoCalculate,
      formData.manualCalories,
    ]
  );

  const fetchUserData = useCallback(async () => {
    try {
      const user = await getUser(token);
      setUserData(user);
      if (user.weight) {
        setFormData((prev) => ({
          ...prev,
          bodyWeight: user.weight,
        }));
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  }, [token]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fetchedEntries, fetchedSummary] = await Promise.all([
        getUserCalories(token, {}),
        getRecentCaloriesSummary(token, 7),
      ]);

      setEntries(
        Array.isArray(fetchedEntries)
          ? fetchedEntries
          : fetchedEntries.data || []
      );
      setSummary(
        Array.isArray(fetchedSummary)
          ? fetchedSummary
          : fetchedSummary.data || null
      );
    } catch (err) {
      toast.error(
        "Failed to fetch data. Please check your connection and try again."
      );
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchData();
      fetchUserData();
    }
  }, [token, fetchData, fetchUserData]);

  const resetForm = useCallback(() => {
    setEditingEntry(null);
    setFormData({
      activityDate: getTodayDateString(),
      activityName: "running",
      activityValue: "",
      bodyWeight: userData?.weight || 70,
      manualCalories: "",
      isAutoCalculate: true,
    });
    setFormErrors({});
    setActivities([]);
    setIsFormOpen(false);
    setIsFormCollapsed(false);
  }, [userData?.weight]);

  const handleFormSubmit = async () => {
    if (!formData.activityDate) {
      setFormErrors({ activityDate: "Please select an activity date." });
      return;
    }

    // Check if date is in the future
    const selectedDate = new Date(formData.activityDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (selectedDate > today) {
      setFormErrors({ activityDate: "Activity date cannot be in the future." });
      return;
    }

    if (activities.length === 0) {
      toast.error("Please add at least one activity before saving.");
      return;
    }

    const payload = {
      activity_date: formData.activityDate,
      calories_burned: activities.map((activity) => ({
        activity_name: activity.activity_name,
        calories: activity.calories,
      })),
    };

    try {
      setIsSubmitting(true);

      if (editingEntry) {
        await updateUserCalories(token, editingEntry.id, payload);
        toast.success("Activity entry updated successfully!");
      } else {
        await createUserCalories(token, payload);
        toast.success("Activity entry created successfully!");
      }

      await fetchData();
      resetForm();
    } catch (err) {
      // Handle specific error messages from the API
      let errorMessage = err.message;

      if (err.message.includes("already exists")) {
        errorMessage =
          "An entry already exists for this date. Please edit the existing entry instead.";
      } else if (err.message.includes("cannot be in the future")) {
        errorMessage =
          "Activity date cannot be in the future. Please select a valid date.";
      }

      toast.error(errorMessage);
      console.error("Submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = useCallback(
    (entry) => {
      setEditingEntry(entry);
      const firstActivity = entry.calories_burned[0] || {};
      setFormData({
        activityDate: entry.activity_date,
        activityName: firstActivity.activity_name || "running",
        activityValue: "",
        bodyWeight: userData?.weight || 70,
        manualCalories: "",
        isAutoCalculate: true,
      });

      const existingActivities = entry.calories_burned.map(
        (activity, index) => ({
          id: Date.now() + index,
          activity_name: activity.activity_name,
          calories: activity.calories,
          duration: "",
          unit: ACTIVITIES[activity.activity_name]?.unit || "minutes",
        })
      );
      setActivities(existingActivities);

      setFormErrors({});
      setIsFormOpen(true);
      setIsFormCollapsed(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [userData?.weight]
  );

  const handleDelete = async (id) => {
    try {
      await deleteUserCalories(token, id);
      await fetchData();
      toast.success("Activity entry deleted successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to delete entry. Please try again.");
      console.error("Delete error:", err);
    }
  };

  const openNewEntryForm = useCallback(() => {
    resetForm();
    setIsFormOpen(true);
    setIsFormCollapsed(false);
  }, [resetForm]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const addActivity = () => {
    if (
      !formData.activityName ||
      (!formData.activityValue && formData.isAutoCalculate) ||
      (formData.isAutoCalculate && Number(formData.activityValue) <= 0) ||
      (!formData.isAutoCalculate &&
        (!formData.manualCalories || Number(formData.manualCalories) <= 0))
    ) {
      setFormErrors({
        activityName: !formData.activityName
          ? "Activity type is required"
          : null,
        activityValue:
          formData.isAutoCalculate &&
          (!formData.activityValue || Number(formData.activityValue) <= 0)
            ? "Please enter a valid activity value"
            : null,
        manualCalories:
          !formData.isAutoCalculate &&
          (!formData.manualCalories || Number(formData.manualCalories) <= 0)
            ? "Please enter a valid calorie value"
            : null,
      });
      return;
    }

    // Check for duplicate activities
    const isDuplicate = activities.some(
      (activity) => activity.activity_name === formData.activityName
    );

    if (isDuplicate) {
      toast.error(
        "This activity type has already been added. Please choose a different activity or remove the existing one."
      );
      return;
    }

    const newActivity = {
      id: Date.now(),
      activity_name: formData.activityName,
      calories: calculatedCalories.toString(),
      duration: formData.isAutoCalculate ? formData.activityValue : "",
      unit: ACTIVITIES[formData.activityName]?.unit || "minutes",
    };

    setActivities((prev) => [...prev, newActivity]);

    setFormData((prev) => ({
      ...prev,
      activityName: "running",
      activityValue: "",
      manualCalories: "",
    }));
    setFormErrors({});
  };

  const removeActivity = (activityId) => {
    setActivities((prev) =>
      prev.filter((activity) => activity.id !== activityId)
    );
  };

  const getTotalCaloriesFromActivities = () => {
    return activities.reduce(
      (sum, activity) => sum + parseInt(activity.calories),
      0
    );
  };

  const getActivityIcon = (activityName) => {
    const ActivityIcon = ACTIVITIES[activityName]?.icon || Activity;
    const color = ACTIVITIES[activityName]?.color || "text-gray-600";
    return <ActivityIcon className={`h-5 w-5 ${color}`} />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTotalCaloriesFromEntry = (entry) => {
    return entry.calories_burned.reduce(
      (sum, activity) => sum + parseInt(activity.calories),
      0
    );
  };

  const getActivityDisplayName = (activityName) => {
    return (
      ACTIVITIES[activityName]?.name ||
      activityName.charAt(0).toUpperCase() + activityName.slice(1)
    );
  };

  // Check if user is authenticated
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 text-gray-800 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Please log in to access the calorie tracker
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 text-gray-800 p-2 sm:p-4 lg:p-6">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={3}
        rtl={false}
      />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-6 sm:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Calorie Tracker
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Track your activities and achieve your fitness goals
          </p>
        </header>

        {/* Enhanced Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-sm sm:text-lg mb-1">
                    Total Burned
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {summary.total_calories_burned?.toLocaleString() || "0"}
                  </p>
                  <p className="text-xs sm:text-sm opacity-90">
                    kcal in 7 days
                  </p>
                </div>
                <Flame className="h-8 w-8 sm:h-12 sm:w-12 opacity-80 flex-shrink-0" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-sm sm:text-lg mb-1">
                    Daily Average
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {summary.average_calories_per_day?.toLocaleString() || "0"}
                  </p>
                  <p className="text-xs sm:text-sm opacity-90">kcal per day</p>
                </div>
                <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 opacity-80 flex-shrink-0" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-sm sm:text-lg mb-1">
                    Total Entries
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {summary.entries_count || "0"}
                  </p>
                  <p className="text-xs sm:text-sm opacity-90">
                    activities logged
                  </p>
                </div>
                <BarChart2 className="h-8 w-8 sm:h-12 sm:w-12 opacity-80 flex-shrink-0" />
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-sm sm:text-lg mb-1">
                    Top Activity
                  </h3>
                  <p className="text-lg sm:text-xl font-bold">
                    {summary.activities_summary &&
                    Object.keys(summary.activities_summary).length > 0
                      ? getActivityDisplayName(
                          Object.keys(summary.activities_summary)[0]
                        )
                      : "None"}
                  </p>
                  <p className="text-xs sm:text-sm opacity-90">
                    {summary.activities_summary &&
                    Object.keys(summary.activities_summary).length > 0
                      ? `${Object.values(summary.activities_summary)[0]} kcal`
                      : "Start logging!"}
                  </p>
                </div>
                <Target className="h-8 w-8 sm:h-12 sm:w-12 opacity-80 flex-shrink-0" />
              </div>
            </Card>
          </div>
        )}

        {/* Add Entry Button */}
        {!isFormOpen && (
          <Card className="mb-6 sm:mb-8 text-center p-4 sm:p-6 flex flex-col items-center justify-center min-h-[200px] sm:min-h-auto">
            <h3 className="font-bold text-base sm:text-lg text-emerald-800 mb-4">
              Ready to log your activity?
            </h3>
            <Button
              onClick={openNewEntryForm}
              size="lg"
              icon={Plus}
              className="w-full sm:w-auto"
            >
              Add New Entry
            </Button>
          </Card>
        )}

        {/* Enhanced Add/Edit Form */}
        {isFormOpen && (
          <Card className="mb-6 sm:mb-8">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-emerald-700 flex items-center">
                  {editingEntry ? (
                    <Edit className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <Plus className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                  {editingEntry ? "Edit" : "Add New"} Activity Entry
                </h2>
              </div>

              {!isFormCollapsed && (
                <div className="space-y-6 animate-in slide-in-from-top-2">
                  {/* Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label
                        htmlFor="activity_date"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Activity Date
                      </label>
                      <input
                        id="activity_date"
                        type="date"
                        value={formData.activityDate}
                        onChange={(e) =>
                          handleInputChange("activityDate", e.target.value)
                        }
                        className={`w-full border rounded-lg shadow-sm py-2.5 sm:py-3 px-3 sm:px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                          formErrors.activityDate
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        required
                      />
                      {formErrors.activityDate && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.activityDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="activity_name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Activity Type
                      </label>
                      <select
                        id="activity_name"
                        value={formData.activityName}
                        onChange={(e) =>
                          handleInputChange("activityName", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg shadow-sm py-2.5 sm:py-3 px-3 sm:px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      >
                        {Object.entries(ACTIVITIES).map(([key, { name }]) => (
                          <option key={key} value={key}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label
                        htmlFor="activity_value"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Duration/Steps (
                        {ACTIVITIES[formData.activityName]?.unit})
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {getActivityIcon(formData.activityName)}
                        </div>
                        <input
                          id="activity_value"
                          type="number"
                          min="0"
                          step="1"
                          value={formData.activityValue}
                          onChange={(e) =>
                            handleInputChange("activityValue", e.target.value)
                          }
                          placeholder={`Enter ${
                            ACTIVITIES[formData.activityName]?.unit
                          }`}
                          className={`w-full pl-10 sm:pl-12 border rounded-lg shadow-sm py-2.5 sm:py-3 px-3 sm:px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                            formErrors.activityValue
                              ? "border-red-500"
                              : formData.isAutoCalculate
                              ? "border-gray-300"
                              : "border-gray-200 bg-gray-50"
                          }`}
                          required={formData.isAutoCalculate}
                          disabled={!formData.isAutoCalculate}
                        />
                      </div>
                      {formErrors.activityValue && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.activityValue}
                        </p>
                      )}
                      {!formData.isAutoCalculate && (
                        <p className="mt-1 text-sm text-gray-500">
                          Duration field is disabled in manual mode
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="body_weight"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Body Weight (kg)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="body_weight"
                          type="number"
                          min="30"
                          max="200"
                          step="0.1"
                          value={formData.bodyWeight}
                          onChange={(e) =>
                            handleInputChange("bodyWeight", e.target.value)
                          }
                          placeholder="Enter your weight"
                          className={`w-full pl-10 sm:pl-12 border rounded-lg shadow-sm py-2.5 sm:py-3 px-3 sm:px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                            formErrors.bodyWeight
                              ? "border-red-500"
                              : formData.isAutoCalculate
                              ? "border-gray-300"
                              : "border-gray-200 bg-gray-50"
                          }`}
                          required={formData.isAutoCalculate}
                          disabled={!formData.isAutoCalculate}
                        />
                      </div>
                      {formErrors.bodyWeight && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.bodyWeight}
                        </p>
                      )}
                      {!formData.isAutoCalculate && (
                        <p className="mt-1 text-sm text-gray-500">
                          Weight field is disabled in manual mode
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Enhanced Calorie Display with Toggle */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-4 sm:p-6">
                    <div className="mb-4">
                      <ToggleSwitch
                        checked={formData.isAutoCalculate}
                        onChange={() => {
                          setFormData((prev) => ({
                            ...prev,
                            isAutoCalculate: !prev.isAutoCalculate,
                            manualCalories: !prev.isAutoCalculate
                              ? ""
                              : prev.manualCalories,
                          }));
                          // Clear relevant errors when switching modes
                          setFormErrors((prev) => ({
                            ...prev,
                            activityValue: null,
                            manualCalories: null,
                          }));
                        }}
                        label="Auto-calculate calories"
                        description={
                          formData.isAutoCalculate
                            ? "Calories are automatically calculated based on activity and weight"
                            : "Enter calories manually"
                        }
                      />
                    </div>

                    <div className="flex items-center justify-center space-x-4">
                      <div className="bg-emerald-100 p-2 sm:p-3 rounded-full">
                        {formData.isAutoCalculate ? (
                          <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
                        ) : (
                          <Edit3 className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">
                          {formData.isAutoCalculate ? "Estimated" : "Manual"}{" "}
                          Calories Burned
                        </p>
                        {formData.isAutoCalculate ? (
                          <p className="text-3xl sm:text-4xl font-bold text-emerald-600">
                            {calculatedCalories.toLocaleString()}
                          </p>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={formData.manualCalories}
                              onChange={(e) =>
                                handleInputChange(
                                  "manualCalories",
                                  e.target.value
                                )
                              }
                              placeholder="Enter calories"
                              className="text-3xl sm:text-4xl font-bold text-emerald-600 bg-transparent border-b-2 border-emerald-300 focus:border-emerald-500 focus:outline-none text-center w-32 sm:w-40"
                            />
                          </div>
                        )}
                        <p className="text-sm text-gray-500">kcal</p>
                      </div>
                    </div>

                    {!formData.isAutoCalculate && formErrors.manualCalories && (
                      <p className="mt-2 text-sm text-red-600 text-center">
                        {formErrors.manualCalories}
                      </p>
                    )}
                  </div>

                  {/* Add Activity Button */}
                  <div className="flex items-center justify-center">
                    <Button
                      onClick={addActivity}
                      disabled={
                        (formData.isAutoCalculate &&
                          (!formData.activityValue ||
                            Number(formData.activityValue) <= 0)) ||
                        (!formData.isAutoCalculate &&
                          (!formData.manualCalories ||
                            Number(formData.manualCalories) <= 0))
                      }
                      icon={Plus}
                      className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-400 text-white transform hover:scale-105 active:scale-95"
                    >
                      Add Activity
                    </Button>
                  </div>

                  {/* Activities List */}
                  {activities.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <BarChart2 className="w-4 h-4 mr-2" />
                        Activities ({activities.length})
                      </h4>
                      <div className="space-y-2">
                        {activities.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              {getActivityIcon(activity.activity_name)}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">
                                  {getActivityDisplayName(
                                    activity.activity_name
                                  )}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {activity.duration} {activity.unit}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 flex-shrink-0">
                              <span className="font-bold text-emerald-600 text-sm sm:text-base">
                                {parseInt(activity.calories).toLocaleString()}{" "}
                                kcal
                              </span>
                              <Button
                                onClick={() => removeActivity(activity.id)}
                                variant="danger"
                                size="sm"
                                icon={Trash2}
                                className="p-1"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total Calories */}
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-700">
                            Total Calories:
                          </span>
                          <span className="text-xl sm:text-2xl font-bold text-emerald-600">
                            {getTotalCaloriesFromActivities().toLocaleString()}{" "}
                            kcal
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
                    <Button
                      onClick={resetForm}
                      variant="secondary"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleFormSubmit}
                      loading={isSubmitting}
                      disabled={activities.length === 0}
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-400 text-white transform hover:scale-105 active:scale-95"
                    >
                      {editingEntry ? "Update Entry" : "Save Entry"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Enhanced Activity Log */}
        <Card>
          <div className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-emerald-700 mb-6 flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
              Activity Log
            </h2>

            {isLoading ? (
              <LoadingSpinner />
            ) : entries.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No entries found yet</p>
                <p className="text-gray-400 text-sm">
                  Start logging your activities to see them here!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start sm:items-center space-x-4 sm:space-x-6 mb-4 sm:mb-0">
                      <div className="flex-shrink-0">
                        <div className="bg-white p-2 sm:p-3 rounded-full shadow-sm">
                          <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-2">
                          {formatDate(entry.activity_date)}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          {entry.calories_burned.map((activity, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 bg-white px-2 py-1 rounded-md border border-gray-200 text-xs sm:text-sm"
                            >
                              {getActivityIcon(activity.activity_name)}
                              <span className="text-gray-600">
                                {getActivityDisplayName(activity.activity_name)}
                              </span>
                              <span className="text-emerald-600 font-medium">
                                {parseInt(activity.calories).toLocaleString()}{" "}
                                kcal
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-4">
                      <div className="text-right">
                        <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                          {getTotalCaloriesFromEntry(entry).toLocaleString()}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          kcal burned
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEdit(entry)}
                          variant="secondary"
                          size="sm"
                          icon={Edit}
                          className="p-2"
                        />
                        <Popconfirm
                          title="Delete Activity Entry"
                          description="Are you sure you want to delete this activity entry? This action cannot be undone."
                          onConfirm={() => handleDelete(entry.id)}
                          okText="Yes, Delete"
                          cancelText="Cancel"
                          okType="danger"
                          placement="bottom"
                          trigger="click"
                          showCancel={true}
                          overlayStyle={{ zIndex: 1000 }}
                          destroyTooltipOnHide={true}
                          getPopupContainer={(triggerNode) =>
                            triggerNode.parentNode
                          }
                        >
                          <span>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={Trash2}
                              className="p-2"
                            />
                          </span>
                        </Popconfirm>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
