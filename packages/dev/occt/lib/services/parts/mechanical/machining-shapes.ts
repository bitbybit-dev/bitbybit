import type { TopoDS_Shape } from "../../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { InputError } from "@bitbybit-dev/base";
import type { InvoluteSplineSizes, KnurlSizes, ParallelKeySizes, RetainingRingSizes, SpurGearSpec } from "@bitbybit-dev/base";
import { spurGearOutline } from "@bitbybit-dev/base/lib/api/gears/gears";
import * as Inputs from "../../../api/inputs";
import { checkedWithin } from "../../base/input-checks";
import type { OCCTSketch } from "../../sketch/sketch";
import { gearPen } from "./gear-pen";
import { diamondKnurlMesh } from "./knurl-mesh";
import { WORLD_FRAME } from "../../base/frames";
import type { PartBuilder } from "../part-builder";
import type { ThreadCutter } from "./thread-cutter";
import { CUTTER_OVERSHOOT, FULL_TURN_DEGREES, MOST_TWIST_SECTIONS, TWIST_STEP } from "../parts.constants";
import { add3, polar2, scale3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";

type Point3 = Inputs.Base.Point3;

export class MachiningShapes {

    constructor(
        private readonly sketch: OCCTSketch,
        readonly build: PartBuilder,
        readonly threads: ThreadCutter,
    ) { }

    cutFrom(shape: TopoDS_Shape, tool: TopoDS_Shape): TopoDS_Shape {
        let cut: TopoDS_Shape;
        try {
            cut = this.build.booleans.difference({ shape, shapes: [tool], keepEdges: false });
        } finally {
            tool.delete();
        }
        const solids = this.build.shapes.solid.getSolids({ shape: cut });
        solids.forEach(solid => solid.delete());
        if (solids.length === 0) {
            cut.delete();
            throw new InputError("`shape` lies wholly inside the cut, so nothing of it is left: size the cut to the shape, or move it with `frame`.", "shape");
        }
        return cut;
    }

    keywayCutter(key: ParallelKeySizes, diameter: number, length: number, inHub: boolean, frame: Inputs.Base.Frame | undefined): TopoDS_Shape {
        const radius = diameter / 2;
        const over = diameter * CUTTER_OVERSHOOT;
        const half = key.width / 2;
        if (inHub) {
            return this.build.oriented(this.box([0, -half, -over], [radius + key.hubDepth, half, length + over]), frame);
        }
        if (!(length > key.width)) {
            throw new InputError(`\`length\` is not more than the keyway's width, ${String(key.width)}, so it has no straight sides.`, "length");
        }
        const bottom = radius - key.shaftDepth;
        const face = this.sketch.pen({
            commands: [
                { type: "line", to: [length - half, -half], relative: false },
                { type: "threePointArc", through: [length, 0], to: [length - half, half], relative: false },
                { type: "line", to: [half, half], relative: false },
                { type: "threePointArc", through: [0, 0], to: [half, -half], relative: false },
            ],
            start: [half, -half],
            frame: { origin: [bottom, 0, 0], normal: [1, 0, 0], direction: [0, 0, 1] },
            makeFace: true,
        });
        try {
            return this.build.oriented(this.build.operations.extrude({ shape: face, direction: [key.shaftDepth + over, 0, 0] }), frame);
        } finally {
            face.delete();
        }
    }

    flatCutter(diameter: number, depthOf: number, lengthOf: number, frame: Inputs.Base.Frame | undefined): TopoDS_Shape {
        const radius = checkedWithin(diameter, "diameter", { above: 0 }) / 2;
        const depth = checkedWithin(depthOf, "depth", { above: 0 });
        if (!(depth < 2 * radius)) {
            throw new InputError("`depth` cuts through the whole shaft: make it less than the diameter.", "depth");
        }
        const length = checkedWithin(lengthOf, "length", { above: 0 });
        const over = radius * CUTTER_OVERSHOOT;
        return this.build.oriented(this.box([radius - depth, -radius - over, 0], [radius + over, radius + over, length]), frame);
    }

    grooveCutter(sizes: RetainingRingSizes, onShaft: boolean, frame: Inputs.Base.Frame | undefined): TopoDS_Shape {
        const over = sizes.nominal * CUTTER_OVERSHOOT;
        const ring = (outer: number, inner: number): TopoDS_Shape => this.build.revolved([[inner, 0], [outer, 0], [outer, sizes.grooveWidth], [inner, sizes.grooveWidth]]);
        const cutter = onShaft
            ? ring(sizes.nominal / 2 + over, sizes.grooveDiameter / 2)
            : ring(sizes.grooveDiameter / 2, sizes.nominal / 2 - over);
        return this.build.oriented(cutter, frame);
    }

    knurlCutter(knurl: KnurlSizes, diameter: number, length: number, pattern: Inputs.Engineering.knurlPatternEnum, frame: Inputs.Base.Frame | undefined): TopoDS_Shape {
        const crest = knurl.diameter / 2;
        const star = (turn: number, z: number): Point3[] => {
            const start = this.build.base.math.degToRad({ number: turn });
            return Array.from({ length: 2 * knurl.grooves }, (_, index): Point3 => [...polar2(index % 2 === 0 ? crest : crest - knurl.depth, start + Math.PI * index / knurl.grooves), z]);
        };
        const helix = Math.tan(this.build.base.math.degToRad({ number: knurl.helixAngle }));
        const twist = FULL_TURN_DEGREES * length * helix / (Math.PI * knurl.diameter);
        if (Math.ceil(Math.abs(twist) / TWIST_STEP) > MOST_TWIST_SECTIONS) {
            throw new InputError(`\`length\` twists the grooves through ${String(Math.round(Math.abs(twist)))} degrees, more than the ${String(MOST_TWIST_SECTIONS * TWIST_STEP)} a knurl is modelled with: make it shorter.`, "length");
        }
        const outside = Math.max(crest, diameter / 2) * (1 + CUTTER_OVERSHOOT);
        const wire = this.build.shapes.wire;
        const grooves = (sense: number): TopoDS_Shape => {
            const steps = twist === 0 ? 1 : Math.max(1, Math.ceil(twist / TWIST_STEP));
            const sections = Array.from({ length: steps + 1 }, (_, index) => wire.createPolygonWire({ points: star(sense * twist * index / steps, length * index / steps) }));
            const rims = [0, length].map(z => wire.createCircleWire({ radius: outside, center: [0, 0, z], direction: [0, 0, 1] }));
            try {
                const flanks = twist === 0
                    ? this.build.operations.extrude({ shape: sections[0]!, direction: [0, 0, length] })
                    : this.build.operations.loft({ shapes: sections, makeSolid: false });
                return this.build.solidOfFaces([
                    () => flanks,
                    () => this.build.operations.extrude({ shape: rims[0]!, direction: [0, 0, length] }),
                    () => this.build.faceWithHoles(rims[0]!, [sections[0]!]),
                    () => this.build.faceWithHoles(rims[1]!, [sections[sections.length - 1]!]),
                ], knurl.diameter);
            } finally {
                [...sections, ...rims].forEach(shape => shape.delete());
            }
        };
        const cutter = pattern === Inputs.Engineering.knurlPatternEnum.diamond
            ? this.build.facetedSolid(diamondKnurlMesh({ crest, root: crest - knurl.depth, grooves: knurl.grooves, twist: helix / crest, length, outside }), knurl.diameter)
            : grooves(pattern === Inputs.Engineering.knurlPatternEnum.left ? -1 : 1);
        return this.build.oriented(cutter, frame);
    }

    splineShaft(spline: InvoluteSplineSizes, length: number, frame: Inputs.Base.Frame | undefined): TopoDS_Shape {
        return this.splineSolid(this.splineSpec(spline.module, spline.teeth, spline.profileShift, spline.shaftTipDiameter, spline.shaftRootDiameter, spline.rootFillet, spline.pressureAngle), 0, checkedWithin(length, "length", { above: 0 }), frame);
    }

    hubCutter(spline: InvoluteSplineSizes, length: number, frame: Inputs.Base.Frame | undefined): TopoDS_Shape {
        const along = checkedWithin(length, "length", { above: 0 });
        const over = spline.referenceDiameter * CUTTER_OVERSHOOT;
        return this.splineSolid(this.splineSpec(spline.module, spline.teeth, spline.profileShift, spline.hubRootDiameter, spline.hubTipDiameter, 0, spline.pressureAngle), -over, along + 2 * over, frame);
    }

    private box(from: Point3, to: Point3): TopoDS_Shape {
        return this.build.shapes.solid.createBox({ width: to[0] - from[0], length: to[2] - from[2], height: to[1] - from[1], center: scale3(add3(from, to), 1 / 2), originOnCenter: true });
    }

    private splineSpec(module: number, teeth: number, profileShift: number, tipDiameter: number, rootDiameter: number, rootFillet: number, pressureAngle: number): SpurGearSpec {
        const pitchRadius = module * teeth / 2;
        return {
            module,
            teeth,
            pressureAngle,
            profileShift,
            backlash: 0,
            addendum: (tipDiameter / 2 - pitchRadius) / module - profileShift,
            dedendum: (pitchRadius - rootDiameter / 2) / module + profileShift,
            rootFillet,
        };
    }

    private splineSolid(spec: SpurGearSpec, from: number, length: number, frame: Inputs.Base.Frame | undefined): TopoDS_Shape {
        const pen = gearPen(spurGearOutline(spec, [0, 0], 0));
        const start = this.build.along(WORLD_FRAME, from);
        const face = this.sketch.pen({ commands: pen.commands, start: pen.start, frame: start, makeFace: true });
        try {
            return this.build.oriented(this.build.operations.extrude({ shape: face, direction: [0, 0, length] }), frame);
        } finally {
            face.delete();
        }
    }
}
