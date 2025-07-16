import axiosInstance from "./axiosInstance";

export async function getUser() {
  const res = await axiosInstance.get("/users/me");
  return res.data;
}

export async function updateUser(data) {
  const res = await axiosInstance.put("/users/me", data);
  return res.data;
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axiosInstance.post("/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
