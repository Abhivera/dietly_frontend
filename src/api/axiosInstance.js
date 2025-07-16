import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Attach token if present
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Log errors and redirect on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // global error handling here
    if (error.response && error.response.status === 401) {
      // Remove token and redirect to signup
      localStorage.removeItem("access_token");
      window.location.replace("/register");
    }
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
