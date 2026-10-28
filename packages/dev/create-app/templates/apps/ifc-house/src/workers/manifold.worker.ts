import { initializationComplete, onMessageInput, type DataInput } from "@bitbybit-dev/manifold-worker";
import Module from "manifold-3d";

const MANIFOLD_WASM_URL = "https://git-cdn.bitbybit.dev/v1.6.0/wasm/manifold-3.5.4.wasm";

async function init(): Promise<void> {
    const wasm = await Module({ locateFile: () => MANIFOLD_WASM_URL });
    wasm.setup();
    initializationComplete(wasm);
}

void init();

addEventListener("message", ({ data }: MessageEvent<DataInput>) => {
    onMessageInput(data, postMessage);
});
