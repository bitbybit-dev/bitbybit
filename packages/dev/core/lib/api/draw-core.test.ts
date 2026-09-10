import { describe, it, expect, beforeEach } from "vitest";
import { DrawCore, DrawableKind } from "./draw-core";
import * as Inputs from "./inputs";

class ProbeCore extends DrawCore {
    kinds(): readonly DrawableKind[] { return this.drawableKinds(); }
    points(path: Inputs.JSCAD.JSCADPath2): Inputs.Base.Point3[] { return this.pathToPolylinePoints(path); }
    resolve(entity: unknown, phase: "sync" | "async", handled: string[]): string | undefined {
        return this.resolveDrawableKind(entity, phase, (k) => handled.includes(k));
    }
}

describe("DrawCore entity detection", () => {
    let core: DrawCore;

    beforeEach(() => {
        core = new DrawCore();
    });

    describe("a JSCAD path is not a polyline", () => {
        const path = { points: [[0, 0], [1, 0], [1, 1]], isClosed: true, transforms: [] };
        const closedPolyline = { points: [[0, 0, 3], [1, 0, 4]], isClosed: true };

        it("should detect a path, by the field that tells JSCAD's three kinds apart", () => {
            expect(core.detectJscadPath(path)).toBe(true);
        });

        it("should not detect a path as a polyline, so the dispatch order is not what decides it", () => {
            expect(core.detectPolyline(path)).toBe(false);
        });

        it("should not detect a path as a JSCAD mesh, which is why it used to reach the polyline branch", () => {
            expect(core.detectJscadMesh(path)).toBe(false);
        });

        it("should still detect an ordinary polyline", () => {
            expect(core.detectPolyline({ points: [[0, 0, 0], [1, 1, 1]] })).toBe(true);
        });

        it("should not read a closed polyline as a path, because this repo's own DTO carries isClosed", () => {
            expect(core.detectJscadPath(closedPolyline)).toBe(false);
            expect(core.detectPolyline(closedPolyline)).toBe(true);
        });

        it("should detect a list of paths", () => {
            expect(core.detectJscadPaths([path, path])).toBe(true);
        });
    });

    describe("an empty list is not a list of anything", () => {
        const plural: [string, (e: unknown) => boolean][] = [
            ["detectPoints", e => core.detectPoints(e)],
            ["detectLines", e => core.detectLines(e)],
            ["detectPolylines", e => core.detectPolylines(e)],
            ["detectJscadMeshes", e => core.detectJscadMeshes(e)],
            ["detectJscadPaths", e => core.detectJscadPaths(e)],
            ["detectOcctShapes", e => core.detectOcctShapes(e)],
            ["detectManifoldShapes", e => core.detectManifoldShapes(e)],
            ["detectDecomposedMeshes", e => core.detectDecomposedMeshes(e)],
            ["detectTags", e => core.detectTags(e)],
            ["detectNodes", e => core.detectNodes(e)],
            ["detectVerbCurves", e => core.detectVerbCurves(e)],
            ["detectVerbSurfaces", e => core.detectVerbSurfaces(e)],
        ];

        plural.forEach(([name, detect]) => {
            it(`should report false from ${name}, because every element of an empty list vacuously matches`, () => {
                expect(detect([])).toBe(false);
            });
        });
    });

    describe("a two-point list is read as a segment, and that is a stated rule", () => {
        it("should detect a pair of points as a line, which is what the dispatch tries first", () => {
            expect(core.detectLine([[0, 0, 0], [1, 1, 1]])).toBe(true);
        });

        it("should also satisfy the point-list check, which is why the order between them matters", () => {
            expect(core.detectPoints([[0, 0, 0], [1, 1, 1]])).toBe(true);
        });
    });

    describe("kernel handles are told apart by their tag", () => {
        it("should detect an OCCT shape", () => {
            expect(core.detectOcctShape({ hash: 1, type: "occ-shape" })).toBe(true);
        });

        it("should detect a Manifold shape", () => {
            expect(core.detectManifoldShape({ hash: 1, type: "manifold-shape" })).toBe(true);
        });

        it("should not confuse the two kernels", () => {
            expect(core.detectOcctShape({ hash: 1, type: "manifold-shape" })).toBe(false);
            expect(core.detectManifoldShape({ hash: 1, type: "occ-shape" })).toBe(false);
        });

        it("should not read a kernel handle as a decomposed mesh", () => {
            expect(core.detectDecomposedMesh({ hash: 1, type: "occ-shape" })).toBe(false);
        });
    });
});

describe("the order a draw call tries kinds in", () => {
    let probe: ProbeCore;

    beforeEach(() => {
        probe = new ProbeCore();
    });

    it("should be this exact list, because order is what decides the ambiguous cases", () => {
        expect(probe.kinds().map(k => k.kind)).toEqual([
            "jscadMesh", "occtShape", "occtShapes", "jscadMeshes",
            "manifoldShape", "manifoldShapes", "decomposedMeshes", "decomposedMesh",
            "line", "point", "jscadPath", "polyline", "node", "verbCurve", "verbSurface",
            "jscadPaths", "polylines", "lines", "points", "nodes",
            "verbCurves", "verbSurfaces", "tag", "tags",
        ]);
    });

    it("should reach a kernel shape only from the asynchronous call", () => {
        const async = probe.kinds().filter(k => k.phase === "async").map(k => k.kind);
        expect(async).toEqual(["jscadMesh", "occtShape", "occtShapes", "jscadMeshes",
            "manifoldShape", "manifoldShapes", "decomposedMeshes", "decomposedMesh"]);
    });

    it("should read a pair of points as a segment, because line is tried before points", () => {
        expect(probe.resolve([[0, 0, 0], [1, 1, 1]], "sync", ["line", "points"])).toBe("line");
    });

    it("should read a JSCAD path as a path, because jscadPath is tried before polyline", () => {
        const path = { points: [[0, 0], [1, 0]], isClosed: false, transforms: [] };
        expect(probe.resolve(path, "sync", ["jscadPath", "polyline"])).toBe("jscadPath");
    });

    it("should skip a kind the renderer registered no handler for", () => {
        const node = { id: "node-1" };
        expect(probe.resolve(node, "sync", ["node"])).toBe("node");
        expect(probe.resolve(node, "sync", [])).toBeUndefined();
    });

    it("should resolve nothing for an empty list, whatever is registered", () => {
        const every = probe.kinds().map(k => k.kind);
        expect(probe.resolve([], "sync", every)).toBeUndefined();
        expect(probe.resolve([], "async", every)).toBeUndefined();
    });
});

describe("the points a JSCAD path draws as", () => {
    let probe: ProbeCore;

    const identity: Inputs.JSCAD.JSCADMat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const movedRight2Up3: Inputs.JSCAD.JSCADMat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 2, 3, 0, 1];
    const quarterTurn: Inputs.JSCAD.JSCADMat4 = [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    beforeEach(() => {
        probe = new ProbeCore();
    });

    const path = (points: Inputs.JSCAD.JSCADVec2[], transforms: Inputs.JSCAD.JSCADMat4, isClosed = false): Inputs.JSCAD.JSCADPath2 =>
        ({ points, isClosed, transforms });

    it("should give a flat two-dimensional point its third component", () => {
        expect(probe.points(path([[1, 2], [3, 4]], identity))).toEqual([[1, 2, 0], [3, 4, 0]]);
    });

    it("should close a closed path, whose last segment is implied rather than stored", () => {
        expect(probe.points(path([[0, 0], [1, 0], [1, 1]], identity, true)))
            .toEqual([[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 0, 0]]);
    });

    it("should apply a translation the path is still carrying, not the pose it was built at", () => {
        expect(probe.points(path([[1, 2], [3, 4]], movedRight2Up3))).toEqual([[3, 5, 0], [5, 7, 0]]);
    });

    it("should apply a rotation the path is still carrying", () => {
        expect(probe.points(path([[1, 0], [0, 2]], quarterTurn))).toEqual([[0, 1, 0], [-2, 0, 0]]);
    });

    it("should close a transformed path at its transformed start, not its original one", () => {
        const drawn = probe.points(path([[1, 2], [3, 4]], movedRight2Up3, true));
        expect(drawn[drawn.length - 1]).toEqual([3, 5, 0]);
    });

    it("should draw a path with no usable matrix at the coordinates it stores", () => {
        const noMatrix = path([[1, 2]], identity);
        delete (noMatrix as { transforms?: Inputs.JSCAD.JSCADMat4 }).transforms;
        expect(probe.points(noMatrix)).toEqual([[1, 2, 0]]);
    });
});
