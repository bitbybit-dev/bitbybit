import { createRequire } from "module";
import { OCCTService } from "@bitbybit-dev/occt/lib/occ-service.js";
import { OccHelper } from "@bitbybit-dev/occt/lib/occ-helper.js";
import { VectorHelperService } from "@bitbybit-dev/occt/lib/api/vector-helper.service.js";
import { ShapesHelperService } from "@bitbybit-dev/occt/lib/api/shapes-helper.service.js";
import initOpenCascade from "@bitbybit-dev/occt/bitbybit-dev-occt/index.js";

const require = createRequire(import.meta.url);

export class BitByBitBase {
    public occt!: OCCTService;

    constructor() {
    }

    async init() {
        // For Node.js, we need to specify the path to the WASM file
        const wasmPath = require.resolve("@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt.5e93f201.wasm");
        
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
        const occHelper = new OccHelper(vecHelper, shapesHelper, occ);
        this.occt = new OCCTService(occ, occHelper);
    }
}
