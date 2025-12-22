import { MathBitByBit, Logic, Lists, TextBitByBit, Vector, Point, Transforms, Color, GeometryHelper, Line, Polyline } from "@bitbybit-dev/base";
import { JSONBitByBit, CSVBitByBit, Verb } from "@bitbybit-dev/core";
import { Jscad } from "@bitbybit-dev/jscad";
import { ManifoldService } from "@bitbybit-dev/manifold";
import { OCCTService, OccHelper, VectorHelperService, ShapesHelperService } from "@bitbybit-dev/occt";
import Module from "manifold-3d";
import { JSONPath } from "jsonpath-plus";
import initOpenCascade from "@bitbybit-dev/occt/bitbybit-dev-occt/node.js";
import * as vrb from "verb-nurbs-web";

export class BitByBitBase {
    public math: MathBitByBit;
    public logic: Logic;
    public lists: Lists;
    public json: JSONBitByBit;
    public csv: CSVBitByBit;
    public vector: Vector;
    public point: Point;
    public line: Line;
    public transforms: Transforms;
    public polyline: Polyline;
    public verb: Verb;
    public jscad: Jscad;
    public manifold: ManifoldService;
    public text: TextBitByBit;
    public occt: OCCTService;
    public color: Color;

    constructor() {
    }

    async init() {
        const occ = await initOpenCascade();
        const s = await import("@bitbybit-dev/jscad/jscad-generated.js");
        const jscad = s.default();
        this.jscad = new Jscad(jscad);
        const wasm = await Module({
            locateFile: () => {
                return "./manifold-3-0-0.wasm";
            },
        });
        wasm.setup();
        this.manifold = new ManifoldService(wasm);
        const geometryHelper = new GeometryHelper();
        this.math = new MathBitByBit();
        this.lists = new Lists();
        this.vector = new Vector(this.math, geometryHelper);
        this.color = new Color(this.math);
        this.transforms = new Transforms(this.vector, this.math);
        this.point = new Point(geometryHelper, this.transforms, this.vector, this.lists);
        const verb = { geom: vrb.geom, core: vrb.core };
        this.verb = new Verb({ verb } as any, geometryHelper, this.math);
        this.line = new Line(this.vector, this.point, geometryHelper);
        this.polyline = new Polyline(this.vector, this.point, this.line, geometryHelper);
        const vecHelper = new VectorHelperService();
        const shapesHelper = new ShapesHelperService();
        const occHelper = new OccHelper(vecHelper, shapesHelper, occ);
        this.occt = new OCCTService(occ, occHelper);
        this.logic = new Logic();
        this.json = new JSONBitByBit({ jsonpath: JSONPath } as any);
        this.csv = new CSVBitByBit();
        this.text = new TextBitByBit(this.point);
    }
}
