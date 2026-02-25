import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import { ClientSideProtection } from "./components/providers/ClientSideProtection";
import { BCPPage } from "./pages/BCPPage";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClientSideProtection>
      <ThemeProvider>
        <BCPPage />
      </ThemeProvider>
    </ClientSideProtection>
  </React.StrictMode>
);
