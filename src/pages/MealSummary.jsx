import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  Activity,
  Utensils,
  Flame,
  Footprints,
  Target,
  Trophy,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import * as mealApi from "../api/meal";
import * as userCaloriesApi from "../api/userCalories";
import { useSelector } from "react-redux";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";

export default function MealSummary() {
  const token = useSelector((state) => state.auth.token);

  const [summary, setSummary] = useState({
    total_meals: 0,
    total_calories: 0,
    total_exercise: {
      steps: 0,
      walking_km: 0,
    },
    meals: [
      { analysis: { nutrients: { protein: 0, carbs: 0, fat: 0 } } },
      { analysis: { nutrients: { protein: 0, carbs: 0, fat: 0 } } },
      { analysis: { nutrients: { protein: 0, carbs: 0, fat: 0 } } },
    ],
  });
  const [userCalories, setUserCalories] = useState([]);
  const [viewMode, setViewMode] = useState("today");
  const [selectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (token) {
      // Fetch meal summary
      mealApi.getMealSummary({ viewMode, selectedDate }).then(setSummary);

      // Fetch user calories (burned calories from activities)
      const fetchUserCalories = async () => {
        try {
          const params = {};
          if (viewMode === "today") {
            params.start_date = selectedDate;
            params.end_date = selectedDate;
          } else if (viewMode === "weekly") {
            const endDate = new Date(selectedDate);
            const startDate = new Date(selectedDate);
            startDate.setDate(startDate.getDate() - 7);
            params.start_date = startDate.toISOString().split("T")[0];
            params.end_date = endDate.toISOString().split("T")[0];
          } else if (viewMode === "monthly") {
            const endDate = new Date(selectedDate);
            const startDate = new Date(selectedDate);
            startDate.setMonth(startDate.getMonth() - 1);
            params.start_date = startDate.toISOString().split("T")[0];
            params.end_date = endDate.toISOString().split("T")[0];
          }
          const calories = await userCaloriesApi.getUserCalories(params);
          setUserCalories(calories);
        } catch (error) {
          console.error(error);
        }
      };
      fetchUserCalories();
    }
  }, [token, viewMode, selectedDate]);

  // Calculate total calories burned from activities
  const totalCaloriesBurned = userCalories.reduce((total, entry) => {
    return (
      total +
      entry.calories_burned.reduce((dayTotal, activity) => {
        return dayTotal + parseInt(activity.calories) || 0;
      }, 0)
    );
  }, 0);

  // Calculate net calories (consumed - burned)
  const netCalories = summary.total_calories - totalCaloriesBurned;

  // Mock data for charts

  const nutritionData = summary?.meals?.reduce(
    (acc, meal) => {
      acc.protein += meal.analysis?.nutrients?.protein || 0;
      acc.carbs += meal.analysis?.nutrients?.carbs || 0;
      acc.fat += meal.analysis?.nutrients?.fat || 0;
      return acc;
    },
    { protein: 0, carbs: 0, fat: 0 }
  );

  const pieData = nutritionData
    ? [
        { name: "Protein", value: nutritionData.protein, fill: "#10b981" },
        { name: "Carbs", value: nutritionData.carbs, fill: "#14b8a6" },
        { name: "Fat", value: nutritionData.fat, fill: "#0d9488" },
      ]
    : [];

  if (!summary) {
    return (
      <div className="max-w-7xl mx-auto mt-10 p-6">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 shadow-lg">
          <div className="animate-pulse">
            <div className="h-8 bg-emerald-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-emerald-100 rounded w-3/4"></div>
              <div className="h-4 bg-emerald-100 rounded w-1/2"></div>
              <div className="h-4 bg-emerald-100 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-emerald-50 p-6 space-y-8">
      {/* Header */}
      <header className="mb-6 sm:mb-8 text-center">
        <div className="flex items-center justify-center gap-2">
          <AssessmentOutlinedIcon style={{ fontSize: 40, color: "#006045" }} />
          <h1 className="text-3xl sm:text-4xl font-bold bg-emerald-800 bg-clip-text text-transparent mb-2">
            Meal Summary
          </h1>
        </div>
        <p className="text-emerald-600 text-base sm:text-lg">
          View your meal and nutrition summary at a glance
        </p>
      </header>
      {/* View Mode Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 bg-white rounded-xl p-1 border border-emerald-100">
          {["today", "weekly", "monthly"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base ${
                viewMode === mode
                  ? "bg-emerald-500 text-white transform scale-105"
                  : "text-gray-600 hover:bg-emerald-50"
              }`}
            >
              {mode === "today" && <Clock className="w-3 h-3 sm:w-4 sm:h-4" />}
              {mode === "weekly" && (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              {mode === "monthly" && (
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span className="whitespace-nowrap">
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </span>
            </button>
          ))}
        </div>

        {viewMode === "today" && (
          <div className="flex items-center justify-center sm:justify-start bg-white rounded-xl border border-emerald-100 px-4 py-3">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mr-2 sm:mr-3" />
            <span className="text-gray-700 font-medium text-sm sm:text-base">
              {new Date(selectedDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white border border-emerald-200 rounded-xl p-6 text-emerald-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-400 text-sm font-medium">
                Total Meals
              </p>
              <p className="text-3xl font-bold text-emerald-700">
                {summary.total_meals}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
              <Utensils className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-teal-200 rounded-xl p-6 text-teal-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-400 text-sm font-medium">
                Calories Consumed
              </p>
              <p className="text-3xl font-bold text-teal-700">
                {summary.total_calories}
              </p>
            </div>
            <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
              <Flame className="w-6 h-6 text-teal-500" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-orange-200 rounded-xl p-6 text-orange-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-sm font-medium">
                Calories Burned
              </p>
              <p className="text-3xl font-bold text-orange-700">
                {totalCaloriesBurned}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-purple-200 rounded-xl p-6 text-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">
                Net Calories
              </p>
              <p
                className={`text-3xl font-bold ${
                  netCalories >= 0 ? "text-purple-700" : "text-red-600"
                }`}
              >
                {netCalories}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Nutrition Breakdown Pie Chart */}
        <div className="bg-white rounded-2xl p-6 border border-emerald-100">
          <div className="flex items-center space-x-2 mb-4">
            <PieChartIcon className="w-6 h-6 text-emerald-500" />
            <h3 className="text-xl font-bold text-gray-800">
              Nutrition Breakdown
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}g`, "Amount"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Protein</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Carbs</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
              <span className="text-sm text-gray-600">Fat</span>
            </div>
          </div>
        </div>

        {/* Calories vs Exercise */}
        <div className="bg-white rounded-2xl p-6 border border-emerald-100">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-6 h-6 text-emerald-500" />
            <h3 className="text-xl font-bold text-gray-800">
              Calories Consumed vs Burned
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: "Today",
                    consumed: summary.total_calories,
                    burned: totalCaloriesBurned,
                    net: netCalories,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="consumed"
                  fill="#10b981"
                  name="Consumed"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="burned"
                  fill="#f97316"
                  name="Burned"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hide weekly and monthly charts if data is not available */}
      </div>

      {/* Activity Details */}
      {userCalories.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-emerald-100">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-6 h-6 text-emerald-500" />
            <h3 className="text-xl font-bold text-gray-800">
              Activity Details
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userCalories.map((entry) => (
              <div
                key={entry.id}
                className="bg-emerald-50 rounded-lg p-4 border border-emerald-200"
              >
                <div className="text-sm text-emerald-600 font-medium mb-2">
                  {new Date(entry.activity_date).toLocaleDateString()}
                </div>
                <div className="space-y-2">
                  {entry.calories_burned.map((activity, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-700 capitalize">
                        {activity.activity_name}
                      </span>
                      <span className="text-sm font-semibold text-emerald-700">
                        {activity.calories} cal
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Summary Cards */}
      {viewMode === "weekly" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-emerald-100">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-semibold text-gray-800">
                Weekly Averages
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Calories/Day</span>
                <span className="font-semibold text-emerald-600">
                  {Math.round(
                    summary.meals.reduce(
                      (acc, meal) => acc + (meal.analysis?.calories || 0),
                      0
                    ) / summary.meals.length
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Meals/Day</span>
                <span className="font-semibold text-teal-600">
                  {summary.meals.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Meals</span>
                <span className="font-semibold text-emerald-700">
                  {summary.meals.length}
                </span>
              </div>
            </div>
          </div>

          {/* <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-100">
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-semibold text-gray-800">Best Day</h3>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <p className="text-2xl font-bold text-emerald-600">Saturday</p>
              <p className="text-gray-600">Most balanced nutrition</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-100">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-semibold text-gray-800">
                Goals Progress
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Calorie Goal</span>
                  <span className="text-sm text-emerald-600 font-medium">
                    75%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Protein Goal</span>
                  <span className="text-sm text-emerald-600 font-medium">
                    85%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: "85%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
}
