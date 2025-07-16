import axiosInstance from "./axiosInstance";

// Create a new calorie entry for the current user
export async function createUserCalories(data) {
  const res = await axiosInstance.post("/user-calories/", data);
  const responseData = res.data;
  return responseData;
}

// Get calorie entries for the current user with optional date filtering
export async function getUserCalories(params = {}) {
  const res = await axiosInstance.get("/user-calories/", { params });
  return res.data;
}

// Get a specific calorie entry by ID
export async function getUserCaloriesById(caloriesId) {
  const res = await axiosInstance.get(`/user-calories/${caloriesId}`);
  return res.data;
}

// Update a specific calorie entry
export async function updateUserCalories(caloriesId, data) {
  const res = await axiosInstance.put(`/user-calories/${caloriesId}`, data);
  const responseData = res.data;
  return responseData;
}

// Delete a specific calorie entry
export async function deleteUserCalories(caloriesId) {
  const res = await axiosInstance.delete(`/user-calories/${caloriesId}`);
  const responseData = res.data;
  return responseData;
}

// Get calorie entry for a specific date
export async function getUserCaloriesByDate(activityDate) {
  const res = await axiosInstance.get(`/user-calories/date/${activityDate}`);
  return res.data;
}

// Get summary of calories burned in a date range
export async function getUserCaloriesSummary(startDate, endDate) {
  const res = await axiosInstance.get(`/user-calories/summary/range`, {
    params: { start_date: startDate, end_date: endDate },
  });
  return res.data;
}

// Get summary of calories burned in the last N days
export async function getRecentCaloriesSummary(days = 7) {
  const res = await axiosInstance.get(`/user-calories/summary/recent`, {
    params: { days },
  });
  return res.data;
}
