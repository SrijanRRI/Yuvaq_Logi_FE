import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: null,
  role: null,
  isAuthenticated: false,
  isAuthChecking: true,

  // subscription state
  subscription: {
    isActive: false,
    subscription: { status: "none" },
  },
  subscriptionLoaded: false,
  isSubscriptionChecking: false,
};

const userSlice = createSlice({
  name: "User",
  initialState,
  reducers: {
    login: (state, action) => {
      state.userInfo = action.payload.user;
      state.role = action.payload.role;
      state.isAuthenticated = true;
      state.isAuthChecking = false;
    },

    logout: (state) => {
      state.userInfo = null;
      state.role = null;
      state.isAuthenticated = false;
      state.isAuthChecking = false;

      state.subscription = { isActive: false, subscription: { status: "none" } };
      state.subscriptionLoaded = false;
      state.isSubscriptionChecking = false;
    },

    setAuthChecking: (state, action) => {
      state.isAuthChecking = action.payload;
    },

    setSubscriptionChecking: (state, action) => {
      state.isSubscriptionChecking = action.payload;
    },

    setSubscription: (state, action) => {
      state.subscription = {
        isActive: !!action.payload.isActive,
        subscription: action.payload.subscription || { status: "none" },
      };
      state.subscriptionLoaded = true;
      state.isSubscriptionChecking = false;
    },

    clearSubscription: (state) => {
      state.subscription = { isActive: false, subscription: { status: "none" } };
      state.subscriptionLoaded = false;
      state.isSubscriptionChecking = false;
    },
  },
});

export const {
  login,
  logout,
  setAuthChecking,
  setSubscription,
  setSubscriptionChecking,
  clearSubscription,
} = userSlice.actions;

export default userSlice.reducer;