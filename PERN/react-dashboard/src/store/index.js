import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
    persistStore,
    persistReducer,
} from "redux-persist";

import storage from "redux-persist/es/storage";

import authReducer from "./authSlice";
import uiReducer from "./uiSlice";

const persistConfig = {
    key: "root",
    storage,
    whitelist: ["auth"],
};

const rootReducer = combineReducers({
    auth: authReducer,
    ui: uiReducer,
});

const persistedReducer = persistReducer(
    persistConfig,
    rootReducer
);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export const persistor = persistStore(store);