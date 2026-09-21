import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

const root = document.getElementById("root");
if (!root) {
    throw new Error("index.html has no #root element to mount the app in");
}

createRoot(root).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
