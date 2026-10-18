import { Color } from "./color";
import { Dates } from "./dates";
import { Engineering } from "./engineering";
import { Frame } from "./frame";
import { GeometryHelper } from "./geometry-helper";
import { IoBitByBit } from "./io";
import { Line } from "./line";
import { Lists } from "./lists";
import { Logic } from "./logic";
import { MathBitByBit } from "./math";
import { MeshBitByBit } from "./mesh";
import { Point } from "./point";
import { Polyline } from "./polyline";
import { Recipes } from "./recipes";
import { TextBitByBit } from "./text";
import { Transforms } from "./transforms";
import { Vector } from "./vector";

/**
 * Every service of the base package, wired to each other once. The kernels, the renderers and code
 * running in Node take this one object rather than building the services themselves, so each package
 * calls the same maths a user does.
 */
export class BaseBitByBit {
    readonly geometryHelper: GeometryHelper;
    readonly math: MathBitByBit;
    readonly vector: Vector;
    readonly transforms: Transforms;
    readonly lists: Lists;
    readonly point: Point;
    readonly line: Line;
    readonly polyline: Polyline;
    readonly mesh: MeshBitByBit;
    readonly textService: TextBitByBit;
    readonly io: IoBitByBit;
    readonly frame: Frame;
    readonly color: Color;
    readonly logic: Logic;
    readonly dates: Dates;
    readonly engineering: Engineering;
    readonly recipes: Recipes;

    constructor() {
        this.geometryHelper = new GeometryHelper();
        this.math = new MathBitByBit();
        this.vector = new Vector(this.math, this.geometryHelper);
        this.transforms = new Transforms(this.vector, this.math);
        this.lists = new Lists();
        this.point = new Point(this.geometryHelper, this.transforms, this.vector, this.lists);
        this.line = new Line(this.vector, this.point, this.geometryHelper);
        this.polyline = new Polyline(this.vector, this.point, this.line, this.geometryHelper);
        this.mesh = new MeshBitByBit(this.vector, this.polyline);
        this.textService = new TextBitByBit(this.point);
        this.io = new IoBitByBit();
        this.frame = new Frame(this.vector, this.math, this.geometryHelper);
        this.color = new Color(this.math);
        this.logic = new Logic();
        this.dates = new Dates();
        this.engineering = new Engineering();
        this.recipes = new Recipes();
    }
}
