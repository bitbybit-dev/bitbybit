/// <reference lib="webworker" />
/*eslint no-restricted-globals: 0*/
import createBitbybitOcct from '@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt';
import { BitbybitOcctModule } from '@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt.js';
import { initializationComplete, onMessageInput } from '@bitbybit-dev/occt-worker';

createBitbybitOcct().then((occ: BitbybitOcctModule) => {
    initializationComplete(occ, undefined);
});

addEventListener('message', ({ data }) => {
    onMessageInput(data, postMessage);
});
