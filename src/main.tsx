import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Toaster } from "sonner";
import { registerSW } from "virtual:pwa-register";
import { TRPCProvider } from "@/providers/trpc";
import { CartProvider } from "@/context/CartContext";
import "./fonts.css";
import "./index.css";
import "./App.css";
import App from "./App";

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <CartProvider>
          <App />
          <Toaster position="bottom-right" richColors closeButton />
        </CartProvider>
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
);
