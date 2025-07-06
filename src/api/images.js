// src/api/images.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function uploadAndAnalyzeImage(token, file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/images/upload-and-analyze`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  return res.json();
}

export async function getImage(token, image_id) {
  const res = await fetch(`${BASE_URL}/images/${image_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function deleteImage(token, image_id) {
  const res = await fetch(`${BASE_URL}/images/${image_id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getAllImages(token, params = {}) {
  const url = new URL(`${BASE_URL}/images/`);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getFreshUrl(token, image_id, expiration = 3600) {
  const res = await fetch(
    `${BASE_URL}/images/${image_id}/fresh-url?expiration=${expiration}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.json();
}
