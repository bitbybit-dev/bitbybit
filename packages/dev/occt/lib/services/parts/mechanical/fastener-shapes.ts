import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import type { HexBoltSizes, HexNutSizes, SetScrewSizes, SocketHeadCapScrewSizes, ThreadSizes, WasherSizes } from "@bitbybit-dev/base";
import type * as Inputs from "../../../api/inputs";
import type * as Models from "../../../api/models";
import { checkedWithin } from "../../base/input-checks";
import { kernelObjects, releasedOnError } from "../../base/release";
import { dowelPinRule, hexBoltRule, hexNutRule, setScrewRule, socketScrewRule, washerRule } from "./fastener-faces";
import type { PartBuilder } from "../part-builder";
import type { ScrewShape, SetScrewPointShape } from "../parts-types";
import type { ThreadCutter } from "./thread-cutter";
import {
    DOWEL_CHAMFER_SHARE, FACE_TOLERANCE_SHARE, HEAD_CHAMFER_SHARE, HEX_CHAMFER_START, HEX_CHAMFER_TAN, HEX_CORNER_EXTRA, OVAL_POINT_SEGMENTS, SQRT_THREE,
} from "../parts.constants";

type Point2 = Inputs.Base.Point2;
type Unit = Inputs.Base.unitOfLengthEnum;

const SEAT = "seat";

export class FastenerShapes {

    constructor(readonly build: PartBuilder, private readonly threads: ThreadCutter) { }

    socketScrew(thread: ThreadSizes, head: SocketHeadCapScrewSizes, length: number, modelled: boolean, unit: Unit, frame: Inputs.Base.Frame | undefined): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const screw = this.screwShape(thread.diameter, thread.minorDiameter, checkedWithin(length, "length", { above: 0 }), head.threadLength, head.socketSize, head.headHeight - head.socketDepth);
        const radius = thread.diameter / 2;
        const tip = (thread.diameter - thread.minorDiameter) / 2;
        const top = head.headDiameter * HEAD_CHAMFER_SHARE;
        const outline: Point2[] = [
            [0, -screw.length], [radius - tip, -screw.length], [radius, tip - screw.length], ...this.threadEnd(screw, radius),
            [radius, 0], [head.headDiameter / 2, 0], [head.headDiameter / 2, head.headHeight - top], [head.headDiameter / 2 - top, head.headHeight],
        ];
        const shape = this.threadedIf(this.recessed(outline, head.socketSize, screw.socketBottom, thread.diameter), thread, screw, modelled, unit);
        return this.build.named(shape, socketScrewRule(screw, thread.diameter * FACE_TOLERANCE_SHARE), frame, SEAT);
    }

    bolt(thread: ThreadSizes, sizes: HexBoltSizes, length: number, fullyThreaded: boolean, modelled: boolean, unit: Unit, frame: Inputs.Base.Frame | undefined): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const threaded = fullyThreaded ? length : sizes.threadLength;
        const screw = this.screwShape(thread.diameter, thread.minorDiameter, length, threaded, sizes.acrossFlats, 0);
        const radius = thread.diameter / 2;
        const tip = (thread.diameter - thread.minorDiameter) / 2;
        const shank: Point2[] = [[0, -length], [radius - tip, -length], [radius, tip - length], ...this.threadEnd(screw, radius), [radius, 0]];
        const shape = this.threadedIf(this.chamferedHex(sizes.acrossFlats, -length, sizes.headHeight, shank, [[0, sizes.headHeight]], false), thread, screw, modelled, unit);
        return this.build.named(shape, hexBoltRule(screw, thread.diameter * FACE_TOLERANCE_SHARE), frame, SEAT);
    }

    nut(thread: ThreadSizes, sizes: HexNutSizes, frame: Inputs.Base.Frame | undefined): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const radius = thread.diameter / 2;
        const shape = this.chamferedHex(sizes.acrossFlats, 0, sizes.height, [[radius, 0]], [[radius, sizes.height]], true);
        return this.build.named(shape, hexNutRule(radius, sizes.height, thread.diameter * FACE_TOLERANCE_SHARE), frame, SEAT);
    }

    washer(sizes: WasherSizes, chamferHeight: number, chamferWidth: number, frame: Inputs.Base.Frame | undefined): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const inner = sizes.innerDiameter / 2;
        const outer = sizes.outerDiameter / 2;
        const edge: Point2[] = chamferHeight > 0 ? [[outer, sizes.thickness - chamferHeight], [outer - chamferWidth, sizes.thickness]] : [[outer, sizes.thickness]];
        const shape = this.build.revolved([[inner, 0], [outer, 0], ...edge, [inner, sizes.thickness]]);
        return this.build.named(shape, washerRule(inner, sizes.thickness, sizes.innerDiameter * FACE_TOLERANCE_SHARE), frame, SEAT);
    }

    setScrew(thread: ThreadSizes, sizes: SetScrewSizes, point: SetScrewPointShape, length: number, designation: string, frame: Inputs.Base.Frame | undefined): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const radius = thread.diameter / 2;
        const root = thread.minorDiameter / 2;
        const tip = radius - root;
        const outline = this.pointOutline(point, sizes, root, length);
        const pointTop = outline[outline.length - 1]![1] + length + tip;
        if (!(length > sizes.socketDepth + pointTop + tip)) {
            throw new InputError(`\`length\` is too short for the recess and the ${point} point of an ${designation} set screw: make it more than ${String(sizes.socketDepth + pointTop + tip)}.`, "length");
        }
        const screw = this.screwShape(thread.diameter, thread.minorDiameter, length, length, sizes.socketSize, -sizes.socketDepth);
        const shape = this.recessed([...outline, [radius, outline[outline.length - 1]![1] + tip], [radius, -tip], [root, 0]], sizes.socketSize, -sizes.socketDepth, thread.diameter);
        return this.build.named(shape, setScrewRule(screw, thread.diameter * FACE_TOLERANCE_SHARE), frame, "top");
    }

    pin(diameter: number, length: number, frame: Inputs.Base.Frame | undefined): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const across = checkedWithin(diameter, "diameter", { above: 0 });
        const along = checkedWithin(length, "length", { above: 0 });
        const chamfer = across * DOWEL_CHAMFER_SHARE;
        if (!(along > 2 * chamfer)) {
            throw new InputError(`\`length\` is too short for the chamfers at both ends: make it more than ${String(2 * chamfer)}.`, "length");
        }
        const radius = across / 2;
        const shape = this.build.revolved([[0, 0], [radius - chamfer, 0], [radius, chamfer], [radius, along - chamfer], [radius - chamfer, along], [0, along]]);
        return this.build.named(shape, dowelPinRule(), frame, "end");
    }

    private pointOutline(point: SetScrewPointShape, sizes: SetScrewSizes, root: number, length: number): Point2[] {
        const bottom = -length;
        const half = sizes.pointDiameter / 2;
        if (point === "cup") {
            return [[0, bottom + sizes.pointLength], [half, bottom], [root, bottom + root - half]];
        }
        if (point === "cone") {
            return [[0, bottom], ...(half > 0 ? [[half, bottom] as Point2] : []), [root, bottom + sizes.pointLength]];
        }
        if (point === "oval") {
            const reach = Math.asin(Math.min(1, root / sizes.pointRadius));
            return Array.from({ length: OVAL_POINT_SEGMENTS + 1 }, (_, index): Point2 => {
                const turn = reach * index / OVAL_POINT_SEGMENTS;
                return [sizes.pointRadius * Math.sin(turn), bottom + sizes.pointRadius * (1 - Math.cos(turn))];
            });
        }
        if (point === "dog") {
            const dog = sizes.pointLength - (root - half);
            return [[0, bottom], [half, bottom], [half, bottom + dog], [root, bottom + sizes.pointLength]];
        }
        return [[0, bottom], [half, bottom], [root, bottom + sizes.pointLength]];
    }

    private screwShape(diameter: number, minorDiameter: number, length: number, threadLength: number, socketSize: number, socketBottom: number): ScrewShape {
        const tip = (diameter - minorDiameter) / 2;
        if (!(length > 2 * tip)) {
            throw new InputError(`\`length\` is too short for the chamfer at the tip: make it more than ${String(2 * tip)}.`, "length");
        }
        return { diameter, length, tip, threaded: Math.min(length, threadLength), socketReach: socketSize / SQRT_THREE, socketBottom };
    }

    private threadedIf(shape: TopoDS_Shape, thread: ThreadSizes, screw: ScrewShape, modelled: boolean, unit: Unit): TopoDS_Shape {
        if (!modelled) {
            return shape;
        }
        let tool: TopoDS_Shape | undefined;
        try {
            tool = this.threads.tool(thread, { length: screw.threaded, internal: false, unit, frame: { origin: [0, 0, screw.threaded - screw.length], normal: [0, 0, 1], direction: [1, 0, 0] } });
            return this.build.soleSolid(this.build.booleans.difference({ shape, shapes: [tool], keepEdges: false }));
        } finally {
            tool?.delete();
            shape.delete();
        }
    }

    private threadEnd(screw: ScrewShape, radius: number): Point2[] {
        return screw.threaded < screw.length ? [[radius, screw.threaded - screw.length]] : [];
    }

    private recessed(outline: Point2[], socketSize: number, socketBottom: number, size: number): TopoDS_Shape {
        const [edge, top] = outline[outline.length - 1]!;
        const { own, releaseAll } = kernelObjects();
        try {
            const rim = own(this.build.shapes.wire.createCircleWire({ radius: edge, center: [0, 0, top], direction: [0, 0, 1] }));
            const mouth = own(this.build.hexWire(socketSize, top));
            const floor = own(this.build.hexWire(socketSize, socketBottom));
            return this.build.solidOfFaces([
                () => this.build.revolvedShell(outline),
                () => this.build.faceWithHoles(rim, [mouth]),
                () => this.build.operations.extrude({ shape: floor, direction: [0, 0, top - socketBottom] }),
                () => this.build.faceWithHoles(floor, []),
            ], size);
        } finally {
            releaseAll();
        }
    }

    private chamferedHex(acrossFlats: number, from: number, height: number, below: Point2[], above: Point2[], bothSides: boolean): TopoDS_Shape {
        const start = acrossFlats * HEX_CHAMFER_START / 2;
        const beyond = acrossFlats / SQRT_THREE * (1 + HEX_CORNER_EXTRA);
        const rise = (beyond - start) * HEX_CHAMFER_TAN;
        const bottom: Point2[] = bothSides ? [[start, 0], [beyond, rise]] : [[beyond, 0]];
        const turned = this.build.revolved([...below, ...bottom, [beyond, height - rise], [start, height], ...above]);
        return this.build.common([releasedOnError([turned], () => this.build.hexPrism(acrossFlats, from, height)), turned]);
    }
}
