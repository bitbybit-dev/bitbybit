import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTEdge, OCCTSolid } from "../shapes";
import { OCCTCorners } from "./corners";
import { OCCTBrepGraph } from "../brep-graph/brep-graph";
import * as Inputs from "../../api/inputs";

describe("OCCT corners unit tests", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let corners: OCCTCorners;
    let brepGraph: OCCTBrepGraph;
    let solid: OCCTSolid;
    let edge: OCCTEdge;

    const has = (name: string): boolean =>
        typeof (occt as unknown as Record<string, unknown>)[name] === "function";

    const box = (): TopoDS_Shape => solid.createBox({ width: 10, height: 10, length: 10, center: [0, 0, 0] });

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        corners = new OCCTCorners(occt, occHelper);
        brepGraph = new OCCTBrepGraph(occt, occHelper);
        solid = new OCCTSolid(occt, occHelper);
        edge = new OCCTEdge(occt, occHelper);
    });

    it("should classify a box corner as a 3D solid corner with three incident faces", () => {
        if (!has("ClassifyCornerByPoint")) { return; }
        const b = box();
        const report = corners.classifyCornerByPoint({ shape: b, points: [[5, 5, 5]], snapTolerance: 0 });
        expect(report.ok).toBe(true);
        expect(report.results.length).toBe(1);
        expect(report.results[0].classification).toBe("solid3d");
        expect(report.results[0].valence).toBe(3);
        expect(report.results[0].incidentFaces).toBe(3);
        b.delete();
    });

    it("should round a box corner and add faces", () => {
        if (!has("FilletCornerByPoint")) { return; }
        const b = box();
        const before = brepGraph.analyze({ shape: b }).faces;
        const rounded = corners.filletCornerByPoint({ shape: b, points: [[5, 5, 5]], radius: 2, taperFactor: 1, snapTolerance: 0, mode: Inputs.OCCT.cornerModeEnum.auto });
        expect(rounded.IsNull()).toBe(false);
        expect(brepGraph.analyze({ shape: rounded }).faces).toBeGreaterThan(before);
        b.delete();
        rounded.delete();
    });

    it("should bevel a box corner and add faces", () => {
        if (!has("ChamferCornerByPoint")) { return; }
        const b = box();
        const before = brepGraph.analyze({ shape: b }).faces;
        const beveled = corners.chamferCornerByPoint({ shape: b, points: [[5, 5, 5]], distance: 2, angle: 45, snapTolerance: 0, mode: Inputs.OCCT.cornerModeEnum.auto });
        expect(beveled.IsNull()).toBe(false);
        expect(brepGraph.analyze({ shape: beveled }).faces).toBeGreaterThan(before);
        b.delete();
        beveled.delete();
    });

    it("should round several corners at once", () => {
        if (!has("FilletCornerByPoint")) { return; }
        const b = box();
        const rounded = corners.filletCornerByPoint({ shape: b, points: [[5, 5, 5], [-5, -5, -5]], radius: 1.5, taperFactor: 1, snapTolerance: 0, mode: Inputs.OCCT.cornerModeEnum.auto });
        expect(rounded.IsNull()).toBe(false);
        b.delete();
        rounded.delete();
    });

    it("should produce a report with applied=true for a rounded corner", () => {
        if (!has("CornerByPointReport")) { return; }
        const b = box();
        const report = corners.cornerByPointReport({ shape: b, points: [[5, 5, 5]], radius: 1, taperFactor: 1, snapTolerance: 0, mode: Inputs.OCCT.cornerModeEnum.auto });
        expect(report.ok).toBe(true);
        expect(report.results[0].applied).toBe(true);
        b.delete();
    });

    it("should fillet every corner obtained from the box corner points and remove a little material", () => {
        if (!has("FilletCornerByPoint")) { return; }
        const b = box();
        const cornerPoints = edge.getCornerPointsOfEdgesForShape({ shape: b });
        expect(cornerPoints.length).toBe(8);
        const volumeBefore = solid.getSolidVolume({ shape: b });
        const rounded = corners.filletCornerByPoint({ shape: b, points: cornerPoints, radius: 1.5, taperFactor: 1, snapTolerance: 0, mode: Inputs.OCCT.cornerModeEnum.auto });
        expect(rounded.IsNull()).toBe(false);
        // every corner should now have its own rounding face
        expect(brepGraph.analyze({ shape: rounded }).faces).toBeGreaterThanOrEqual(6 + 8);
        const volumeAfter = solid.getSolidVolume({ shape: rounded });
        expect(volumeAfter).toBeLessThan(volumeBefore);
        expect(volumeAfter).toBeGreaterThan(volumeBefore * 0.9);
        b.delete();
        rounded.delete();
    });

    it("should chamfer every corner obtained from the box corner points and remove a little material", () => {
        if (!has("ChamferCornerByPoint")) { return; }
        const b = box();
        const cornerPoints = edge.getCornerPointsOfEdgesForShape({ shape: b });
        expect(cornerPoints.length).toBe(8);
        const volumeBefore = solid.getSolidVolume({ shape: b });
        const beveled = corners.chamferCornerByPoint({ shape: b, points: cornerPoints, distance: 1.5, angle: 45, snapTolerance: 0, mode: Inputs.OCCT.cornerModeEnum.auto });
        expect(beveled.IsNull()).toBe(false);
        expect(brepGraph.analyze({ shape: beveled }).faces).toBeGreaterThanOrEqual(6 + 8);
        const volumeAfter = solid.getSolidVolume({ shape: beveled });
        expect(volumeAfter).toBeLessThan(volumeBefore);
        expect(volumeAfter).toBeGreaterThan(volumeBefore * 0.9);
        b.delete();
        beveled.delete();
    });

    describe("taper factor", () => {
        const taperFactors = [1, 0.75, 0.5, 0.25, 0];

        taperFactors.forEach(taperFactor => {
            it(`should round a box corner with taperFactor=${taperFactor} producing a valid solid`, () => {
                if (!has("FilletCornerByPoint")) { return; }
                const b = box();
                const volumeBefore = solid.getSolidVolume({ shape: b });
                const rounded = corners.filletCornerByPoint({ shape: b, points: [[5, 5, 5]], radius: 2, taperFactor, snapTolerance: 0, mode: Inputs.OCCT.cornerModeEnum.auto });
                expect(rounded.IsNull()).toBe(false);
                const volumeAfter = solid.getSolidVolume({ shape: rounded });
                // a corner round must remove a little material and add at least one face
                expect(volumeAfter).toBeLessThan(volumeBefore);
                expect(volumeAfter).toBeGreaterThan(volumeBefore * 0.85);
                expect(brepGraph.analyze({ shape: rounded }).faces).toBeGreaterThan(6);
                b.delete();
                rounded.delete();
            });

            it(`should report the corner as applied with taperFactor=${taperFactor}`, () => {
                if (!has("CornerByPointReport")) { return; }
                const b = box();
                const report = corners.cornerByPointReport({ shape: b, points: [[5, 5, 5]], radius: 2, taperFactor, snapTolerance: 0, mode: Inputs.OCCT.cornerModeEnum.auto });
                expect(report.ok).toBe(true);
                expect(report.results[0].applied).toBe(true);
                b.delete();
            });
        });

        xit("should produce visibly tighter rounding as taperFactor decreases (more material kept)", () => {
            if (!has("FilletCornerByPoint")) { return; }
            const measure = (taperFactor: number): number => {
                const b = box();
                const rounded = corners.filletCornerByPoint({ shape: b, points: [[5, 5, 5]], radius: 2, taperFactor, snapTolerance: 0, mode: Inputs.OCCT.cornerModeEnum.auto });
                const v = solid.getSolidVolume({ shape: rounded });
                b.delete();
                rounded.delete();
                return v;
            };
            const vFull = measure(1);
            const vTight = measure(0);
            // a tighter (more spherical) corner removes less material, so keeps more volume
            expect(vTight).not.toBeCloseTo(vFull, 3);
            expect(vTight).toBeGreaterThan(vFull);
        });
    });

    describe("mode: auto vs planarOnly", () => {
        it("should round a box (3D) corner in auto mode", () => {
            if (!has("FilletCornerByPoint")) { return; }
            const b = box();
            const rounded = corners.filletCornerByPoint({ shape: b, points: [[5, 5, 5]], radius: 2, taperFactor: 1, snapTolerance: 0, mode: Inputs.OCCT.cornerModeEnum.auto });
            expect(brepGraph.analyze({ shape: rounded }).faces).toBeGreaterThan(6);
            b.delete();
            rounded.delete();
        });

        it("should classify a box corner as solid3d (so planarOnly will skip it)", () => {
            if (!has("ClassifyCornerByPoint")) { return; }
            const b = box();
            const report = corners.classifyCornerByPoint({ shape: b, points: [[5, 5, 5]], snapTolerance: 0 });
            expect(report.results[0].classification).toBe("solid3d");
            b.delete();
        });

        it("should leave a box unchanged in planarOnly mode (3D corners skipped)", () => {
            if (!has("FilletCornerByPoint")) { return; }
            const b = box();
            const volumeBefore = solid.getSolidVolume({ shape: b });
            const result = corners.filletCornerByPoint({ shape: b, points: [[5, 5, 5]], radius: 2, taperFactor: 1, snapTolerance: 0, mode: Inputs.OCCT.cornerModeEnum.planarOnly });
            expect(result.IsNull()).toBe(false);
            expect(brepGraph.analyze({ shape: result }).faces).toBe(6);
            expect(solid.getSolidVolume({ shape: result })).toBeCloseTo(volumeBefore, 4);
            b.delete();
            result.delete();
        });

        it("should report a box corner as not applied in planarOnly mode", () => {
            if (!has("CornerByPointReport")) { return; }
            const b = box();
            const report = corners.cornerByPointReport({ shape: b, points: [[5, 5, 5]], radius: 2, taperFactor: 1, snapTolerance: 0, mode: Inputs.OCCT.cornerModeEnum.planarOnly });
            expect(report.results[0].applied).toBe(false);
            b.delete();
        });
    });
});
