import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    sidebarOpen: true,
    darkMode: false,
};

const uiSlice = createSlice({
    name: "ui",
    initialState,

    reducers: {
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },

        closeSidebar: (state) => {
            state.sidebarOpen = false;
        },

        openSidebar: (state) => {
            state.sidebarOpen = true;
        },

        toggleTheme: (state) => {
            state.darkMode = !state.darkMode;
        },

        enableDarkMode: (state) => {
            state.darkMode = true;
        },

        disableDarkMode: (state) => {
            state.darkMode = false;
        },
    },
});

export const {
    toggleSidebar,
    closeSidebar,
    openSidebar,
    toggleTheme,
    enableDarkMode,
    disableDarkMode,
} = uiSlice.actions;

export default uiSlice.reducer;