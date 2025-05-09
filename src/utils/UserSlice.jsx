// src/redux/UserSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  role: null,
  isAuthenticated: false,
  isAuthChecking: true, // added
};

export const UserSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.isAuthChecking = false;
      state.role = action.payload.role;
      state.userInfo = action.payload.user;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.isAuthChecking = false;
      state.role = null;
      state.userInfo = null;
    },
    setAuthChecking: (state, action) => {
      state.isAuthChecking = action.payload;
    },
  },
});

export const { login, logout, setAuthChecking  } = UserSlice.actions;
export default UserSlice.reducer;
