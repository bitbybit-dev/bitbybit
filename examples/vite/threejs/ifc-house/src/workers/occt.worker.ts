import initOpenCascade from "@bitbybit-dev/occt/bitbybit-dev-occt/cdn";
import { initializationComplete, onMessageInput, type DataInput } from "@bitbybit-dev/occt-worker";

async function init(): Promise<void> {
    const occ = await initOpenCascade();
    initializationComplete(occ, undefined);
}

init().catch((error: unknown) => {
    setTimeout(() => {
        throw error instanceof Error ? error : new Error(String(error));
    });
});

addEventListener("message", ({ data }: MessageEvent<DataInput>) => {
    onMessageInput(data, postMessage);
});
