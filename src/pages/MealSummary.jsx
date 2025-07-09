import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as mealApi from "../api/meal";

export default function MealSummary() {
  const token = useSelector((state) => state.auth.token);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (token) {
      mealApi.getMealSummary(token).then(setSummary);
    }
  }, [token]);

  if (!summary) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6">
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
    <div className="max-w-4xl mx-auto mt-10 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
          Daily Health Summary
        </h1>
        <p className="text-gray-600">Track your nutrition and exercise journey</p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Total Meals</p>
              <p className="text-3xl font-bold">{summary.total_meals}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm font-medium">Total Calories</p>
              <p className="text-3xl font-bold">{summary.total_calories}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Steps Taken</p>
              <p className="text-3xl font-bold">{summary.total_exercise?.steps?.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm font-medium">Distance (km)</p>
              <p className="text-3xl font-bold">{summary.total_exercise?.walking_km}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Meals Section */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          Your Meals Today
        </h2>

        {summary.meals && summary.meals.length > 0 ? (
          <div className="space-y-6">
            {summary.meals.map((meal, index) => (
              <div key={meal.id || index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="md:flex">
                  {/* Meal Image */}
                  <div className="md:w-1/3">
                    <img
                      src={meal.file_url}
                      alt={meal.description || "Meal"}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  
                  {/* Meal Details */}
                  <div className="md:w-2/3 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">{meal.original_filename?.replace('.jpg', '').replace('.jpeg', '').replace('.png', '') || 'Meal'}</h3>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          {Math.round(meal.analysis?.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{meal.analysis?.description}</p>
                    
                    {/* Food Items */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {meal.analysis?.food_items?.map((item, i) => (
                          <span key={i} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Nutrition Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                        <p className="text-2xl font-bold text-emerald-600">{meal.analysis?.calories}</p>
                        <p className="text-sm text-gray-600">Calories</p>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{meal.analysis?.nutrients?.protein}g</p>
                        <p className="text-sm text-gray-600">Protein</p>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{meal.analysis?.nutrients?.carbs}g</p>
                        <p className="text-sm text-gray-600">Carbs</p>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                        <p className="text-2xl font-bold text-emerald-600">{meal.analysis?.nutrients?.fat}g</p>
                        <p className="text-sm text-gray-600">Fat</p>
                      </div>
                    </div>
                    
                    {/* Exercise Recommendations */}
                    {meal.analysis?.exercise_recommendations && (
                      <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg p-4">
                        <h4 className="font-semibold text-emerald-800 mb-2">💪 Exercise Recommendations</h4>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-emerald-700">
                            🚶 {meal.analysis.exercise_recommendations.steps?.toLocaleString()} steps
                          </span>
                          <span className="text-emerald-700">
                            🏃 {meal.analysis.exercise_recommendations.walking_km} km walk
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Timestamp */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Added {new Date(meal.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No meals found for today</p>
            <p className="text-gray-400 text-sm mt-2">Start by adding your first meal!</p>
          </div>
        )}
      </div>
    </div>
  );
}