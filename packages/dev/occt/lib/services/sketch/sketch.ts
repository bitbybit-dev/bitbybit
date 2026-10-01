import { BitbybitOcctModule, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import { FrameAxes, squareFrame } from "@bitbybit-dev/base/lib/api/services/helpers/frame-axes";
import { OccHelper } from "../../occ-helper";
import * as Inputs from "../../api/inputs";
import * as Models from "../../api/models";
import * as Resolved from "../../api/resolved-inputs";
import { PathBuilder } from "../../svg/path-builder";
import { OCCTShapes } from "../shapes/shapes";
import { OCCTOperations } from "../operations";
import { OCCTBooleans } from "../booleans";
import { checkedChoice, checkedFlag, checkedFrame, checkedShape, checkedShapes, checkedWithin } from "../base/input-checks";
import { numbersOfFrames } from "../base/frames";
import { OCCTSketchCommands } from "./commands";
import { COINCIDENT, Outline, Vec2, outlineOf, segmentsOf, signedArea, subpathOf } from "./outline";
import { HullPart, hullOf } from "./hull";

type Vec3 = Inputs.Base.Vector3;

/** The ground frame a sketch lies in when none is given: the XZ plane, facing up, the sketch's y axis along -Z. */
export const GROUND_FRAME: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 1, 0], direction: [1, 0, 0] };

const XY_FRAME: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] };
const IN_PLANE = 1e-6;
const CAPS: readonly Inputs.OCCT.strokeCapEnum[] = [Inputs.OCCT.strokeCapEnum.flat, Inputs.OCCT.strokeCapEnum.round, Inputs.OCCT.strokeCapEnum.square];
const JOINS: readonly Inputs.OCCT.joinTypeEnum[] = [Inputs.OCCT.joinTypeEnum.arc, Inputs.OCCT.joinTypeEnum.intersection, Inputs.OCCT.joinTypeEnum.tangent];

const plus = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const times = (a: Vec3, factor: number): Vec3 => [a[0] * factor, a[1] * factor, a[2] * factor];
const minus = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const along = (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/**
 * Drawing flat outlines with a pen: a start point and a list of moves (lines, arcs, Bezier curves,
 * rounded and beveled corners) become one exact wire, or a face when the outline closes, in the plane
 * of a frame. `commands` makes the moves one at a time; `stroke` and `hull` outline wires and wrap
 * shapes. A sketch's x axis is the frame's direction and its y axis the normal crossed with it.
 */
export class OCCTSketch {
    public readonly commands: OCCTSketchCommands;
    private readonly builder: PathBuilder;

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper,
        private readonly shapes: OCCTShapes,
        private readonly operations: OCCTOperations,
        private readonly booleans: OCCTBooleans,
    ) {
        this.commands = new OCCTSketchCommands();
        this.builder = new PathBuilder(occ, och);
    }

    /**
     * Draws an outline with a pen, from a start point through a list of moves, in a frame's plane.
     *
     * Each command draws on from where the previous one ended, and lines and arcs come out as exact
     * lines and circles. `makeFace` turns a closed outline into a face facing along the frame's
     * normal; one that crosses itself is refused.
     * @param inputs - The commands, the start point, the frame and whether to make a face
     * @returns The outline as a wire, or a face when `makeFace` is true
     * @group draw
     * @shortname pen
     * @drawable true
     * @example
     * ```typescript
     * const plate = await bitbybit.occt.sketch.pen({
     *     commands: [
     *         { type: "hLine", length: 40 },
     *         { type: "vLine", length: 10 },
     *         { type: "filletCorner", radius: 2 },
     *         { type: "tangentArc", to: [-10, 10], relative: true },
     *         { type: "close" },
     *     ],
     *     makeFace: true,
     * });
     * ```
     */
    pen(inputs: Inputs.OCCT.SketchPenDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.SketchPenDto, inputs) as Resolved.OCCT.SketchPenDto;
        return this.drawn(resolved).shape;
    }

    /**
     * Draws an outline as `pen` does and reports which edges each command drew, so later steps can
     * find the edges and faces a command made by its `id`.
     *
     * Edges are numbered as `shapes.edge.getEdges` numbers them on the result. A command without an
     * `id` is named by its position, and a command that drew nothing is left out.
     * @param inputs - The commands, the start point, the frame and whether to make a face
     * @returns The outline and, per command, the edges it drew
     * @group draw
     * @shortname pen with segments
     * @drawable false
     * @example
     * ```typescript
     * const drawn = await bitbybit.occt.sketch.penWithSegments({
     *     commands: [{ type: "hLine", id: "base", length: 40 }, { type: "vLine", id: "side", length: 10 }, { type: "close", id: "slope" }],
     *     makeFace: true,
     * });
     * console.log(drawn.segments.find(segment => segment.id === "slope")?.edges);
     * ```
     */
    penWithSegments(inputs: Inputs.OCCT.SketchPenDto): Models.OCCT.SketchWithSegments<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.SketchPenDto, inputs) as Resolved.OCCT.SketchPenDto;
        const drawn = this.drawn(resolved);
        return { shape: drawn.shape, segments: segmentsOf(drawn.names, drawn.outline.pieces) };
    }

    /**
     * Outlines a wire as if it were drawn with a pen of a given width, in a frame's plane.
     *
     * Half of `width` lies to each side; `cap` finishes an open wire's ends and `join` its corners.
     * A closed wire gives a ring: a face with one hole, or its two wires in a compound without
     * `makeFace`.
     * @param inputs - The wire, the width, the end and corner styles, the frame and whether to make a face
     * @returns The outline as a face, or as a wire or compound of wires when `makeFace` is false
     * @group outline
     * @shortname stroke
     * @drawable true
     * @example
     * ```typescript
     * const path = await bitbybit.occt.sketch.pen({ commands: [{ type: "hLine", length: 30 }, { type: "tangentArc", to: [10, 10], relative: true }] });
     * const slot = await bitbybit.occt.sketch.stroke({ shape: path, width: 4, cap: Bit.Inputs.OCCT.strokeCapEnum.round });
     * ```
     */
    stroke(inputs: Inputs.OCCT.SketchStrokeDto<TopoDS_Wire | TopoDS_Edge>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.SketchStrokeDto, inputs) as Resolved.OCCT.SketchStrokeDto<TopoDS_Wire | TopoDS_Edge>;
        const shape = checkedShape(resolved.shape);
        const width = checkedWithin(resolved.width, "width", { above: 0 });
        const cap = checkedChoice(resolved.cap, CAPS, "cap");
        const join = checkedChoice(resolved.join, JOINS, "join");
        const frame = this.frameOf(resolved.frame);
        const makeFace = checkedFlag(resolved.makeFace, "makeFace");
        const type = this.och.enumService.getShapeTypeEnum(shape);
        if (type !== Inputs.OCCT.shapeTypeEnum.wire && type !== Inputs.OCCT.shapeTypeEnum.edge) {
            throw new InputError("`shape` is not a wire or an edge.", "shape");
        }
        this.inPlane(shape, frame, "shape");
        const wire = type === Inputs.OCCT.shapeTypeEnum.edge
            ? this.shapes.wire.createWireFromEdge({ shape: shape })
            : shape;
        const plane = this.built({ pieces: [
            { kind: "line", from: [0, 0], to: [1, 0], owner: 0 },
            { kind: "line", from: [1, 0], to: [1, 1], owner: 0 },
            { kind: "line", from: [1, 1], to: [0, 1], owner: 0 },
            { kind: "line", from: [0, 1], to: [0, 0], owner: 0 },
        ], closed: true }, frame, true, "shape");
        try {
            return this.shapes.wire.isWireClosed({ shape: wire })
                ? this.ring(wire, plane, width, join, makeFace)
                : this.band(wire, plane, width, cap, join, makeFace);
        } finally {
            plane.delete();
            if (wire !== shape) {
                wire.delete();
            }
        }
    }

    /**
     * Wraps vertices, straight edges and circular edges lying in a frame's plane in the tightest
     * convex outline around them.
     *
     * The outline is exact: straight where it spans between shapes, following a circle where a circle
     * or an arc bulges out. Other curves are refused, as are shapes off the frame's plane or circles
     * tilted out of it.
     * @param inputs - The shapes, the frame and whether to make a face
     * @returns The hull as a face, or as a wire when `makeFace` is false
     * @group outline
     * @shortname hull
     * @drawable true
     * @example
     * ```typescript
     * const left = await bitbybit.occt.shapes.wire.createCircleWire({ radius: 5, center: [0, 0, 0], direction: [0, 1, 0] });
     * const right = await bitbybit.occt.shapes.wire.createCircleWire({ radius: 2, center: [20, 0, 0], direction: [0, 1, 0] });
     * const lever = await bitbybit.occt.sketch.hull({ shapes: [left, right] });
     * ```
     */
    hull(inputs: Inputs.OCCT.SketchHullDto<TopoDS_Shape>): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.SketchHullDto, inputs) as Resolved.OCCT.SketchHullDto<TopoDS_Shape>;
        const shapes = checkedShapes(resolved.shapes);
        if (shapes.length === 0) {
            throw new InputError("`shapes` is empty: there is nothing to wrap.", "shapes");
        }
        const frame = this.frameOf(resolved.frame);
        const makeFace = checkedFlag(resolved.makeFace, "makeFace");
        const axes = squareFrame(frame.origin, frame.normal, frame.direction) as FrameAxes;
        const parts = shapes.flatMap((shape, index) => this.hullParts(shape, index, axes));
        const outline = hullOf(parts);
        if (outline === undefined || Math.abs(signedArea(outline.pieces)) <= COINCIDENT * COINCIDENT) {
            throw new InputError("`shapes` lie on one line or at one point, so they wrap no area.", "shapes");
        }
        return this.built(outline, frame, makeFace, "shapes");
    }

    private drawn(resolved: Resolved.OCCT.SketchPenDto): { shape: TopoDS_Shape; outline: Outline; names: string[] } {
        const start = pointOf(resolved.start, "start");
        const frame = this.frameOf(resolved.frame);
        const makeFace = checkedFlag(resolved.makeFace, "makeFace");
        const { outline, names } = outlineOf(resolved.commands, start);
        return { shape: this.built(outline, frame, makeFace, "commands"), outline, names };
    }

    private frameOf(frame: Inputs.Base.Frame | undefined): Inputs.Base.Frame {
        return frame === undefined ? GROUND_FRAME : checkedFrame(frame, "frame");
    }

    /** The outline as one wire, or a face facing along the frame's normal, placed on the frame. */
    private built(outline: Outline, frame: Inputs.Base.Frame, makeFace: boolean, property: string): TopoDS_Shape {
        if (makeFace && !outline.closed) {
            throw new InputError("`makeFace` needs a closed outline: end the commands with `close`, or back at `start`.", "makeFace");
        }
        const built = this.builder.buildGroups([{ subpaths: [subpathOf(outline)], makeFaces: false }], { scale: 1, flipY: false, origin: [0, 0, 0] }, {
            joinSegments: false,
            tolerance: COINCIDENT,
            warnings: [],
        })[0];
        if (built === undefined) {
            throw new Error("The outline could not be built.");
        }
        const wire = built.shape;
        const edges = this.och.shapeGettersService.getEdges({ shape: wire });
        const count = edges.length;
        edges.forEach(edge => edge.delete());
        if (count !== outline.pieces.length) {
            wire.delete();
            throw new Error(`The outline was drawn as ${outline.pieces.length} pieces but built into ${count} edges.`);
        }
        let flat: TopoDS_Shape = wire;
        if (makeFace) {
            const area = signedArea(outline.pieces);
            if (Math.abs(area) <= COINCIDENT * COINCIDENT) {
                wire.delete();
                throw new InputError(`\`${property}\` draw an outline that encloses no area.`, property);
            }
            flat = this.faceOf(wire, area < 0, property);
            wire.delete();
        }
        const placed = this.placed(flat, XY_FRAME, frame);
        flat.delete();
        return placed;
    }

    /** A planar face bounded by the wire, built from the wire turned around when it runs clockwise. */
    private faceOf(wire: TopoDS_Wire, clockwise: boolean, property: string): TopoDS_Face {
        const reversed = clockwise ? wire.Reversed() : undefined;
        const source = reversed === undefined ? wire : this.och.converterService.getActualTypeOfShape(reversed);
        if (reversed !== undefined && reversed !== source) {
            reversed.delete();
        }
        const face = this.och.facesService.createFaceFromWire({ shape: source, planar: true });
        if (source !== wire) {
            source.delete();
        }
        if (!this.occ.ShapeIsValid(face)) {
            face.delete();
            throw new InputError(`\`${property}\` draw an outline that crosses itself, so it bounds no valid face.`, property);
        }
        return face;
    }

    /** The shape moved rigidly from one frame onto another, its geometry rewritten exactly rather than located. */
    private placed(shape: TopoDS_Shape, from: Inputs.Base.Frame, to: Inputs.Base.Frame): TopoDS_Shape {
        const transformation = new this.occ.gp_Trsf();
        const source = this.och.entitiesService.gpAx3_3(from.origin, from.normal, from.direction);
        const target = this.och.entitiesService.gpAx3_3(to.origin, to.normal, to.direction);
        try {
            transformation.SetDisplacement(source, target);
            const transform = new this.occ.BRepBuilderAPI_Transform(shape, transformation, true);
            const moved = transform.Shape();
            transform.delete();
            const typed = this.och.converterService.getActualTypeOfShape(moved);
            if (typed !== moved) {
                moved.delete();
            }
            return typed;
        } finally {
            source.delete();
            target.delete();
            transformation.delete();
        }
    }

    /** Refuses a shape that does not lie in the frame's plane. */
    private inPlane(shape: TopoDS_Shape, frame: Inputs.Base.Frame, property: string): void {
        const box = this.occ.BoundingBoxInFrame(shape, numbersOfFrames([frame]));
        if (!box.IsValid || Math.abs(box.ZMin) > IN_PLANE || Math.abs(box.ZMax) > IN_PLANE) {
            throw new InputError(`\`${property}\` does not lie in the frame's plane.`, property);
        }
    }

    /** The two offsets of a closed wire, grown and shrunk in its own plane, as a ring face or the two wires. */
    private ring(wire: TopoDS_Wire, plane: TopoDS_Face, width: number, join: Inputs.OCCT.joinTypeEnum, makeFace: boolean): TopoDS_Shape {
        const offset = (distance: number): TopoDS_Wire => this.onlyWire(this.operations.offsetAdv({ shape: wire, distance, tolerance: COINCIDENT, joinType: join, removeIntEdges: false }));
        const outer = offset(width / 2);
        const inner = offset(-width / 2);
        try {
            if (!makeFace) {
                return this.och.converterService.makeCompound({ shapes: [outer, inner] });
            }
            const outerFace = this.shapes.face.createFaceFromWire({ shape: outer, planar: true });
            const innerFace = this.shapes.face.createFaceFromWire({ shape: inner, planar: true });
            try {
                const cut = this.booleans.difference({ shape: outerFace, shapes: [innerFace], keepEdges: false });
                const faces = this.shapes.face.getFaces({ shape: cut });
                const face = faces[0];
                faces.slice(1).forEach(other => other.delete());
                cut.delete();
                if (face === undefined || faces.length !== 1) {
                    face?.delete();
                    throw new InputError("`width` is too wide for the wire: the inside of the ring closes up.", "width");
                }
                return this.facingAlong(face, plane);
            } finally {
                outerFace.delete();
                innerFace.delete();
            }
        } finally {
            outer.delete();
            inner.delete();
        }
    }

    /** The one wire an offset made, refused as too wide when it made none or several. */
    private onlyWire(shape: TopoDS_Shape): TopoDS_Wire {
        const wires = this.shapes.wire.getWires({ shape });
        shape.delete();
        const wire = wires[0];
        if (wire === undefined || wires.length !== 1) {
            wires.forEach(each => each.delete());
            throw new InputError("`width` is too wide for the wire: its offset breaks apart.", "width");
        }
        return wire;
    }

    /** The outline around an open wire: its right offset, the end cap, its left offset back and the start cap. */
    private band(wire: TopoDS_Wire, plane: TopoDS_Face, width: number, cap: Inputs.OCCT.strokeCapEnum, join: Inputs.OCCT.joinTypeEnum, makeFace: boolean): TopoDS_Shape {
        const half = width / 2;
        const right = this.shapes.wire.offsetOpen({ shape: wire, face: plane, distance: half, joinType: join });
        const left = this.shapes.wire.offsetOpen({ shape: wire, face: plane, distance: -half, joinType: join });
        const rightEdges = this.shapes.edge.getEdgesAlongWire({ shape: right });
        const leftEdges = this.shapes.edge.getEdgesAlongWire({ shape: left });
        right.delete();
        left.delete();
        const leftBack = leftEdges.slice().reverse().map(edge => this.shapes.edge.reversedEdge({ shape: edge }));
        const firstOf = (edges: TopoDS_Edge[]): Vec3 => this.shapes.edge.startPointOnEdge({ shape: edges[0]! });
        const lastOf = (edges: TopoDS_Edge[]): Vec3 => this.shapes.edge.endPointOnEdge({ shape: edges[edges.length - 1]! });
        const start = this.shapes.wire.startPointOnWire({ shape: wire });
        const end = this.shapes.wire.endPointOnWire({ shape: wire });
        const startTangent = unit3(this.shapes.wire.tangentOnWireAtParam({ shape: wire, param: 0 }));
        const endTangent = unit3(this.shapes.wire.tangentOnWireAtParam({ shape: wire, param: 1 }));
        const endCap = this.cap(lastOf(rightEdges), lastOf(leftEdges), end, endTangent, half, cap);
        const startCap = this.cap(firstOf(leftEdges), firstOf(rightEdges), start, times(startTangent, -1), half, cap);
        const edges = [...rightEdges, ...endCap, ...leftBack, ...startCap];
        try {
            const outline = this.shapes.wire.combineEdgesAndWiresIntoAWire({ shapes: edges });
            if (!makeFace) {
                return outline;
            }
            const face = this.shapes.face.createFaceFromWire({ shape: outline, planar: true });
            outline.delete();
            if (!this.occ.ShapeIsValid(face)) {
                face.delete();
                throw new InputError("`width` is too wide for the wire: the outline crosses itself.", "width");
            }
            return this.facingAlong(face, plane);
        } finally {
            [...edges, ...leftEdges].forEach(edge => edge.delete());
        }
    }

    /** The edges that close one end of a stroke, from `from` round to `to` about the wire's end. */
    private cap(from: Vec3, to: Vec3, end: Vec3, outward: Vec3, half: number, cap: Inputs.OCCT.strokeCapEnum): TopoDS_Edge[] {
        if (cap === Inputs.OCCT.strokeCapEnum.round) {
            return [this.shapes.edge.arcThroughThreePoints({ start: from, middle: plus(end, times(outward, half)), end: to })];
        }
        if (cap === Inputs.OCCT.strokeCapEnum.flat) {
            return [this.shapes.edge.line({ start: from, end: to })];
        }
        const fromOut = plus(from, times(outward, half));
        const toOut = plus(to, times(outward, half));
        return [this.shapes.edge.line({ start: from, end: fromOut }), this.shapes.edge.line({ start: fromOut, end: toOut }), this.shapes.edge.line({ start: toOut, end: to })];
    }

    /** The face turned to face the way the plane face does. */
    private facingAlong(face: TopoDS_Face, plane: TopoDS_Face): TopoDS_Face {
        const normal = this.shapes.face.normalOnUV({ shape: plane, paramU: 0.5, paramV: 0.5 });
        const facing = this.shapes.face.normalOnUV({ shape: face, paramU: 0.5, paramV: 0.5 });
        if (along(normal, facing) >= 0) {
            return face;
        }
        const reversed = face.Reversed();
        const typed = this.och.converterService.getActualTypeOfShape(reversed);
        if (typed !== reversed) {
            reversed.delete();
        }
        face.delete();
        return typed;
    }

    /** The points, discs and arcs of one shape, in the frame's 2D coordinates. */
    private hullParts(shape: TopoDS_Shape, index: number, axes: FrameAxes): HullPart[] {
        const property = "shapes";
        const flat = (point: Vec3): Vec2 => {
            const offset = minus(point, axes.origin);
            if (Math.abs(along(offset, axes.z)) > IN_PLANE) {
                throw new InputError(`\`${property}\` at position ${index} does not lie in the frame's plane.`, property);
            }
            return [along(offset, axes.x), along(offset, axes.y)];
        };
        if (this.och.enumService.getShapeTypeEnum(shape) === Inputs.OCCT.shapeTypeEnum.vertex) {
            return [{ kind: "point", at: flat(this.shapes.vertex.vertexToPoint({ shape: shape })) }];
        }
        const edges = this.shapes.edge.getEdges({ shape });
        try {
            if (edges.length === 0) {
                throw new InputError(`\`${property}\` at position ${index} has no vertex or edge to wrap.`, property);
            }
            return edges.flatMap((edge): HullPart[] => {
                const start = flat(this.shapes.edge.startPointOnEdge({ shape: edge }));
                const end = flat(this.shapes.edge.endPointOnEdge({ shape: edge }));
                if (this.shapes.edge.isEdgeLinear({ shape: edge })) {
                    return [{ kind: "point", at: start }, { kind: "point", at: end }];
                }
                if (!this.shapes.edge.isEdgeCircular({ shape: edge })) {
                    throw new InputError(`\`${property}\` at position ${index} has an edge that is neither straight nor circular.`, property);
                }
                const normal = this.shapes.edge.getCircularEdgePlaneDirection({ shape: edge });
                if (Math.abs(Math.abs(along(unit3(normal), axes.z)) - 1) > IN_PLANE) {
                    throw new InputError(`\`${property}\` at position ${index} has a circle tilted out of the frame's plane.`, property);
                }
                const center = flat(this.shapes.edge.getCircularEdgeCenterPoint({ shape: edge }));
                const radius = this.shapes.edge.getCircularEdgeRadius({ shape: edge });
                if (Math.hypot(end[0] - start[0], end[1] - start[1]) <= COINCIDENT) {
                    return [{ kind: "disc", center, radius }];
                }
                const middle = flat(this.shapes.edge.pointOnEdgeAtParam({ shape: edge, param: 0.5 }));
                return [{ kind: "point", at: start }, { kind: "point", at: end }, { kind: "disc", center, radius, range: arcRange(center, start, middle, end) }];
            });
        } finally {
            edges.forEach(edge => edge.delete());
        }
    }
}

function pointOf(value: unknown, property: string): Vec2 {
    if (!Array.isArray(value) || value.length !== 2 || !value.every(part => typeof part === "number" && Number.isFinite(part))) {
        throw new InputError(`\`${property}\` is not a 2D point: it needs two finite numbers.`, property);
    }
    return [value[0] as number, value[1] as number];
}

function unit3(vector: Vec3): Vec3 {
    return times(vector, 1 / Math.hypot(vector[0], vector[1], vector[2]));
}

/** The outward directions an arc covers, counterclockwise from where it starts, whichever way it runs. */
function arcRange(center: Vec2, start: Vec2, middle: Vec2, end: Vec2): { from: number; span: number } {
    const angle = (point: Vec2): number => Math.atan2(point[1] - center[1], point[0] - center[0]);
    const turn = (from: number, to: number): number => ((to - from) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const fromStart = turn(angle(start), angle(end));
    return turn(angle(start), angle(middle)) <= fromStart
        ? { from: angle(start), span: fromStart }
        : { from: angle(end), span: turn(angle(end), angle(start)) };
}
