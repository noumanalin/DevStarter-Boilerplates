/**
 * src/utils/getToken.js
 * Read access token from persisted Redux state without using a hook.
 * Use ONLY outside React components (e.g. API helper files).
 * Inside React, use: useSelector(selectAccessToken)
 */
export const getTokenFromStore = () => {
  try {
    const root = JSON.parse(localStorage.getItem("persist:root") || "{}");
    const user = JSON.parse(root.user || "{}");
    return user.accessToken || null;
  } catch {
    return null;
  }
};

export const getUserFromStore = () => {
  try {
    const root = JSON.parse(localStorage.getItem("persist:root") || "{}");
    const user = JSON.parse(root.user || "{}");
    return user.user || null;
  } catch {
    return null;
  }
};