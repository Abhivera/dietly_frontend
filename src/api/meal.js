// src/api/meal.js
const BASE_URL = "https://dietly-backend.onrender.com/api/v1";

export async function getMealSummary(token, params = {}) {
  const url = new URL(`${BASE_URL}/meal/`);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
