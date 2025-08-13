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
        expand={false}
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
          style: {
            width: 'fit-content !important',
            maxWidth: '400px !important',
            minWidth: '200px !important',
            padding: '12px 16px !important',
            margin: '0 !important',
            marginRight: '16px !important',
            marginBottom: '16px !important'
          },
          className: 'custom-toast'
        }}
      />
    </AuthProvider>
  </React.StrictMode>,
);
