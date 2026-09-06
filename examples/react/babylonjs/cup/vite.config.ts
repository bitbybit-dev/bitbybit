import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    base: "/cup/",
    server: {
        port: 3001,
    },
    worker: {
        format: "es",
    },
});
