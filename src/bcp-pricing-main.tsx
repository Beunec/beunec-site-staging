import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import { ClientSideProtection } from "./components/providers/ClientSideProtection";
import { BCPPricingPage } from "./pages/BCPPricingPage";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClientSideProtection>
      <ThemeProvider>
        <BCPPricingPage />
      </ThemeProvider>
    </ClientSideProtection>
  </React.StrictMode>
);
