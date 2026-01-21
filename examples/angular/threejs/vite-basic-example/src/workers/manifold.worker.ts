import {
  initializationComplete,
  onMessageInput,
} from "@bitbybit-dev/manifold-worker";
import Module from "manifold-3d";

const init = async () => {
  const wasm = await Module({
    locateFile: () => {
      return "https://git-cdn.bitbybit.dev/v0.21.1/wasm/manifold-3-3-2.wasm";
    },
  });
  wasm.setup();
  initializationComplete(wasm);
};

init();

addEventListener("message", ({ data }) => {
  onMessageInput(data, postMessage);
});
