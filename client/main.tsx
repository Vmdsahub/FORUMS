import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./global.css";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            marginRight: '8px',
            marginBottom: '8px'
          }
        }}
      />
    </AuthProvider>
  </React.StrictMode>,
);
