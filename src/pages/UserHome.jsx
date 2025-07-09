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
  Zap,
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
    getAllImages(token)
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
      const res = await uploadAndAnalyzeImage(token, file, description);
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
      await deleteImage(token, id);
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
      const res = await updateImageIsMeal(token, img.id, newIsMeal);
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

  const formatNutrients = (nutrients) => {
    if (!nutrients) return "N/A";
    return `Protein: ${nutrients.protein}g, Carbs: ${nutrients.carbs}g, Fat: ${nutrients.fat}g, Sugar: ${nutrients.sugar}g`;
  };

  const formatExercise = (exercise) => {
    if (!exercise) return "N/A";
    return `${exercise.steps} steps (${exercise.walking_km}km walk)`;
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
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
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-200 to-teal-200 text-emerald-900 px-6 py-3 rounded-full text-base font-semibold mb-6 shadow-lg animate-fade-in-down">
            <Pizza className="w-6 h-6 animate-bounce" />
            <span>Your Personalised Calorie Tracker</span>
          </div>
          {/* <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent mb-4 drop-shadow-lg animate-fade-in-up">
            Take control of your{" "}
            <span className="text-emerald-500">health journey</span>
          </h1>
          <p className="text-2xl text-gray-700 max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in-up">
            One snap is all it takes to understand your nutrition.
            <br />
            <span className="text-emerald-600 font-semibold">
              Track meals, stay consistent, and celebrate your progress every
              day.
            </span>
          </p> */}
        </div>
        {/* Upload Section */}
        <div className="mb-6">
          {!file ? (
            <label htmlFor="image-upload" className="block cursor-pointer">
              <div className="border-4 border-dashed border-emerald-300 rounded-2xl p-14 text-center bg-gradient-to-br from-white to-emerald-50 hover:from-emerald-50 hover:to-white transition-all duration-300 shadow-xl group relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-12 h-12 text-emerald-600 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-700 mb-2 tracking-tight">
                      Upload Food Image for Analysis
                    </p>
                    <p className="text-gray-500 mb-2 text-base">
                      Click or drag and drop your image here
                    </p>
                    <p className="text-sm text-gray-400">
                      Supports JPG, PNG (max 10MB)
                    </p>
                  </div>
                  <div className="absolute inset-0 pointer-events-none group-hover:bg-emerald-100/20 transition-colors rounded-2xl" />
                </div>
              </div>
            </label>
          ) : (
            <div className="space-y-6">
              <div className="relative group w-full max-w-md mx-auto rounded-xl overflow-hidden">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Selected food"
                  className="w-full h-auto object-cover rounded-xl"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => setFile(null)}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg transition-colors duration-200"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="text-center">
                <input
                  type="text"
                  placeholder="Add a description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full max-w-md mx-auto mt-2 px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-700 bg-white"
                  disabled={uploading}
                />
              </div>
              <div className="text-center">
                <button
                  onClick={handleUpload}
                  disabled={uploading || !file}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-semibold w-full max-w-md mx-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <div className="bg-gray-100 rounded-lg p-1 flex shadow-inner">
                {["daily", "weekly", "monthly"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400
                      ${
                        viewMode === mode
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow"
                          : "text-gray-600 hover:text-gray-800 hover:bg-emerald-50"
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
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1 shadow-inner">
              <button
                onClick={() => navigateDate(-1)}
                className="p-2 rounded-full border border-gray-300 bg-white hover:bg-emerald-100 hover:border-emerald-400 hover:text-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-medium text-gray-800 min-w-0 text-center px-2">
                {formatDateRange()}
              </span>
              <button
                onClick={() => navigateDate(1)}
                className="p-2 rounded-full border border-gray-300 bg-white hover:bg-emerald-100 hover:border-emerald-400 hover:text-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm text-gray-700 w-56"
                />
              </div>
            </div>
            {/* Meal Switch */}
            <FormControlLabel
              control={
                <Switch
                  checked={mealOnly}
                  onChange={() => setMealOnly((prev) => !prev)}
                  color="success"
                />
              }
              label={
                mealOnly ? (
                  <span className="flex items-center gap-1">
                    <Salad className="w-5 h-5 text-emerald-600" /> Meals
                  </span>
                ) : (
                  "All Items"
                )
              }
              className="mr-4"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-100 to-white rounded-2xl shadow-lg p-6 border-l-4 border-emerald-500 flex items-center gap-4 animate-fade-in-up">
            <div className="p-3 bg-emerald-200 rounded-xl flex items-center justify-center">
              <Eye className="w-7 h-7 text-emerald-700" />
            </div>
            <div>
              <p className="text-base text-gray-600 font-semibold">
                Total Images
              </p>
              <p className="text-3xl font-extrabold text-gray-800 animate-count">
                {stats.totalImages}
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-teal-100 to-white rounded-2xl shadow-lg p-6 border-l-4 border-teal-500 flex items-center gap-4 animate-fade-in-up delay-100">
            <div className="p-3 bg-teal-200 rounded-xl flex items-center justify-center">
              <Apple className="w-7 h-7 text-teal-700" />
            </div>
            <div>
              <p className="text-base text-gray-600 font-semibold">
                Food Items
              </p>
              <p className="text-3xl font-extrabold text-gray-800 animate-count">
                {stats.foodImages}
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-200 to-white rounded-2xl shadow-lg p-6 border-l-4 border-emerald-600 flex items-center gap-4 animate-fade-in-up delay-200">
            <div className="p-3 bg-emerald-300 rounded-xl flex items-center justify-center">
              <Flame className="w-7 h-7 text-emerald-800" />
            </div>
            <div>
              <p className="text-base text-gray-600 font-semibold">
                Total Calories
              </p>
              <p className="text-3xl font-extrabold text-gray-800 animate-count">
                {stats.totalCalories}
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-teal-200 to-white rounded-2xl shadow-lg p-6 border-l-4 border-teal-600 flex items-center gap-4 animate-fade-in-up delay-300">
            <div className="p-3 bg-teal-300 rounded-xl flex items-center justify-center">
              <Target className="w-7 h-7 text-teal-800" />
            </div>
            <div>
              <p className="text-base text-gray-600 font-semibold">
                Avg Calories
              </p>
              <p className="text-3xl font-extrabold text-gray-800 animate-count">
                {stats.avgCalories}
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your food images...</p>
          </div>
        )}

        {/* Images Grid */}
        <div className="grid gap-6">
          {filteredImages && filteredImages.length > 0
            ? filteredImages.map((img) => (
                <div
                  key={img.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-emerald-300/60 hover:scale-[1.01] transition-all duration-300 border border-emerald-100 group"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <img
                          src={img.file_url}
                          alt={img.original_filename}
                          className="w-full lg:w-48 h-auto max-h-48 object-cover rounded-xl shadow-md border-2 border-emerald-100 group-hover:border-emerald-300 transition-all duration-300"
                        />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <h3 className="text-xl font-semibold text-gray-800 break-words flex items-center gap-2">
                            <Upload className="w-5 h-5 text-emerald-600" />
                            {img.original_filename}
                          </h3>
                          <Popconfirm
                            title="Are you sure you want to delete this image?"
                            onConfirm={() => handleDelete(img.id)}
                            okText="Yes"
                            cancelText="No"
                            placement="topRight"
                          >
                            <button className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-100 transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </Popconfirm>
                        </div>
                        {img.analysis ? (
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                                  img.analysis.is_food
                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                    : "bg-gray-100 text-gray-800 border border-gray-200"
                                }`}
                              >
                                {img.analysis.is_food ? (
                                  <>
                                    <Apple className="w-4 h-4" />
                                    Food Item
                                  </>
                                ) : (
                                  <>
                                    <Filter className="w-4 h-4" />
                                    Not Food
                                  </>
                                )}
                              </span>
                              {img.analysis.is_food && (
                                <span className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-sm font-medium flex items-center gap-1">
                                  <Flame className="w-4 h-4" />
                                  {img.analysis.calories} calories
                                </span>
                              )}
                              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-sm font-medium flex items-center gap-1">
                                <Activity className="w-4 h-4" />
                                {(img.analysis.confidence * 100).toFixed(1)}%
                                confidence
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {img.analysis.food_items &&
                                img.analysis.food_items.length > 0 && (
                                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                                    <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                      <Utensils className="w-4 h-4 text-emerald-600" />
                                      Food Items
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {img.analysis.food_items.join(", ")}
                                    </p>
                                  </div>
                                )}
                              {img.analysis.description && (
                                <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-teal-600" />
                                    Description
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {img.analysis.description}
                                  </p>
                                </div>
                              )}
                              {img.analysis.nutrients && (
                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                                    Nutrients
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {formatNutrients(img.analysis.nutrients)}
                                  </p>
                                </div>
                              )}
                              {img.analysis.exercise_recommendations && (
                                <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-teal-600" />
                                    Exercise to Burn
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {formatExercise(
                                      img.analysis.exercise_recommendations
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>
                            {img.analysis && img.analysis.is_food && (
                              <div className="mt-4 flex justify-end">
                                <button
                                  onClick={() => handleToggleMeal(img)}
                                  disabled={mealUpdatingId === img.id}
                                  className={`px-5 py-2 rounded-full font-bold transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400 flex items-center gap-2
                            ${
                              img.analysis.is_meal
                                ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                                : "bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600"
                            }
                            ${
                              mealUpdatingId === img.id
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }
                          `}
                                >
                                  {mealUpdatingId === img.id ? (
                                    <span className="flex items-center gap-2">
                                      <Activity className="w-4 h-4 animate-spin" />
                                      Updating...
                                    </span>
                                  ) : img.analysis.is_meal ? (
                                    <span className="flex items-center gap-2">
                                      <Salad className="w-4 h-4" />
                                      Remove from Meal
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-2">
                                      <Salad className="w-4 h-4" />
                                      Add to Meal
                                    </span>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <p className="text-yellow-800 text-sm flex items-center gap-2">
                              <Filter className="w-4 h-4" />
                              Analysis not available
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            : !loading && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No images found
                  </h3>
                  <p className="text-gray-600">
                    Upload your first food image to get started with AI-powered calorie and 
                    nutrition analysis!
                  </p>
                </div>
              )}
        </div>
      </div>
    </div>
  );
}
