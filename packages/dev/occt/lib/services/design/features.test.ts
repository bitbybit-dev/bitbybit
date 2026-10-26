import { describe, it, expect, beforeAll, vi } from "vitest";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { OCCTService } from "../../occ-service";
import type * as Inputs from "../../api/inputs";
import type * as Models from "../../api/models";
import { sha256 } from "./digest";
import { releaseDesignCaches } from "../../release-design-caches";
import { handlesIn, namesOf, openWindow } from "../../../../__test__/embind-ledger";

type Document = Models.OCCT.DesignPartDocument;

const rectangle = (id: string, width: number, depth: number, on: Models.OCCT.DesignSketchPlacement, start: [number, number] = [0, 0]): Models.OCCT.DesignSketchFeature => ({
    id,
    type: "sketch",
    on,
    start,
    pen: [
        { type: "hLine", id: "bottom", length: width },
        { type: "vLine", id: "right", length: depth },
        { type: "hLine", id: "top", length: -width },
        { type: "close", id: "left" },
    ],
});

const plate = (...extra: Models.OCCT.DesignFeature[]): Document => ({
    schemaVersion: 1,
    features: [rectangle("base", 40, 20, { plane: "XY" }), { id: "plate", type: "extrude", profile: "base", distance: 10 }, ...extra],
});

describe("OCCT design features beyond the first slice", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        const helper = new OccHelper(kernel);
        occt = new OCCTService(kernel, helper);
    }, 120_000);

    const volume = (shape: TopoDS_Shape): number => occt.shapes.solid.getSolidVolume({ shape });
    const facesNamed = (part: Models.OCCT.DesignBuiltPart<TopoDS_Shape>, name: string): number[] => part.faceNames.flatMap((names, index) => names.includes(name) ? [index] : []);
    const centreOf = (part: Models.OCCT.DesignBuiltPart<TopoDS_Shape>, face: number): number[] => occt.analysis.signatures({ shape: part.shape }).faces[face]!.centre;
    const areaOf = (part: Models.OCCT.DesignBuiltPart<TopoDS_Shape>, face: number): number => occt.analysis.signatures({ shape: part.shape }).faces[face]!.area;
    const statuses = (result: Models.OCCT.DesignBuildResult<TopoDS_Shape>): string[] => result.report.map(entry => entry.status);
    const keptAfter = <T>(act: () => T): { answer: T; kept: string[] } => {
        const opened = openWindow();
        let answer: T;
        try {
            answer = act();
            handlesIn(answer).forEach(handle => { handle.delete(); });
        } finally {
            opened.close();
        }
        releaseDesignCaches(occt);
        return { answer, kept: namesOf(opened.made().filter(handle => !handle.isDeleted())) };
    };

    describe("operations whose parts name their faces", () => {
        const gearDocument = (...extra: Models.OCCT.DesignFeature[]): Document => ({
            schemaVersion: 1,
            features: [{ id: "gear", type: "operation", operation: "occt.parts.mechanical.gears.spurGear", params: { module: 2, teeth: 20, width: 6, bore: 8 } }, ...extra],
        });

        it("should name each face by the role the part's twin gives it, so a gear's tips and bore are found by name", () => {
            // Act
            const gear = occt.design.build({ document: gearDocument() }).parts[0]!;

            // Assert
            expect(facesNamed(gear, "gear:tip")).toHaveLength(20);
            expect(facesNamed(gear, "gear:bore").length).toBeGreaterThan(0);
            expect(facesNamed(gear, "gear:start")).toHaveLength(1);
            expect(facesNamed(gear, "gear:face")).toEqual([]);
        });

        it("should point an operation's refusal at the parameter it names, from a part's roles twin and from an operation without a twin alike", () => {
            // Arrange
            const polyline: Document = { schemaVersion: 1, features: [{ id: "line", type: "operation", operation: "occt.shapes.wire.createPolylineWire", params: { points: [[0, 0, 0]] } }] };

            // Act
            const bored = occt.design.build({ document: { schemaVersion: 1, features: [{ id: "gear", type: "operation", operation: "occt.parts.mechanical.gears.spurGear", params: { module: 2, teeth: 20, width: 6, bore: 100 } }] } }).report[0]!;
            const short = occt.design.build({ document: polyline }).report[0]!;

            // Assert
            expect(bored.messages).toEqual(["/features/0/params/bore: `bore` reaches the root circle of the teeth: make it smaller than the root diameter."]);
            expect(short.messages).toEqual(["/features/0/params/points: A polyline needs at least two points, and `points` has 1."]);
        });

        it("should let a later feature reach the edges between two roles", () => {
            // Arrange
            const document = gearDocument({ id: "tipBevel", type: "chamfer", body: "gear", distance: 0.2, edges: { between: [{ of: "gear", role: "end" }, { of: "gear", role: "tip" }], count: 20 } });

            // Act
            const result = occt.design.build({ document });

            // Assert
            expect(statuses(result)).toEqual(["ok", "ok"]);
        });
    });

    describe("standard parts sized by their parameters", () => {
        const screwDocument: Document = {
            schemaVersion: 1,
            parameters: { size: { type: "choice", value: "M3", options: [{ value: "M3" }, { value: "M4" }] }, length: { value: 10, min: 4 } },
            features: [{ id: "screw", type: "operation", operation: "occt.parts.mechanical.fasteners.iso.socketHeadCapScrew", params: { size: { expr: "size" }, length: { expr: "length" } } }],
            parts: [{ id: "screw", body: "screw", connectors: [{ id: "seat", on: { of: "screw", role: "seat" }, axis: { of: "screw", role: "thread" } }] }],
        };

        it("should give an operation the text a choice parameter holds, so one screw document makes every size", () => {
            // Act
            const small = occt.design.build({ document: screwDocument }).parts[0]!;
            const large = occt.design.build({ document: screwDocument, parameters: { size: "M4", length: 16 } }).parts[0]!;

            // Assert
            const across = (part: Models.OCCT.DesignBuiltPart<TopoDS_Shape>): number[] => {
                const box = occt.analysis.measure.tightBoundingBox({ shape: part.shape });
                return [box.max[0] - box.min[0], box.max[1] - box.min[1]];
            };
            expect(across(small)).toEqual([expect.closeTo(5.5, 4), expect.closeTo(13, 4)]);
            expect(across(large)).toEqual([expect.closeTo(7, 4), expect.closeTo(20, 4)]);
            expect(large.connectors.map(connector => [connector.id, connector.frame.origin.map(value => Math.round(value * 1e6) / 1e6), connector.frame.normal])).toEqual([["seat", [0, 0, 0], [0, -1, 0]]]);
        });

        it("should stand connectors on a bearing's ring sides and a spring's ground ends by the roles they name", () => {
            // Arrange
            const bearing: Document = {
                schemaVersion: 1,
                parameters: { designation: { type: "choice", value: "608", options: [{ value: "608" }, { value: "6204" }] } },
                features: [{ id: "part", type: "operation", operation: "occt.parts.mechanical.bearings.iso.ballBearing", params: { designation: { expr: "designation" }, shields: false } }],
                parts: [{ id: "bearing", body: "part", connectors: [{ id: "inner", on: { of: "part", role: "innerStart" }, axis: { of: "part", role: "bore" } }, { id: "outer", on: { of: "part", role: "outerEnd" }, axis: { of: "part", role: "outside" } }] }],
            };
            const spring: Document = {
                schemaVersion: 1,
                parameters: { length: { value: 25, min: 1 } },
                features: [{ id: "part", type: "operation", operation: "occt.parts.mechanical.springs.compressionSpring", params: { wireDiameter: 1, diameter: 10, activeCoils: 6, length: { expr: "length" } } }],
                parts: [{ id: "spring", body: "part", connectors: [{ id: "bottom", on: { of: "part", role: "bottom" } }, { id: "top", on: { of: "part", role: "top" } }] }],
            };

            // Act
            const ring = occt.design.build({ document: bearing, parameters: { designation: "6204" } });
            const coil = occt.design.build({ document: spring, parameters: { length: 20 } });

            // Assert
            const frames = (result: Models.OCCT.DesignBuildResult<TopoDS_Shape>): (string | number)[][] => result.parts[0]!.connectors.map(connector => [connector.id, ...connector.frame.origin.map(value => Math.round(value * 1e6) / 1e6), ...connector.frame.normal.map(value => Math.round(value))]);
            expect(ring.issues).toEqual([]);
            expect(frames(ring)).toEqual([["inner", 0, 0, 0, 0, -1, 0], ["outer", 0, 14, 0, 0, 1, 0]]);
            expect(coil.issues).toEqual([]);
            expect(frames(coil)).toEqual([["bottom", 0, 0, 0, 0, -1, 0], ["top", 0, 20, 0, 0, 1, 0]]);
        });

        it("should refuse text where the operation takes a number, at the parameter that takes it", () => {
            // Arrange
            const document: Document = { ...screwDocument, features: [{ id: "screw", type: "operation", operation: "occt.parts.mechanical.fasteners.iso.socketHeadCapScrew", params: { size: { expr: "size" }, length: { expr: "size" } } }] };

            // Act
            const result = occt.design.build({ document });

            // Assert
            expect(statuses(result)).toEqual(["failed"]);
            expect(result.report[0]!.messages).toEqual(["/features/0/params/length: must be a number"]);
        });
    });

    describe("loops and circles", () => {
        const square = (id: string, size: number, at: number, anticlockwise = true): Models.OCCT.DesignLoop => ({
            start: [at, at],
            pen: anticlockwise
                ? [{ type: "hLine", id: `${id}South`, length: size }, { type: "vLine", length: size }, { type: "hLine", length: -size }, { type: "close" }]
                : [{ type: "vLine", id: `${id}West`, length: size }, { type: "hLine", length: size }, { type: "vLine", length: -size }, { type: "close" }],
        });
        const extruded = (sketch: Models.OCCT.DesignSketchFeature): Document => ({ schemaVersion: 1, features: [sketch, { id: "washer", type: "extrude", profile: "base", distance: 2 }] });

        it("should make one face of loops, the first the outside and the others holes, whichever way each is drawn, naming every side", () => {
            // Arrange
            const circled = extruded({ id: "base", type: "sketch", on: { plane: "XY" }, loops: [square("outer", 20, -10), { pen: [{ type: "circle", id: "bore", centre: [0, 0], radius: 4 }] }] });
            const squared = extruded({ id: "base", type: "sketch", on: { plane: "XY" }, loops: [square("outer", 20, -10), square("inner", 4, -2, false)] });

            // Act
            const washer = occt.design.build({ document: circled }).parts[0]!;
            const frame = occt.design.build({ document: squared }).parts[0]!;

            // Assert
            expect(volume(washer.shape)).toBeCloseTo((400 - Math.PI * 16) * 2, 6);
            expect(facesNamed(washer, "washer:side:base.bore")).toHaveLength(1);
            expect(facesNamed(washer, "washer:side:base.outerSouth")).toHaveLength(1);
            expect(volume(frame.shape)).toBeCloseTo((400 - 16) * 2, 6);
            expect(facesNamed(frame, "washer:side:base.innerWest")).toHaveLength(1);
            expect(occt.shapeFix.isValid({ shape: frame.shape })).toBe(true);
        });

        it("should draw a circle alone as an exact disc with one side face, at its centre in the sketch's frame", () => {
            // Arrange
            const document = extruded({ id: "base", type: "sketch", on: { frame: { origin: [0, 0, 5], normal: [0, 0, 1], direction: [0, 1, 0] } }, pen: [{ type: "circle", id: "rim", centre: [3, 0], radius: "1 + 1" }] });

            // Act
            const disc = occt.design.build({ document }).parts[0]!;
            const box = occt.analysis.measure.tightBoundingBox({ shape: disc.shape });

            // Assert
            expect(volume(disc.shape)).toBeCloseTo(Math.PI * 4 * 2, 6);
            expect(facesNamed(disc, "washer:side:base.rim")).toHaveLength(1);
            expect([box.min, box.max].map(point => point.map(value => Math.round(value * 1e6) / 1e6 + 0))).toEqual([[-2, 1, 5], [2, 5, 7]]);
        });

        it("should square a circle's frame as a pen's is squared, so it stays on the sketch's plane", () => {
            // Arrange
            const document = extruded({ id: "base", type: "sketch", on: { frame: { origin: [0, 0, 0], normal: [0, 0, 1], direction: [1, 0, 1] } }, pen: [{ type: "circle", centre: [10, 0], radius: 1 }] });

            // Act
            const disc = occt.design.build({ document }).parts[0]!;
            const box = occt.analysis.measure.tightBoundingBox({ shape: disc.shape });

            // Assert
            expect([box.min, box.max].map(point => point.map(value => Math.round(value * 1e6) / 1e6 + 0))).toEqual([[9, -1, 0], [11, 1, 2]]);
        });

        it("should refuse loops beside a pen, a circle beside other commands, ids repeated across loops and a hole outside its outline", () => {
            // Arrange
            const sketchOf = (sketch: Record<string, unknown>): Document => ({ schemaVersion: 1, features: [{ id: "base", type: "sketch", on: { plane: "XY" }, ...sketch }] });

            // Act
            const issuesOf = (sketch: Record<string, unknown>): string[] => occt.design.validate({ document: sketchOf(sketch) }).map(issue => `${issue.path}: ${issue.message}`);
            const both = issuesOf({ pen: [{ type: "hLine", length: 1 }], loops: [square("a", 2, 0)] });
            const crowded = issuesOf({ pen: [{ type: "circle", centre: [0, 0], radius: 1 }, { type: "hLine", length: 1 }] });
            const repeated = issuesOf({ loops: [square("a", 20, -10), square("a", 2, 0)] });
            const outside = occt.design.build({ document: extruded({ id: "base", type: "sketch", on: { plane: "XY" }, loops: [square("outer", 4, 0), square("far", 2, 10)] }) });

            // Assert
            expect(both).toEqual(["/features/0/pen: a sketch draws with pen or with loops: give pen inside each loop"]);
            expect(crowded).toEqual(["/features/0/pen/0: a circle is a loop by itself: give it a pen or a loop of its own"]);
            expect(repeated).toEqual(["/features/0/loops/1/pen/0/id: command ids are distinct, start with a letter or _ and hold letters, digits, _ and -"]);
            expect(outside.report[0]!.messages).toEqual(["/features/0/loops: the loops make no valid face: loop 1 lies outside the outline (loop 0)"]);
        });
    });

    describe("faces an operation makes", () => {
        it("should keep the names of the faces an operation carries through its history and give its new faces the operation's roles", () => {
            // Arrange
            const document: Document = {
                schemaVersion: 1,
                features: [
                    { id: "block", type: "operation", operation: "occt.shapes.solid.createBox", params: { width: 20, length: 20, height: 10, center: [0, 5, 0] } },
                    { id: "pin", type: "operation", operation: "occt.shapes.solid.createCylinder", params: { radius: 2, height: 30, center: [0, -10, 0], direction: [0, 1, 0] } },
                    { id: "drilled", type: "operation", operation: "occt.booleans.difference", params: { shape: { body: "block" }, shapes: [{ body: "pin" }], keepEdges: false }, body: "block" },
                    { id: "round", type: "operation", operation: "occt.fillets.filletEdges", params: { shape: { body: "block" }, radius: 1, indexes: [1] }, body: "block" },
                ],
            };

            // Act
            const part = occt.design.build({ document }).parts[0]!;
            const named = (name: string): number => facesNamed(part, name).length;

            // Assert
            expect([named("block:face"), named("pin:face"), named("round:round")]).toEqual([6, 1, 1]);
            expect(part.faceNames.every(names => names.length > 0 && !names.includes("drilled:face") && !names.includes("round:face"))).toBe(true);
        });
    });

    describe("faces the operations with history twins make from plain bodies", () => {
        const block = { id: "block", type: "operation", operation: "occt.shapes.solid.createBox", params: { width: 20, length: 20, height: 10, center: [0, 5, 0] } } as const;
        const rectangleFace = (id: string, width: number, length: number, center: Inputs.Base.Point3, direction: Inputs.Base.Vector3): Models.OCCT.DesignFeature => ({ id, type: "operation", operation: "occt.shapes.face.createRectangleFace", params: { width, length, center, direction } });
        const edgeOfBlock: Models.OCCT.DesignFeature = { id: "edge", type: "operation", operation: "occt.shapes.edge.getEdge", params: { shape: { body: "block" }, index: 1 } };
        const partBuilt = (document: Document, body: string): Models.OCCT.DesignBuiltPart<TopoDS_Shape> => occt.design.build({ document }).parts.find(part => part.id === body)!;
        const counted = (part: Models.OCCT.DesignBuiltPart<TopoDS_Shape>, ...names: string[]): number[] => names.map(name => facesNamed(part, name).length);
        const offsetBy = (distance: number): Document => ({ schemaVersion: 1, features: [block, { id: "grown", type: "operation", operation: "occt.operations.offset", params: { shape: { body: "block" }, distance, tolerance: 0.1 }, body: "block" }] });

        it("should keep a block's names through an offset of 0, which answers with the block's own shape in a handle of its own, as an offset of 1 keeps them and names its rounded joins", () => {
            // Act
            const still = partBuilt(offsetBy(0), "block");
            const grown = partBuilt(offsetBy(1), "block");

            // Assert
            expect(still.faceNames).toEqual(Array.from({ length: 6 }, () => ["block:face"]));
            expect(counted(grown, "block:face", "grown:side", "grown:face")).toEqual([6, 12, 8]);
        });

        it("should keep nothing alive once an offset of 0 and the caches are released, its answer being a handle the outcome owns", () => {
            // Act
            const { answer, kept } = keptAfter(() => occt.design.build({ document: offsetBy(0) }));

            // Assert
            expect(statuses(answer)).toEqual(["ok", "ok"]);
            expect(kept).toEqual([]);
        });

        const farFrame = { origin: [100, 100, 100], normal: [0, 0, 1], direction: [1, 0, 0] };
        const answeringWithTheBody: [string, Models.OCCT.DesignFeature, Record<string, unknown>, number][] = [
            ["occt.shapeFix.basicShapeRepair", block, {}, 6],
            ["occt.shapeFix.orientClosedSolid", block, {}, 6],
            ["occt.shapes.shape.purgeInternalEdges", block, {}, 6],
            ["occt.shapes.edge.removeInternalEdges", block, {}, 6],
            ["occt.shapes.face.reversedFace", rectangleFace("block", 20, 10, [0, 0, 0], [0, 0, 1]), {}, 1],
            ["occt.shapes.face.getFace", rectangleFace("block", 20, 10, [0, 0, 0], [0, 0, 1]), { index: 0 }, 1],
            ["occt.parts.mechanical.machining.flat", block, { frame: farFrame }, 6],
            ["occt.parts.mechanical.machining.din.keyway", block, { frame: farFrame }, 6],
            ["occt.parts.mechanical.machining.din.knurl", block, { frame: farFrame }, 6],
            ["occt.parts.mechanical.machining.din.ringGroove", block, { frame: farFrame }, 6],
            ["occt.parts.mechanical.machining.ansi.keyway", block, { frame: farFrame, diameter: 25.4, length: 25.4 }, 6],
            ["occt.parts.mechanical.machining.ansi.knurl", block, { frame: farFrame, diameter: 25.4 }, 6],
            ["occt.parts.mechanical.machining.ansi.ringGroove", block, { frame: farFrame, diameter: 25.4 }, 6],
        ];

        it.each(answeringWithTheBody)("should keep the body's names through %s, which answers with the body's own shape in a handle of its own where it changes nothing", (operation, made, params, faces) => {
            // Arrange
            const document: Document = { schemaVersion: 1, features: [made, { id: "kept", type: "operation", operation, params: { shape: { body: "block" }, ...params }, body: "block" }] };

            // Act
            const { answer, kept } = keptAfter(() => occt.design.build({ document }));

            // Assert
            expect([statuses(answer), answer.parts.find(part => part.id === "block")!.faceNames, kept]).toEqual([["ok", "ok"], Array.from({ length: faces }, () => ["block:face"]), []]);
        });

        it("should keep every face's names through an offset with sharp joins and through the faces a unify merges", () => {
            // Arrange
            const sharp: Document = { schemaVersion: 1, features: [block, { id: "grown", type: "operation", operation: "occt.operations.offsetAdv", params: { shape: { body: "block" }, distance: 1, tolerance: 0.1, joinType: "intersection", removeIntEdges: false }, body: "block" }] };
            const merged: Document = {
                schemaVersion: 1,
                features: [
                    block,
                    { id: "other", type: "operation", operation: "occt.shapes.solid.createBox", params: { width: 20, length: 20, height: 10, center: [20, 5, 0] } },
                    { id: "joined", type: "operation", operation: "occt.booleans.union", params: { shapes: [{ body: "block" }, { body: "other" }], keepEdges: true }, body: "block" },
                    { id: "merged", type: "operation", operation: "occt.shapes.shape.unifySameDomain", params: { shape: { body: "block" }, unifyEdges: true, unifyFaces: true, concatBSplines: false }, body: "block" },
                ],
            };

            // Act
            const offset = partBuilt(sharp, "block");
            const unified = partBuilt(merged, "block");

            // Assert
            expect(offset.faceNames).toEqual(Array.from({ length: 6 }, () => ["block:face"]));
            expect(unified.faceNames).toHaveLength(6);
            expect(counted(unified, "block:face", "other:face", "merged:face")).toEqual([5, 5, 0]);
        });

        it("should name a sewn shell's and a solid's faces after the face bodies they were made of", () => {
            // Arrange
            const shell: Document = {
                schemaVersion: 1,
                features: [
                    rectangleFace("wall", 20, 10, [10, 0, 5], [0, 1, 0]), rectangleFace("left", 10, 10, [5, 5, 0], [0, 0, 1]), rectangleFace("right", 10, 10, [15, 5, 0], [0, 0, 1]),
                    { id: "sewn", type: "operation", operation: "occt.shapes.shell.sewFaces", params: { shapes: [{ body: "wall" }, { body: "left" }, { body: "right" }], tolerance: 1e-7 } },
                ],
            };
            const sides = ["bottom", "top", "east", "west", "north", "south"];
            const cube: Document = {
                schemaVersion: 1,
                features: [
                    rectangleFace("bottom", 10, 10, [0, 0, 0], [0, -1, 0]), rectangleFace("top", 10, 10, [0, 10, 0], [0, 1, 0]),
                    rectangleFace("east", 10, 10, [5, 5, 0], [1, 0, 0]), rectangleFace("west", 10, 10, [-5, 5, 0], [-1, 0, 0]),
                    rectangleFace("north", 10, 10, [0, 5, 5], [0, 0, 1]), rectangleFace("south", 10, 10, [0, 5, -5], [0, 0, -1]),
                    { id: "cube", type: "operation", operation: "occt.shapes.solid.fromFaces", params: { shapes: sides.map(body => ({ body })), tolerance: 1e-7 } },
                ],
            };

            // Act
            const sewn = partBuilt(shell, "sewn");
            const solid = partBuilt(cube, "cube");

            // Assert
            expect(sewn.faceNames).toHaveLength(3);
            expect(sewn.faceNames).toEqual(expect.arrayContaining([["wall:face"], ["left:face"], ["right:face"]]));
            expect(solid.faceNames).toHaveLength(6);
            expect(solid.faceNames).toEqual(expect.arrayContaining(sides.map(side => [`${side}:face`])));
        });

        it("should keep the names of a split body's faces in both pieces and name the cut faces after the tool", () => {
            // Arrange
            const document: Document = {
                schemaVersion: 1,
                features: [
                    block,
                    rectangleFace("knife", 40, 40, [0, 5, 0], [1, 0, 0]),
                    { id: "cut", type: "operation", operation: "occt.operations.splitShapeWithShapes", params: { shape: { body: "block" }, shapes: [{ body: "knife" }], localFuzzyTolerance: 1e-7, nonDestructive: false }, body: "block" },
                ],
            };

            // Act
            const split = partBuilt(document, "block");

            // Assert
            expect(split.faceNames).toHaveLength(12);
            expect(counted(split, "block:face", "knife:face", "cut:face")).toEqual([10, 2, 0]);
        });

        it("should name the sides, start and end of a twisted extrusion and a polygon pipe, and the walls a drafted outline sweeps", () => {
            // Arrange
            const twisted: Document = {
                schemaVersion: 1,
                features: [
                    { id: "square", type: "operation", operation: "occt.shapes.face.createSquareFace", params: { size: 5, center: [0, 0, 0], direction: [0, 1, 0] } },
                    { id: "twisted", type: "operation", operation: "occt.operations.rotatedExtrude", params: { shape: { body: "square" }, height: 20, angle: 90, makeSolid: true }, body: "square" },
                ],
            };
            const hexagonal: Document = {
                schemaVersion: 1,
                features: [
                    { id: "path", type: "operation", operation: "occt.shapes.wire.createLineWire", params: { start: [0, 0, 0], end: [0, 10, 0] } },
                    { id: "bar", type: "operation", operation: "occt.operations.pipePolylineWireNGon", params: { shape: { body: "path" }, radius: 0.5, nrCorners: 6, makeSolid: true }, body: "path" },
                ],
            };
            const drafted: Document = {
                schemaVersion: 1,
                features: [
                    { id: "outline", type: "operation", operation: "occt.shapes.wire.createRectangleWire", params: { width: 10, length: 10, center: [0, 0, 0], direction: [0, 1, 0] } },
                    { id: "walls", type: "operation", operation: "occt.draft.makeDraft", params: { shape: { body: "outline" }, direction: [0, 1, 0], angle: 5, lengthMax: 20, internal: false }, body: "outline" },
                ],
            };

            // Act
            const turned = partBuilt(twisted, "square");
            const bar = partBuilt(hexagonal, "path");
            const walls = partBuilt(drafted, "outline");

            // Assert
            expect(counted(turned, "twisted:side", "twisted:start", "twisted:end", "twisted:face", "square:face")).toEqual([4, 1, 1, 0, 1]);
            expect(turned.faceNames.find(names => names.includes("square:face"))).toEqual(["square:face", "twisted:start"]);
            expect(counted(bar, "bar:side", "bar:start", "bar:end", "bar:face")).toEqual([6, 1, 1, 0]);
            expect(counted(walls, "walls:side", "walls:face")).toEqual([4, 0]);
        });

        it("should give a rib's and a tapered boss's new faces the roles their profile's history names, keeping the body's names", () => {
            // Arrange
            const ribbed: Document = {
                schemaVersion: 1,
                features: [
                    { id: "floor", type: "operation", operation: "occt.shapes.solid.createBox", params: { width: 20, length: 2, height: 10, center: [10, 5, 1] } },
                    { id: "wall", type: "operation", operation: "occt.shapes.solid.createBox", params: { width: 2, length: 20, height: 10, center: [1, 5, 10] } },
                    { id: "bracket", type: "operation", operation: "occt.booleans.union", params: { shapes: [{ body: "floor" }, { body: "wall" }], keepEdges: false }, body: "floor" },
                    { id: "diagonal", type: "operation", operation: "occt.shapes.wire.createPolylineWire", params: { points: [[2, 5, 12], [12, 5, 2]] } },
                    { id: "rib", type: "operation", operation: "occt.features.rib", params: { shape: { body: "floor" }, wire: { body: "diagonal" }, frame: { origin: [0, 5, 0], normal: [0, 1, 0], direction: [1, 0, 0] }, thickness: 0.5, otherSideThickness: 0.5 }, body: "floor" },
                ],
            };
            const bossed: Document = {
                schemaVersion: 1,
                features: [
                    block,
                    { id: "top", type: "operation", operation: "occt.shapes.face.createSquareFace", params: { size: 4, center: [0, 10, 0], direction: [0, 1, 0] } },
                    { id: "boss", type: "operation", operation: "occt.features.taperedBoss", params: { shape: { body: "block" }, profile: { body: "top" }, sketchFaceIndex: 3, angle: 10, length: 3 }, body: "block" },
                ],
            };

            // Act
            const rib = partBuilt(ribbed, "floor");
            const boss = partBuilt(bossed, "block");

            // Assert
            expect(counted(rib, "floor:face", "wall:face", "rib:side", "rib:start", "rib:end", "rib:face")).toEqual([6, 6, 1, 1, 1, 0]);
            expect(counted(boss, "block:face", "boss:side", "boss:end", "boss:face")).toEqual([6, 4, 1, 0]);
        });

        it("should name what every fillet makes round and what every chamfer makes bevel, whichever of their forms runs", () => {
            // Arrange
            const rounded = (operation: string, params: Record<string, unknown>): Document => ({ schemaVersion: 1, features: [block, edgeOfBlock, { id: "made", type: "operation", operation, params: { shape: { body: "block" }, ...params }, body: "block" }] });

            // Act
            const listed = partBuilt(rounded("occt.fillets.filletEdgesListOneRadius", { edges: [{ body: "edge" }], radius: 1 }), "block");
            const varying = partBuilt(rounded("occt.fillets.filletEdgeVariableRadius", { edge: { body: "edge" }, radiusList: [1, 2], paramsU: [0, 1] }), "block");
            const bevelled = partBuilt(rounded("occt.fillets.chamferEdgesList", { edges: [{ body: "edge" }], distanceList: [1] }), "block");

            // Assert
            expect(counted(listed, "block:face", "made:round", "made:side")).toEqual([6, 1, 0]);
            expect(counted(varying, "block:face", "made:round", "made:side")).toEqual([6, 1, 0]);
            expect(counted(bevelled, "block:face", "made:bevel", "made:side")).toEqual([6, 1, 0]);
        });
    });

    describe("operations whose history twin refuses what they accept", () => {
        const block = { id: "block", type: "operation", operation: "occt.shapes.solid.createBox", params: { width: 20, length: 20, height: 10, center: [0, 5, 0] } } as const;

        it("should offset a solid by a distance of 0 as the plain operation does, leaving it as it was", () => {
            // Arrange
            const document: Document = {
                schemaVersion: 1,
                features: [block, { id: "grown", type: "operation", operation: "occt.operations.offset", params: { shape: { body: "block" }, distance: 0, tolerance: 0.1 }, body: "block" }],
            };

            // Act
            const built = occt.design.build({ document });

            // Assert
            expect(statuses(built)).not.toContain("failed");
            expect(volume(built.parts[0]!.shape)).toBeCloseTo(4000, 6);
        });

        it("should offset a wire body, whose offset keeps no history of faces, through the plain operation", () => {
            // Arrange
            const document: Document = {
                schemaVersion: 1,
                features: [
                    { id: "ring", type: "operation", operation: "occt.shapes.wire.createCircleWire", params: { radius: 5, center: [0, 0, 0], direction: [0, 1, 0] } },
                    { id: "wider", type: "operation", operation: "occt.operations.offset", params: { shape: { body: "ring" }, distance: 1, tolerance: 0.1 }, body: "ring" },
                ],
            };

            // Act
            const built = occt.design.build({ document });

            // Assert
            expect(statuses(built)).not.toContain("failed");
            expect(occt.shapes.wire.getWireLength({ shape: built.parts[0]!.shape })).toBeCloseTo(2 * Math.PI * 6, 6);
        });

        it("should refuse a split that cuts nothing off the shape, as the plain operation does, rather than give an empty body", () => {
            // Arrange
            const document: Document = {
                schemaVersion: 1,
                features: [
                    block,
                    { id: "far", type: "operation", operation: "occt.shapes.solid.createBox", params: { width: 2, length: 2, height: 2, center: [100, 0, 0] } },
                    { id: "cut", type: "operation", operation: "occt.operations.splitShapeWithShapes", params: { shape: { body: "block" }, shapes: [{ body: "far" }], localFuzzyTolerance: 1e-4, nonDestructive: false }, body: "block" },
                ],
            };

            // Act
            const built = occt.design.build({ document });

            // Assert
            const failed = built.report.find(entry => entry.status === "failed");
            expect(failed?.messages.join(" ")).toContain("makes neither a shape nor a list of shapes");
        });
    });

    describe("sweep and loft", () => {
        it("should sweep a profile along a path and name its ends and its sides by profile command", () => {
            // Arrange
            const document: Document = {
                schemaVersion: 1,
                features: [
                    rectangle("profile", 2, 1, { plane: "XZ" }, [-1, -0.5]),
                    { id: "spine", type: "sketch", on: { plane: "XY" }, pen: [{ type: "vLine", id: "up", length: 10 }] },
                    { id: "bar", type: "sweep", profile: "profile", path: "spine" },
                ],
            };

            // Act
            const result = occt.design.build({ document });

            // Assert
            const bar = result.parts[0]!;
            expect(statuses(result)).toEqual(["ok", "ok", "ok"]);
            expect(volume(bar.shape)).toBeCloseTo(2 * 1 * 10, 6);
            expect(centreOf(bar, facesNamed(bar, "bar:start")[0]!)[1]).toBeCloseTo(0, 6);
            expect(centreOf(bar, facesNamed(bar, "bar:end")[0]!)[1]).toBeCloseTo(10, 6);
            expect(facesNamed(bar, "bar:side")).toHaveLength(4);
            expect(centreOf(bar, facesNamed(bar, "bar:side:profile.bottom")[0]!)[2]).toBeCloseTo(0.5, 6);
        });

        it("should loft through profiles in order, naming the first and last caps and each profile's sides", () => {
            // Arrange
            const document: Document = {
                schemaVersion: 1,
                features: [
                    rectangle("low", 4, 4, { plane: "XY" }, [-2, -2]),
                    rectangle("high", 2, 2, { plane: "XY", offset: 5 }, [-1, -1]),
                    { id: "frustum", type: "loft", profiles: ["low", "high"] },
                ],
            };

            // Act
            const result = occt.design.build({ document });

            // Assert
            const frustum = result.parts[0]!;
            expect(volume(frustum.shape)).toBeCloseTo((5 / 3) * (16 + 4 + 8), 4);
            expect(centreOf(frustum, facesNamed(frustum, "frustum:start")[0]!)[2]).toBeCloseTo(0, 6);
            expect(centreOf(frustum, facesNamed(frustum, "frustum:end")[0]!)[2]).toBeCloseTo(5, 6);
            expect(facesNamed(frustum, "frustum:side:low.bottom")).toEqual(facesNamed(frustum, "frustum:side:high.bottom"));
            expect(facesNamed(frustum, "frustum:side")).toHaveLength(4);
        });

        it("should loft an open skin when solid is false and join a sweep to a body", () => {
            // Arrange
            const document: Document = {
                schemaVersion: 1,
                features: [
                    rectangle("low", 4, 4, { plane: "XY" }, [-2, -2]),
                    rectangle("high", 4, 4, { plane: "XY", offset: 5 }, [-2, -2]),
                    { id: "skin", type: "loft", profiles: ["low", "high"], solid: false },
                    { id: "block", type: "extrude", profile: "low", distance: 2 },
                    { id: "spine", type: "sketch", on: { plane: "XZ" }, pen: [{ type: "hLine", id: "across", length: 10 }] },
                    rectangle("ring", 1, 1, { plane: "YZ" }, [-0.5, 0]),
                    { id: "rail", type: "sweep", profile: "ring", path: "spine", body: "block" },
                ],
            };

            // Act
            const result = occt.design.build({ document });

            // Assert
            expect(statuses(result)).toEqual(["ok", "ok", "ok", "ok", "ok", "ok", "ok"]);
            const [skin, block] = result.parts;
            expect(facesNamed(skin!, "skin:start")).toEqual([]);
            expect(skin!.faceNames).toHaveLength(4);
            expect(skin!.volume).toBeUndefined();
            expect(volume(block!.shape)).toBeCloseTo(4 * 4 * 2 + 1 * 1 * 8, 4);
            expect(block!.volume).toBeCloseTo(4 * 4 * 2 + 1 * 1 * 8, 4);
        });
    });

    describe("shell, holes, boss and pocket", () => {
        it("should refuse a shell of thickness 0 before it offsets or thickens the body, leaving nothing of its own behind", () => {
            // Arrange
            const empty = plate({ id: "hollow", type: "shell", body: "plate", thickness: 0, open: { of: "plate", role: "end", count: 1 } });
            const offsets = vi.spyOn(occt.operations, "offsetAdv");
            const thickened = vi.spyOn(occt.operations, "makeThickSolidByJoinWithHistory");

            // Act
            const { answer, kept } = keptAfter(() => occt.design.build({ document: empty }));
            const calls = [offsets.mock.calls.length, thickened.mock.calls.length];
            offsets.mockRestore();
            thickened.mockRestore();

            // Assert
            expect(calls).toEqual([0, 0]);
            expect(statuses(answer)).toEqual(["ok", "ok", "failed"]);
            expect(kept).toEqual([]);
        });

        it("should keep none of the shapes it made cutting a shell open when a lid or the cut that opens it throws", () => {
            // Arrange
            const flatFacesOpen: Document = {
                schemaVersion: 1,
                features: [
                    { id: "block", type: "operation", operation: "occt.shapes.solid.createBox", params: { width: 20, length: 20, height: 10, center: [0, 5, 0] } },
                    { id: "round", type: "operation", operation: "occt.fillets.filletEdges", params: { shape: { body: "block" }, radius: 1 }, body: "block" },
                    { id: "hollow", type: "shell", body: "block", thickness: 0.5, open: { of: "block", role: "face", filter: { select: "ofType", type: "plane" }, count: 6 } },
                ],
            };
            const joins = vi.spyOn(occt.operations, "makeThickSolidByJoinWithHistory").mockImplementation(() => { throw new Error("no joins"); });
            const extrude = occt.operations.extrude.bind(occt.operations);
            const difference = occt.booleans.differenceWithHistory.bind(occt.booleans);

            // Act
            const lids = vi.spyOn(occt.operations, "extrude").mockImplementation(inputs => {
                if ((inputs.direction?.[1] ?? 0) < 0) {
                    throw new Error("no lid facing -Y");
                }
                return extrude(inputs);
            });
            const lidFailed = keptAfter(() => occt.design.build({ document: flatFacesOpen }));
            lids.mockRestore();
            const cuts = vi.spyOn(occt.booleans, "differenceWithHistory").mockImplementation(inputs => {
                if (inputs.strategy !== undefined) {
                    throw new Error("no opening cut");
                }
                return difference(inputs);
            });
            const cutFailed = keptAfter(() => occt.design.build({ document: flatFacesOpen }));
            cuts.mockRestore();
            joins.mockRestore();

            // Assert
            expect(lidFailed.answer.report[2]?.messages[0]).toMatch(/by cutting: no lid facing -Y\)$/);
            expect(cutFailed.answer.report[2]?.messages[0]).toMatch(/by cutting: no opening cut\)$/);
            expect([lidFailed.kept, cutFailed.kept]).toEqual([[], []]);
        });

        const roundedAllOpen: Document = {
            schemaVersion: 1,
            features: [
                { id: "block", type: "operation", operation: "occt.shapes.solid.createBox", params: { width: 20, length: 20, height: 10, center: [0, 5, 0] } },
                { id: "round", type: "operation", operation: "occt.fillets.filletEdges", params: { shape: { body: "block" }, radius: 1 }, body: "block" },
                { id: "hollow", type: "shell", body: "block", thickness: 0.5, open: { of: "block", role: "face", filter: { select: "ofType", type: "plane" }, count: 6 } },
            ],
        };
        const shellParts: [string, () => { mockRestore: () => void }][] = [
            ["taking the third face it opens", () => {
                const getFace = occt.shapes.face.getFace.bind(occt.shapes.face);
                let taken = 0;
                return vi.spyOn(occt.shapes.face, "getFace").mockImplementation(inputs => {
                    taken += 1;
                    if (taken === 3) {
                        throw new Error("no third face");
                    }
                    return getFace(inputs);
                });
            }],
            ["reading the inward offset's type", () => {
                const getShapeType = occt.shapes.shape.getShapeType.bind(occt.shapes.shape);
                return vi.spyOn(occt.shapes.shape, "getShapeType").mockImplementation(inputs => {
                    const type = getShapeType(inputs);
                    if (String(type) === "shell") {
                        throw new Error("no type");
                    }
                    return type;
                });
            }],
            ["closing the inward offset into a solid", () => vi.spyOn(occt.shapes.solid, "fromClosedShell").mockImplementation(() => { throw new Error("no solid"); })],
            ["checking the inner solid", () => vi.spyOn(occt.shapeFix, "isValid").mockImplementation(() => { throw new Error("no check"); })],
        ];

        it.each(shellParts)("should keep none of the shapes a shell took or made when %s throws", (_what, failing) => {
            // Arrange
            const joins = vi.spyOn(occt.operations, "makeThickSolidByJoinWithHistory").mockImplementation(() => { throw new Error("no joins"); });
            const failed = failing();

            // Act
            let built: { answer: Models.OCCT.DesignBuildResult<TopoDS_Shape>; kept: string[] } | undefined;
            try {
                built = keptAfter(() => occt.design.build({ document: roundedAllOpen }));
            } finally {
                failed.mockRestore();
                joins.mockRestore();
            }

            // Assert
            expect([statuses(built.answer), built.kept]).toEqual([["ok", "ok", "failed"], []]);
        });

        it("should hollow a body, naming the rim where the open face was and the inner walls", () => {
            // Arrange
            const document = plate({ id: "hollow", type: "shell", body: "plate", thickness: 2, open: { of: "plate", role: "end", count: 1 } });

            // Act
            const result = occt.design.build({ document });

            // Assert
            const hollow = result.parts[0]!;
            expect(volume(hollow.shape)).toBeCloseTo(40 * 20 * 10 - 36 * 16 * 8, 4);
            const rim = facesNamed(hollow, "hollow:rim");
            expect(rim).toHaveLength(1);
            expect(areaOf(hollow, rim[0]!)).toBeCloseTo(40 * 20 - 36 * 16, 4);
            expect(facesNamed(hollow, "hollow:inner")).toHaveLength(5);
        });

        it("should hollow a filleted body into a valid solid", () => {
            // Arrange
            const document = plate(
                { id: "soft", type: "fillet", body: "plate", radius: 2, edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 4 } },
                { id: "hollow", type: "shell", body: "plate", thickness: 1, open: { of: "plate", role: "start", count: 1 } },
            );

            // Act
            const result = occt.design.build({ document });

            // Assert
            const hollow = result.parts[0]!;
            expect(statuses(result)).toEqual(["ok", "ok", "ok", "ok"]);
            expect(occt.shapeFix.isValid({ shape: hollow.shape })).toBe(true);
            expect(facesNamed(hollow, "hollow:rim")).toHaveLength(1);
            expect(volume(hollow.shape)).toBeLessThan(40 * 20 * 10 - 38 * 18 * 9);
        });

        it("should hollow a block rounded all round, which OCCT's own shell leaves invalid, by cutting its inward offset and a lid out", () => {
            // Arrange
            const allRound: Document = {
                schemaVersion: 1,
                features: [
                    { id: "block", type: "operation", operation: "occt.shapes.solid.createBox", params: { width: 20, length: 20, height: 10, center: [0, 5, 0] } },
                    { id: "round", type: "operation", operation: "occt.fillets.filletEdges", params: { shape: { body: "block" }, radius: 1 }, body: "block" },
                    { id: "hollow", type: "shell", body: "block", thickness: 0.5, open: { of: "block", role: "face", filter: { select: "facing", direction: [0, 1, 0] }, count: 1 } },
                ],
            };
            const solid: Document = { ...allRound, features: allRound.features.slice(0, 2) };

            // Act
            const built = occt.design.build({ document: allRound });
            const whole = occt.design.build({ document: solid });

            // Assert
            const [part] = built.parts;
            const [solidPart] = whole.parts;
            expect(built.report.map(entry => entry.status)).toEqual(["ok", "ok", "ok"]);
            expect(part !== undefined && solidPart !== undefined).toBe(true);
            if (part === undefined || solidPart === undefined) {
                return;
            }
            expect(occt.shapeFix.isValid({ shape: part.shape })).toBe(true);
            expect(volume(solidPart.shape)).toBeCloseTo(3958.419, 2);
            expect(volume(part.shape)).toBeCloseTo(3958.419 - 3239.081 - 18 * 18 * 0.5, 2);
            expect(facesNamed(part, "hollow:inner").length).toBeGreaterThan(20);
            expect(facesNamed(part, "hollow:rim")).toHaveLength(4);
            expect(facesNamed(part, "hollow:rim").filter(face => part.faceNames[face]?.includes("hollow:inner"))).toEqual([]);
        });

        it("should not cut a shell open through a curved face, and say so", () => {
            // Arrange
            const roundOpen: Document = {
                schemaVersion: 1,
                features: [
                    { id: "block", type: "operation", operation: "occt.shapes.solid.createBox", params: { width: 20, length: 20, height: 10, center: [0, 5, 0] } },
                    { id: "round", type: "operation", operation: "occt.fillets.filletEdges", params: { shape: { body: "block" }, radius: 1 }, body: "block" },
                    { id: "hollow", type: "shell", body: "block", thickness: 0.5, open: { of: "round", role: "face", filter: { select: "nearest", point: [10, 10, 0] }, count: 1 } },
                ],
            };

            // Act
            const report = occt.design.build({ document: roundOpen }).report[2];

            // Assert
            expect(report?.status).toBe("failed");
            expect(report?.messages[0]).toMatch(/by cutting, an open face is not flat or has no inner face below it\)$/);
        });

        it("should refuse a shell OCCT cannot build or leaves unhollowed with either join and by cutting, naming why for each", () => {
            // Arrange
            const dented = plate(
                rectangle("dent", 4, 4, { face: { of: "plate", role: "end" }, origin: [20, 10, 10] }, [-2, -2]),
                { id: "dip", type: "pocket", profile: "dent", body: "plate", distance: 4 },
                { id: "hollow", type: "shell", body: "plate", thickness: 0.5, open: { of: "plate", role: "end", count: 1 } },
            );
            const tooThick = plate({ id: "hollow", type: "shell", body: "plate", thickness: 25, open: { of: "plate", role: "end", count: 1 } });

            // Act
            const refused = occt.design.build({ document: dented }).report[4]!;
            const unhollowed = occt.design.build({ document: tooThick }).report[2]!;

            // Assert
            expect(refused.messages[0]).toMatch(/^\/features\/4\/thickness: the shell could not be built \(with arc joins: .+; with intersection joins: .+; by cutting.+\)$/);
            expect(unhollowed.messages).toEqual(["/features/2/thickness: the shell could not be built (with arc joins nothing was hollowed; with intersection joins nothing was hollowed; by cutting, the inward offset is not one closed solid)"]);
        });

        it("should drill holes at positions on a face, through by default, naming each hole's walls", () => {
            // Arrange
            const plain = plate({ id: "holes", type: "hole", body: "plate", on: { of: "plate", role: "end" }, origin: [20, 10, 10], at: [{ id: "left", x: -10, y: 0 }, { id: "right", x: 10, y: 0 }], diameter: 4 });
            const bored = plate({ id: "holes", type: "hole", body: "plate", on: { of: "plate", role: "end" }, origin: [20, 10, 10], at: [{ id: "bore", x: -10, y: 0 }], diameter: 4, counterbore: { diameter: 8, depth: 2 } });
            const sunk = plate({ id: "holes", type: "hole", body: "plate", on: { of: "plate", role: "end" }, origin: [20, 10, 10], at: [{ id: "sink", x: "-10", y: "2 + 2" }], diameter: 4, depth: 5, countersink: { diameter: 8, angle: 90 } });

            // Act
            const drilled = occt.design.build({ document: plain }).parts[0]!;
            const counterbored = occt.design.build({ document: bored }).parts[0]!;
            const countersunk = occt.design.build({ document: sunk }).parts[0]!;

            // Assert
            expect(volume(drilled.shape)).toBeCloseTo(40 * 20 * 10 - 2 * Math.PI * 4 * 10, 4);
            expect(facesNamed(drilled, "holes:wall")).toHaveLength(2);
            expect(centreOf(drilled, facesNamed(drilled, "holes:wall:right")[0]!)[0]).toBeCloseTo(30, 6);
            expect(facesNamed(counterbored, "holes:wall:bore")).toHaveLength(3);
            expect(volume(counterbored.shape)).toBeCloseTo(40 * 20 * 10 - Math.PI * 4 * 8 - Math.PI * 16 * 2, 4);
            expect(facesNamed(countersunk, "holes:wall:sink").length).toBeGreaterThanOrEqual(2);
            facesNamed(countersunk, "holes:wall:sink").forEach(face => expect(centreOf(countersunk, face).slice(0, 2)).toEqual([expect.closeTo(10, 6), expect.closeTo(14, 6)]));
            expect(volume(countersunk.shape)).toBeLessThan(40 * 20 * 10 - Math.PI * 4 * 5 + 1e-6);
        });

        it("should drill holes on a face a union split in two, its pieces still one plane", () => {
            // Arrange
            const split = plate(
                rectangle("ribBase", 4, 20, { plane: "XY", offset: 10 }, [18, 0]),
                { id: "rib", type: "extrude", profile: "ribBase", distance: 5 },
                { id: "ribbed", type: "boolean", operation: "union", body: "plate", tools: ["rib"] },
                { id: "holes", type: "hole", body: "plate", on: { of: "plate", role: "end" }, origin: [20, 10, 10], at: [{ id: "left", x: -10, y: 0 }, { id: "right", x: 10, y: 0 }], diameter: 4 },
            );

            // Act
            const built = occt.design.build({ document: split });

            // Assert
            expect(statuses(built)).not.toContain("failed");
            expect(volume(built.parts[0]!.shape)).toBeCloseTo(40 * 20 * 10 + 4 * 20 * 5 - 2 * Math.PI * 4 * 10, 4);
            expect(facesNamed(built.parts[0]!, "holes:wall")).toHaveLength(2);
        });

        it("should remove a hole's wall and fill the hole, the faces that stay keeping their names, and ask how many faces it removes", () => {
            // Arrange
            const drilled: Models.OCCT.DesignHoleFeature = { id: "holes", type: "hole", body: "plate", on: { of: "plate", role: "end" }, origin: [20, 10, 10], at: [{ id: "left", x: -10, y: 0 }, { id: "right", x: 10, y: 0 }], diameter: 4 };
            const filled = plate(drilled, { id: "fill", type: "removeFaces", body: "plate", faces: { of: "holes", role: "wall", from: "left", count: 1 } });
            const uncounted = plate(drilled, { id: "fill", type: "removeFaces", body: "plate", faces: { of: "holes", role: "wall", from: "left" } });

            // Act
            const built = occt.design.build({ document: filled });
            const check = occt.design.validate({ document: uncounted });

            // Assert
            const [part] = built.parts;
            expect(built.report.map(entry => entry.status)).toEqual(["ok", "ok", "ok", "ok"]);
            expect(built.parts).toHaveLength(1);
            if (part === undefined) {
                return;
            }
            expect(volume(part.shape)).toBeCloseTo(40 * 20 * 10 - Math.PI * 4 * 10, 4);
            expect(facesNamed(part, "holes:wall:left")).toEqual([]);
            expect(facesNamed(part, "holes:wall:right")).toHaveLength(1);
            expect(facesNamed(part, "plate:end")).toHaveLength(1);
            expect(check.map(issue => issue.path)).toEqual(["/features/3/faces/count"]);
        });

        it("should raise a boss from a sketch on a face and sink pockets a distance, until a face or through", () => {
            // Arrange
            const square = rectangle("square", 4, 4, { face: { of: "plate", role: "end" }, origin: [20, 10, 10] }, [-2, -2]);
            const boss = plate(square, { id: "lug", type: "boss", profile: "square", body: "plate", distance: 5 });
            const shallow = plate(square, { id: "dent", type: "pocket", profile: "square", body: "plate", distance: 3 });
            const until = plate(square, { id: "dent", type: "pocket", profile: "square", body: "plate", until: { of: "plate", role: "start" } });
            const through = plate(square, { id: "dent", type: "pocket", profile: "square", body: "plate", through: true });

            // Act
            const raised = occt.design.build({ document: boss }).parts[0]!;
            const [dented, toFloor, pierced] = [shallow, until, through].map(document => occt.design.build({ document }).parts[0]!);

            // Assert
            expect(volume(raised.shape)).toBeCloseTo(40 * 20 * 10 + 16 * 5, 4);
            expect(centreOf(raised, facesNamed(raised, "lug:end")[0]!)[2]).toBeCloseTo(15, 6);
            expect(facesNamed(raised, "lug:side")).toHaveLength(4);
            expect(facesNamed(raised, "lug:side:square.right")).toHaveLength(1);
            expect(volume(dented!.shape)).toBeCloseTo(40 * 20 * 10 - 16 * 3, 4);
            expect(centreOf(dented!, facesNamed(dented!, "dent:end")[0]!)[2]).toBeCloseTo(7, 6);
            expect(volume(toFloor!.shape)).toBeCloseTo(40 * 20 * 10 - 16 * 10, 4);
            expect(volume(pierced!.shape)).toBeCloseTo(40 * 20 * 10 - 16 * 10, 4);
        });

        it("should refuse a boss whose sketch face is not on the body and distances that are not above 0", () => {
            // Arrange
            const square = rectangle("square", 4, 4, { face: { of: "plate", role: "end" }, origin: [20, 10, 10] }, [-2, -2]);
            const elsewhere = plate(square, rectangle("o", 2, 2, { plane: "XY" }, [100, 0]), { id: "other", type: "extrude", profile: "o", distance: 1 }, { id: "lug", type: "boss", profile: "square", body: "other", distance: 1 });
            const flat = plate(square, { id: "lug", type: "boss", profile: "square", body: "plate", distance: 0 });
            const empty = plate({ id: "hollow", type: "shell", body: "plate", thickness: 0, open: { of: "plate", role: "end", count: 1 } });
            const sides = plate(square, { id: "dent", type: "pocket", profile: "square", body: "plate", until: { of: "plate", role: "side" } });

            // Act
            const messages = [elsewhere, flat, empty, sides].map(document => occt.design.build({ document }).report.find(entry => entry.status === "failed")!.messages);

            // Assert
            expect(messages).toEqual([
                ["/features/5/profile: the reference finds no faces"],
                ["/features/3/distance: the distance is above 0, not 0"],
                ["/features/2/thickness: the thickness is 0"],
                ["/features/3/until: one face of \"plate\" is needed here, and the reference finds 4"],
            ]);
        });
    });

    describe("import", () => {
        const brepOf = (shape: TopoDS_Shape): string => occt.io.saveShapeBrep({ shape, tryDownload: false, withTriangulation: false });
        const block = (): TopoDS_Shape => occt.shapes.solid.createBox({ width: 4, length: 4, height: 2, center: [0, 1, 0] });

        it("should start a body from text BREP, binary BREP and STEP, naming its faces by index", () => {
            // Arrange
            const text = brepOf(block());
            const bytes = occt.io.saveShapeBrepBinary({ shape: block(), tryDownload: false, withTriangulation: false });
            const step = occt.io.saveShapeSTEP({ shape: block(), tryDownload: false });
            const documentFor = (uri: string, sha: string): Document => ({
                schemaVersion: 1,
                assets: [{ id: "file", uri, sha256: sha }],
                features: [
                    { id: "part", type: "import", asset: "file" },
                    { id: "soft", type: "fillet", body: "part", radius: 0.2, edges: { between: [{ of: "part", role: "face", from: "0" }, { of: "part", role: "face" }], count: 4 } },
                ],
            });

            // Act
            const fromText = occt.design.build({ document: documentFor("files/block.brep", sha256(new TextEncoder().encode(text))), assets: { file: text } });
            const fromBytes = occt.design.build({ document: documentFor("files/block.brep", sha256(bytes)), assets: { file: bytes } });
            const fromStep = occt.design.build({ document: documentFor("files/block.step", sha256(new TextEncoder().encode(step))), assets: { file: new TextEncoder().encode(step).buffer } });

            // Assert
            for (const result of [fromText, fromBytes, fromStep]) {
                expect(statuses(result)).toEqual(["ok", "ok"]);
                expect(facesNamed(result.parts[0]!, "soft:round")).toHaveLength(4);
            }
            expect(volume(fromBytes.parts[0]!.shape)).toBeLessThan(32);
        });

        it("should refuse data that is missing, does not match its SHA-256, or has a format it cannot tell", () => {
            // Arrange
            const text = brepOf(block());
            const step = occt.io.saveShapeSTEP({ shape: block(), tryDownload: false });
            const hashOf = (data: string): string => sha256(new TextEncoder().encode(data));
            const documentFor = (asset: Models.OCCT.DesignAsset): Document => ({ schemaVersion: 1, assets: [asset], features: [{ id: "part", type: "import", asset: asset.id }] });

            // Act
            const missing = occt.design.build({ document: documentFor({ id: "file", uri: "a.brep", sha256: hashOf(text) }) }).report[0]!.messages;
            const inherited = occt.design.build({ document: documentFor({ id: "constructor", uri: "a.brep", sha256: hashOf(text) }), assets: {} }).report[0]!.messages;
            const changed = occt.design.build({ document: documentFor({ id: "file", uri: "a.brep", sha256: "0".repeat(64) }), assets: { file: text } }).report[0]!.messages;
            const unknown = occt.design.build({ document: documentFor({ id: "file", uri: "a.dat", sha256: hashOf(text) }), assets: { file: text } }).report[0]!.messages;
            const told = occt.design.build({ document: { ...documentFor({ id: "file", uri: "a.dat", sha256: hashOf(text) }), features: [{ id: "part", type: "import", asset: "file", format: "brep" }] }, assets: { file: text } });
            const media = occt.design.build({ document: documentFor({ id: "file", uri: "download", mediaType: "model/step", sha256: hashOf(step) }), assets: { file: step } });
            const brepMedia = occt.design.build({ document: documentFor({ id: "file", uri: "download", mediaType: "model/vnd.occt.brep; version=3", sha256: hashOf(text) }), assets: { file: text } });

            // Assert
            expect(missing).toEqual(["/features/0/asset: the build was given no data for the asset \"file\""]);
            expect(inherited).toEqual(["/features/0/asset: the build was given no data for the asset \"constructor\""]);
            expect(changed).toEqual([`/features/0/asset: the data given for "file" has the SHA-256 ${sha256(new TextEncoder().encode(text))}, not the ${"0".repeat(64)} the document records`]);
            expect(unknown).toEqual(["/features/0/format: the format of \"a.dat\" cannot be told from its media type or extension: give format"]);
            expect(statuses(told)).toEqual(["ok"]);
            expect(statuses(media)).toEqual(["ok"]);
            expect(statuses(brepMedia)).toEqual(["ok"]);
        });

        it("should read binary BREP given as text as its bytes, and refuse one that holds no shape", () => {
            // Arrange
            const garbage = "not a binary BREP";
            const document: Document = { schemaVersion: 1, assets: [{ id: "file", uri: "a.bin", sha256: sha256(new TextEncoder().encode(garbage)) }], features: [{ id: "part", type: "import", asset: "file", format: "brep-binary" }] };

            // Act
            const report = occt.design.build({ document, assets: { file: garbage } }).report[0];

            // Assert
            expect(report?.status).toBe("failed");
            expect(report?.messages).toHaveLength(1);
        });

        it("should rebuild an import when its data changes and reuse it when it does not", () => {
            // Arrange
            const small = brepOf(block());
            const large = brepOf(occt.shapes.solid.createBox({ width: 8, length: 8, height: 2, center: [0, 1, 0] }));
            const documentOf = (data: string, mediaType?: string): Document => ({ schemaVersion: 1, assets: [{ id: "file", uri: "a.brep", sha256: sha256(new TextEncoder().encode(data)), ...(mediaType === undefined ? {} : { mediaType }) }], features: [{ id: "part", type: "import", asset: "file" }] });
            occt.design.build({ document: documentOf(small), assets: { file: small } });

            // Act
            const same = occt.design.build({ document: documentOf(small), assets: { file: small } });
            const recorded = occt.design.build({ document: documentOf(small, "text/plain"), assets: { file: small } });
            const changed = occt.design.build({ document: documentOf(large), assets: { file: large } });

            // Assert
            expect(same.report[0]!.cached).toBe(true);
            expect(recorded.report[0]!.cached).toBe(false);
            expect(changed.report[0]!.cached).toBe(false);
            expect(volume(changed.parts[0]!.shape)).toBeCloseTo(128, 6);
        });
    });

    describe("validation of the new features", () => {
        const pathsOf = (document: unknown): string[] => occt.design.validate({ document: document as Document }).map(issue => issue.path);

        it("should refuse references, extents and inputs the new features cannot use", () => {
            // Arrange
            const square = rectangle("square", 4, 4, { face: { of: "plate", role: "end" }, origin: [20, 10, 10] }, [-2, -2]);
            const document = {
                ...plate(square, rectangle("free", 2, 2, { plane: "XY" })),
                assets: [{ id: "file", uri: "a.step" }],
                features: [
                    ...plate(square, rectangle("free", 2, 2, { plane: "XY" })).features,
                    { id: "a", type: "boss", profile: "free", body: "plate", distance: 1 },
                    { id: "b", type: "boss", profile: "square", body: "plate" },
                    { id: "c", type: "pocket", profile: "square", body: "plate", distance: 1, through: true },
                    { id: "d", type: "hole", body: "plate", on: { of: "plate", role: "end" }, origin: [20, 10, 10], at: [[0, 0]], diameter: 1, counterbore: { diameter: 2, depth: 1 }, countersink: { diameter: 2, angle: 90 } },
                    { id: "e", type: "hole", body: "plate", on: { of: "plate", role: "end" }, origin: [20, 10, 10], at: [], diameter: 1 },
                    { id: "f", type: "hole", body: "plate", on: { of: "plate", role: "end" }, origin: [20, 10, 10], at: [[0]], diameter: 1 },
                    { id: "g", type: "hole", body: "plate", on: { of: "plate", role: "end" }, origin: [20, 10, 10], at: [[0, 0]], diameter: 1, counterbore: { diameter: 2 } },
                    { id: "h", type: "loft", profiles: ["free"] },
                    { id: "i", type: "sweep", profile: "free", path: "nothing" },
                    { id: "j", type: "import", asset: "other" },
                    { id: "k", type: "import", asset: "file", format: "obj" },
                    { id: "l", type: "shell", body: "plate", thickness: 1, open: { of: "plate", role: "end", from: "2", count: 1 } },
                    { id: "m", type: "fillet", body: "plate", radius: 1, edges: { between: [{ of: "d", role: "wall", from: "x" }, { of: "plate", role: "end" }], count: 1 } },
                    { id: "n", type: "fillet", body: "plate", radius: 1, edges: { between: [{ of: "d", role: "wall", from: "0" }, { of: "plate", role: "end" }], count: 1 } },
                ],
            };

            // Act
            const paths = pathsOf(document);

            // Assert
            expect(paths).toEqual([
                "/features/4/profile",
                "/features/5",
                "/features/6",
                "/features/7/countersink",
                "/features/8/at",
                "/features/9/at/0",
                "/features/10/counterbore/depth",
                "/features/11/profiles",
                "/features/12/path",
                "/features/13/asset",
                "/features/14/format",
                "/features/15/open/from",
                "/features/16/edges/between/0/from",
                "/features/17/edges/between/0/from",
            ]);
        });

        it("should take a failed import as made, so what reads its body is still checked against it", () => {
            // Act
            const paths = pathsOf({ schemaVersion: 1, features: [{ id: "part", type: "import", asset: "missing" }, { id: "lift", type: "operation", operation: "occt.transforms.translate", params: { shape: { body: "part" } } }] });

            // Assert
            expect(paths).toEqual(["/features/0/asset"]);
        });
    });
});
