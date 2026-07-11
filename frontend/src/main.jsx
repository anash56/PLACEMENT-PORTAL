import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Toaster } from "react-hot-toast";

import "./index.css";
import App from "./App.jsx";

import {
    AuthProvider
} from "./context/AuthContext.jsx";

createRoot(
    document.getElementById("root")
).render(

    <StrictMode>

        <AuthProvider>

            <App />

            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    duration: 3000,
                    style: {
                        borderRadius: "10px",
                        background: "#333",
                        color: "#fff"
                    }
                }}
            />

        </AuthProvider>

    </StrictMode>

);