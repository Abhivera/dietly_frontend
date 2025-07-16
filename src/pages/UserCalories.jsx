import React, { useState, useEffect, useCallback } from "react";
import { Popconfirm } from "antd";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Flame,
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
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import {
  createUserCalories,
  getUserCalories,
  updateUserCalories,
  deleteUserCalories,
  getRecentCaloriesSummary,
} from "../api/userCalories";
import { getUser } from "../api/user";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// --- Enhanced Activity Data ---
const ACTIVITIES = {
  running: {
    name: "Running",
    met: 9.8,
    unit: "minutes",
    icon: DirectionsRunIcon, // Use MUI icon
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
    icon: DirectionsRunIcon, // Use MUI icon for all Activity
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  swimming: {
    name: "Swimming",
    met: 8.0,
    unit: "minutes",
    icon: DirectionsRunIcon, // Use MUI icon for all Activity
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
  },
  yoga: {
    name: "Yoga",
    met: 3.0,
    unit: "minutes",
    icon: DirectionsRunIcon, // Use MUI icon for all Activity
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
  basketball: {
    name: "Basketball",
    met: 8.0,
    unit: "minutes",
    icon: DirectionsRunIcon, // Use MUI icon for all Activity
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  tennis: {
    name: "Tennis",
    met: 7.0,
    unit: "minutes",
    icon: DirectionsRunIcon, // Use MUI icon for all Activity
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
    className={`bg-gray-50 rounded-xl border border-gray-300 overflow-hidden transition-all duration-300 ${
      hover ? "hover:border-emerald-400" : ""
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
  icon: Icon,
  loading = false,
  className = "",
  variant = "primary",
  size = "md",
  ...props // forward all other props
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
      className={`${baseClasses} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props} // forward all props, including onClick, type, etc.
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
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
  const [activities, setActivities] = useState([]);

  const fetchUserData = useCallback(async () => {
    try {
      const user = await getUser();
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
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [fetchedEntries, fetchedSummary] = await Promise.all([
        getUserCalories({}),
        getRecentCaloriesSummary(7),
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
  };

  useEffect(() => {
    fetchData();
    fetchUserData();
  }, []);

  const resetForm = useCallback(() => {
    setEditingEntry(null);
    setFormData({
      activityDate: getTodayDateString(),
      activityName: "running",
      activityValue: "",
      bodyWeight: userData?.weight || 0,
      manualCalories: "",
      isAutoCalculate: true,
    });
    setActivities([]);
    setIsFormOpen(false);
    setIsFormCollapsed(false);
  }, [userData?.weight]);

  const handleFormSubmit = async (values) => {
    if (activities.length === 0) {
      toast.error("Please add at least one activity before saving.");
      return;
    }

    const payload = {
      activity_date: values.activityDate,
      calories_burned: activities.map((activity) => ({
        activity_name: activity.activity_name,
        calories: activity.calories,
      })),
    };

    try {
      // Formik handles isSubmitting

      if (editingEntry) {
        await updateUserCalories(editingEntry.id, payload);
        toast.success("Activity entry updated successfully!");
      } else {
        await createUserCalories(payload);
        toast.success("Activity entry created successfully!");
      }

      await fetchData();
      resetForm();
    } catch (err) {
      // Handle specific error messages from the API
      let errorMessage = err.message;

      // Check for API error in err.response.data.detail
      if (err.response && err.response.data && err.response.data.detail) {
        if (err.response.data.detail.includes("already exists")) {
          errorMessage =
            "An entry already exists for this date. Please edit the existing entry instead.";
        } else if (
          err.response.data.detail.includes("cannot be in the future")
        ) {
          errorMessage =
            "Activity date cannot be in the future. Please select a valid date.";
        } else {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message.includes("already exists")) {
        errorMessage =
          "An entry already exists for this date. Please edit the existing entry instead.";
      } else if (err.message.includes("cannot be in the future")) {
        errorMessage =
          "Activity date cannot be in the future. Please select a valid date.";
      }

      toast.error(errorMessage);
      console.error("Submit error:", err);
    } finally {
      // Formik handles isSubmitting
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

      setIsFormOpen(true);
      setIsFormCollapsed(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [userData?.weight]
  );

  const handleDelete = async (id) => {
    try {
      await deleteUserCalories(id);
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

  const addActivity = (values) => {
    if (
      !values.activityName ||
      (!values.activityValue && values.isAutoCalculate) ||
      (values.isAutoCalculate && Number(values.activityValue) <= 0) ||
      (!values.isAutoCalculate &&
        (!values.manualCalories || Number(values.manualCalories) <= 0))
    ) {
      // setFormErrors({
      //   activityName: !formData.activityName
      //     ? "Activity type is required"
      //     : null,
      //   activityValue:
      //     formData.isAutoCalculate &&
      //     (!formData.activityValue || Number(formData.activityValue) <= 0)
      //       ? "Please enter a valid activity value"
      //       : null,
      //   manualCalories:
      //     !formData.isAutoCalculate &&
      //     (!formData.manualCalories || Number(formData.manualCalories) <= 0)
      //       ? "Please enter a valid calorie value"
      //       : null,
      // });
      return;
    }

    // Check for duplicate activities
    const isDuplicate = activities.some(
      (activity) => activity.activity_name === values.activityName
    );

    if (isDuplicate) {
      toast.error(
        "This activity type has already been added. Please choose a different activity or remove the existing one."
      );
      return;
    }

    const newActivity = {
      id: Date.now(),
      activity_name: values.activityName,
      calories: (values.isAutoCalculate
        ? calculateCalories(
            values.activityName,
            Number(values.activityValue),
            values.bodyWeight
          )
        : Number(values.manualCalories) || 0
      ).toString(),
      duration: values.isAutoCalculate ? values.activityValue : "",
      unit: ACTIVITIES[values.activityName]?.unit || "minutes",
    };

    setActivities((prev) => [...prev, newActivity]);
    // Optionally reset fields using Formik's setFieldValue if needed
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
    const ActivityIcon = ACTIVITIES[activityName]?.icon || DirectionsRunIcon;
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

  const today = new Date();
  const activitySchema = Yup.object().shape({
    activityDate: Yup.date()
      .required("Please select an activity date.")
      .max(today, "Activity date cannot be in the future."),
    activityName: Yup.string().required("Activity type is required"),
    activityValue: Yup.number().when("isAutoCalculate", {
      is: true,
      then: (schema) =>
        schema
          .required("Please enter a valid activity value")
          .moreThan(0, "Must be greater than 0"),
      otherwise: (schema) => schema,
    }),
    bodyWeight: Yup.number().when("isAutoCalculate", {
      is: true,
      then: (schema) =>
        schema
          .required("Please enter your weight")
          .moreThan(0, "Must be greater than 0"),
      otherwise: (schema) => schema,
    }),
    manualCalories: Yup.number().when("isAutoCalculate", {
      is: false,
      then: (schema) =>
        schema
          .required("Please enter a valid calorie value")
          .moreThan(0, "Must be greater than 0"),
      otherwise: (schema) => schema,
    }),
    isAutoCalculate: Yup.boolean(),
  });

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
          <div className="flex items-center justify-center gap-2">
            <QueryStatsIcon style={{ fontSize: 40, color: "#006045" }} />
            <h1 className="text-3xl sm:text-4xl  font-bold bg-emerald-800 bg-clip-text text-transparent mb-2">
              Calorie Tracker
            </h1>
          </div>
          <p className="text-emerald-600 text-base sm:text-lg">
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
                <Formik
                  initialValues={{
                    activityDate: formData.activityDate,
                    activityName: formData.activityName,
                    activityValue: formData.activityValue,
                    bodyWeight: formData.bodyWeight,
                    manualCalories: formData.manualCalories,
                    isAutoCalculate: formData.isAutoCalculate,
                  }}
                  enableReinitialize
                  validationSchema={activitySchema}
                  onSubmit={async (values, { setSubmitting }) => {
                    // Set local formData for compatibility with addActivity, etc.
                    setFormData(values);
                    setSubmitting(true);
                    await handleFormSubmit(values);
                    setSubmitting(false);
                  }}
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    setFieldValue,
                  }) => (
                    <Form className="space-y-6 animate-in slide-in-from-top-2">
                      {/* Form Fields */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
                        {/* Activity Type */}
                        <div className="flex flex-col">
                          <label
                            htmlFor="activity_name"
                            className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                          >
                            Activity Type
                            <span
                              className="ml-1 text-gray-400"
                              title="Select the type of activity you performed."
                            ></span>
                          </label>
                          <Field
                            as="select"
                            id="activity_name"
                            name="activityName"
                            className={`w-full border rounded-lg shadow-sm py-2.5 sm:py-3 px-3 sm:px-4 focus:outline-none transition-colors focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                              (errors.activityName && touched.activityName) ||
                              !values.activityName
                                ? "border-red-500"
                                : "border-green-400"
                            }`}
                            aria-label="Activity Type"
                            onChange={(e) => {
                              handleChange(e);
                              setFieldValue("activityValue", ""); // reset value on type change
                            }}
                          >
                            {Object.entries(ACTIVITIES).map(
                              ([key, { name }]) => (
                                <option key={key} value={key}>
                                  {name}
                                </option>
                              )
                            )}
                          </Field>
                          <ErrorMessage
                            name="activityName"
                            component="div"
                            className="mt-1 text-sm text-red-600"
                          />
                        </div>
                        {/* Duration/Steps */}
                        <div className="flex flex-col">
                          <label
                            htmlFor="activity_value"
                            className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                          >
                            Duration/Steps
                            <span
                              className="ml-1 text-gray-400"
                              title={`Enter the number of ${
                                ACTIVITIES[values.activityName]?.unit
                              } for this activity.`}
                            ></span>
                            <span className="ml-2 text-xs text-gray-500 font-normal">
                              ({ACTIVITIES[values.activityName]?.unit})
                            </span>
                          </label>
                          <div className="relative flex items-center">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              {getActivityIcon(values.activityName)}
                            </div>
                            <Field
                              id="activity_value"
                              name="activityValue"
                              type="number"
                              min="0"
                              step="1"
                              placeholder={`Enter ${
                                ACTIVITIES[values.activityName]?.unit
                              }`}
                              className={`w-full pl-10 sm:pl-12 border rounded-lg shadow-sm py-2.5 sm:py-3 px-3 sm:px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors
                                ${
                                  (errors.activityValue &&
                                    touched.activityValue) ||
                                  (!values.activityValue &&
                                    values.isAutoCalculate)
                                    ? "border-red-500"
                                    : values.activityValue
                                    ? "border-green-400"
                                    : values.isAutoCalculate
                                    ? "border-gray-300"
                                    : "border-gray-200 bg-gray-50"
                                }
                              `}
                              required={values.isAutoCalculate}
                              aria-invalid={!!errors.activityValue}
                              aria-describedby="activity_value_error"
                              autoFocus={
                                values.isAutoCalculate && !values.activityValue
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  // Optionally trigger addActivity here if needed
                                }
                              }}
                            />
                          </div>
                          <ErrorMessage
                            name="activityValue"
                            component="div"
                            className="mt-1 text-sm text-red-600"
                          />
                        </div>
                        {/* Activity Date */}
                        <div className="flex flex-col">
                          <label
                            htmlFor="activity_date"
                            className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                          >
                            Activity Date
                          </label>
                          <Field
                            id="activity_date"
                            name="activityDate"
                            type="date"
                            className={`w-full border rounded-lg shadow-sm py-2.5 sm:py-3 px-3 sm:px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                              (errors.activityDate && touched.activityDate) ||
                              !values.activityDate
                                ? "border-red-500"
                                : "border-green-400"
                            }`}
                            required
                            aria-invalid={!!errors.activityDate}
                            aria-describedby="activity_date_error"
                            autoFocus={!values.activityDate}
                          />
                          <ErrorMessage
                            name="activityDate"
                            component="div"
                            className="mt-1 text-sm text-red-600"
                          />
                        </div>
                        {/* Body Weight */}
                        <div className="flex flex-col">
                          <label
                            htmlFor="body_weight"
                            className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                          >
                            Body Weight
                            <span
                              className="ml-1 text-gray-400"
                              title="Your body weight in kilograms. Used for calorie calculation."
                            ></span>
                            <span className="ml-2 text-xs text-gray-500 font-normal">
                              (kg)
                            </span>
                          </label>
                          <div className="relative flex items-center">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <Field
                              id="body_weight"
                              name="bodyWeight"
                              type="number"
                              min="30"
                              max="200"
                              step="0.1"
                              placeholder="Enter your weight"
                              className={`w-full pl-10 sm:pl-12 border rounded-lg shadow-sm py-2.5 sm:py-3 px-3 sm:px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors
                                ${
                                  (errors.bodyWeight && touched.bodyWeight) ||
                                  (!values.bodyWeight && values.isAutoCalculate)
                                    ? "border-red-500"
                                    : values.bodyWeight
                                    ? "border-green-400"
                                    : values.isAutoCalculate
                                    ? "border-gray-300"
                                    : "border-gray-200 bg-gray-50"
                                }
                              `}
                              required={values.isAutoCalculate}
                              aria-invalid={!!errors.bodyWeight}
                              aria-describedby="body_weight_error"
                              autoFocus={
                                values.isAutoCalculate && !values.bodyWeight
                              }
                            />
                          </div>
                          <ErrorMessage
                            name="bodyWeight"
                            component="div"
                            className="mt-1 text-sm text-red-600"
                          />
                        </div>
                      </div>
                      {/* Enhanced Calorie Display with Toggle - Single Row Layout */}
                      <div className="relative bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl shadow p-2 sm:p-3 flex flex-row items-center gap-3 sm:gap-6 w-full">
                        {/* Toggle and label */}
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <span className="text-xs sm:text-sm font-bold text-emerald-700 whitespace-nowrap">
                            Auto-calculate
                          </span>
                          <ToggleSwitch
                            checked={values.isAutoCalculate}
                            onChange={() => {
                              setFieldValue(
                                "isAutoCalculate",
                                !values.isAutoCalculate
                              );
                              setFieldValue("manualCalories", "");
                              setFieldValue("activityValue", "");
                            }}
                            label={null}
                            description={null}
                          />
                        </div>
                        {/* Calories input */}
                        <div className="flex items-center gap-2 flex-1 justify-center">
                          <div
                            className={`rounded-full p-1.5 shadow ${
                              values.isAutoCalculate
                                ? "bg-emerald-100"
                                : "bg-yellow-100"
                            }`}
                          >
                            {values.isAutoCalculate ? (
                              <Calculator className="h-4 w-4 text-emerald-600 animate-pulse" />
                            ) : (
                              <Edit3 className="h-4 w-4 text-yellow-600 animate-bounce" />
                            )}
                          </div>
                          <div className="flex flex-col items-center flex-1 max-w-xs">
                            <p className="text-[10px] text-emerald-700 mb-1 font-semibold tracking-wide uppercase">
                              Calories Burned
                            </p>
                            {values.isAutoCalculate ? (
                              <span className="inline-block text-2xl sm:text-3xl font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg shadow-inner border border-emerald-200 w-full sm:w-auto text-center">
                                {calculateCalories(
                                  values.activityName,
                                  Number(values.activityValue),
                                  values.bodyWeight
                                ).toLocaleString()}
                              </span>
                            ) : (
                              <div className="flex items-center w-full justify-center">
                                <Field
                                  type="number"
                                  min="0"
                                  step="1"
                                  name="manualCalories"
                                  placeholder="Calories"
                                  className="text-2xl sm:text-2xl font-extrabold text-yellow-600 bg-transparent border-b border-yellow-300 focus:border-yellow-500 focus:outline-none text-center w-full sm:w-28"
                                />
                              </div>
                            )}
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              kcal
                            </p>
                            {!values.isAutoCalculate && (
                              <ErrorMessage
                                name="manualCalories"
                                component="div"
                                className="mt-1 text-xs text-red-600 text-center"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Add Activity Button */}
                      <div className="flex items-center justify-center">
                        <Button
                          type="button"
                          onClick={() => addActivity(values)}
                          disabled={
                            (values.isAutoCalculate &&
                              (!values.activityValue ||
                                Number(values.activityValue) <= 0)) ||
                            (!values.isAutoCalculate &&
                              (!values.manualCalories ||
                                Number(values.manualCalories) <= 0))
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
                                    {parseInt(
                                      activity.calories
                                    ).toLocaleString()}{" "}
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
                      <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-2">
                        <Button
                          type="submit"
                          loading={values.isSubmitting}
                          disabled={
                            activities.length === 0 || values.isSubmitting
                          }
                          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-400 text-white transform hover:scale-105 active:scale-95"
                        >
                          {editingEntry ? "Update" : "Save"}
                        </Button>
                        <Button
                          onClick={resetForm}
                          variant="secondary"
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
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
                <DirectionsRunIcon
                  style={{
                    fontSize: 64,
                    color: "#D1D5DB",
                    margin: "0 auto 1rem auto",
                  }}
                />
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
