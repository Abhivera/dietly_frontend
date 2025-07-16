import axiosInstance from "./axiosInstance";

export async function getMealSummary(params = {}) {
  const res = await axiosInstance.get("/meal/", { params });
  return res.data;
}
