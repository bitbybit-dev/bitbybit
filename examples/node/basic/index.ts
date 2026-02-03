import { createRequire } from "module";
import initOpenCascade from "@bitbybit-dev/occt/bitbybit-dev-occt/index.js";
import { OCCTWire } from "@bitbybit-dev/occt/lib/services/shapes/wire.js";
import { OccHelper } from "@bitbybit-dev/occt/lib/occ-helper.js";
import { VectorHelperService } from "@bitbybit-dev/occt/lib/api/vector-helper.service.js";
import { ShapesHelperService } from "@bitbybit-dev/occt/lib/api/shapes-helper.service.js";

const require = createRequire(import.meta.url);

async function run() {
    console.log("initializing...");
    
    // For Node.js, we need to specify the path to the WASM file
    const wasmPath = require.resolve("@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt.dec37f82.wasm");
    
    const occ = await initOpenCascade({
        locateFile: (path: string) => {
            if (path.endsWith(".wasm")) {
                return wasmPath;
            }
            return path;
        }
    });

    const vecHelper = new VectorHelperService();
    const shapesHelper = new ShapesHelperService();
    const helper = new OccHelper(vecHelper, shapesHelper, occ);
    const wire = new OCCTWire(occ, helper);
    const circle = wire.createCircleWire({ radius: 1, center: [0, 0, 0], direction: [0, 1, 0] });
    const pt = wire.pointOnWireAtParam({shape: circle, param: 0.2});
    console.log("point on circle was: ", pt);
}

run();