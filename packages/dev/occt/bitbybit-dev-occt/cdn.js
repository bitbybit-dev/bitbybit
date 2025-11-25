import ocFullJS from "./bitbybit-dev-occt.js";
import { GlobalCDNProvider } from "@bitbybit-dev/base";

const initOpenCascade = ({
  mainJS = ocFullJS,
  mainWasm = GlobalCDNProvider.BITBYBIT_CDN_URL + "/wasm/bitbybit-dev-occt.f151efeb.wasm",
  worker = undefined,
  libs = [],
  module = {},
} = {}) => {
  return new Promise((resolve, reject) => {
    new mainJS({
      locateFile(path) {
        if (path.endsWith('.wasm')) {
          return mainWasm;
        }
        if (path.endsWith('.worker.js') && !!worker) {
          return worker;
        }
        return path;
      },
      ...module
    }).then(async oc => {
      for (let lib of libs) {
        await oc.loadDynamicLibrary(lib, { loadAsync: true, global: true, nodelete: true, allowUndefined: false });
      }
      resolve(oc);
    });
  });
};

export default initOpenCascade;
