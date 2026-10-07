import { initializationComplete, onMessageInput } from "@bitbybit-dev/ifc-worker";

initializationComplete();
addEventListener("message", ({ data }) => onMessageInput(data, postMessage));
