import { initializationComplete, onMessageInput, type DataInput } from "@bitbybit-dev/ifc-worker";

initializationComplete();

addEventListener("message", ({ data }: MessageEvent<DataInput>) => {
    onMessageInput(data, postMessage);
});
