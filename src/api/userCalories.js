// src/api/userCalories.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create a new calorie entry for the current user
export async function createUserCalories(token, data) {
  const res = await fetch(`${BASE_URL}/user-calories/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(responseData.detail || "Failed to create calorie entry");
  }

  return responseData;
}

// Get calorie entries for the current user with optional date filtering
export async function getUserCalories(token, params = {}) {
  const queryParams = new URLSearchParams();

  if (params.skip !== undefined) queryParams.append("skip", params.skip);
  if (params.limit !== undefined) queryParams.append("limit", params.limit);
  if (params.start_date) queryParams.append("start_date", params.start_date);
  if (params.end_date) queryParams.append("end_date", params.end_date);

  const queryString = queryParams.toString();
  const url = `${BASE_URL}/user-calories/${
    queryString ? `?${queryString}` : ""
  }`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// Get a specific calorie entry by ID
export async function getUserCaloriesById(token, caloriesId) {
  const res = await fetch(`${BASE_URL}/user-calories/${caloriesId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// Update a specific calorie entry
export async function updateUserCalories(token, caloriesId, data) {
  const res = await fetch(`${BASE_URL}/user-calories/${caloriesId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(responseData.detail || "Failed to update calorie entry");
  }

  return responseData;
}

// Delete a specific calorie entry
export async function deleteUserCalories(token, caloriesId) {
  const res = await fetch(`${BASE_URL}/user-calories/${caloriesId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(responseData.detail || "Failed to delete calorie entry");
  }

  return responseData;
}

// Get calorie entry for a specific date
export async function getUserCaloriesByDate(token, activityDate) {
  const res = await fetch(`${BASE_URL}/user-calories/date/${activityDate}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// Get summary of calories burned in a date range
export async function getUserCaloriesSummary(token, startDate, endDate) {
  const queryParams = new URLSearchParams();
  queryParams.append("start_date", startDate);
  queryParams.append("end_date", endDate);

  const res = await fetch(
    `${BASE_URL}/user-calories/summary/range?${queryParams}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.json();
}

// Get summary of calories burned in the last N days
export async function getRecentCaloriesSummary(token, days = 7) {
  const queryParams = new URLSearchParams();
  queryParams.append("days", days);

  const res = await fetch(
    `${BASE_URL}/user-calories/summary/recent?${queryParams}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.json();
}
