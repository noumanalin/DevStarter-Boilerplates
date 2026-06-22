import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../api/axios";

/* ─────────────────────────────────────────────
   LOGIN
───────────────────────────────────────────── */
export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (formData, { rejectWithValue }) => {
        try {
            const { data } = await api.post("/auth/login", formData);

            const token = data?.data?.token ?? null;
            const user = data?.data?.user ?? null;

            if (token) {
                localStorage.setItem("nexora_token", token);
                localStorage.setItem("nexora_user", JSON.stringify(user));
                localStorage.setItem("login_time", Date.now().toString());
            }

            return { user, token };
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message ?? "Login failed"
            );
        }
    }
);

/* ─────────────────────────────────────────────
   LOGOUT
───────────────────────────────────────────── */
export const logoutUser = createAsyncThunk(
    "auth/logoutUser",
    async (_, { rejectWithValue }) => {
        try {
            await api.post("/auth/logout");
            localStorage.removeItem("nexora_token");
            localStorage.removeItem("nexora_user");
            return true;
        } catch (error) {
            localStorage.removeItem("nexora_token");
            localStorage.removeItem("nexora_user");
            return rejectWithValue(
                error?.response?.data?.message ?? "Logout failed"
            );
        }
    }
);

/* ─────────────────────────────────────────────
   CHECK AUTH - Initialize app auth state
───────────────────────────────────────────── */
export const checkAuth = createAsyncThunk(
    "auth/checkAuth",
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem("nexora_token");
        
        if (!token) {
            return rejectWithValue("No token found");
        }

        // Optional: Verify token with backend
        try {
            const { data } = await api.get("/auth/me", {
                headers: { Authorization: `Bearer ${token}` }
            });
            return {
                user: data?.data?.user,
                token: token,
                isAuthenticated: true
            };
        } catch (error) {
            // If verification fails, still return basic auth from localStorage
            const userStr = localStorage.getItem("nexora_user");
            const user = userStr ? JSON.parse(userStr) : null;
            
            if (user) {
                return { user, token, isAuthenticated: true };
            }
            
            localStorage.removeItem("nexora_token");
            localStorage.removeItem("nexora_user");
            return rejectWithValue("Auth failed");
        }
    }
);

const initialState = {
    user: null,
    token: localStorage.getItem("nexora_token") || null,
    isAuthenticated: false,
    isLoading: true, // Start as true to show loading spinner
    isError: false,
    errorMessage: "",
};

const authSlice = createSlice({
    name: "auth",
    initialState,

    reducers: {
        logout: (state) => {
            localStorage.removeItem("nexora_token");
            localStorage.removeItem("nexora_user");
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isLoading = false;
        },
    },

    extraReducers: (builder) => {
        builder
            /* CHECK AUTH */
            .addCase(checkAuth.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action?.payload?.user ?? null;
                state.token = action?.payload?.token ?? null;
                state.isAuthenticated = true;
                state.isError = false;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.isLoading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.isError = false;
            })

            /* LOGIN */
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = "";
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action?.payload?.user ?? null;
                state.token = action?.payload?.token ?? null;
                state.isAuthenticated = Boolean(action?.payload?.token);
                state.isError = false;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isAuthenticated = false;
                state.errorMessage = action?.payload ?? "Something went wrong";
            })

            /* LOGOUT */
            .addCase(logoutUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.isLoading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            })
            .addCase(logoutUser.rejected, (state) => {
                state.isLoading = false;
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;