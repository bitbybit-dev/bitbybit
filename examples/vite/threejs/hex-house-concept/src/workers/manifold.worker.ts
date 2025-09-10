import {
  initializationComplete,
  onMessageInput,
} from '@bitbybit-dev/manifold-worker';
import Module from 'manifold-3d';

const init = async () => {
  const wasm = await Module({
    locateFile: () => {
      return 'https://cdn.jsdelivr.net/gh/bitbybit-dev/bitbybit-assets@0.20.5/wasm/manifold.cc2ddd38.wasm';
    },
  });
  wasm.setup();
  initializationComplete(wasm);
};

init();

addEventListener('message', ({ data }) => {
  onMessageInput(data, postMessage);
});
