import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      onError: (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        console.error('Query Error:', errorMessage);
      }
    },
    mutations: {
      onError: (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        console.error('Mutation Error:', errorMessage);
      }
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);