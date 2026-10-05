import { describe, it, expect, beforeAll } from "vitest";
import type { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import type * as Models from "../../api/models";
import { sha256 } from "./digest";

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
        const helper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel);
        occt = new OCCTService(kernel, helper);
    }, 120_000);

    const volume = (shape: TopoDS_Shape): number => occt.shapes.solid.getSolidVolume({ shape });
    const facesNamed = (part: Models.OCCT.DesignBuiltPart<TopoDS_Shape>, name: string): number[] => part.faceNames.flatMap((names, index) => names.includes(name) ? [index] : []);
    const centreOf = (part: Models.OCCT.DesignBuiltPart<TopoDS_Shape>, face: number): number[] => occt.analysis.signatures({ shape: part.shape }).faces[face]!.centre;
    const areaOf = (part: Models.OCCT.DesignBuiltPart<TopoDS_Shape>, face: number): number => occt.analysis.signatures({ shape: part.shape }).faces[face]!.area;
    const statuses = (result: Models.OCCT.DesignBuildResult<TopoDS_Shape>): string[] => result.report.map(entry => entry.status);

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
            expect(outside.report[0]!.messages).toEqual(["/features/0/loops: the loops make no valid face: they cross, or a hole lies outside the first loop"]);
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

        it("should refuse a shell OCCT builds invalid, cannot build, or leaves unhollowed with either join, naming why for each", () => {
            // Arrange
            const allRound: Document = {
                schemaVersion: 1,
                features: [
                    { id: "block", type: "operation", operation: "occt.shapes.solid.createBox", params: { width: 20, length: 20, height: 10, center: [0, 5, 0] } },
                    { id: "round", type: "operation", operation: "occt.fillets.filletEdges", params: { shape: { body: "block" }, radius: 1 }, body: "block" },
                    { id: "hollow", type: "shell", body: "block", thickness: 0.5, open: { of: "block", role: "face", filter: { select: "facing", direction: [0, 1, 0] }, count: 1 } },
                ],
            };
            const dented = plate(
                rectangle("dent", 4, 4, { face: { of: "plate", role: "end" }, origin: [20, 10, 10] }, [-2, -2]),
                { id: "dip", type: "pocket", profile: "dent", body: "plate", distance: 4 },
                { id: "hollow", type: "shell", body: "plate", thickness: 0.5, open: { of: "plate", role: "end", count: 1 } },
            );
            const tooThick = plate({ id: "hollow", type: "shell", body: "plate", thickness: 25, open: { of: "plate", role: "end", count: 1 } });

            // Act
            const invalid = occt.design.build({ document: allRound }).report[2]!;
            const refused = occt.design.build({ document: dented }).report[4]!;
            const unhollowed = occt.design.build({ document: tooThick }).report[2]!;

            // Assert
            expect(invalid.messages).toEqual(["/features/2/thickness: the shell could not be built (with arc joins the solid is not valid; with intersection joins nothing was hollowed)"]);
            expect(refused.messages[0]).toMatch(/^\/features\/4\/thickness: the shell could not be built \(with arc joins: .+; with intersection joins: .+\)$/);
            expect(unhollowed.messages).toEqual(["/features/2/thickness: the shell could not be built (with arc joins nothing was hollowed; with intersection joins nothing was hollowed)"]);
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
