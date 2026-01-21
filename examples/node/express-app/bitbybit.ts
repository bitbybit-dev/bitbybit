import { createRequire } from "module";

// Base utilities
import {
    MathBitByBit,
    Logic,
    Lists,
    TextBitByBit,
    Vector,
    Point,
    Transforms,
    Color,
    GeometryHelper,
    Line,
    Polyline,
} from "@bitbybit-dev/base";

// Core functionality
import { JSONBitByBit, CSVBitByBit, Verb, ContextBase } from "@bitbybit-dev/core";

// JSCAD for Node.js
import { Jscad } from "@bitbybit-dev/jscad";

// Manifold for Node.js
import { ManifoldService } from "@bitbybit-dev/manifold";

// OCCT for Node.js
import { OCCTService, OccHelper, VectorHelperService, ShapesHelperService } from "@bitbybit-dev/occt";
import initOpenCascade, { BitbybitOcctModule } from "@bitbybit-dev/occt/bitbybit-dev-occt/index.js";

// Manifold WASM module
import Module from "manifold-3d";

// JSON path for advanced JSON queries
import { JSONPath } from "jsonpath-plus";

// NURBS functionality
import vrb from "verb-nurbs-web";

const require = createRequire(import.meta.url);

export class BitByBitBase {
    // Base utilities
    public math!: MathBitByBit;
    public logic!: Logic;
    public lists!: Lists;
    public text!: TextBitByBit;
    public vector!: Vector;
    public point!: Point;
    public transforms!: Transforms;
    public color!: Color;
    public line!: Line;
    public polyline!: Polyline;

    // Core functionality
    public json!: JSONBitByBit;
    public csv!: CSVBitByBit;
    public verb!: Verb;

    // Geometry kernels
    public jscad!: Jscad;
    public manifold!: ManifoldService;
    public occt!: OCCTService;

    async init() {
        // Initialize OCCT (OpenCascade) with locateFile for Node.js WASM loading
        const wasmPath = require.resolve("@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt.5e93f201.wasm");
        const occ = await (initOpenCascade as (options?: { locateFile?: (path: string) => string }) => Promise<BitbybitOcctModule>)({
            locateFile: (path: string) => {
                if (path.endsWith(".wasm")) {
                    return wasmPath;
                }
                return path;
            }
        });

        // Initialize JSCAD
        const jscadModule = await import("@bitbybit-dev/jscad/jscad-generated.js");
        const jscad = jscadModule.default();
        this.jscad = new Jscad(jscad);

        // Initialize Manifold
        const manifoldWasmPath = require.resolve("manifold-3d/manifold.wasm");
        const wasm = await Module({
            locateFile: () => manifoldWasmPath,
        });
        wasm.setup();
        this.manifold = new ManifoldService(wasm);

        // Initialize base utilities
        const geometryHelper = new GeometryHelper();
        this.math = new MathBitByBit();
        this.lists = new Lists();
        this.logic = new Logic();
        this.color = new Color(this.math);
        this.vector = new Vector(this.math, geometryHelper);
        this.transforms = new Transforms(this.vector, this.math);
        this.point = new Point(geometryHelper, this.transforms, this.vector, this.lists);
        this.line = new Line(this.vector, this.point, geometryHelper);
        this.polyline = new Polyline(this.vector, this.point, this.line, geometryHelper);
        this.text = new TextBitByBit(this.point);

        // Initialize core functionality with context
        const context = new ContextBase();
        context.verb = { geom: vrb.geom, core: vrb.core };
        context.jsonpath = JSONPath;

        this.verb = new Verb(context, geometryHelper, this.math);
        this.json = new JSONBitByBit(context);
        this.csv = new CSVBitByBit();

        // Initialize OCCT service
        const vecHelper = new VectorHelperService();
        const shapesHelper = new ShapesHelperService();
        const occHelper = new OccHelper(vecHelper, shapesHelper, occ);
        this.occt = new OCCTService(occ, occHelper);
    }
}
