import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import "./landing.css";
import "./workspace-polish.css";
// Load the shared site-wide styles once, in a deliberate order, before rendering the app.
import "./components/ui/portal-consistency.css";
import "./components/ui/contrast-safety.css";
import "./workflow-contrast.css";
import "./design-system-overrides.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={10}
        containerStyle={{ top: 16, right: 16 }}
        toastOptions={{
          duration: 3200,
          style: {
            borderRadius: "14px",
            background: "#ffffff",
            color: "#102747",
            border: "1px solid #dbe6f4",
            boxShadow: "0 12px 30px rgb(3 20 46 / 14%)",
            padding: "12px 14px",
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1.45,
            maxWidth: "min(420px, calc(100vw - 32px))",
          },
          success: {
            duration: 3200,
            style: {
              borderRadius: "14px",
              background: "#ffffff",
              color: "#102747",
              border: "1px solid #dbe6f4",
              borderLeft: "4px solid #16a34a",
              boxShadow: "0 12px 30px rgb(3 20 46 / 14%)",
              padding: "12px 14px",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: 1.45,
              maxWidth: "min(420px, calc(100vw - 32px))",
            },
            iconTheme: { primary: "#15803d", secondary: "#dcfce7" },
          },
          error: {
            duration: 2000,
            style: {
              borderRadius: "14px",
              background: "#ffffff",
              color: "#102747",
              border: "1px solid #dbe6f4",
              borderLeft: "4px solid #dc2626",
              boxShadow: "0 12px 30px rgb(3 20 46 / 14%)",
              padding: "12px 14px",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: 1.45,
              maxWidth: "min(420px, calc(100vw - 32px))",
            },
            iconTheme: { primary: "#b91c1c", secondary: "#fee2e2" },
          },
          loading: {
            style: {
              borderRadius: "14px",
              background: "#ffffff",
              color: "#102747",
              border: "1px solid #dbe6f4",
              borderLeft: "4px solid #2563eb",
              boxShadow: "0 12px 30px rgb(3 20 46 / 14%)",
              padding: "12px 14px",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: 1.45,
              maxWidth: "min(420px, calc(100vw - 32px))",
            },
            iconTheme: { primary: "#2563eb", secondary: "#dbeafe" },
          },
        }}
      />
    </AuthProvider>
  </StrictMode>,
);
