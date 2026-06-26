import "./index.css";
import App from "./App.jsx";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store/index.js";
import { HelmetProvider } from "react-helmet-async";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

/**
 * React Query config
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1 hour (fresh data window)
      gcTime: 1000 * 60 * 60 * 24, // 24 hours in memory cache
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
    },
  },
});

/**
 * Persist React Query cache to localStorage
 */
const asyncStoragePersister = createAsyncStoragePersister({
  storage: window.localStorage,
  key: "tanstack-query-cache",
  throttleTime: 1000,
});

persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
});

createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    {/* 1. Redux store */}
    <Provider store={store}>
      {/* 2. Wait for persisted redux state */}
      <PersistGate loading={null} persistor={persistor}>
        {/* 3. Router */}
        <BrowserRouter>
          {/* 4. SEO */}
          <HelmetProvider>
            {/* 5. App */}
            <App />
          </HelmetProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </QueryClientProvider>
);