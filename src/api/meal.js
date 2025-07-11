// src/api/meal.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
