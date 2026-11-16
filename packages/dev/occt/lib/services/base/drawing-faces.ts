import type { Base } from "@bitbybit-dev/base";
import { WorkBudget } from "@bitbybit-dev/base/lib/api/services/helpers/files/work-budget";
import type { BitbybitOcctModule, TopoDS_Face, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type { OccHelper } from "../../occ-helper";
import { deleteQuietly } from "./path-builder";
import type { FillRule2, NestingOutline2 } from "@bitbybit-dev/base/lib/api/services/helpers/geometry/polygon-nesting";
import {
    filledRegions2, nestedOutlines2, nestingOutlineOf2, outlinesCross2, overlappingBoxPairs2,
} from "@bitbybit-dev/base/lib/api/services/helpers/geometry/polygon-nesting";
import { FACE_STEPS_PER_CURVED_EDGE, FACE_STEPS_PER_EDGE_PAIR, FACE_STEPS_PER_EDGE_READ, FACE_STEPS_PER_FACE, FACE_STEPS_PER_FACING_EDGE_PAIR, FACE_STEPS_PER_LINE_EDGE, FACE_STEPS_PER_LOOP, FACE_STEPS_PER_OUTLINE_POINT, FACE_STEPS_PER_SAMPLED_CIRCLE, FACE_STEPS_PER_SAMPLED_WIRE, FACE_STEPS_PER_WIRE_EDGE, FACE_WORK_CEILING, FACE_WORK_FLOOR, FACE_WORK_PER_INPUT_CHARACTER, MAX_FACE_EDGES, MAX_FACE_HOLES, MAX_NESTING_EDGE_VISITS, MAX_OVERLAPPING_SUBPATH_PAIRS, SAMPLES_PER_WIRE } from "./drawing-faces.constants";

export type SvgFaceRule = FillRule2 | "perSubpath";

export interface FaceLoop {
    wire: TopoDS_Wire;
    outline?: Base.Point2[];
}

export interface FaceBuild {
    faces: TopoDS_Face[];
    unfaced: TopoDS_Wire[];
}

export interface FaceWarnings {
    readonly crossing: string;
    readonly overlapping: string;
    readonly noArea: string;
    readonly invalid: string;
    readonly holes: string;
    readonly edges: string;
    readonly budget: string;
    readonly failed: (reason: string) => string;
}

export const SVG_FACE_WARNINGS: FaceWarnings = {
    crossing: "Subpaths of a filled element cross one another; its faces follow how the subpaths nest, which can differ from the SVG fill where they overlap.",
    overlapping: "Subpaths of a filled SVG element overlap one another so much that nesting them would take too long; it is returned as its outline wires.",
    noArea: "A closed subpath of a filled SVG element encloses no area, because it folds back on itself or crosses itself into equal and opposite parts; it is returned as its outline wire.",
    invalid: "A filled region of an SVG element could not become a valid face, often because its outline crosses itself; it is returned as its outline wires.",
    holes: `A filled region of an SVG element has more than ${MAX_FACE_HOLES} holes, more than one face is checked with; it is returned as its outline wires.`,
    edges: `A filled region of an SVG element has more than ${MAX_FACE_EDGES} edges, more than one face is checked with; it is returned as its outline wires.`,
    budget: "Building faces took all the work one SVG import of its size may do; the filled elements left are returned as their outline wires.",
    failed: reason => `SVG face building failed for an element (${reason}); returning its outline wires.`,
};

export const faceWorkBudgetFor = (inputSize: number): WorkBudget =>
    WorkBudget.forInput(inputSize, FACE_WORK_PER_INPUT_CHARACTER, FACE_WORK_FLOOR, FACE_WORK_CEILING);

export class DrawingFaceBuilder {
    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper,
        private readonly words: FaceWarnings = SVG_FACE_WARNINGS
    ) { }

    build(input: FaceLoop[], rule: SvgFaceRule, warnings: string[], budget: WorkBudget): FaceBuild {
        const result: FaceBuild = { faces: [], unfaced: [] };
        try {
            return this.buildFaces(input, rule, warnings, result, budget);
        } catch (e) {
            result.faces.forEach((f) => deleteQuietly(f));
            warnings.push(this.words.failed((e as Error).message));
            return { faces: [], unfaced: input.map((l) => l.wire) };
        }
    }

    private buildFaces(input: FaceLoop[], rule: SvgFaceRule, warnings: string[], result: FaceBuild, budget: WorkBudget): FaceBuild {
        if (input.length === 0) { return result; }
        const loops = this.outlinesOf(input, budget);
        if (loops === undefined) {
            warnings.push(this.words.budget);
            return { faces: [], unfaced: input.map((l) => l.wire) };
        }
        loops.forEach((loop, i) => {
            if (!loop.inner) {
                warnings.push(this.words.noArea);
                result.unfaced.push(input[i]!.wire);
            }
        });
        const turned = new Map<number, TopoDS_Wire>();
        const turnedOf = (i: number): TopoDS_Wire => {
            const known = turned.get(i);
            if (known) { return known; }
            const wire = this.och.wiresService.reversedWire({ shape: input[i]!.wire });
            turned.set(i, wire);
            return wire;
        };
        const ccw = (i: number): TopoDS_Wire => (loops[i]!.area > 0 ? input[i]!.wire : turnedOf(i));
        const cw = (i: number): TopoDS_Wire => (loops[i]!.area < 0 ? input[i]!.wire : turnedOf(i));
        try {
            const regions = rule === "perSubpath"
                ? loops.flatMap((loop, i) => (loop.inner ? [[i]] : []))
                : this.nestedRegions(loops, rule, input, result, warnings, budget);
            for (const members of regions) {
                this.addFace(members, () => [ccw(members[0]!), ...members.slice(1).map(cw)], loops, input, result, warnings, budget);
            }
        } finally {
            turned.forEach((wire) => deleteQuietly(wire));
        }
        return result;
    }

    private outlinesOf(input: FaceLoop[], budget: WorkBudget): NestingOutline2[] | undefined {
        const loops: NestingOutline2[] = [];
        for (const loop of input) {
            if (budget.exhausted) { return undefined; }
            const points = this.outlinePoints(loop, budget);
            if (points === undefined) { return undefined; }
            loops.push(nestingOutlineOf2(points));
        }
        return loops;
    }

    private outlinePoints(loop: FaceLoop, budget: WorkBudget): Base.Point2[] | undefined {
        if (loop.outline !== undefined) {
            return budget.spend(FACE_STEPS_PER_LOOP + loop.outline.length * FACE_STEPS_PER_OUTLINE_POINT) ? loop.outline : undefined;
        }
        const circle = this.isCircle(loop.wire);
        const sampling = circle ? FACE_STEPS_PER_SAMPLED_CIRCLE : FACE_STEPS_PER_SAMPLED_WIRE;
        return budget.spend(FACE_STEPS_PER_LOOP + sampling + SAMPLES_PER_WIRE * FACE_STEPS_PER_OUTLINE_POINT) ? this.sample(loop.wire, circle) : undefined;
    }

    private nestedRegions(loops: NestingOutline2[], rule: FillRule2, input: FaceLoop[], result: FaceBuild, warnings: string[], budget: WorkBudget): number[][] {
        const pairs = overlappingBoxPairs2(loops.map((loop) => loop.box), MAX_OVERLAPPING_SUBPATH_PAIRS, budget);
        const crossing = pairs === undefined ? undefined : this.withinNestingCap(budget, (part) => outlinesCross2(loops, pairs, part));
        const ancestors = pairs === undefined || crossing === undefined ? undefined : this.withinNestingCap(budget, (part) => nestedOutlines2(loops, pairs, part));
        if (ancestors === undefined) {
            warnings.push(budget.exhausted ? this.words.budget : this.words.overlapping);
            input.forEach((loop, i) => {
                if (loops[i]!.inner) { result.unfaced.push(loop.wire); }
            });
            return [];
        }
        if (crossing) { warnings.push(this.words.crossing); }
        return filledRegions2(loops, ancestors, rule).map((region) => [region.outer, ...region.holes]);
    }

    private withinNestingCap<T>(budget: WorkBudget, work: (part: WorkBudget) => T | undefined): T | undefined {
        const part = new WorkBudget(Math.min(MAX_NESTING_EDGE_VISITS, budget.remaining));
        const done = work(part);
        budget.spend(part.spent);
        return done;
    }

    private addFace(
        members: number[],
        wiresOf: () => TopoDS_Wire[],
        loops: NestingOutline2[],
        input: FaceLoop[],
        result: FaceBuild,
        warnings: string[],
        budget: WorkBudget
    ): void {
        const unfaced = (): void => members.forEach((i) => result.unfaced.push(input[i]!.wire));
        if (budget.exhausted) {
            unfaced();
            return;
        }
        if (members.length - 1 > MAX_FACE_HOLES) {
            warnings.push(this.words.holes);
            unfaced();
            return;
        }
        const counts = members.map((i) => this.occ.CountEdges(input[i]!.wire));
        if (counts.reduce((sum, count) => sum + count, 0) > MAX_FACE_EDGES) {
            warnings.push(this.words.edges);
            unfaced();
            return;
        }
        const cost = this.faceCost(members, counts, loops, input, budget);
        if (cost === undefined || !budget.spend(cost)) {
            warnings.push(this.words.budget);
            unfaced();
            return;
        }
        const face = this.validFace(wiresOf());
        if (face) {
            result.faces.push(face);
            return;
        }
        warnings.push(this.words.invalid);
        unfaced();
    }

    private faceCost(members: number[], counts: number[], loops: NestingOutline2[], input: FaceLoop[], budget: WorkBudget): number | undefined {
        const total = counts.reduce((sum, count) => sum + count, 0);
        if (!budget.spend(total * FACE_STEPS_PER_EDGE_READ)) { return undefined; }
        const facing = members.length === 1 ? 0 : this.facingEdgePairs(members, counts, loops, budget);
        if (facing === undefined) { return undefined; }
        const curved = members.reduce((sum, i) => sum + this.curvedEdgesOf(input[i]!.wire), 0);
        const pairsWithinWires = counts.reduce((sum, count) => sum + count * count, 0);
        return FACE_STEPS_PER_FACE
            + (total - curved) * FACE_STEPS_PER_LINE_EDGE
            + curved * FACE_STEPS_PER_CURVED_EDGE
            + pairsWithinWires * FACE_STEPS_PER_EDGE_PAIR
            + members.length * total * FACE_STEPS_PER_WIRE_EDGE
            + facing * FACE_STEPS_PER_FACING_EDGE_PAIR;
    }

    private facingEdgePairs(members: number[], counts: number[], loops: NestingOutline2[], budget: WorkBudget): number | undefined {
        const pairs = overlappingBoxPairs2(members.map((i) => loops[i]!.box), Number.POSITIVE_INFINITY, budget);
        return pairs?.reduce((sum, [first, second]) => sum + counts[first]! * counts[second]!, 0);
    }

    private curvedEdgesOf(wire: TopoDS_Wire): number {
        const edges = this.och.shapeGettersService.getEdges({ shape: wire });
        try {
            return edges.filter((edge) => !this.occ.IsEdgeLinear(edge)).length;
        } finally {
            edges.forEach((edge) => deleteQuietly(edge));
        }
    }

    private validFace(wires: TopoDS_Wire[]): TopoDS_Face | undefined {
        if (wires.length > 1) {
            try {
                return this.och.facesService.createFaceFromWires({ shapes: wires, planar: true });
            } catch {
                return undefined;
            }
        }
        let face: TopoDS_Face;
        try {
            face = this.och.facesService.createFaceFromWire({ shape: wires[0]!, planar: true });
        } catch {
            return undefined;
        }
        if (this.occ.ShapeIsValid(face)) { return face; }
        deleteQuietly(face);
        return undefined;
    }

    private isCircle(wire: TopoDS_Wire): boolean {
        if (this.occ.CountEdges(wire) !== 1) { return false; }
        const edges = this.och.shapeGettersService.getEdges({ shape: wire });
        try {
            return this.occ.IsEdgeCircular(edges[0]!);
        } finally {
            edges.forEach((edge) => deleteQuietly(edge));
        }
    }

    private sample(wire: TopoDS_Wire, circle: boolean): Base.Point2[] {
        const division = { shape: wire, nrOfDivisions: SAMPLES_PER_WIRE, removeStartPoint: false, removeEndPoint: true };
        const points = circle
            ? this.och.wiresService.divideWireByParamsToPoints(division)
            : this.och.wiresService.divideWireByEqualDistanceToPoints(division);
        return points.map((p): Base.Point2 => [p[0], p[1]]);
    }
}
