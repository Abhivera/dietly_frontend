import axiosInstance from "./axiosInstance";

export async function register(data) {
  const res = await axiosInstance.post("/auth/register", data);
  return res.data;
}

export async function login({ username, password }) {
  const params = new URLSearchParams();
  params.append("grant_type", "password");
  params.append("username", username);
  params.append("password", password);
  params.append("client_id", "string");
  params.append("client_secret", "string");

  const res = await axiosInstance.post("/auth/login", params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return res.data;
}

export async function passwordResetRequest(email) {
  const res = await axiosInstance.post("/auth/password-reset-request", {
    email,
  });
  return res.data;
}

export async function passwordResetConfirm(token, new_password) {
  const res = await axiosInstance.post("/auth/password-reset-confirm", {
    token,
    new_password,
  });
  return res.data;
}

export async function changePassword(token, current_password, new_password) {
  const res = await axiosInstance.post(
    "/auth/change-password",
    { current_password, new_password },
    {
      headers: {
        // Authorization header is handled by interceptor
      },
    }
  );
  return res.data;
}

export async function getCurrentUser() {
  const res = await axiosInstance.get("/auth/me");
  return res.data;
}

export async function verifyEmail(querytoken) {
  const res = await axiosInstance.get(`/auth/verify-email?token=${querytoken}`);
  return res.data;
}

export async function googleLogin() {
  const res = await axiosInstance.get("/auth/google/login", {
    withCredentials: true,
  });
  return res.data;
}

export async function googleCallback(queryString) {
  const res = await axiosInstance.get(
    `/auth/google/callback${queryString || ""}`,
    { withCredentials: true }
  );
  return res.data;
}
