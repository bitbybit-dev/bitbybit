/// <reference lib="webworker" />
import { initOpenCascade } from 'opencascade.js';
import { initializationComplete, onMessageInput } from 'projects/bitbybit-core/src/lib/workers/occ/occ-worker';

initOpenCascade().then(occ => {
    initializationComplete(occ);
    postMessage('occ initialised');
});

addEventListener('message', ({ data }) => {
    onMessageInput(data, postMessage);
});
