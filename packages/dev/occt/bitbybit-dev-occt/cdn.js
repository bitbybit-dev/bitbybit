import ocFullJS from "./bitbybit-dev-occt.js";

const initOpenCascade = ({
  mainJS = ocFullJS,
  mainWasm = "https://cdn.jsdelivr.net/gh/bitbybit-dev/bitbybit-assets@0.20.2/wasm/bitbybit-dev-occt.90cf0714.wasm",
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
