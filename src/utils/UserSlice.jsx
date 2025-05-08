// src/utils/UserSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  role: null,
  isAuthenticated: false,
  isAuthChecking: true, // added
};

const userSlice = createSlice({
  name: "User",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.isAuthenticated = true;
      state.isAuthChecking = false;
    },
    logout: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.isAuthChecking = false;
    },
    setAuthChecking: (state, action) => {
      state.isAuthChecking = action.payload;
    },
  },
});

export const { login, logout, setAuthChecking } = userSlice.actions;
export default userSlice.reducer;
