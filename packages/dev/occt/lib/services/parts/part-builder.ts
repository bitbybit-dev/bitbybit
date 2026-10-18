import type { TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { BaseBitByBit } from "@bitbybit-dev/base";
import type * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import type { OCCTAnalysis } from "../analysis/analysis";
import { WORLD_FRAME } from "../base/frames";
import { checkedFrame } from "../base/input-checks";
import { kernelObjects, release, releasedOnError } from "../base/release";
import type { OCCTBooleans } from "../booleans";
import type { OCCTOperations } from "../operations";
import type { OCCTShapes } from "../shapes/shapes";
import type { OCCTRecipes } from "../recipes/recipes";
import { GROUND_FRAME } from "../sketch/sketch";
import type { OCCTSketch } from "../sketch/sketch";
import type { OCCTTransforms } from "../transforms";
import { spotOf } from "./face-spots";
import type { FaceRule, KnurlMesh, NamedSolid } from "./parts-types";
import { HEX_CORNER_TURN, HEX_CORNERS, PART_SEW_SHARE, SQRT_THREE, TRIANGLE_CORNERS } from "./parts.constants";
import { add3, polar2, scale3 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/vectors";
import { IDENTITY_MATRIX } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/matrices.constants";

type Point2 = Inputs.Base.Point2;

export const RADIAL_FRAME: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, -1, 0], direction: [1, 0, 0] };

export class PartBuilder {

    constructor(
        readonly shapes: OCCTShapes,
        readonly operations: OCCTOperations,
        readonly booleans: OCCTBooleans,
        private readonly transforms: OCCTTransforms,
        private readonly analysis: OCCTAnalysis,
        readonly base: BaseBitByBit,
        readonly sketch: OCCTSketch,
        readonly recipes: OCCTRecipes,
    ) { }

    revolved(outline: readonly Point2[]): TopoDS_Shape {
        const { own, releaseAll } = kernelObjects();
        try {
            const wire = own(this.shapes.wire.createPolygonWire({ points: outline.map(([radius, z]) => [radius, 0, z]) }));
            const face = own(this.shapes.face.createFaceFromWire({ shape: wire, planar: true }));
            return this.operations.revolve({ shape: face, angle: 360, direction: [0, 0, 1] });
        } finally {
            releaseAll();
        }
    }

    hexPrism(acrossFlats: number, from: number, to: number): TopoDS_Shape {
        return this.prism(this.hexCorners(acrossFlats, from), to - from);
    }

    hexWire(acrossFlats: number, z: number): TopoDS_Shape {
        return this.shapes.wire.createPolygonWire({ points: this.hexCorners(acrossFlats, z) });
    }

    sphereAbout(centre: Inputs.Base.Point3, axis: Inputs.Base.Vector3, side: Inputs.Base.Vector3, radius: number): TopoDS_Shape {
        const at = (along: number, across: number): Inputs.Base.Point3 => add3(scale3(axis, along), scale3(side, across));
        const { own, releaseAll } = kernelObjects();
        try {
            const meridian = own(this.shapes.edge.arcThroughThreePoints({ start: at(radius, 0), middle: at(0, radius), end: at(-radius, 0) }));
            const sphere = own(this.operations.revolve({ shape: meridian, angle: 360, direction: axis }));
            return this.transforms.translate({ shape: sphere, translation: centre });
        } finally {
            releaseAll();
        }
    }

    revolvedShell(outline: readonly Point2[]): TopoDS_Shape {
        const wire = this.shapes.wire.createPolylineWire({ points: outline.map(([radius, z]): Inputs.Base.Point3 => [radius, 0, z]) });
        try {
            return this.operations.revolve({ shape: wire, angle: 360, direction: [0, 0, 1] });
        } finally {
            wire.delete();
        }
    }

    revolvedProfile(commands: Models.OCCT.SketchCommand[], start: Point2): TopoDS_Shape {
        const face = this.sketch.pen({ commands, start, frame: RADIAL_FRAME, makeFace: true });
        try {
            return this.operations.revolve({ shape: face, angle: 360, direction: [0, 0, 1] });
        } finally {
            face.delete();
        }
    }

    extrudedProfile(commands: Models.OCCT.SketchCommand[], start: Point2, height: number): TopoDS_Shape {
        const face = this.sketch.pen({ commands, start, frame: WORLD_FRAME, makeFace: true });
        try {
            return this.operations.extrude({ shape: face, direction: [0, 0, height] });
        } finally {
            face.delete();
        }
    }

    faceWithHoles(outer: TopoDS_Shape, holes: readonly TopoDS_Shape[]): TopoDS_Shape {
        const reversed = holes.map(hole => this.shapes.wire.reversedWire({ shape: hole }));
        try {
            return reversed.length === 0
                ? this.shapes.face.createFaceFromWire({ shape: outer, planar: true })
                : this.shapes.face.createFaceFromWires({ shapes: [outer, ...reversed], planar: true });
        } finally {
            reversed.forEach(wire => wire.delete());
        }
    }

    facetedSolid(mesh: KnurlMesh, size: number): TopoDS_Shape {
        const recipe: Inputs.Base.Recipe = {
            format: "bitbybit.recipe",
            version: 1,
            millimetresPerUnit: 1,
            tolerance: size * PART_SEW_SHARE,
            buffers: { f64: Float64Array.from(mesh.positions), i32: Int32Array.from(mesh.indices) },
            nodes: [{ op: "triangles", positions: [0, mesh.positions.length], indices: [0, mesh.indices.length] }],
            roots: [{ node: 0, matrix: [...IDENTITY_MATRIX], tag: {} }],
        };
        return this.recipes.build({ recipe, facetedMeshes: true, maxTriangles: mesh.indices.length / TRIANGLE_CORNERS })[0]!;
    }

    solidOfFaces(makers: readonly (() => TopoDS_Shape)[], size: number): TopoDS_Shape {
        const faces: TopoDS_Shape[] = [];
        try {
            makers.forEach(make => faces.push(make()));
            return this.shapes.solid.fromFaces({ shapes: faces, tolerance: size * PART_SEW_SHARE });
        } finally {
            faces.forEach(face => face.delete());
        }
    }

    private hexCorners(acrossFlats: number, z: number): Inputs.Base.Point3[] {
        const corner = acrossFlats / SQRT_THREE;
        return Array.from({ length: HEX_CORNERS }, (_, index): Inputs.Base.Point3 => [...polar2(corner, HEX_CORNER_TURN + index * 2 * HEX_CORNER_TURN), z]);
    }

    prism(points: Inputs.Base.Point3[], height: number): TopoDS_Shape {
        const { own, releaseAll } = kernelObjects();
        try {
            const wire = own(this.shapes.wire.createPolygonWire({ points }));
            const face = own(this.shapes.face.createFaceFromWire({ shape: wire, planar: true }));
            return this.operations.extrude({ shape: face, direction: [0, 0, height] });
        } finally {
            releaseAll();
        }
    }

    common(shapes: TopoDS_Shape[], keepEdges = true): TopoDS_Shape {
        try {
            return this.soleSolid(this.booleans.intersection({ shapes, keepEdges }));
        } finally {
            shapes.forEach(shape => shape.delete());
        }
    }

    soleSolid(shape: TopoDS_Shape): TopoDS_Shape {
        const solids = this.shapes.solid.getSolids({ shape });
        if (solids.length !== 1) {
            solids.forEach(solid => solid.delete());
            return shape;
        }
        shape.delete();
        return solids[0]!;
    }

    frameOf(frame: Inputs.Base.Frame | undefined): Inputs.Base.Frame {
        return frame === undefined ? GROUND_FRAME : checkedFrame(frame, "frame");
    }

    oriented(shape: TopoDS_Shape, frame: Inputs.Base.Frame | undefined): TopoDS_Shape {
        try {
            return this.transforms.orient({ shape, from: WORLD_FRAME, to: this.frameOf(frame) });
        } finally {
            shape.delete();
        }
    }

    scaled(shape: TopoDS_Shape, factor: number): TopoDS_Shape {
        return this.transforms.scale({ shape, factor });
    }

    along(frame: Inputs.Base.Frame, distance: number): Inputs.Base.Frame {
        return this.base.frame.offset({ frame, distance });
    }

    placed(parts: readonly NamedSolid[], frame: Inputs.Base.Frame, frames: Record<string, Inputs.Base.Frame>): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        let compound: TopoDS_Shape | undefined;
        try {
            const roles: Record<string, number[]> = {};
            let offset = 0;
            parts.forEach(part => {
                const faces = this.shapes.face.getFaces({ shape: part.shape });
                try {
                    faces.forEach((face, index) => {
                        const box = this.analysis.measure.tightBoundingBox({ shape: face });
                        const role = part.rule(spotOf(this.analysis.surfaces.surfaceType({ shape: face }), box.min, box.max));
                        roles[role] = [...(roles[role] ?? []), offset + index];
                    });
                } finally {
                    faces.forEach(release);
                }
                offset += faces.length;
            });
            compound = parts.length === 1 ? undefined : this.shapes.compound.makeCompound({ shapes: parts.map(part => part.shape) });
            return { shape: this.transforms.orient({ shape: compound ?? parts[0]!.shape, from: WORLD_FRAME, to: frame }), roles, frames };
        } finally {
            compound?.delete();
            parts.forEach(part => part.shape.delete());
        }
    }

    named(shape: TopoDS_Shape, rule: FaceRule, frame: Inputs.Base.Frame | undefined, frameName: string): Models.OCCT.ShapeWithRoles<TopoDS_Shape> {
        const to = releasedOnError([shape], () => this.frameOf(frame));
        return this.placed([{ shape, rule }], to, { [frameName]: to });
    }
}
