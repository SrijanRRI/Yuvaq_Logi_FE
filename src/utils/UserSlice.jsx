// src/redux/UserSlice.js
import { createSlice } from "@reduxjs/toolkit";

export const UserSlice = createSlice({
  name: 'user',
  initialState: {
    isAuthenticated: false,
    token: null,
    role: null,
    userInfo: null,
  },
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.userInfo = action.payload.user;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.role = null;
      state.userInfo = null;
    },
  },
});

export const { login, logout } = UserSlice.actions;
export default UserSlice.reducer;
