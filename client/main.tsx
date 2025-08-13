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
            width: 'fit-content',
            maxWidth: '400px',
            minWidth: '200px',
            padding: '12px 16px'
          }
        }}
      />
    </AuthProvider>
  </React.StrictMode>,
);
