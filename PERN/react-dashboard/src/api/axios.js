// react-dashboard/src/api/axios.js
import axios from "axios";
import { store } from "../store/index";
import { selectAccessToken, selectRefreshToken, setTokens, clearCredentials } from "../store/user";

const amIWorkingLocal = false;

const api = axios.create({
  baseURL: amIWorkingLocal ? "http://localhost:4343/api/" : "https://myportfoliodashboard-ebon.vercel.app/api/",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = selectAccessToken(store.getState());
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ─── AUTO REFRESH ON 401 ───────────────────────────────────
   If several requests 401
   at the same moment, only the first one hits /auth/refresh-token —
   the rest await that same promise, then retry with the new token.

   🤔 Who Website Auto Login (user point of view) ?
   User logs in once → tokens get saved into localStorage (via Redux Persist).
  User closes the browser tab, comes back tomorrow → Redux Persist reads those tokens back out of localStorage on app load → isAuthenticated: true instantly, no login form shown.
  They never had to type email/password again. That is auto-login, from the user's point of view.
──────────────────────────────────────────────────────────── */
const REFRESH_URL = "auth/refresh-token";
let refreshPromise = null;

const isAuthRoute = (url = "") => url.includes(REFRESH_URL) || url.includes("auth/login");

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!response || response.status !== 401 || config._retried || isAuthRoute(config.url)) {
      return Promise.reject(error);
    }

    const refreshToken = selectRefreshToken(store.getState());
    if (!refreshToken) {
      store.dispatch(clearCredentials());
      return Promise.reject(error);
    }

    config._retried = true;

    try {
      refreshPromise ??= api.post(REFRESH_URL, { refreshToken }).finally(() => {
        refreshPromise = null;
      });

      const { data } = await refreshPromise;
      const { accessToken, refreshToken: newRefreshToken } = data?.data ?? {};

      store.dispatch(setTokens({ accessToken, refreshToken: newRefreshToken }));
      return api(config);
    } catch (refreshError) {
      store.dispatch(clearCredentials());
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  }
);

export default api;