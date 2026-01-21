/// <reference lib="webworker" />
/*eslint no-restricted-globals: 0*/
import initOpenCascade from "@bitbybit-dev/occt/bitbybit-dev-occt/cdn";
import { BitbybitOcctModule } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt.js";
import { initializationComplete, onMessageInput } from "@bitbybit-dev/occt-worker";

initOpenCascade().then((occ: BitbybitOcctModule) => {
    initializationComplete(occ, undefined);
});

addEventListener("message", ({ data }) => {
    onMessageInput(data, postMessage);
});
