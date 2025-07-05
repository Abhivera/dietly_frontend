// src/pages/MealSummary.jsx
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

  if (!summary) return <div className="max-w-md mx-auto mt-10">Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Meal & Exercise Summary</h2>
      <div className="mb-2">
        Total Meals: <span className="font-bold">{summary.total_meals}</span>
      </div>
      <div className="mb-2">
        Total Calories:{" "}
        <span className="font-bold">{summary.total_calories}</span>
      </div>
      <div className="mb-2">
        Total Steps:{" "}
        <span className="font-bold">{summary.total_exercise?.steps}</span>
      </div>
      <div className="mb-2">
        Total Walking (km):{" "}
        <span className="font-bold">{summary.total_exercise?.walking_km}</span>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Meals</h3>
        {summary.meals && summary.meals.length > 0 ? (
          <ul className="list-disc pl-5">
            {summary.meals.map((meal, i) => (
              <li key={i}>{JSON.stringify(meal)}</li>
            ))}
          </ul>
        ) : (
          <div>No meals found.</div>
        )}
      </div>
    </div>
  );
}
