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
        offset={16}
        toastOptions={{
          style: {
            maxWidth: '400px',
            width: 'fit-content'
          }
        }}
      />
    </AuthProvider>
  </React.StrictMode>,
);
