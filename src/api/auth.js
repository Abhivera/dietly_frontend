// src/api/auth.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL

export async function register(data) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function login({ username, password }) {
  const params = new URLSearchParams();
  params.append("grant_type", "password");
  params.append("username", username);
  params.append("password", password);
  params.append("client_id", "string");
  params.append("client_secret", "string");

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  return res.json();
}

export async function passwordResetRequest(email) {
  const res = await fetch(`${BASE_URL}/auth/password-reset-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function passwordResetConfirm(token, new_password) {
  const res = await fetch(`${BASE_URL}/auth/password-reset-confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password }),
  });
  return res.json();
}

export async function changePassword(token, current_password, new_password) {
  const res = await fetch(`${BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ current_password, new_password }),
  });
  return res.json();
}

export async function getCurrentUser(token) {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function verifyEmail(querytoken) {
  const res = await fetch(`${BASE_URL}/auth/verify-email?token=${querytoken}`);
  return res.json();
}
