// src/utils/getToken.js

export const getTokenFromStore = () => {
  try {
    // Try to get from Redux persist store
    const persistedState = localStorage.getItem("persist:root");
    if (persistedState) {
      const state = JSON.parse(persistedState);
      const auth = JSON.parse(state.auth || "{}");
      if (auth.token) return auth.token;
    }
    
    // Fallback: try to get directly from localStorage
    const directToken = localStorage.getItem("rssek_token");
    if (directToken) return directToken;
    
    // Another fallback: check for token in auth state
    const authState = localStorage.getItem("auth");
    if (authState) {
      const auth = JSON.parse(authState);
      if (auth.token) return auth.token;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting token from store:", error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists
 */
export const isAuthenticated = () => {
  return !!getTokenFromStore();
};