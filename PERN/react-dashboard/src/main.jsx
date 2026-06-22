import './index.css'
import App from './App.jsx'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor, store } from './store/index.js'
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, 
      gcTime: 1000 * 60 * 60 * 24, // 24 hours cache in memory
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false, // No refetch when component remounts
      refetchInterval: false, // No background polling
      refetchIntervalInBackground: false,
    },
  },
});

// Persist cache to localStorage
const asyncStoragePersister = createAsyncStoragePersister({
  storage: localStorage,
  key: 'tanstack-query-cache',
  throttleTime: 1000, // Don't save more than once per second
});

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store} >
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <HelmetProvider>
            <App />
          </HelmetProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider >
  </QueryClientProvider>,
)
