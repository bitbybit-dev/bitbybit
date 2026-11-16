import type { Base } from "@bitbybit-dev/base";
import { InputError } from "@bitbybit-dev/base";
import { readDxfDrawing } from "@bitbybit-dev/base/lib/api/services/helpers/files/dxf/dxf-reader";
import type { WorkBudget } from "@bitbybit-dev/base/lib/api/services/helpers/files/work-budget";
import { checkedUnitOfLength } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/lengths";
import type { BitbybitOcctModule, TopoDS_Shape, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Inputs from "../../api/inputs";
import type * as Resolved from "../../api/resolved-inputs";
import type { OccHelper } from "../../occ-helper";
import type { FaceWarnings } from "./drawing-faces";
import { DrawingFaceBuilder, faceWorkBudgetFor } from "./drawing-faces";
import { MAX_FACE_EDGES, MAX_FACE_HOLES } from "./drawing-faces.constants";
import type { DrawingNumbers } from "./dxf-drawing-numbers";
import { drawingGroupsOf, drawingNumbersOf, kernelEdgeBudgetFor, leftOutWarnings } from "./dxf-drawing-numbers";
import { dxfTextOf } from "@bitbybit-dev/base/lib/api/services/helpers/files/dxf/dxf-file-text";
import { FACE_STEPS_PER_HEIGHT_CHECK, JOIN_TOLERANCE_ALWAYS_ALLOWED, JOIN_TOLERANCE_EXTENT_SHARE } from "./dxf-loader.constants";
import { shapeInModelAxes } from "./file-axes";
import { checkedNumber } from "./input-checks";
import { withKernelErrorsRead } from "./kernel-refusals";
import { release } from "./release";

const DXF_FACE_WARNINGS: FaceWarnings = {
    crossing: "Closed outlines on one layer of the DXF file cross one another; its faces follow how the outlines nest, which can differ from what was meant where they overlap.",
    overlapping: "So many closed outlines on one layer of the DXF file overlap one another that nesting them into faces would take too long; they are returned as their wires.",
    noArea: "A closed outline in the DXF file encloses no area, because it folds back on itself or crosses itself into equal and opposite parts; it is returned as its wire.",
    invalid: "A region bounded by closed outlines in the DXF file could not become a valid face, often because an outline crosses itself; it is returned as its outline wires.",
    holes: `A region bounded by closed outlines in the DXF file has more than ${MAX_FACE_HOLES} holes, more than one face is checked with; it is returned as its outline wires.`,
    edges: `A region bounded by closed outlines in the DXF file has more than ${MAX_FACE_EDGES} edges, more than one face is checked with; it is returned as its outline wires.`,
    budget: "Building faces took all the work one load of a DXF file its size may do; the closed outlines left are returned as their wires.",
    failed: reason => `Faces could not be built for a layer of the DXF file (${reason}); its outlines are returned as wires.`,
};


const LEAST_TOLERANCE = 1e-6;

interface FlatWire {
    readonly wire: TopoDS_Wire;
    readonly height: number;
}

const FARTHEST_NEAR_BUCKET = 2;

const NEAR_BUCKETS = [-FARTHEST_NEAR_BUCKET, -1, 0, 1, FARTHEST_NEAR_BUCKET];

export const levelsByHeight = (heights: readonly number[], tolerance: number): number[][] => {
    const levels: number[][] = [];
    const levelsInBucket = new Map<number, number[]>();
    heights.forEach((height, at) => {
        const bucket = Math.floor(height / tolerance);
        let joined: number | undefined;
        for (const offset of NEAR_BUCKETS) {
            for (const level of levelsInBucket.get(bucket + offset) ?? []) {
                if (Math.abs(heights[levels[level]![0]!]! - height) <= tolerance && (joined === undefined || level < joined)) {
                    joined = level;
                }
            }
        }
        if (joined !== undefined) {
            levels[joined]!.push(at);
            return;
        }
        const inBucket = levelsInBucket.get(bucket) ?? [];
        inBucket.push(levels.length);
        levelsInBucket.set(bucket, inBucket);
        levels.push([at]);
    });
    return levels;
};

const checkedJoinTolerance = (tolerance: number, drawn: DrawingNumbers, scale: number): void => {
    const extent = drawn.extent / scale;
    const most = Math.max(JOIN_TOLERANCE_ALWAYS_ALLOWED, extent * JOIN_TOLERANCE_EXTENT_SHARE);
    if (drawn.drawn > 0 && tolerance > most) {
        throw new InputError(`\`joinTolerance\` may be at most ${most}, a hundredth of the ${extent} units the drawing spans; it is ${tolerance}.`, "joinTolerance");
    }
};

export class DxfLoader {
    private readonly faceBuilder: DrawingFaceBuilder;

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
        this.faceBuilder = new DrawingFaceBuilder(occ, och, DXF_FACE_WARNINGS);
    }

    load(inputs: Resolved.OCCT.LoadDxfDto): Inputs.OCCT.DxfShapesResult<TopoDS_Shape> {
        const fileTolerance = checkedNumber(inputs.joinTolerance, "joinTolerance", 0);
        if (inputs.unit !== undefined) {
            checkedUnitOfLength(inputs.unit, "unit");
        }
        const text = dxfTextOf(inputs.dxf, "dxf");
        const drawing = readDxfDrawing(text, inputs.includeHiddenLayers);
        const warnings = [...drawing.warnings];
        const scale = this.scaleOf(drawing.unit, inputs.unit, warnings);
        const groups = drawingGroupsOf(drawing.entities);
        const drawn = drawingNumbersOf(groups, scale, kernelEdgeBudgetFor(text.length));
        checkedJoinTolerance(fileTolerance, drawn, scale);
        const joinTolerance = fileTolerance * scale;
        const built = withKernelErrorsRead(this.occ, () => this.occ.ShapesFromDrawing(drawn.numbers, joinTolerance));
        const flatTolerance = Math.max(joinTolerance, LEAST_TOLERANCE);
        const faceBudget = faceWorkBudgetFor(text.length);
        const parts: Inputs.OCCT.DxfShapePart<TopoDS_Shape>[] = [];
        try {
            for (const warning of leftOutWarnings(groups, [...drawn.leftOut, ...built.leftOut], drawn.refused)) {
                warnings.push(warning);
            }
            this.och.iteratorService.forEachShapeInCompound(built.shapes, (index, group) => {
                const shape = this.partShapeOf(group, inputs.makeFaces, flatTolerance, warnings, faceBudget);
                if (shape !== undefined) {
                    parts.push({ ...groups[index]!.style, shape });
                }
            });
        } catch (error) {
            parts.forEach(part => release(part.shape));
            throw error;
        } finally {
            built.shapes.delete();
        }
        const unit = inputs.unit !== undefined && drawing.unit !== undefined ? inputs.unit : drawing.unit;
        return { parts, ...(unit === undefined ? {} : { unit }), version: drawing.version, warnings: [...new Set(warnings)] };
    }

    private scaleOf(fileUnit: Base.unitOfLengthEnum | undefined, wanted: Base.unitOfLengthEnum | undefined, warnings: string[]): number {
        if (wanted === undefined) {
            return 1;
        }
        if (fileUnit === undefined) {
            warnings.push(`The file states no unit, so it was read as drawn and not scaled to ${wanted}.`);
            return 1;
        }
        return this.och.base.math.convertLength({ value: 1, from: fileUnit, to: wanted });
    }

    private partShapeOf(group: TopoDS_Shape, makeFaces: boolean, tolerance: number, warnings: string[], budget: WorkBudget): TopoDS_Shape | undefined {
        const wires: TopoDS_Wire[] = [];
        try {
            this.och.iteratorService.forEachShapeInCompound(group, (_index, child) => {
                wires.push(this.och.converterService.castAndRelease(child));
            });
            if (wires.length === 0) {
                return undefined;
            }
            if (!makeFaces) {
                return shapeInModelAxes(this.och, group, true);
            }
            return this.facedShapeOf(wires, tolerance, warnings, budget);
        } finally {
            wires.forEach(release);
            release(group);
        }
    }

    private facedShapeOf(wires: TopoDS_Wire[], tolerance: number, warnings: string[], budget: WorkBudget): TopoDS_Shape {
        const flat: FlatWire[] = [];
        const members: TopoDS_Shape[] = [];
        const faces: TopoDS_Shape[] = [];
        try {
            for (const wire of wires) {
                const height = this.affordedHeight(wire, tolerance, warnings, budget);
                if (height === undefined) {
                    members.push(wire);
                } else {
                    flat.push({ wire, height });
                }
            }
            for (const level of levelsByHeight(flat.map(wire => wire.height), tolerance)) {
                const built = this.faceBuilder.build(level.map(at => ({ wire: flat[at]!.wire })), "evenOdd", warnings, budget);
                for (const face of built.faces) {
                    faces.push(face);
                }
                for (const wire of built.unfaced) {
                    members.push(wire);
                }
            }
            return shapeInModelAxes(this.och, this.och.converterService.makeCompound({ shapes: [...faces, ...members] }), true);
        } finally {
            faces.forEach(release);
        }
    }

    private affordedHeight(wire: TopoDS_Wire, tolerance: number, warnings: string[], budget: WorkBudget): number | undefined {
        if (budget.exhausted) {
            return undefined;
        }
        if (!budget.spend(FACE_STEPS_PER_HEIGHT_CHECK)) {
            warnings.push(DXF_FACE_WARNINGS.budget);
            return undefined;
        }
        return this.flatClosedHeight(wire, tolerance);
    }

    private flatClosedHeight(wire: TopoDS_Wire, tolerance: number): number | undefined {
        const startPoint = this.och.wiresService.startPointOnWire({ shape: wire });
        const endPoint = this.och.wiresService.endPointOnWire({ shape: wire });
        if (this.och.base.point.distance({ startPoint, endPoint }) > tolerance) {
            return undefined;
        }
        const box = this.och.operationsService.boundingBoxOfShape({ shape: wire });
        return box.max[2] - box.min[2] <= tolerance ? box.center[2] : undefined;
    }
}
