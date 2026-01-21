import { defineConfig } from "vite";

export default defineConfig({
    server: {
        headers: {
            // Required for SharedArrayBuffer (needed by multithreaded WASM)
            "Cross-Origin-Opener-Policy": "same-origin",
            // Use "credentialless" to allow cross-origin resources without CORP headers
            // This is more permissive than "require-corp" while still enabling SharedArrayBuffer
            "Cross-Origin-Embedder-Policy": "credentialless",
        },
    },
    optimizeDeps: {
        exclude: ["@babylonjs/core"],
    },
});
