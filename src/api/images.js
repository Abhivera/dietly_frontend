import axiosInstance from "./axiosInstance";
import { getApiUrl } from "@/config/api";

export async function uploadAndAnalyzeImage(file, description) {
  const formData = new FormData();
  formData.append("file", file);
  if (description) {
    formData.append("description", description);
  }
  const res = await axiosInstance.post("/images/upload-and-analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const data = res.data;
  if (!res.status || res.status >= 400) {
    throw new Error(data.message || "Upload failed");
  }
  return data;
}

export async function getImage(image_id) {
  const res = await axiosInstance.get(`/images/${image_id}`);
  return res.data;
}

export async function deleteImage(image_id) {
  const res = await axiosInstance.delete(`/images/${image_id}`);
  return res.data;
}

export async function getAllImages(params = {}) {
  const res = await axiosInstance.get("/images/", { params });
  return res.data;
}

export async function getFreshUrl(image_id, expiration = 3600) {
  const res = await axiosInstance.get(`/images/${image_id}/fresh-url`, {
    params: { expiration },
  });
  return res.data;
}

export async function updateImageIsMeal(image_id, is_meal) {
  const res = await axiosInstance.patch(`/images/is-meal/${image_id}`, {
    is_meal,
  });
  return res.data;
}

export async function publicAnalyzeFood(file, description) {
  const formData = new FormData();
  formData.append("file", file);
  if (description) {
    formData.append("description", description);
  }
  const res = await fetch(getApiUrl("/public/analyze-food"), {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Public food analysis failed");
  }
  return data;
}
