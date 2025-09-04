/// <reference lib="webworker" />

import { initializationComplete, onMessageInput } from "@bitbybit-dev/jscad-worker";

import("@bitbybit-dev/jscad/jscad-generated")
    .then((s) => {
        initializationComplete(s.default());
    });

addEventListener("message", ({ data }) => {
    onMessageInput(data, postMessage);
});
