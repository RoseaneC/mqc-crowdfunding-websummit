"use client";

import { StrictMode } from "react";
import App from "./App";
import { WalletProvider } from "./providers/WalletProvider";
import { NotificationProvider } from "./providers/NotificationProvider";
import { DonationProvider } from "./providers/DonationProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export default function RootApp() {
  return (
    <StrictMode>
      <NotificationProvider>
        <QueryClientProvider client={queryClient}>
          <WalletProvider>
            <AuthProvider>
              <DonationProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </DonationProvider>
            </AuthProvider>
          </WalletProvider>
        </QueryClientProvider>
      </NotificationProvider>
    </StrictMode>
  );
}
