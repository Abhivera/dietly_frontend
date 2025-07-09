// src/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as authApi from "../api/auth";

const tokenFromStorage = localStorage.getItem("access_token");

export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    const res = await authApi.login({ username, password });
    if (res.access_token) {
      localStorage.setItem("access_token", res.access_token);
      return { token: res.access_token };
    }
    return rejectWithValue(res.detail || "Invalid credentials");
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    const res = await authApi.register(data);
    if (res.detail) return rejectWithValue(res.detail);
    return res;
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (token, { rejectWithValue }) => {
    try {
      const user = await authApi.getCurrentUser(token);
      return user;
    } catch (e) {
      console.log(e);
      return rejectWithValue("Failed to fetch user");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: tokenFromStorage || null,
    user: null,
    loading: false,
    error: null,
    registerSuccess: null,
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("access_token");
    },
    clearError(state) {
      state.error = null;
    },
    clearRegisterSuccess(state) {
      state.registerSuccess = null;
    },
    setToken(state, action) {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registerSuccess = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.registerSuccess =
          "Registration started. Please check your email to verify.";
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem("access_token");
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, clearRegisterSuccess, setToken } =
  authSlice.actions;
export default authSlice.reducer;
