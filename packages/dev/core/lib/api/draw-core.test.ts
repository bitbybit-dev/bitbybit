import { describe, it, expect, beforeEach } from "vitest";
import { DrawCore, DrawableKind, FrameMarkerLines, FrameMarkerStyle } from "./draw-core";
import * as Inputs from "./inputs";

class ProbeCore extends DrawCore {
    kinds(): readonly DrawableKind[] { return this.drawableKinds(); }
    points(path: Inputs.JSCAD.JSCADPath2): Inputs.Base.Point3[] { return this.pathToPolylinePoints(path); }
    resolve(entity: unknown, phase: "sync" | "async", handled: string[]): string | undefined {
        return this.resolveDrawableKind(entity, phase, (k) => handled.includes(k));
    }
    markers(frames: Inputs.Base.Frame[], style: FrameMarkerStyle): FrameMarkerLines { return this.frameMarkerLines(frames, style); }
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
            ["detectFrames", e => core.detectFrames(e)],
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

describe("shapes with their appearance and design builds are told apart", () => {
    let core: DrawCore;
    let probe: ProbeCore;
    const shape: Inputs.OCCT.TopoDSShapePointer = { hash: 7, type: "occ-shape" };
    const appearance = { color: "#ffffff", metallic: 0.5, faces: [{ indexes: [0, 2], color: "#000000" }] };
    const world = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 0, 0, 1];
    const build = {
        parts: [{ id: "post-1a", name: "Post", shape, appearance }],
        report: [],
        components: [{ path: "post", part: "post-1a", world }, { path: "frame", assembly: true, world }],
    };

    beforeEach(() => {
        core = new DrawCore();
        probe = new ProbeCore();
    });

    it("should detect a shape with an appearance, and one without", () => {
        // Act
        const withLooks = core.detectShapeWithAppearance({ shape, appearance });
        const plain = core.detectShapeWithAppearance({ shape });

        // Assert
        expect(withLooks).toBe(true);
        expect(plain).toBe(true);
    });

    it("should refuse an appearance whose faces are not listed by integer indexes", () => {
        // Act
        const notAList = core.detectShapeWithAppearance({ shape, appearance: { faces: { indexes: [0] } } });
        const fractional = core.detectShapeWithAppearance({ shape, appearance: { faces: [{ indexes: [0.5] }] } });
        const textOpacity = core.detectShapeWithAppearance({ shape, appearance: { opacity: "0.5" } });

        // Assert
        expect(notAList).toBe(false);
        expect(fractional).toBe(false);
        expect(textOpacity).toBe(false);
    });

    it("should take edge colors listed by integer indexes and refuse others", () => {
        // Act
        const colored = core.detectShapeWithAppearance({ shape, appearance: { edgeColor: "#333333", edges: [{ indexes: [0, 3], color: "#ff0000" }, { indexes: [1] }] } });
        const fractional = core.detectShapeWithAppearance({ shape, appearance: { edges: [{ indexes: [1.5] }] } });
        const notAList = core.detectShapeWithAppearance({ shape, appearance: { edges: { indexes: [0] } } });
        const numberColor = core.detectShapeWithAppearance({ shape, appearance: { edges: [{ indexes: [0], color: 255 }] } });
        const numberEdgeColor = core.detectShapeWithAppearance({ shape, appearance: { edgeColor: 0 } });
        const numberEmissive = core.detectShapeWithAppearance({ shape, appearance: { emissive: 1 } });
        const textStrength = core.detectShapeWithAppearance({ shape, appearance: { faces: [{ indexes: [0], emissiveStrength: "2" }] } });
        const glowing = core.detectShapeWithAppearance({ shape, appearance: { emissive: "#3cf2ff", emissiveStrength: 2.6, faces: [{ indexes: [0], emissive: "#ffffff" }] } });

        // Assert
        expect(colored).toBe(true);
        expect([fractional, notAList, numberColor, numberEdgeColor, numberEmissive, textStrength]).toEqual([false, false, false, false, false, false]);
        expect(glowing).toBe(true);
    });

    it("should not take a bare shape or a mesh for a shape with an appearance", () => {
        // Act
        const bare = core.detectShapeWithAppearance(shape);
        const mesh = core.detectShapeWithAppearance({ faceList: [], edgeList: [] });

        // Assert
        expect(bare).toBe(false);
        expect(mesh).toBe(false);
    });

    it("should detect a list of shapes with their appearance only when every one is", () => {
        // Act
        const all = core.detectShapesWithAppearance([{ shape }, { shape, appearance }]);
        const mixed = core.detectShapesWithAppearance([{ shape }, shape]);
        const empty = core.detectShapesWithAppearance([]);

        // Assert
        expect(all).toBe(true);
        expect(mixed).toBe(false);
        expect(empty).toBe(false);
    });

    it("should detect a design build, with components or without", () => {
        // Arrange
        const partDocumentBuild = { parts: build.parts, report: [] };

        // Act
        const assembly = core.detectDesignBuild(build);
        const partDocument = core.detectDesignBuild(partDocumentBuild);

        // Assert
        expect(assembly).toBe(true);
        expect(partDocument).toBe(true);
    });

    it("should refuse a design build whose parts or components cannot be drawn", () => {
        // Act
        const noReport = core.detectDesignBuild({ parts: build.parts });
        const partWithoutId = core.detectDesignBuild({ parts: [{ shape }], report: [] });
        const shortMatrix = core.detectDesignBuild({ ...build, components: [{ path: "post", part: "post-1a", world: [1, 0, 0] }] });
        const pathless = core.detectDesignBuild({ ...build, components: [{ part: "post-1a", world }] });

        // Assert
        expect(noReport).toBe(false);
        expect(partWithoutId).toBe(false);
        expect(shortMatrix).toBe(false);
        expect(pathless).toBe(false);
    });

    it("should resolve each of them to its own kind in the asynchronous call", () => {
        // Arrange
        const every = probe.kinds().map(k => k.kind);

        // Act
        const one = probe.resolve({ shape, appearance }, "async", every);
        const many = probe.resolve([{ shape }, { shape }], "async", every);
        const assembly = probe.resolve(build, "async", every);
        const plainShape = probe.resolve(shape, "async", every);

        // Assert
        expect(one).toBe("occtShapeWithAppearance");
        expect(many).toBe("occtShapesWithAppearance");
        expect(assembly).toBe("designBuild");
        expect(plainShape).toBe("occtShape");
    });
});

describe("a frame is drawn as a frame", () => {
    let probe: ProbeCore;
    const frame: Inputs.Base.Frame = { origin: [1, 2, 3], normal: [0, 1, 0], direction: [0, 0, 1] };

    beforeEach(() => {
        probe = new ProbeCore();
    });

    it("should detect an origin, a normal and a direction of three numbers each", () => {
        expect(probe.detectFrame(frame)).toBe(true);
    });

    it.each([
        ["without a direction", { origin: [0, 0, 0], normal: [0, 0, 1] }],
        ["with a two-number origin", { origin: [0, 0], normal: [0, 0, 1], direction: [1, 0, 0] }],
        ["with a NaN in its normal", { origin: [0, 0, 0], normal: [0, Number.NaN, 1], direction: [1, 0, 0] }],
        ["given as a list", [[0, 0, 0], [0, 0, 1], [1, 0, 0]]],
        ["missing", undefined],
    ])("should not detect an object %s", (_name, entity) => {
        expect(probe.detectFrame(entity)).toBe(false);
    });

    it("should detect a list of frames only when every entry is one", () => {
        expect(probe.detectFrames([frame, frame])).toBe(true);
        expect(probe.detectFrames([frame, { origin: [0, 0, 0] }])).toBe(false);
    });

    it("should resolve a frame and a list of frames among every kind, from the synchronous call", () => {
        const every = probe.kinds().map(k => k.kind);
        expect(probe.resolve(frame, "sync", every)).toBe("frame");
        expect(probe.resolve([frame, frame], "sync", every)).toBe("frames");
        expect(probe.resolve(frame, "async", every)).toBeUndefined();
    });
});

describe("the lines a frame is drawn with", () => {
    let probe: ProbeCore;
    const style: FrameMarkerStyle = { size: 2, colorX: "#ff0000", colorY: "#00ff00", colorZ: "#0000ff", drawPlane: true, colorPlane: "#808080" };
    const world: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] };

    const expectPoints = (received: Inputs.Base.Point3[], expected: Inputs.Base.Point3[]): void => {
        expect(received).toHaveLength(expected.length);
        received.forEach((point, i) => point.forEach((value, j) => expect(value).toBeCloseTo(expected[i]![j]!, 9)));
    };

    beforeEach(() => {
        probe = new ProbeCore();
    });

    it("should draw the three axes from the origin, size long, in their own colors", () => {
        const { polylines, colours } = probe.markers([world], style);
        expectPoints(polylines[0]!.points, [[0, 0, 0], [2, 0, 0]]);
        expectPoints(polylines[1]!.points, [[0, 0, 0], [0, 2, 0]]);
        expectPoints(polylines[2]!.points, [[0, 0, 0], [0, 0, 2]]);
        expect(colours.slice(0, 3)).toEqual(["#ff0000", "#00ff00", "#0000ff"]);
    });

    it("should draw a grid as wide as an axis is long, centered on the origin in the frame's plane, four cells a side, its middle lines stopping at the origin", () => {
        const { polylines, colours } = probe.markers([world], style);
        expect(polylines).toHaveLength(10);
        expect(colours.slice(3)).toEqual(Array(7).fill("#808080"));
        expectPoints(polylines[3]!.points, [[-1, -1, 0], [1, -1, 0], [1, 1, 0], [-1, 1, 0], [-1, -1, 0]]);
        expectPoints(polylines[4]!.points, [[-0.5, -1, 0], [-0.5, 1, 0]]);
        expectPoints(polylines[5]!.points, [[-1, -0.5, 0], [1, -0.5, 0]]);
        expectPoints(polylines[6]!.points, [[0.5, -1, 0], [0.5, 1, 0]]);
        expectPoints(polylines[7]!.points, [[-1, 0.5, 0], [1, 0.5, 0]]);
        expectPoints(polylines[8]!.points, [[-1, 0, 0], [0, 0, 0]]);
        expectPoints(polylines[9]!.points, [[0, -1, 0], [0, 0, 0]]);
    });

    it("should draw only the axes when the plane is left out", () => {
        const { polylines, colours } = probe.markers([world], { ...style, drawPlane: false });
        expect(polylines).toHaveLength(3);
        expect(colours).toEqual(["#ff0000", "#00ff00", "#0000ff"]);
    });

    it("should follow the frame's own origin and axes, squaring a rough direction first", () => {
        const { polylines } = probe.markers([{ origin: [1, 2, 3], normal: [0, 5, 0], direction: [0, 1, 1] }], style);
        expectPoints(polylines[0]!.points, [[1, 2, 3], [1, 2, 5]]);
        expectPoints(polylines[1]!.points, [[1, 2, 3], [3, 2, 3]]);
        expectPoints(polylines[2]!.points, [[1, 2, 3], [1, 4, 3]]);
    });

    it("should gather every frame of a list into one set of lines, in order, skipping a frame that cannot be squared", () => {
        const second: Inputs.Base.Frame = { origin: [5, 0, 0], normal: [0, 0, 1], direction: [1, 0, 0] };
        const broken: Inputs.Base.Frame = { origin: [9, 9, 9], normal: [0, 0, 0], direction: [1, 0, 0] };
        const { polylines, colours } = probe.markers([world, broken, second], style);
        expect(polylines).toHaveLength(20);
        expect(colours).toHaveLength(20);
        expectPoints(polylines[10]!.points, [[5, 0, 0], [7, 0, 0]]);
        expect(colours[10]).toBe("#ff0000");
    });

    it("should give no lines at all when no frame of the list can be squared", () => {
        const flat: Inputs.Base.Frame = { origin: [0, 0, 0], normal: [0, 0, 0], direction: [1, 0, 0] };
        const alongNormal: Inputs.Base.Frame = { origin: [1, 0, 0], normal: [0, 0, 1], direction: [0, 0, 2] };
        const { polylines, colours } = probe.markers([flat, alongNormal], style);
        expect(polylines).toEqual([]);
        expect(colours).toEqual([]);
    });

    it("should color every line of a list by its frame's axis, whatever the list's length", () => {
        const { colours } = probe.markers([world, world, world], { ...style, colorX: "#111111", colorY: "#222222", colorZ: "#333333", colorPlane: "#444444" });
        const oneFrame = ["#111111", "#222222", "#333333", ...Array(7).fill("#444444")];
        expect(colours).toEqual([...oneFrame, ...oneFrame, ...oneFrame]);
    });
});

describe("the order a draw call tries kinds in", () => {
    let probe: ProbeCore;

    beforeEach(() => {
        probe = new ProbeCore();
    });

    it("should be this exact list, because order is what decides the ambiguous cases", () => {
        expect(probe.kinds().map(k => k.kind)).toEqual([
            "jscadMesh", "occtShape", "occtShapes",
            "occtShapeWithAppearance", "occtShapesWithAppearance", "designBuild", "jscadMeshes",
            "manifoldShape", "manifoldShapes", "decomposedMeshes", "decomposedMesh",
            "line", "point", "jscadPath", "polyline", "frame", "node", "verbCurve", "verbSurface",
            "jscadPaths", "polylines", "frames", "lines", "points", "nodes",
            "verbCurves", "verbSurfaces", "tag", "tags",
        ]);
    });

    it("should reach a kernel shape only from the asynchronous call", () => {
        const async = probe.kinds().filter(k => k.phase === "async").map(k => k.kind);
        expect(async).toEqual(["jscadMesh", "occtShape", "occtShapes",
            "occtShapeWithAppearance", "occtShapesWithAppearance", "designBuild", "jscadMeshes",
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
