import {
    TextBitByBit,
    Point, GeometryHelper,
    Transforms, Vector, MathBitByBit,
    MeshBitByBit, Polyline,
    Line, Lists, IoBitByBit,
    Frame, Color
} from "@bitbybit-dev/base";

export class BaseBitByBit {

    readonly geometryHelper: GeometryHelper;
    readonly vector: Vector;
    readonly math: MathBitByBit;
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

    constructor() {
        this.geometryHelper = new GeometryHelper();
        this.math = new MathBitByBit();
        this.vector = new Vector(this.math, this.geometryHelper);
        this.transforms = new Transforms(this.vector, this.math);
        this.lists = new Lists();
        this.point = new Point(this.geometryHelper, this.transforms, this.vector, this.lists);
        this.line = new Line(this.vector, this.point, this.geometryHelper);
        this.polyline = new Polyline(this.vector, this.point, this.line, this.geometryHelper);
        this.textService = new TextBitByBit(this.point);
        this.mesh = new MeshBitByBit(this.vector, this.polyline);
        this.io = new IoBitByBit();
        this.frame = new Frame(this.vector, this.math, this.geometryHelper);
        this.color = new Color(this.math);
    }

}

