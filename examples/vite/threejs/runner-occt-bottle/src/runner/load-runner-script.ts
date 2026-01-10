

import * as THREEJS from "three";
// eslint-disable-next-line @typescript-eslint/no-explicit-any

// Dynamically load the runner script after THREE is available on window
(window as any).THREEJS = THREEJS;

export function loadRunnerScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/gh/bitbybit-dev/bitbybit-assets@latest/runner/bitbybit-runner-lite-threejs.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load bitbybit-runner script"));
        document.head.appendChild(script);
    });
}
