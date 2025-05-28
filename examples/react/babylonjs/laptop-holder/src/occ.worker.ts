/// <reference lib="webworker" />
/*eslint no-restricted-globals: 0*/
import initOpenCascade from '@bitbybit-dev/occt/bitbybit-dev-occt/cdn';
import { OpenCascadeInstance } from '@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt.js';
import { initializationComplete, onMessageInput } from '@bitbybit-dev/occt-worker';

initOpenCascade().then((occ: OpenCascadeInstance) => {
    initializationComplete(occ, undefined);
});

addEventListener('message', ({ data }) => {
    onMessageInput(data, postMessage);
});
