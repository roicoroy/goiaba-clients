import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { MedusaProvider } from "medusa-react";
import { QueryClient } from "@tanstack/react-query";
import { RegionProvider } from './contexts/RegionContext';
import { CartProvider } from './contexts/CartContext';
import { CustomerProvider } from './contexts/CustomerContext';
import { API_CONFIG } from './utils/constants';

const queryClient = new QueryClient();

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <MedusaProvider
      queryClientProviderProps={{ client: queryClient }}
      baseUrl={API_CONFIG.BASE_URL}
      publishableApiKey={API_CONFIG.PUBLISHABLE_KEY}
    >
      <RegionProvider>
        <CartProvider>
          <CustomerProvider>
            <App />
          </CustomerProvider>
        </CartProvider>
      </RegionProvider>
    </MedusaProvider>
  </React.StrictMode>
);
