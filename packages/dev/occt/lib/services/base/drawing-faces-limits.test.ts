import { describe, it, expect, beforeAll } from "vitest";
import { WorkBudget } from "@bitbybit-dev/base/lib/api/services/helpers/files/work-budget";
import type { BitbybitOcctModule, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { OCCTSVG } from "../svg";
import * as Inputs from "../../api/inputs";
import type { FaceBuild, FaceLoop, SvgFaceRule } from "./drawing-faces";
import { SVG_FACE_WARNINGS, DrawingFaceBuilder, faceWorkBudgetFor } from "./drawing-faces";
import { FACE_STEPS_PER_SAMPLED_WIRE, FACE_WORK_CEILING, MAX_FACE_EDGES, MAX_FACE_HOLES, MAX_NESTING_EDGE_VISITS } from "./drawing-faces.constants";

type Point2 = Inputs.Base.Point2;

const squarePoints = (x: number, y: number, size: number): Point2[] => [[x, y], [x + size, y], [x + size, y + size], [x, y + size]];

const wavyPoints = (count: number): Point2[] => [...Array.from({ length: count }, (_, k): Point2 => [k, k % 2]), [count - 1, -20], [0, -20]];

const holeGrid = (count: number, size: number): Point2[][] => {
    const side = Math.ceil(Math.sqrt(count));
    return Array.from({ length: count }, (_, k) => squarePoints(3 * (k % side), 3 * Math.floor(k / side), size));
};

describe("SVG faces of large drawings", () => {
    let occ: BitbybitOcctModule;
    let och: OccHelper;
    let builder: DrawingFaceBuilder;

    beforeAll(async () => {
        occ = await createBitbybitOcct();
        och = new OccHelper(occ);
        builder = new DrawingFaceBuilder(occ, och);
    });

    const wireOf = (points: Point2[]): TopoDS_Wire => och.wiresService.createPolygonWire({ points: points.map(([x, y]): Inputs.Base.Point3 => [x, y, 0]) });
    const loopOf = (points: Point2[]): FaceLoop => ({ wire: wireOf(points), outline: points });
    const circleLoop = (x: number, radius: number): FaceLoop => ({ wire: och.entitiesService.createCircle(radius, [x, 0, 0], [0, 0, 1], Inputs.OCCT.typeSpecificityEnum.wire) });
    const release = (loops: FaceLoop[], builds: FaceBuild[]): void => {
        builds.forEach((build) => build.faces.forEach((face) => face.delete()));
        loops.forEach((loop) => loop.wire.delete());
    };
    const outlineOf = (count: number, width: number): Point2[] => [[0, 0], [width, 0], [width, width], ...Array.from({ length: count - 3 }, (_, k): Point2 => [width - (k + 1) * width / (count - 2), width + (k % 2)])];

    it.each<SvgFaceRule>(["perSubpath", "evenOdd", "nonzero"])("should charge one budget across every build of an import under %s, and return the elements after it runs out as wires with its warning", (rule) => {
        // Arrange
        const loops = Array.from({ length: 12 }, (_, k) => loopOf(squarePoints(20 * k, 0, 10)));
        const measure = new WorkBudget(Number.POSITIVE_INFINITY);
        const measured = builder.build([loops[0]!], rule, [], measure);
        const budget = new WorkBudget(measure.spent * 3.5);
        const warnings: string[] = [];

        // Act
        const builds = loops.map((loop) => builder.build([loop], rule, warnings, budget));

        // Assert
        expect(builds.map((build) => build.faces.length)).toEqual([1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        expect(builds.slice(3).map((build) => build.unfaced.length)).toEqual(Array.from({ length: 9 }, () => 1));
        expect([...new Set(warnings)]).toEqual([SVG_FACE_WARNINGS.budget]);
        expect(budget.exhausted).toBe(true);
        release(loops, [measured, ...builds]);
    });

    it("should return the regions of an element left after the budget runs out as wires, keeping the faces made before", () => {
        // Arrange
        const loops = [0, 20, 40, 60].map((x) => loopOf(squarePoints(x, 0, 10)));
        const measure = new WorkBudget(Number.POSITIVE_INFINITY);
        const measured = builder.build([loops[0]!], "perSubpath", [], measure);
        const warnings: string[] = [];

        // Act
        const build = builder.build(loops, "perSubpath", warnings, new WorkBudget(2.5 * measure.spent));

        // Assert
        expect(build.faces).toHaveLength(2);
        expect(build.unfaced).toEqual([loops[2]!.wire, loops[3]!.wire]);
        expect(warnings).toEqual([SVG_FACE_WARNINGS.budget]);
        release(loops, [measured, build]);
    });

    it("should return a region with more holes than one face is checked with as its wires before the kernel checks it, and face the regions beside it", () => {
        // Arrange
        const holes = holeGrid(MAX_FACE_HOLES + 1, 1);
        const side = 3 * Math.ceil(Math.sqrt(holes.length));
        const loops = [loopOf(squarePoints(-1, -1, side + 1)), ...holes.map(loopOf), loopOf(squarePoints(side + 10, 0, 5))];
        const warnings: string[] = [];
        const started = performance.now();

        // Act
        const build = builder.build(loops, "evenOdd", warnings, faceWorkBudgetFor(1e9));

        // Assert
        expect(performance.now() - started).toBeLessThan(5000);
        expect(warnings).toEqual([SVG_FACE_WARNINGS.holes]);
        expect(build.faces.map((face) => Math.round(och.facesService.getFaceArea({ shape: face })))).toEqual([25]);
        expect(build.unfaced).toHaveLength(MAX_FACE_HOLES + 2);
        release(loops, [build]);
    });

    it("should return an outline with more edges than one face is checked with as its wire before the kernel checks it", () => {
        // Arrange
        const points = outlineOf(MAX_FACE_EDGES + 1, 1000);
        const loops = [loopOf(points)];
        const warnings: string[] = [];

        // Act
        const build = builder.build(loops, "nonzero", warnings, faceWorkBudgetFor(1e9));

        // Assert
        expect(occ.CountEdges(loops[0]!.wire)).toBe(MAX_FACE_EDGES + 1);
        expect(warnings).toEqual([SVG_FACE_WARNINGS.edges]);
        expect(build.faces).toEqual([]);
        expect(build.unfaced).toEqual([loops[0]!.wire]);
        release(loops, [build]);
    });

    it("should stop at the budget rather than have the kernel check a face whose holes and edges cost more than one import may spend", () => {
        // Arrange
        const holes = holeGrid(MAX_FACE_HOLES, 1);
        const side = 3 * Math.ceil(Math.sqrt(holes.length));
        const loops = [loopOf(squarePoints(-1, -1, side + 1)), ...holes.map(loopOf)];
        const warnings: string[] = [];
        const budget = faceWorkBudgetFor(1e9);

        // Act
        const build = builder.build(loops, "evenOdd", warnings, budget);

        // Assert
        expect(budget.capacity).toBe(FACE_WORK_CEILING);
        expect(warnings).toEqual([SVG_FACE_WARNINGS.budget]);
        expect(build.faces).toEqual([]);
        expect(build.unfaced).toHaveLength(loops.length);
        release(loops, [build]);
    });

    it("should let no element start its nesting tests afresh: elements whose subpaths lie on one another spend the import's budget once", () => {
        // Arrange
        const wavy = wavyPoints(12_000);
        const elements = Array.from({ length: 10 }, () => [loopOf(wavy), loopOf(wavy)]);
        const warnings: string[] = [];
        const budget = faceWorkBudgetFor(0);

        // Act
        const builds = elements.map((loops) => builder.build(loops, "nonzero", warnings, budget));

        // Assert
        expect([...new Set(warnings)]).toEqual([SVG_FACE_WARNINGS.overlapping, SVG_FACE_WARNINGS.budget]);
        expect(builds.every((build) => build.faces.length === 0 && build.unfaced.length === 2)).toBe(true);
        expect(budget.spent).toBeLessThan(budget.capacity + 2 * MAX_NESTING_EDGE_VISITS);
        release(elements.flat(), builds);
    });

    it("should charge the kernel sampling of a closed wire given without its outline, so a budget sized for two of them faces no third", () => {
        // Arrange
        const loops = [0, 20, 40].map((x) => ({ wire: wireOf(squarePoints(x, 0, 10)) }));
        const warnings: string[] = [];

        // Act
        const build = builder.build(loops, "evenOdd", warnings, new WorkBudget(2.5 * FACE_STEPS_PER_SAMPLED_WIRE));

        // Assert
        expect(warnings).toEqual([SVG_FACE_WARNINGS.budget]);
        expect(build.faces).toEqual([]);
        expect(build.unfaced).toEqual(loops.map((loop) => loop.wire));
        release(loops, [build]);
    });

    it("should sample a closed circle without its outline cheaply, at the points its arc length would give, and face it within that budget", () => {
        // Arrange
        const loops = [circleLoop(0, 1), circleLoop(10, 2), circleLoop(20, 3)];
        const division = { shape: loops[1]!.wire, nrOfDivisions: 64, removeStartPoint: false, removeEndPoint: true };

        // Act
        const build = builder.build(loops, "evenOdd", [], new WorkBudget(2.5 * FACE_STEPS_PER_SAMPLED_WIRE));
        const byParameter = och.wiresService.divideWireByParamsToPoints(division);
        const byLength = och.wiresService.divideWireByEqualDistanceToPoints(division);

        // Assert
        expect(build.faces.map((face) => och.facesService.getFaceArea({ shape: face }) / Math.PI).map((share) => Math.round(share * 1e6) / 1e6)).toEqual([1, 4, 9]);
        byParameter.forEach((point, at) => point.forEach((value, axis) => expect(value).toBeCloseTo(byLength[at]![axis]!, 9)));
        release(loops, [build]);
    });

    it("should share one budget across the copies a use element makes of a filled path with many holes, facing the first copies only", () => {
        // Arrange
        const hole = (k: number): string => `M${String(5 + (k % 20) * 5)} ${String(5 + Math.floor(k / 20) * 5)} h2 v2 h-2 z`;
        const plate = `M0 0 H110 V90 H0 Z ${Array.from({ length: 300 }, (_, k) => hole(k)).join(" ")}`;
        const uses = Array.from({ length: 18 }, (_, k) => `<use href="#p" x="${String(200 * k)}"/>`).join("");
        const svg = new OCCTSVG(occ, och);

        // Act
        const result = svg.loadSVGStructured({ svg: `<svg><defs><path id="p" fill-rule="evenodd" d="${plate}"/></defs>${uses}</svg>`, faceStrategy: Inputs.OCCT.svgFaceStrategyEnum.auto });

        // Assert
        const faced = result.shapes.map((shape) => shape.isFace);
        expect(faced.length).toBe(18);
        expect(faced[0]).toBe(true);
        expect(faced[17]).toBe(false);
        expect(faced.indexOf(false)).toBeGreaterThan(0);
        expect(faced.slice(faced.indexOf(false)).every((isFace) => !isFace)).toBe(true);
        expect(result.warnings).toEqual([SVG_FACE_WARNINGS.budget]);
        result.shapes.forEach((shape) => shape.shape.delete());
    });
});
