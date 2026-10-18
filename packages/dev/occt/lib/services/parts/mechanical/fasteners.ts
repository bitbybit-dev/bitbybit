import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError, resolveDto } from "@bitbybit-dev/base";
import type { SetScrewSizes } from "@bitbybit-dev/base";
import * as Inputs from "../../../api/inputs";
import type * as Models from "../../../api/models";
import type * as Resolved from "../../../api/resolved-inputs";
import { checkedFlag, checkedWithin } from "../../base/input-checks";
import { kernelObjects, releasedOnError } from "../../base/release";
import { dowelPinRule, hexBoltRule, hexNutRule, setScrewRule, socketScrewRule, washerRule } from "./fastener-faces";
import type { PartBuilder } from "../part-builder";
import type { ScrewShape } from "../parts-types";
import type { ThreadCutter } from "./thread-cutter";
import {
    DOWEL_CHAMFER_SHARE, FACE_TOLERANCE_SHARE, HEAD_CHAMFER_SHARE, HEX_CHAMFER_START, HEX_CHAMFER_TAN, HEX_CORNER_EXTRA, SQRT_THREE,
} from "../parts.constants";

type Point2 = Inputs.Base.Point2;

const SEAT = "seat";

/**
 * Metric fasteners made from their ISO sizes in millimetres: cap screws with a hexagon recess in a
 * round head (ISO 4762), hexagon bolts (ISO 4017 and 4014), nuts (ISO 4032), plain washers (ISO 7089
 * and 7090), set screws (ISO 4026 to 4029) and dowel pins. Threads are cosmetic: a threaded length is a face of its own named `thread`, at the nominal
 * diameter on a screw and in a nut alike, so a part stays light and a screw in its nut touches it without overlapping;
 * cap screws and bolts can model it instead.
 * Each has a twin that names its faces and gives its `seat` frame.
 */
export class OCCTFasteners {

    constructor(private readonly build: PartBuilder, private readonly threads: ThreadCutter) { }

    /**
     * Makes an ISO 4762 cap screw: a round head with a hexagon recess for a key, and a shank threaded
     * from the tip for the length the standard gives, or to the head on a shorter screw.
     *
     * The head sits on the frame's origin and rises along its normal; the shank runs the other way.
     * `modelledThread` models the thread.
     * @param inputs - The size, the length under the head, whether the thread is modelled and the frame
     * @returns A new solid
     * @group fasteners
     * @shortname socket head cap screw
     * @drawable true
     * @example
     * ```typescript
     * const screw = await bitbybit.occt.parts.mechanical.fasteners.socketHeadCapScrew({ size: Bit.Inputs.Engineering.metricSizeEnum.m5, length: 20 });
     * ```
     */
    socketHeadCapScrew(inputs: Inputs.OCCT.SocketHeadCapScrewDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.SocketHeadCapScrewDto, inputs) as Resolved.OCCT.SocketHeadCapScrewDto;
        return this.socketScrew(resolved).shape;
    }

    /**
     * Makes a cap screw as `socketHeadCapScrew` does and names the role each face plays.
     *
     * The roles `head`, `recess`, `seat` (under the head), `shank`, `thread` and `end` (the tip) list
     * face indexes as `shapes.face.getFaces` numbers them; a screw threaded to its head has no
     * `shank`. The `seat` frame is the input frame.
     * @param inputs - The size, the length under the head, whether the thread is modelled and the frame
     * @returns The screw, the faces each role names and its seat
     * @group fasteners
     * @shortname socket head cap screw with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles, frames } = await bitbybit.occt.parts.mechanical.fasteners.socketHeadCapScrewWithRoles({ size: Bit.Inputs.Engineering.metricSizeEnum.m5, length: 20 });
     * ```
     */
    socketHeadCapScrewWithRoles(inputs: Inputs.OCCT.SocketHeadCapScrewDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.SocketHeadCapScrewDto, inputs) as Resolved.OCCT.SocketHeadCapScrewDto;
        return this.socketScrew(resolved);
    }

    /**
     * Makes a hexagon head bolt with chamfered top corners: threaded to the head after ISO 4017, or
     * after ISO 4014 only for the length the standard gives when `fullyThreaded` is false.
     *
     * The head sits on the frame's origin and rises along its normal, a flat facing the frame's
     * direction; the shank runs the other way. `modelledThread` cuts the thread.
     * @param inputs - The size, the length under the head, how far it is threaded, whether the thread is modelled and the frame
     * @returns A new solid
     * @group fasteners
     * @shortname hex bolt
     * @drawable true
     * @example
     * ```typescript
     * const bolt = await bitbybit.occt.parts.mechanical.fasteners.hexBolt({ size: Bit.Inputs.Engineering.metricSizeEnum.m8, length: 40, fullyThreaded: false, modelledThread: true });
     * ```
     */
    hexBolt(inputs: Inputs.OCCT.HexBoltDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.HexBoltDto, inputs) as Resolved.OCCT.HexBoltDto;
        return this.bolt(resolved).shape;
    }

    /**
     * Makes a hexagon head bolt as `hexBolt` does and names the role each face plays.
     *
     * The roles `head`, `seat` (under the head), `shank`, `thread` and `end` (the tip) list face
     * indexes as `shapes.face.getFaces` numbers them; a bolt threaded to its head has no `shank`. The
     * `seat` frame is the input frame.
     * @param inputs - The size, the length under the head, how far it is threaded and the frame
     * @returns The bolt, the faces each role names and its seat
     * @group fasteners
     * @shortname hex bolt with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.fasteners.hexBoltWithRoles({ size: Bit.Inputs.Engineering.metricSizeEnum.m8, length: 40 });
     * ```
     */
    hexBoltWithRoles(inputs: Inputs.OCCT.HexBoltDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.HexBoltDto, inputs) as Resolved.OCCT.HexBoltDto;
        return this.bolt(resolved);
    }

    /**
     * Makes an ISO 4032 hexagon nut, its corners chamfered on both sides and its hole at the thread's
     * nominal diameter, so a screw of its size passes through without overlapping it.
     *
     * Its bearing face lies on the frame's origin and it rises along the normal, a flat facing the
     * frame's direction.
     * @param inputs - The size and the frame
     * @returns A new solid
     * @group fasteners
     * @shortname hex nut
     * @drawable true
     * @example
     * ```typescript
     * const nut = await bitbybit.occt.parts.mechanical.fasteners.hexNut({ size: Bit.Inputs.Engineering.metricSizeEnum.m8 });
     * ```
     */
    hexNut(inputs: Inputs.OCCT.MetricFastenerDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.MetricFastenerDto, inputs) as Resolved.OCCT.MetricFastenerDto;
        return this.nut(resolved).shape;
    }

    /**
     * Makes a hexagon nut as `hexNut` does and names the role each face plays.
     *
     * The roles `seat` (the bearing face), `top`, `side` and `thread` (the hole) list face indexes as
     * `shapes.face.getFaces` numbers them. The `seat` frame is the input frame.
     * @param inputs - The size and the frame
     * @returns The nut, the faces each role names and its seat
     * @group fasteners
     * @shortname hex nut with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.fasteners.hexNutWithRoles({ size: Bit.Inputs.Engineering.metricSizeEnum.m8 });
     * ```
     */
    hexNutWithRoles(inputs: Inputs.OCCT.MetricFastenerDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.MetricFastenerDto, inputs) as Resolved.OCCT.MetricFastenerDto;
        return this.nut(resolved);
    }

    /**
     * Makes a plain washer: flat after ISO 7089, or after ISO 7090 with its outside chamfered on the
     * face away from the seat.
     *
     * Its bearing face lies on the frame's origin and it rises along the normal.
     * @param inputs - The size of the screw it goes under, whether it is chamfered and the frame
     * @returns A new solid
     * @group fasteners
     * @shortname washer
     * @drawable true
     * @example
     * ```typescript
     * const washer = await bitbybit.occt.parts.mechanical.fasteners.washer({ size: Bit.Inputs.Engineering.metricSizeEnum.m8 });
     * ```
     */
    washer(inputs: Inputs.OCCT.WasherDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.WasherDto, inputs) as Resolved.OCCT.WasherDto;
        return this.plainWasher(resolved).shape;
    }

    /**
     * Makes a plain washer as `washer` does and names the role each face plays.
     *
     * The roles `seat` (the bearing face), `top`, `bore` and `rim` (the chamfer too) list face
     * indexes as `shapes.face.getFaces` numbers them. The `seat` frame is the input frame.
     * @param inputs - The size of the screw it goes under, whether it is chamfered and the frame
     * @returns The washer, the faces each role names and its seat
     * @group fasteners
     * @shortname washer with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.fasteners.washerWithRoles({ size: Bit.Inputs.Engineering.metricSizeEnum.m8 });
     * ```
     */
    washerWithRoles(inputs: Inputs.OCCT.WasherDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.WasherDto, inputs) as Resolved.OCCT.WasherDto;
        return this.plainWasher(resolved);
    }

    /**
     * Makes a set screw with a hexagon recess, threaded its whole length, its point flat, cone, dog
     * or cup as ISO 4026 to 4029 give them, the recess as deep as they ask of its length.
     *
     * Its recessed end lies on the frame's origin and it runs against the normal.
     * @param inputs - The size, the length, the point and the frame
     * @returns A new solid
     * @group fasteners
     * @shortname set screw
     * @drawable true
     * @example
     * ```typescript
     * const grub = await bitbybit.occt.parts.mechanical.fasteners.setScrew({ size: Bit.Inputs.Engineering.metricSizeEnum.m4, length: 6, point: Bit.Inputs.Engineering.setScrewPointEnum.cone });
     * ```
     */
    setScrew(inputs: Inputs.OCCT.SetScrewDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.SetScrewDto, inputs) as Resolved.OCCT.SetScrewDto;
        return this.grub(resolved).shape;
    }

    /**
     * Makes a set screw as `setScrew` does and names the role each face plays.
     *
     * The roles `top` (the recessed end), `recess`, `thread` and `end` (the point) list face indexes as
     * `shapes.face.getFaces` numbers them. The `top` frame is the input frame.
     * @param inputs - The size, the length, the point and the frame
     * @returns The set screw, the faces each role names and its top
     * @group fasteners
     * @shortname set screw with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.fasteners.setScrewWithRoles({ size: Bit.Inputs.Engineering.metricSizeEnum.m4, length: 6 });
     * ```
     */
    setScrewWithRoles(inputs: Inputs.OCCT.SetScrewDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.SetScrewDto, inputs) as Resolved.OCCT.SetScrewDto;
        return this.grub(resolved);
    }

    /**
     * Makes a cylindrical dowel pin with a 45 degree chamfer of a tenth of its diameter at each end,
     * after ISO 2338.
     *
     * It starts at the frame's origin and runs along the normal.
     * @param inputs - The diameter, the length and the frame
     * @returns A new solid
     * @group fasteners
     * @shortname dowel pin
     * @drawable true
     * @example
     * ```typescript
     * const pin = await bitbybit.occt.parts.mechanical.fasteners.dowelPin({ diameter: 4, length: 16 });
     * ```
     */
    dowelPin(inputs: Inputs.OCCT.DowelPinDto): TopoDS_Shape {
        const resolved = resolveDto(Inputs.OCCT.DowelPinDto, inputs) as Resolved.OCCT.DowelPinDto;
        return this.pin(resolved).shape;
    }

    /**
     * Makes a dowel pin as `dowelPin` does and names the role each face plays.
     *
     * The roles `side` and `end` (both ends with their chamfers) list face indexes as
     * `shapes.face.getFaces` numbers them. The `end` frame is the input frame.
     * @param inputs - The diameter, the length and the frame
     * @returns The pin, the faces each role names and its end
     * @group fasteners
     * @shortname dowel pin with roles
     * @drawable false
     * @example
     * ```typescript
     * const { shape, roles } = await bitbybit.occt.parts.mechanical.fasteners.dowelPinWithRoles({ diameter: 4, length: 16 });
     * ```
     */
    dowelPinWithRoles(inputs: Inputs.OCCT.DowelPinDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const resolved = resolveDto(Inputs.OCCT.DowelPinDto, inputs) as Resolved.OCCT.DowelPinDto;
        return this.pin(resolved);
    }

    private socketScrew(resolved: Resolved.OCCT.SocketHeadCapScrewDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const size = resolved.size;
        const modelled = checkedFlag(resolved.modelledThread, "modelledThread");
        const thread = this.build.base.engineering.mechanical.threads.metricThread({ size });
        const head = this.build.base.engineering.mechanical.fasteners.socketHeadCapScrewSizes({ size });
        const screw = this.screwShape(thread.diameter, thread.minorDiameter, checkedWithin(resolved.length, "length", { above: 0 }), head.threadLength, head.socketSize, head.headHeight - head.socketDepth);
        const radius = thread.diameter / 2;
        const tip = (thread.diameter - thread.minorDiameter) / 2;
        const top = head.headDiameter * HEAD_CHAMFER_SHARE;
        const outline: Point2[] = [
            [0, -screw.length], [radius - tip, -screw.length], [radius, tip - screw.length], ...this.threadEnd(screw, radius),
            [radius, 0], [head.headDiameter / 2, 0], [head.headDiameter / 2, head.headHeight - top], [head.headDiameter / 2 - top, head.headHeight],
        ];
        const shape = this.threadedIf(this.recessed(outline, head.socketSize, screw.socketBottom, thread.diameter), size, screw, modelled);
        return this.build.named(shape, socketScrewRule(screw, thread.diameter * FACE_TOLERANCE_SHARE), resolved.frame, SEAT);
    }

    private bolt(resolved: Resolved.OCCT.HexBoltDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const size = resolved.size;
        const modelled = checkedFlag(resolved.modelledThread, "modelledThread");
        const thread = this.build.base.engineering.mechanical.threads.metricThread({ size });
        const length = checkedWithin(resolved.length, "length", { above: 0 });
        const sizes = this.build.base.engineering.mechanical.fasteners.hexBoltSizes({ size, length });
        const threaded = checkedFlag(resolved.fullyThreaded, "fullyThreaded") ? length : sizes.threadLength;
        const screw = this.screwShape(thread.diameter, thread.minorDiameter, length, threaded, sizes.acrossFlats, 0);
        const radius = thread.diameter / 2;
        const tip = (thread.diameter - thread.minorDiameter) / 2;
        const shank: Point2[] = [[0, -length], [radius - tip, -length], [radius, tip - length], ...this.threadEnd(screw, radius), [radius, 0]];
        const shape = this.threadedIf(this.chamferedHex(sizes.acrossFlats, -length, sizes.headHeight, shank, [[0, sizes.headHeight]], false), size, screw, modelled);
        return this.build.named(shape, hexBoltRule(screw, thread.diameter * FACE_TOLERANCE_SHARE), resolved.frame, SEAT);
    }

    private nut(resolved: Resolved.OCCT.MetricFastenerDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const size = resolved.size;
        const thread = this.build.base.engineering.mechanical.threads.metricThread({ size });
        const sizes = this.build.base.engineering.mechanical.fasteners.hexNutSizes({ size });
        const radius = thread.diameter / 2;
        const shape = this.chamferedHex(sizes.acrossFlats, 0, sizes.height, [[radius, 0]], [[radius, sizes.height]], true);
        return this.build.named(shape, hexNutRule(radius, sizes.height, thread.diameter * FACE_TOLERANCE_SHARE), resolved.frame, SEAT);
    }

    private plainWasher(resolved: Resolved.OCCT.WasherDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const size = resolved.size;
        const sizes = checkedFlag(resolved.chamfered, "chamfered") ? this.build.base.engineering.mechanical.fasteners.chamferedWasherSizes({ size }) : { ...this.build.base.engineering.mechanical.fasteners.washerSizes({ size }), chamferHeight: 0, chamferWidth: 0 };
        const inner = sizes.innerDiameter / 2;
        const outer = sizes.outerDiameter / 2;
        const edge: Point2[] = sizes.chamferHeight > 0 ? [[outer, sizes.thickness - sizes.chamferHeight], [outer - sizes.chamferWidth, sizes.thickness]] : [[outer, sizes.thickness]];
        const shape = this.build.revolved([[inner, 0], [outer, 0], ...edge, [inner, sizes.thickness]]);
        return this.build.named(shape, washerRule(inner, sizes.thickness, sizes.innerDiameter * FACE_TOLERANCE_SHARE), resolved.frame, SEAT);
    }

    private grub(resolved: Resolved.OCCT.SetScrewDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const size = resolved.size;
        const thread = this.build.base.engineering.mechanical.threads.metricThread({ size });
        const length = checkedWithin(resolved.length, "length", { above: 0 });
        const sizes = this.build.base.engineering.mechanical.fasteners.setScrewSizes({ size, point: resolved.point, length });
        const radius = thread.diameter / 2;
        const root = thread.minorDiameter / 2;
        const tip = radius - root;
        const point = this.pointOutline(resolved.point, sizes, root, length);
        const pointTop = point[point.length - 1]![1] + length + tip;
        if (!(length > sizes.socketDepth + pointTop + tip)) {
            throw new InputError(`\`length\` is too short for the recess and the ${resolved.point} point of an ${size} set screw: make it more than ${String(sizes.socketDepth + pointTop + tip)}.`, "length");
        }
        const screw = this.screwShape(thread.diameter, thread.minorDiameter, length, length, sizes.socketSize, -sizes.socketDepth);
        const shape = this.recessed([...point, [radius, point[point.length - 1]![1] + tip], [radius, -tip], [root, 0]], sizes.socketSize, -sizes.socketDepth, thread.diameter);
        return this.build.named(shape, setScrewRule(screw, thread.diameter * FACE_TOLERANCE_SHARE), resolved.frame, "top");
    }

    private pointOutline(point: Inputs.Engineering.setScrewPointEnum, sizes: SetScrewSizes, root: number, length: number): Point2[] {
        const bottom = -length;
        const half = sizes.pointDiameter / 2;
        if (point === Inputs.Engineering.setScrewPointEnum.cup) {
            return [[0, bottom + sizes.pointLength], [half, bottom], [root, bottom + root - half]];
        }
        if (point === Inputs.Engineering.setScrewPointEnum.cone) {
            return [[0, bottom], ...(half > 0 ? [[half, bottom] as Point2] : []), [root, bottom + sizes.pointLength]];
        }
        if (point === Inputs.Engineering.setScrewPointEnum.dog) {
            const dog = sizes.pointLength - (root - half);
            return [[0, bottom], [half, bottom], [half, bottom + dog], [root, bottom + sizes.pointLength]];
        }
        return [[0, bottom], [half, bottom], [root, bottom + sizes.pointLength]];
    }

    private pin(resolved: Resolved.OCCT.DowelPinDto): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const diameter = checkedWithin(resolved.diameter, "diameter", { above: 0 });
        const length = checkedWithin(resolved.length, "length", { above: 0 });
        const chamfer = diameter * DOWEL_CHAMFER_SHARE;
        if (!(length > 2 * chamfer)) {
            throw new InputError(`\`length\` is too short for the chamfers at both ends: make it more than ${String(2 * chamfer)}.`, "length");
        }
        const radius = diameter / 2;
        const shape = this.build.revolved([[0, 0], [radius - chamfer, 0], [radius, chamfer], [radius, length - chamfer], [radius - chamfer, length], [0, length]]);
        return this.build.named(shape, dowelPinRule(), resolved.frame, "end");
    }

    private screwShape(diameter: number, minorDiameter: number, length: number, threadLength: number, socketSize: number, socketBottom: number): ScrewShape {
        const tip = (diameter - minorDiameter) / 2;
        if (!(length > 2 * tip)) {
            throw new InputError(`\`length\` is too short for the chamfer at the tip: make it more than ${String(2 * tip)}.`, "length");
        }
        return { diameter, length, tip, threaded: Math.min(length, threadLength), socketReach: socketSize / SQRT_THREE, socketBottom };
    }

    private threadedIf(shape: TopoDS_Shape, size: Inputs.Engineering.metricSizeEnum, screw: ScrewShape, modelled: boolean): TopoDS_Shape {
        if (!modelled) {
            return shape;
        }
        let tool: TopoDS_Shape | undefined;
        try {
            tool = this.threads.tool({ size, length: screw.threaded, internal: false, frame: { origin: [0, 0, screw.threaded - screw.length], normal: [0, 0, 1], direction: [1, 0, 0] } });
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
