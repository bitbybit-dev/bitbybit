/// <reference lib="webworker" />

import { initializationComplete, onMessageInput } from "@bitbybit-dev/manifold-worker";
import Module from "manifold-3d";

const init = async () => {
    const wasm = await Module({
        locateFile: () => {
            return "static/js/manifold-3.5.3.wasm";
        },
    });
    wasm.setup();
    initializationComplete(wasm);
};

init();

addEventListener("message", ({ data }) => {
    onMessageInput(data, postMessage);
});
