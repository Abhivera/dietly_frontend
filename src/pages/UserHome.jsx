import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Calendar,
  Upload,
  Trash2,
  Activity,
  TrendingUp,
  Eye,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Image,
  Target,
  BarChart3,
  Clock,
  Apple,
  Flame,
  Salad,
  Pizza,
} from "lucide-react";
import {
  getAllImages,
  uploadAndAnalyzeImage,
  deleteImage,
  updateImageIsMeal,
} from "../api/images";
import { Popconfirm } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Switch, FormControlLabel } from "@mui/material";
import { Link } from "react-router-dom";

export default function UserHome() {
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [viewMode, setViewMode] = useState("daily"); // daily, weekly, monthly
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [mealOnly, setMealOnly] = useState(true); // default to meal only
  const { token } = useSelector((state) => state.auth);
  const [mealUpdatingId, setMealUpdatingId] = useState(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    let isCurrent = true;
    getAllImages()
      .then((data) => {
        if (!isCurrent) return;
        setImages(data.images || []);
        setFilteredImages(data.images || []);
        // No toast for empty state, handled by illustration
      })
      .catch(() => {
        if (!isCurrent) return;
        setImages([]);
        setFilteredImages([]);
        toast.error("Failed to load images");
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [token]);

  // Filter and search logic
  useEffect(() => {
    let filtered = images;

    // Filter by meal switch
    if (mealOnly) {
      filtered = filtered.filter((img) => img.analysis?.is_meal);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (img) =>
          img.original_filename
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          img.analysis?.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          img.analysis?.food_items?.some((item) =>
            item.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filter by date range based on view mode
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    if (viewMode === "daily") {
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter((img) => {
        const imgDate = new Date(img.created_at || img.upload_date);
        return imgDate >= startOfDay && imgDate <= endOfDay;
      });
    } else if (viewMode === "weekly") {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      filtered = filtered.filter((img) => {
        const imgDate = new Date(img.created_at || img.upload_date);
        return imgDate >= startOfWeek && imgDate <= endOfWeek;
      });
    } else if (viewMode === "monthly") {
      const startOfMonth = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        0
      );
      endOfMonth.setHours(23, 59, 59, 999);
      filtered = filtered.filter((img) => {
        const imgDate = new Date(img.created_at || img.upload_date);
        return imgDate >= startOfMonth && imgDate <= endOfMonth;
      });
    }

    setFilteredImages(filtered);
  }, [images, mealOnly, searchTerm, viewMode, selectedDate]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.info("Please select a file first");
      return;
    }
    if (!token) {
      toast.error("You must be logged in to upload images");
      return;
    }
    try {
      setUploading(true);
      const res = await uploadAndAnalyzeImage(file, description);
      if (res && res.image) {
        setImages((prev) => [res.image, ...prev]);
        toast.success("Image uploaded and analyzed successfully!");
      } else {
        toast.error(res?.message || "Upload failed. Please try again.");
      }
      setFile(null);
      setDescription("");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!token) {
      toast.error("You must be logged in to delete images");
      return;
    }
    try {
      await deleteImage(id);
      setImages((prev) => prev.filter((img) => img.id !== id));
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete image");
    }
  };

  const handleToggleMeal = async (img) => {
    if (!token) {
      toast.error("You must be logged in to update meal status");
      return;
    }
    if (!img.analysis?.is_food) return;
    setMealUpdatingId(img.id);
    try {
      const newIsMeal = !img.analysis.is_meal;
      const res = await updateImageIsMeal(img.id, newIsMeal);
      if (res && res.success) {
        setImages((prev) =>
          prev.map((i) =>
            i.id === img.id
              ? {
                  ...i,
                  analysis: { ...i.analysis, is_meal: newIsMeal },
                }
              : i
          )
        );
        toast.success(newIsMeal ? "Added to meal" : "Removed from meal");
      } else {
        toast.error(res?.message || "Failed to update meal status");
      }
    } catch {
      toast.error("Failed to update meal status");
    } finally {
      setMealUpdatingId(null);
    }
  };

  const calculateStats = () => {
    const foodImages = filteredImages.filter((img) => img.analysis?.is_food);
    const totalCalories = foodImages.reduce(
      (sum, img) => sum + (img.analysis?.calories || 0),
      0
    );
    const avgCalories =
      foodImages.length > 0 ? Math.round(totalCalories / foodImages.length) : 0;

    return {
      totalImages: filteredImages.length,
      foodImages: foodImages.length,
      totalCalories,
      avgCalories,
    };
  };

  const stats = calculateStats();

  const formatDateRange = () => {
    if (viewMode === "daily") {
      return selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else if (viewMode === "weekly") {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${endOfWeek.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    } else {
      return selectedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    }
  };

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    if (viewMode === "daily") {
      newDate.setDate(newDate.getDate() + direction);
    } else if (viewMode === "weekly") {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setSelectedDate(newDate);
  };

  return (
    <div className="min-h-screen bg-emerald-50 p-4">
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
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="text-center mb-10">
          <Link to="/health-info">
            <div className="inline-flex items-center gap-2 bg-white text-emerald-800 px-6 py-3 rounded-full text-base font-semibold mb-6 shadow-sm hover:shadow-md hover:bg-emerald-100 border border-emerald-200">
              <Pizza className="w-6 h-6 text-emerald-600 animate-bounce" />
              <span>Your Personalised Calorie Tracker</span>
            </div>
          </Link>
        </div>

        {/*Desktop Upload Section */}
        <div className="hidden sm:block mb-6">
          {!file ? (
            <label htmlFor="image-upload" className="block cursor-pointer">
              <div className="group border-2 border-dashed border-emerald-300 rounded-lg p-14 text-center bg-white  transition-colors duration-300">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-120">
                    <Upload className="w-12 h-12 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-800 mb-2">
                      Upload Food Image for Analysis
                    </p>
                    <p className="text-emerald-700 mb-2 text-base">
                      Click or drag and drop your image here
                    </p>
                    <p className="text-sm text-emerald-600">
                      Supports JPG, PNG (max 10MB)
                    </p>
                  </div>
                </div>
              </div>
            </label>
          ) : (
            <div className="space-y-6">
              <div className="relative group w-full max-w-md mx-auto rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Selected food"
                  className="w-full h-auto object-cover rounded-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => setFile(null)}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-colors duration-200"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="text-center">
                <input
                  type="text"
                  placeholder="Description ( Optional )"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full max-w-md mx-auto mt-2 px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-emerald-800 bg-white"
                  disabled={uploading}
                />
              </div>
              <div className="text-center">
                <button
                  onClick={handleUpload}
                  disabled={uploading || !file}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-semibold w-full max-w-md mx-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Upload & Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg p-6 mb-6 border border-emerald-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* View Mode Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600 hidden sm:block" />
              </div>
              <div className="bg-emerald-100 rounded-lg p-1 flex flex-col sm:flex-row w-full sm:w-auto">
                {["daily", "weekly", "monthly"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center sm:justify-start gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400
          ${
            viewMode === mode
              ? "bg-emerald-600 text-white"
              : "text-emerald-700 hover:text-emerald-800 hover:bg-emerald-200"
          }
        `}
                  >
                    {mode === "daily" && <Clock className="w-4 h-4" />}
                    {mode === "weekly" && <BarChart3 className="w-4 h-4" />}
                    {mode === "monthly" && <TrendingUp className="w-4 h-4" />}
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center justify-between bg-emerald-100 rounded-lg px-3 py-2 w-full sm:w-auto">
              {/* Left Arrow */}
              <button
                onClick={() => navigateDate(-1)}
                className="p-2 rounded-full border border-emerald-300 bg-white hover:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <ChevronLeft className="w-5 h-5 text-emerald-600" />
              </button>

              {/* Centered Date Text */}
              <span className="flex-1 text-center font-medium text-emerald-800 px-4">
                {formatDateRange()}
              </span>

              {/* Right Arrow */}
              <button
                onClick={() => navigateDate(1)}
                className="p-2 rounded-full border border-emerald-300 bg-white hover:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <ChevronRight className="w-5 h-5 text-emerald-600" />
              </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-auto">
                <Search className="w-4 h-4 absolute left-3 top-3 text-emerald-600" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-emerald-200 rounded-full focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white text-emerald-800 w-full md:w-56"
                />
              </div>
            </div>

            {/* Meal Switch */}
            <FormControlLabel
              control={
                <Switch
                  checked={mealOnly}
                  onChange={() => setMealOnly((prev) => !prev)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#059669",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#059669",
                    },
                  }}
                />
              }
              label={
                mealOnly ? (
                  <span className="flex items-center gap-1 text-emerald-700">
                    <Salad className="w-5 h-5 text-emerald-600" /> Meals
                  </span>
                ) : (
                  <span className="text-emerald-700">All Items</span>
                )
              }
              className="mr-4"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6">
          {/* Mobile 4-column icon grid */}
          <div className="grid grid-cols-4 gap-2 sm:hidden">
            <div className="flex flex-col items-center rounded-xl border border-emerald-200 bg-white p-2 text-center shadow-sm">
              <Eye className="h-6 w-6 text-emerald-600" />
              <p className="text-xs font-medium text-emerald-700 leading-tight mt-1">
                Images
              </p>
              <p className="text-lg font-bold text-emerald-800 mt-0.5">
                {stats.totalImages}
              </p>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-emerald-200 bg-white p-2 text-center shadow-sm">
              <Apple className="h-6 w-6 text-emerald-600" />
              <p className="text-xs font-medium text-emerald-700 leading-tight mt-1">
                Foods
              </p>
              <p className="text-lg font-bold text-emerald-800 mt-0.5">
                {stats.foodImages}
              </p>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-emerald-200 bg-white p-2 text-center shadow-sm">
              <Flame className="h-6 w-6 text-emerald-600" />
              <p className="text-xs font-medium text-emerald-700 leading-tight mt-1">
                Calories
              </p>
              <p className="text-lg font-bold text-emerald-800 mt-0.5">
                {stats.totalCalories}
              </p>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-emerald-200 bg-white p-2 text-center shadow-sm">
              <Target className="h-6 w-6 text-emerald-600" />
              <p className="text-xs font-medium text-emerald-700 leading-tight mt-1">
                Avg Cal
              </p>
              <p className="text-lg font-bold text-emerald-800 mt-0.5">
                {stats.avgCalories}
              </p>
            </div>
          </div>

          {/* Desktop grid layout */}
          <div className="hidden sm:grid grid-cols-4 gap-4">
            <div className="flex items-center gap-4 rounded-lg border border-emerald-200 bg-white p-6">
              <div className="flex items-center justify-center rounded-2xl border border-emerald-200 p-3">
                <Eye className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-emerald-700">
                  Total Images
                </p>
                <p className="text-3xl font-bold text-emerald-800">
                  {stats.totalImages}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-emerald-200 bg-white p-6">
              <div className="flex items-center justify-center rounded-2xl border border-emerald-200 p-3">
                <Apple className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-emerald-700">
                  Food Items
                </p>
                <p className="text-3xl font-bold text-emerald-800">
                  {stats.foodImages}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-emerald-200 bg-white p-6">
              <div className="flex items-center justify-center rounded-2xl border border-emerald-200 p-3">
                <Flame className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-emerald-700">
                  Total Calories
                </p>
                <p className="text-3xl font-bold text-emerald-800">
                  {stats.totalCalories}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-emerald-200 bg-white p-6">
              <div className="flex items-center justify-center rounded-2xl border border-emerald-200 p-3">
                <Target className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-emerald-700">
                  Avg Calories
                </p>
                <p className="text-3xl font-bold text-emerald-800">
                  {stats.avgCalories}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-emerald-700">Loading your food images...</p>
          </div>
        )}

        {/* Images Grid */}
        <div className="space-y-4">
          {filteredImages && filteredImages.length > 0
            ? filteredImages.map((img) => (
                <div
                  key={img.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden sm:h-62"
                >
                  <div className="sm:flex h-full">
                    {/* Image */}
                    <div className="sm:w-1/3 h-24 sm:h-full">
                      <img
                        src={img.file_url}
                        alt={img.original_filename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Details */}
                    <div className="sm:w-2/3 p-3 flex flex-col justify-between h-full">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-base font-semibold text-gray-800 break-words flex items-center gap-1">
                            <Upload className="w-4 h-4 text-emerald-600" />
                            {img.original_filename}
                          </h3>
                          <div className="flex items-center space-x-1">
                            <div
                              className={`w-2 h-2 ${
                                img.analysis?.is_food
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              } rounded-full`}
                            ></div>
                            <span className="text-xs text-gray-600">
                              {img.analysis
                                ? `${(img.analysis.confidence * 100).toFixed(
                                    1
                                  )}%`
                                : "No analysis"}
                            </span>
                            <Popconfirm
                              title="Are you sure you want to delete this image?"
                              onConfirm={() => handleDelete(img.id)}
                              okText="Yes"
                              cancelText="No"
                              placement="topRight"
                            >
                              <button className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </Popconfirm>
                          </div>
                        </div>
                        {img.analysis ? (
                          <>
                            <p className="hidden sm:block text-xs text-gray-600 mb-2 line-clamp-2">
                              {img.analysis.description}
                            </p>
                            {/* Food Items */}
                            {img.analysis.food_items &&
                              img.analysis.food_items.length > 0 && (
                                <div className="mb-2">
                                  <div className="flex flex-wrap gap-1">
                                    {img.analysis.food_items.map((item, i) => (
                                      <span
                                        key={i}
                                        className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium"
                                      >
                                        {item}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            {/* Nutrition Grid */}
                            <div className="grid grid-cols-4 gap-2 mb-2">
                              <div className="text-center p-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded">
                                <p className="text-lg font-bold text-emerald-600">
                                  {img.analysis.calories}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Calories
                                </p>
                              </div>
                              <div className="text-center p-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded">
                                <p className="text-lg font-bold text-blue-600">
                                  {img.analysis.nutrients?.protein}g
                                </p>
                                <p className="text-xs text-gray-600">Protein</p>
                              </div>
                              <div className="text-center p-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded">
                                <p className="text-lg font-bold text-purple-600">
                                  {img.analysis.nutrients?.carbs}g
                                </p>
                                <p className="text-xs text-gray-600">Carbs</p>
                              </div>
                              <div className="text-center p-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded">
                                <p className="text-lg font-bold text-emerald-600">
                                  {img.analysis.nutrients?.fat}g
                                </p>
                                <p className="text-xs text-gray-600">Fat</p>
                              </div>
                            </div>
                            {/* Exercise Recommendations */}
                            {img.analysis.exercise_recommendations && (
                              <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded p-2 mb-1">
                                <div className="flex items-center space-x-2 text-xs">
                                  <span className="text-emerald-700">
                                    🚶{" "}
                                    {img.analysis.exercise_recommendations.steps?.toLocaleString()}{" "}
                                    steps
                                  </span>
                                  <span className="text-emerald-700">
                                    🏃{" "}
                                    {
                                      img.analysis.exercise_recommendations
                                        .walking_km
                                    }{" "}
                                    km
                                  </span>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                            <p className="text-yellow-800 text-xs flex items-center gap-1">
                              <Filter className="w-4 h-4" />
                              Analysis not available
                            </p>
                          </div>
                        )}
                      </div>
                      {/* Meal Toggle and Timestamp */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 text-xs">
                        {img.analysis && img.analysis.is_food && (
                          <button
                            onClick={() => handleToggleMeal(img)}
                            disabled={mealUpdatingId === img.id}
                            className={`px-3 py-1 rounded-full font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 flex items-center gap-1
                              ${
                                img.analysis.is_meal
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-emerald-600 text-white hover:bg-emerald-700"
                              }
                              ${
                                mealUpdatingId === img.id
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }
                            `}
                          >
                            {mealUpdatingId === img.id ? (
                              <span className="flex items-center gap-1">
                                <Activity className="w-4 h-4 animate-spin" />
                                Updating...
                              </span>
                            ) : img.analysis.is_meal ? (
                              <span className="flex items-center gap-1">
                                <Salad className="w-4 h-4" />
                                Remove from Meal
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Salad className="w-4 h-4" />
                                Add to Meal
                              </span>
                            )}
                          </button>
                        )}
                        <p>
                          Added{" "}
                          {new Date(
                            img.created_at || img.upload_date
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : !loading && (
                <div className="hidden sm:block text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Image className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No images found
                  </h3>
                  <p className="text-gray-600">
                    Upload your first food image to get started with AI-powered
                    calorie and nutrition analysis!
                  </p>
                </div>
              )}
        </div>
        {/*Mobile Upload Section */}
        <div className="block mt-2 sm:hidden mb-6">
          {!file ? (
            <label htmlFor="image-upload" className="block cursor-pointer">
              <div className="group border-2 border-dashed border-emerald-300 rounded-lg p-14 text-center bg-white  transition-colors duration-300">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-120">
                    <Upload className="w-12 h-12 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-800 mb-2">
                      Upload Food Image for Analysis
                    </p>
                    <p className="text-emerald-700 mb-2 text-base">
                      Click or drag and drop your image here
                    </p>
                    <p className="text-sm text-emerald-600">
                      Supports JPG, PNG (max 10MB)
                    </p>
                  </div>
                </div>
              </div>
            </label>
          ) : (
            <div className="space-y-6">
              <div className="relative group w-full max-w-md mx-auto rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Selected food"
                  className="w-full h-auto object-cover rounded-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => setFile(null)}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-colors duration-200"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="text-center">
                <input
                  type="text"
                  placeholder="Description ( Optional )"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full max-w-md mx-auto mt-2 px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-emerald-800 bg-white"
                  disabled={uploading}
                />
              </div>
              <div className="text-center">
                <button
                  onClick={handleUpload}
                  disabled={uploading || !file}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-semibold w-full max-w-md mx-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Upload & Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
