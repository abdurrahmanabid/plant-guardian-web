import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import App from "./App.jsx";
import "./i18n.js"; // Importing i18n configuration

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <React.Suspense fallback={<div>Loading...</div>}>
      <App />
    </React.Suspense>
  </StrictMode>
);
