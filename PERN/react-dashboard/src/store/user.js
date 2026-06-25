/**
 * src/store/user.js
 * Manages authentication state: user, accessToken, refreshToken, isAuthenticated.
 * Persisted via Redux Persist — no profile API call needed on page refresh.
 */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,           // { id, name, email, role, avatar_url }
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Called after successful login — stores everything in one shot
    setCredentials: (state, { payload }) => {
      state.user = payload.user;
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken ?? state.refreshToken;
      state.isAuthenticated = true;
    },
    // Updates tokens only — never touches `user`. Used by the axios
    // refresh interceptor and the manual "Refresh session" button.
    setTokens: (state, { payload }) => {
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken ?? state.refreshToken;
    },
    
    // Called after profile update — merges only changed fields
    updateUser: (state, { payload }) => {
      if (state.user) {
        state.user = { ...state.user, ...payload };
      }
    },
    // Called on logout / session clear
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, setTokens, updateUser, clearCredentials } = userSlice.actions;

// Selectors
export const selectUser            = (state) => state.user.user;
export const selectAccessToken     = (state) => state.user.accessToken;
export const selectRefreshToken    = (state) => state.user.refreshToken;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectUserRole        = (state) => state.user.user?.role;


export default userSlice.reducer;