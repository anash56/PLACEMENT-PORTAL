import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import "./landing.css";
import "./workspace-polish.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3200,
          style: { borderRadius: "12px", background: "#102747", color: "#fff", boxShadow: "0 12px 30px rgb(3 20 46 / 22%)" },
        }}
      />
    </AuthProvider>
  </StrictMode>,
);

