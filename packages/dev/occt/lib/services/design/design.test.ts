import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule, TopoDS_Shape } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTService } from "../../occ-service";
import * as Models from "../../api/models";
import { InputError } from "@bitbybit-dev/base";

type Document = Models.OCCT.DesignPartDocument;

const rectangle = (id: string, width: string | number, depth: string | number, on: Models.OCCT.DesignSketchPlacement = { plane: "XY" }, start: [number, number] = [0, 0]): Models.OCCT.DesignSketchFeature => ({
    id,
    type: "sketch",
    on,
    start,
    pen: [
        { type: "hLine", id: "bottom", length: width },
        { type: "vLine", id: "right", length: depth },
        { type: "hLine", id: "top", length: typeof width === "number" ? -width : `-(${width})` },
        { type: "close", id: "left" },
    ],
});

const plate = (extra: Models.OCCT.DesignFeature[] = [], parameters: NonNullable<Document["parameters"]> = { width: 40, depth: 20, height: 10 }): Document => ({
    schemaVersion: 1,
    parameters,
    features: [
        rectangle("base", "width", "depth"),
        { id: "plate", type: "extrude", profile: "base", distance: "height" },
        ...extra,
    ],
});

describe("OCCT design documents", () => {
    let kernel: BitbybitOcctModule;
    let occt: OCCTService;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        const helper = new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel);
        occt = new OCCTService(kernel, helper);
    }, 120_000);

    const size = (shape: TopoDS_Shape): number[] => occt.analysis.measure.tightBoundingBox({ shape }).size;
    const volume = (shape: TopoDS_Shape): number => occt.shapes.solid.getSolidVolume({ shape });
    const facesNamed = (faceNames: string[][], name: string): number[] => faceNames.flatMap((names, index) => names.includes(name) ? [index] : []);

    describe("building", () => {
        it("should extrude a sketch into a body whose faces are named by role and sketch command", () => {
            // Arrange
            const document = plate();

            // Act
            const result = occt.design.build({ document });

            // Assert
            expect(result.report.map(entry => entry.status)).toEqual(["ok", "ok"]);
            expect(result.parts.map(body => body.id)).toEqual(["plate"]);
            const body = result.parts[0]!;
            expect(volume(body.shape)).toBeCloseTo(40 * 20 * 10, 6);
            expect(facesNamed(body.faceNames, "plate:start")).toHaveLength(1);
            expect(facesNamed(body.faceNames, "plate:end")).toHaveLength(1);
            expect(facesNamed(body.faceNames, "plate:side")).toHaveLength(4);
            const signatures = occt.analysis.signatures({ shape: body.shape }).faces;
            expect(signatures[facesNamed(body.faceNames, "plate:end")[0]!]!.centre[2]).toBeCloseTo(10, 6);
            expect(signatures[facesNamed(body.faceNames, "plate:side:base.right")[0]!]!.centre[0]).toBeCloseTo(40, 6);
            expect(signatures[facesNamed(body.faceNames, "plate:side:base.bottom")[0]!]!.centre[1]).toBeCloseTo(0, 6);
        });

        it("should follow parameter values given to the build over the document's own", () => {
            // Arrange
            const document = plate([], { width: 40, depth: "width / 2", height: 10 });

            // Act
            const result = occt.design.build({ document, parameters: { width: 60 } });

            // Assert
            expect(size(result.parts[0]!.shape)).toEqual([expect.closeTo(60, 6), expect.closeTo(30, 6), expect.closeTo(10, 6)]);
        });

        it("should round the edges a reference names between two sets of faces and keep naming them when the size changes", () => {
            // Arrange
            const document = plate([{ id: "round", type: "fillet", body: "plate", radius: 2, edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 4 } }]);

            // Act
            const small = occt.design.build({ document });
            const large = occt.design.build({ document, parameters: { width: 80 } });

            // Assert
            for (const result of [small, large]) {
                expect(result.report.map(entry => entry.status)).toEqual(["ok", "ok", "ok"]);
                const names = result.parts[0]!.faceNames;
                expect(facesNamed(names, "round:round")).toHaveLength(4);
                expect(facesNamed(names, "plate:end")).toHaveLength(1);
                expect(facesNamed(names, "plate:side")).toHaveLength(4);
            }
        });
        it("should cut a sketch drawn on a named face through the body and name the walls of the hole", () => {
            // Arrange
            const document = plate([
                rectangle("slot", 4, 4, { face: { of: "plate", role: "end", count: 1 }, origin: [20, 10, 10] }, [-2, -2]),
                { id: "cut", type: "extrude", profile: "slot", distance: -12, body: "plate", join: "cut" },
            ]);

            // Act
            const result = occt.design.build({ document });

            // Assert
            expect(result.report.map(entry => entry.status)).toEqual(["ok", "ok", "ok", "ok"]);
            const body = result.parts[0]!;
            expect(result.parts.map(made => made.id)).toEqual(["plate"]);
            expect(volume(body.shape)).toBeCloseTo(40 * 20 * 10 - 4 * 4 * 10, 6);
            expect(facesNamed(body.faceNames, "cut:side")).toHaveLength(4);
            expect(facesNamed(body.faceNames, "cut:side:slot.left")).toHaveLength(1);
            const signatures = occt.analysis.signatures({ shape: body.shape }).faces;
            expect(signatures[facesNamed(body.faceNames, "cut:side:slot.left")[0]!]!.centre[0]).toBeCloseTo(18, 6);
            expect(facesNamed(body.faceNames, "plate:end")).toHaveLength(1);
        });

        it("should add a boss on a named face along the face's outward normal", () => {
            // Arrange
            const document = plate([
                rectangle("top", 10, 6, { face: { of: "plate", role: "end" }, origin: [20, 10, 10] }, [-5, -3]),
                { id: "boss", type: "extrude", profile: "top", distance: 5, body: "plate" },
            ]);

            // Act
            const result = occt.design.build({ document });

            // Assert
            const body = result.parts[0]!;
            expect(size(body.shape)[2]).toBeCloseTo(15, 6);
            expect(volume(body.shape)).toBeCloseTo(40 * 20 * 10 + 10 * 6 * 5, 6);
            const end = facesNamed(body.faceNames, "boss:end");
            expect(end).toHaveLength(1);
            expect(occt.analysis.signatures({ shape: body.shape }).faces[end[0]!]!.centre).toEqual([expect.closeTo(20, 6), expect.closeTo(10, 6), expect.closeTo(15, 6)]);
        });

        it("should revolve a sketch about an axis away from the origin, with start and end faces only on a part turn", () => {
            // Arrange
            const profile = rectangle("profile", 2, 3, { plane: "XY" }, [5, 0]);
            const whole: Document = { schemaVersion: 1, features: [profile, { id: "ring", type: "revolve", profile: "profile", axis: { origin: [0, 0, 0], direction: [0, 1, 0] } }] };
            const part: Document = { schemaVersion: 1, features: [profile, { id: "ring", type: "revolve", profile: "profile", axis: { origin: [1, 0, 0], direction: [0, 1, 0] }, angle: 90 }] };

            // Act
            const wholeTurn = occt.design.build({ document: whole }).parts[0]!;
            const partTurn = occt.design.build({ document: part }).parts[0]!;

            // Assert
            expect(volume(wholeTurn.shape)).toBeCloseTo(Math.PI * (49 - 25) * 3, 4);
            expect(facesNamed(wholeTurn.faceNames, "ring:start")).toHaveLength(0);
            expect(facesNamed(wholeTurn.faceNames, "ring:side:profile.left")).toHaveLength(1);
            expect(volume(partTurn.shape)).toBeCloseTo(Math.PI * (36 - 16) * 3 / 4, 4);
            expect(facesNamed(partTurn.faceNames, "ring:start")).toHaveLength(1);
            expect(facesNamed(partTurn.faceNames, "ring:end")).toHaveLength(1);
        });

        it("should use up the tools of a boolean and keep their face names on the body it continues", () => {
            // Arrange
            const document = plate([
                rectangle("square", 5, 5, { plane: "XY" }, [10, 5]),
                { id: "post", type: "extrude", profile: "square", distance: 20 },
                { id: "joined", type: "boolean", operation: "union", body: "plate", tools: ["post"] },
                { id: "soft", type: "fillet", body: "plate", radius: 1, edges: { between: [{ of: "post", role: "end" }, { of: "post", role: "side" }], count: 4 } },
            ]);

            // Act
            const result = occt.design.build({ document });

            // Assert
            expect(result.report.map(entry => entry.status)).toEqual(["ok", "ok", "ok", "ok", "ok", "ok"]);
            expect(result.parts.map(body => body.id)).toEqual(["plate"]);
            expect(facesNamed(result.parts[0]!.faceNames, "soft:round")).toHaveLength(4);
            expect(size(result.parts[0]!.shape)[2]).toBeCloseTo(20, 6);
        });

        it("should place a sketch on a face of a tool after a boolean took the tool into another body", () => {
            // Arrange
            const document = plate([
                rectangle("square", 5, 5, { plane: "XY" }, [10, 5]),
                { id: "post", type: "extrude", profile: "square", distance: 20 },
                { id: "joined", type: "boolean", operation: "union", body: "plate", tools: ["post"] },
                rectangle("cap", 1, 1, { face: { of: "post", role: "end" } }, [-0.5, -0.5]),
                { id: "pin", type: "extrude", profile: "cap", distance: 3, body: "plate" },
            ]);

            // Act
            const result = occt.design.build({ document });

            // Assert
            expect(result.report.map(entry => entry.status)).toEqual(["ok", "ok", "ok", "ok", "ok", "ok", "ok"]);
            expect(size(result.parts[0]!.shape)[2]).toBeCloseTo(23, 6);
        });

        it("should name the faces of each pattern copy apart from the original's", () => {
            // Arrange
            const document: Document = {
                schemaVersion: 1,
                features: [
                    rectangle("square", 4, 4),
                    { id: "block", type: "extrude", profile: "square", distance: 2 },
                    { id: "row", type: "linearPattern", body: "block", direction: [1, 0, 0], spacing: 10, count: 3 },
                    { id: "edge", type: "chamfer", body: "block", distance: 0.5, edges: { between: [{ of: "block", role: "end", copy: { of: "row", index: 2 } }, { of: "block", role: "side", copy: { of: "row", index: 2 } }], count: 4 } },
                ],
            };

            // Act
            const result = occt.design.build({ document });

            // Assert
            const body = result.parts[0]!;
            expect(result.report.map(entry => entry.status)).toEqual(["ok", "ok", "ok", "ok"]);
            expect(facesNamed(body.faceNames, "block:end")).toHaveLength(1);
            expect(facesNamed(body.faceNames, "block:end@row#1")).toHaveLength(1);
            const bevels = facesNamed(body.faceNames, "edge:bevel");
            expect(bevels).toHaveLength(4);
            const signatures = occt.analysis.signatures({ shape: body.shape }).faces;
            bevels.forEach(face => expect(signatures[face]!.centre[0]).toBeGreaterThan(20));
            expect(size(body.shape)[0]).toBeCloseTo(24, 6);
        });

        it("should turn copies evenly about an axis and mirror a body without its original", () => {
            // Arrange
            const document: Document = {
                schemaVersion: 1,
                features: [
                    rectangle("square", 2, 2, { plane: "XY" }, [5, -1]),
                    { id: "tooth", type: "extrude", profile: "square", distance: 1 },
                    { id: "ring", type: "polarPattern", body: "tooth", axis: { origin: [0, 0, 0], direction: [0, 0, 1] }, count: 4 },
                    rectangle("other", 2, 2, { plane: "XY" }, [10, 10]),
                    { id: "single", type: "extrude", profile: "other", distance: 1 },
                    { id: "flip", type: "mirror", body: "single", plane: { origin: [0, 0, 0], normal: [1, 0, 0] }, keepOriginal: false },
                ],
            };

            // Act
            const result = occt.design.build({ document });

            // Assert
            const [ring, single] = result.parts;
            expect(volume(ring!.shape)).toBeCloseTo(4 * 4, 6);
            expect(size(ring!.shape)).toEqual([expect.closeTo(14, 6), expect.closeTo(14, 6), expect.closeTo(1, 6)]);
            expect(facesNamed(ring!.faceNames, "tooth:end@ring#3")).toHaveLength(1);
            const centre = occt.analysis.signatures({ shape: single!.shape }).faces[facesNamed(single!.faceNames, "single:end@flip#1")[0]!]!.centre;
            expect(centre[0]).toBeCloseTo(-11, 6);
            expect(facesNamed(single!.faceNames, "single:end")).toHaveLength(0);
        });

        it("should run an operation by its path with bodies and expressions in its inputs, naming the faces of one without a history after it, and keeping them through a move", () => {
            // Arrange
            const document: Document = {
                schemaVersion: 1,
                parameters: { size: 4 },
                features: [
                    { id: "cube", type: "operation", operation: "occt.shapes.solid.createBox", params: { width: { expr: "size" }, length: { expr: "size * 2" }, height: 3, center: [0, 0, 0] } },
                    { id: "lift", type: "operation", operation: "occt.transforms.translate", params: { shape: { body: "cube" }, translation: [0, 0, { expr: "size" }] }, body: "cube" },
                ],
            };

            // Act
            const result = occt.design.build({ document });

            // Assert
            const body = result.parts[0]!;
            expect(result.parts.map(made => made.id)).toEqual(["cube"]);
            expect(size(body.shape)).toEqual([expect.closeTo(4, 6), expect.closeTo(3, 6), expect.closeTo(8, 6)]);
            expect(occt.operations.boundingBoxCenterOfShape({ shape: body.shape })[2]).toBeCloseTo(4, 6);
            expect(body.faceNames).toEqual(Array.from({ length: 6 }, () => ["cube:face"]));
        });
    });

    describe("placements and references", () => {
        const extent = (shape: TopoDS_Shape): { min: number[]; max: number[] } => {
            const bounds = occt.analysis.measure.tightBoundingBox({ shape });
            return { min: bounds.min.map(value => Number(value.toFixed(6))), max: bounds.max.map(value => Number(value.toFixed(6))) };
        };
        const messagesOf = (document: Document, index: number): string[] => occt.design.build({ document }).report[index]!.messages;

        it("should lay the XZ plane facing +Y with its y along -Z, and the YZ plane facing +X with its y along +Z, moved by the offset", () => {
            // Arrange
            const onPlane = (plane: "XZ" | "YZ"): Document => ({ schemaVersion: 1, features: [rectangle("s", 4, 2, { plane, offset: 3 }), { id: "b", type: "extrude", profile: "s", distance: 1 }] });

            // Act
            const xz = extent(occt.design.build({ document: onPlane("XZ") }).parts[0]!.shape);
            const yz = extent(occt.design.build({ document: onPlane("YZ") }).parts[0]!.shape);

            // Assert
            expect(xz).toEqual({ min: [0, 3, -2], max: [4, 4, 0] });
            expect(yz).toEqual({ min: [3, 0, 0], max: [4, 4, 2] });
        });

        it("should draw on a frame and sweep along its normal, reading lines, relative points and expressions in the pen", () => {
            // Arrange
            const document: Document = {
                schemaVersion: 1,
                parameters: { side: 3 },
                features: [
                    { id: "s", type: "sketch", on: { frame: { origin: [0, 0, 5], normal: [0, 0, -1], direction: [1, 0, 0] } }, pen: [{ type: "line", to: ["side", 0] }, { type: "line", to: [0, "side"], relative: true }, { type: "close" }] },
                    { id: "b", type: "extrude", profile: "s", distance: 2 },
                ],
            };

            // Act
            const result = occt.design.build({ document });

            // Assert
            expect(extent(result.parts[0]!.shape)).toEqual({ min: [0, -3, 3], max: [3, 0, 5] });
            expect(volume(result.parts[0]!.shape)).toBeCloseTo(9, 6);
        });

        it("should take a sketch's x direction on a face from the document, kept in the face's plane", () => {
            // Arrange
            const document = plate([
                rectangle("top", 4, 2, { face: { of: "plate", role: "end" }, origin: [0, 0, 10], direction: [0, 1, 1] }),
                { id: "boss", type: "extrude", profile: "top", distance: 1, body: "plate" },
            ]);

            // Act
            const result = occt.design.build({ document });

            // Assert
            const end = occt.analysis.signatures({ shape: result.parts[0]!.shape }).faces[facesNamed(result.parts[0]!.faceNames, "boss:end")[0]!]!;
            expect(end.centre).toEqual([expect.closeTo(-1, 6), expect.closeTo(2, 6), expect.closeTo(11, 6)]);
        });

        it("should refuse a sketch on faces that are not one flat face of a body, or a direction along its normal", () => {
            // Arrange
            const ring: Models.OCCT.DesignFeature[] = [rectangle("p", 1, 1, { plane: "XY" }, [3, 0]), { id: "ring", type: "revolve", profile: "p", axis: { origin: [0, 0, 0], direction: [0, 1, 0] } }];
            const onSketch = plate([rectangle("s", 1, 1, { face: { of: "base", role: "end" } })]);
            const onSides = plate([rectangle("s", 1, 1, { face: { of: "plate", role: "side" } })]);
            const onCurve = plate([...ring, rectangle("s", 1, 1, { face: { of: "ring", role: "side", from: "p.left" } })]);
            const alongNormal = plate([rectangle("s", 1, 1, { face: { of: "plate", role: "end" }, direction: [0, 0, 2] })]);

            // Act
            const messages = [messagesOf(onSketch, 2), messagesOf(onSides, 2), messagesOf(onCurve, 4), messagesOf(alongNormal, 2)];

            // Assert
            expect(messages).toEqual([
                ["/features/2/on/face/of: \"base\" made no faces of a body"],
                ["/features/2/on/face: one face is needed here, and the reference finds 4"],
                ["/features/4/on/face: a flat face is needed here, and this one is a cylinder"],
                ["/features/2/on/direction: the direction runs along the face's normal"],
            ]);
        });

        it("should narrow a reference with a selector and say when nothing or the wrong thing is found", () => {
            // Arrange
            const along = plate([{ id: "round", type: "fillet", body: "plate", radius: 1, edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], filter: { select: "along", direction: [1, 0, 0] }, count: 2 } }]);
            const missing = plate([{ id: "round", type: "fillet", body: "plate", radius: 1, edges: { between: [{ of: "plate", role: "rim" }, { of: "plate", role: "side" }], count: 2 } }]);
            const broken = plate([{ id: "round", type: "fillet", body: "plate", radius: 1, edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], filter: { select: "along", direction: [0, 0, 0] }, count: 2 } }]);

            // Act
            const rounded = occt.design.build({ document: along }).parts[0]!;
            const missingMessages = messagesOf(missing, 2);
            const brokenMessages = messagesOf(broken, 2);

            // Assert
            expect(facesNamed(rounded.faceNames, "round:round")).toHaveLength(2);
            expect(missingMessages).toEqual(["/features/2/edges/between/0: the reference finds no faces"]);
            expect(brokenMessages[0]).toMatch(/^\/features\/2\/edges\/filter: the filter failed: /);
        });

        it("should intersect a sweep with the body it names and mirror a body onto itself", () => {
            // Arrange
            const document = plate([
                rectangle("half", 20, 40, { plane: "XY" }, [0, -10]),
                { id: "keep", type: "extrude", profile: "half", distance: 30, body: "plate", join: "intersect" },
                { id: "twin", type: "mirror", body: "plate", plane: { origin: [30, 0, 0], normal: [1, 0, 0] } },
            ]);

            // Act
            const result = occt.design.build({ document });

            // Assert
            expect(result.report.map(entry => entry.status)).toEqual(["ok", "ok", "ok", "ok", "ok"]);
            expect(volume(result.parts[0]!.shape)).toBeCloseTo(2 * 20 * 20 * 10, 6);
            expect(extent(result.parts[0]!.shape)).toEqual({ min: [0, 0, 0], max: [60, 20, 10] });
            expect(facesNamed(result.parts[0]!.faceNames, "plate:start@twin#1")).toHaveLength(1);
        });

        it("should spread a part turn's copies from its first to its last angle", () => {
            // Arrange
            const document: Document = {
                schemaVersion: 1,
                features: [
                    rectangle("s", 2, 2, { plane: "XY" }, [5, -1]),
                    { id: "tooth", type: "extrude", profile: "s", distance: 1 },
                    { id: "fan", type: "polarPattern", body: "tooth", axis: { origin: [0, 0, 0], direction: [0, 0, 1] }, count: 3, angle: 180 },
                ],
            };

            // Act
            const result = occt.design.build({ document });

            // Assert
            expect(extent(result.parts[0]!.shape)).toEqual({ min: [-7, -1, 0], max: [7, 7, 1] });
        });

        it("should refuse sizes and angles that make nothing", () => {
            // Arrange
            const flat = plate([], { width: 40, depth: 20, height: 0 });
            const overTurn: Document = { schemaVersion: 1, features: [rectangle("p", 1, 1, { plane: "XY" }, [3, 0]), { id: "ring", type: "revolve", profile: "p", axis: { origin: [0, 0, 0], direction: [0, 1, 0] }, angle: 400 }] };
            const noTurn = plate([{ id: "fan", type: "polarPattern", body: "plate", axis: { origin: [0, 0, 0], direction: [0, 0, 1] }, count: 2, angle: 0 }]);
            const single = plate([{ id: "row", type: "linearPattern", body: "plate", direction: [1, 0, 0], spacing: 50, count: 1 }]);

            // Act
            const messages = [messagesOf(flat, 1), messagesOf(overTurn, 1), messagesOf(noTurn, 2), messagesOf(single, 2)];

            // Assert
            expect(messages).toEqual([
                ["/features/1/distance: the distance is 0"],
                ["/features/1/angle: the angle is not 0 and at most 360 either way, not 400"],
                ["/features/2/angle: the angle is not 0 and at most 360 either way, not 0"],
                ["/features/2/count: a whole number of at least 2 is expected, not 1"],
            ]);
        });

        it("should fail a sketch the pen cannot draw and skip the sweep that reads it", () => {
            // Arrange
            const document: Document = {
                schemaVersion: 1,
                features: [
                    { id: "s", type: "sketch", on: { frame: { origin: [0, 0, 0], normal: [1, 0, 0], direction: [1, 0, 0] } }, pen: [{ type: "hLine", length: 1 }, { type: "vLine", length: 1 }, { type: "close" }] },
                    { id: "b", type: "extrude", profile: "s", distance: 1 },
                ],
            };

            // Act
            const report = occt.design.build({ document }).report;

            // Assert
            expect(report.map(entry => entry.status)).toEqual(["failed", "skipped"]);
            expect(report[1]!.messages).toEqual(["sketch \"s\" failed earlier"]);
        });

        it("should make the compound of the shapes an operation makes as a list, leaving its input whole", () => {
            // Arrange
            const document: Document = { ...plate([{ id: "faces", type: "operation", operation: "occt.shapes.face.getFaces", params: { shape: { body: "plate" } } }]), parts: [{ id: "plate", body: "plate" }, { id: "faces", body: "faces" }] };

            // Act
            const result = occt.design.build({ document });

            // Assert
            const faces = result.parts.find(part => part.id === "faces")!;
            const plateVolume = occt.shapes.solid.getSolidVolume({ shape: result.parts.find(part => part.id === "plate")!.shape });
            expect(result.report.map(entry => entry.status)).toEqual(["ok", "ok", "ok"]);
            expect(occt.shapes.shape.getShapeType({ shape: faces.shape })).toBe("compound");
            expect(faces.faceNames).toEqual(Array.from({ length: 6 }, () => ["faces:face"]));
            expect(plateVolume).toBeCloseTo(8000, 3);
        });
    });

    describe("suppression and configurations", () => {
        const rounded = (suppressed: boolean | string): Models.OCCT.DesignFeature => ({ id: "round", type: "fillet", body: "plate", radius: 2, suppressed, edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 4 } });

        it("should leave a body as it was when a feature that changes it is suppressed", () => {
            // Arrange
            const document = plate([rounded("!soft")], { width: 40, depth: 20, height: 10, soft: true });

            // Act
            const soft = occt.design.build({ document });
            const sharp = occt.design.build({ document, parameters: { soft: false } });

            // Assert
            expect(soft.report.map(entry => entry.status)).toEqual(["ok", "ok", "ok"]);
            expect(sharp.report.map(entry => entry.status)).toEqual(["ok", "ok", "suppressed"]);
            expect(volume(sharp.parts[0]!.shape)).toBeCloseTo(40 * 20 * 10, 6);
            expect(volume(soft.parts[0]!.shape)).toBeLessThan(40 * 20 * 10);
        });

        it("should skip what reads a suppressed feature's body, sketch or faces, saying it was suppressed", () => {
            // Arrange
            const document: Document = {
                schemaVersion: 1,
                features: [
                    { ...rectangle("base", 4, 4), suppressed: true },
                    { id: "block", type: "extrude", profile: "base", distance: 2 },
                    rectangle("other", 4, 4),
                    { id: "post", type: "extrude", profile: "other", distance: 2, suppressed: 1 },
                    { id: "edge", type: "chamfer", body: "post", distance: 0.5, edges: { between: [{ of: "post", role: "end" }, { of: "post", role: "side" }], count: 4 } },
                    { id: "kept", type: "extrude", profile: "other", distance: 3 },
                    { id: "round", type: "fillet", body: "kept", radius: 0.5, suppressed: true, edges: { between: [{ of: "kept", role: "end" }, { of: "kept", role: "side" }], count: 4 } },
                    { id: "bevel", type: "chamfer", body: "kept", distance: 0.2, edges: { between: [{ of: "round", role: "round" }, { of: "kept", role: "side" }], count: 4 } },
                ],
                parts: [{ id: "a", body: "block" }, { id: "b", body: "post" }, { id: "c", body: "kept" }],
            };

            // Act
            const result = occt.design.build({ document });

            // Assert
            expect(result.report.map(entry => entry.status)).toEqual(["suppressed", "skipped", "ok", "suppressed", "skipped", "ok", "suppressed", "failed"]);
            expect(result.report[1]!.messages).toEqual(["sketch \"base\" was suppressed"]);
            expect(result.report[4]!.messages).toEqual(["body \"post\" was suppressed"]);
            expect(result.report[7]!.messages).toEqual(["/features/7/edges/between/0: \"round\" is suppressed, so it made no faces"]);
            expect(result.parts).toEqual([]);
            expect(result.issues).toEqual([
                { path: "/parts/0/body", message: "the body \"block\" was suppressed, so the part was not built" },
                { path: "/parts/1/body", message: "the body \"post\" was suppressed, so the part was not built" },
                { path: "/parts/2/body", message: "the body \"kept\" failed, so the part was not built" },
            ]);
        });

        it("should keep a suppressed boolean's tools as bodies of their own", () => {
            // Arrange
            const document = plate([
                rectangle("square", 5, 5, { plane: "XY" }, [100, 0]),
                { id: "post", type: "extrude", profile: "square", distance: 5 },
                { id: "joined", type: "boolean", operation: "union", body: "plate", tools: ["post"], suppressed: true },
            ]);

            // Act
            const result = occt.design.build({ document });

            // Assert
            expect(result.parts.map(part => part.id)).toEqual(["plate", "post"]);
        });

        it("should build a configuration, report it with the parameter values used, and refuse one the document does not have", () => {
            // Arrange
            const document: Document = {
                ...plate([rounded("configuration == 'sharp'")], { width: { value: 40, min: 10, max: 100 }, depth: 20, height: 10 }),
                configurations: [{ id: "wide", values: { width: 80 } }, { id: "sharp", values: { height: 5 } }],
            };

            // Act
            const wide = occt.design.build({ document, configuration: "wide" });
            const sharp = occt.design.build({ document, configuration: "sharp", parameters: { width: 30 } });
            const missing = (): unknown => occt.design.build({ document, configuration: "huge" });
            const tooWide = (): unknown => occt.design.build({ document, parameters: { width: 200 } });

            // Assert
            expect(size(wide.parts[0]!.shape)[0]).toBeCloseTo(80, 6);
            expect(wide.configuration).toBe("wide");
            expect(wide.parameters).toEqual({ width: 80, depth: 20, height: 10 });
            expect(sharp.report[2]!.status).toBe("suppressed");
            expect(volume(sharp.parts[0]!.shape)).toBeCloseTo(30 * 20 * 5, 6);
            expect(occt.design.build({ document }).configuration).toBeUndefined();
            expect(occt.design.build({ document, configuration: "" }).configuration).toBeUndefined();
            expect(missing).toThrow(InputError);
            expect(missing).toThrow("/configurations: \"huge\" is not a configuration of this document.");
            expect(tooWide).toThrow("/parameters/width: \"width\" is 200, above its maximum 100.");
        });
    });

    describe("parts", () => {
        it("should give a part document's build the structure that exports its parts to STEP under the document's name, with their colours and properties", () => {
            // Arrange
            const document: Document = {
                ...plate([rectangle("lugSketch", 4, 4, { plane: "XY", offset: 20 }), { id: "lug", type: "extrude", profile: "lugSketch", distance: 2 }]),
                meta: { name: "Bracket set" },
                parts: [
                    { id: "plate", name: "Plate", body: "plate", appearance: { color: "#336699" }, properties: { partNumber: "PL-{width}" } },
                    { id: "lug", name: "Lug", body: "lug" },
                ],
            };
            const built = occt.design.build({ document });

            // Act
            const exported = occt.assembly.manager.buildAssemblyDocument({ structure: built.structure! });
            const step = new TextDecoder().decode(occt.assembly.manager.exportDocumentToStep({ document: exported, fileName: "set.step", author: "", organization: "", compress: false, tryDownload: false }));
            exported.delete();

            // Assert
            expect(built.structure!.nodes).toEqual([
                { id: "/", type: "assembly", name: "Bracket set" },
                { id: "plate", type: "instance", name: "Plate", parentId: "/", partId: "plate" },
                { id: "lug", type: "instance", name: "Lug", parentId: "/", partId: "lug" },
            ]);
            expect(built.structure!.parts.map(part => [part.id, part.name, part.colorRgba?.b, part.properties])).toEqual([["plate", "Plate", 0.6, { partNumber: "PL-40" }], ["lug", "Lug", undefined, undefined]]);
            expect(built.structure!.lengthUnit).toBe("mm");
            expect(step).toMatch(/PRODUCT\('Bracket set'/);
            expect(step).toMatch(/PRODUCT\('Plate'/);
            expect(step).toMatch(/DESCRIPTIVE_REPRESENTATION_ITEM\('partNumber','PL-40'\)/);
            built.structure!.parts.forEach(part => part.shape.delete());
        });

        it("should give a volume and a mass only to a part that is solid, and say so when a density asks for a mass", () => {
            // Arrange
            const document: Document = {
                schemaVersion: 1,
                materials: [{ id: "steel", density: 7850 }],
                features: [
                    rectangle("low", 4, 4, { plane: "XY" }, [-2, -2]),
                    rectangle("high", 4, 4, { plane: "XY", offset: 5 }, [-2, -2]),
                    { id: "skin", type: "loft", profiles: ["low", "high"], solid: false },
                ],
                parts: [{ id: "skin", body: "skin", material: "steel" }],
            };

            // Act
            const built = occt.design.build({ document });

            // Assert
            expect(built.parts[0]!.volume).toBeUndefined();
            expect(built.parts[0]!.mass).toBeUndefined();
            expect(built.issues).toEqual([{ path: "/parts/0/body", message: "the body \"skin\" is not a solid, so the part has no volume or mass" }]);
        });

        it("should keep a property named __proto__ as a property of the part", () => {
            // Arrange
            const document = JSON.parse(JSON.stringify(plate())) as Document;
            document.parts = JSON.parse("[{\"id\":\"plate\",\"body\":\"plate\",\"properties\":{\"__proto__\":\"P-{width}\",\"code\":\"C\"}}]") as Models.OCCT.DesignPart[];

            // Act
            const built = occt.design.build({ document });

            // Assert
            expect(Object.keys(built.parts[0]!.properties)).toEqual(["__proto__", "code"]);
            expect(Object.getOwnPropertyDescriptor(built.parts[0]!.properties, "__proto__")?.value).toBe("P-40");
        });
        it("should evaluate part properties, material and mass, with templates reading the configuration and choices", () => {
            // Arrange
            const document: Document = {
                ...plate([], { width: 40, depth: 20, height: 10, finish: { type: "choice", value: "raw", options: [{ value: "raw" }, { value: "black" }] } }),
                configurations: [{ id: "L", values: { width: 100 } }],
                materials: [{ id: "alu", name: "Aluminium", standard: "EN AW-6061", density: 2700, properties: { supplier: "Mill {finish}" } }],
                parts: [{ id: "plate", name: "Base plate", body: "plate", material: "alu", properties: { partNumber: "PL-{width}x{height}-{configuration}", description: "Plate {width} mm, {finish}", stocked: true, weightGrams: { expr: "width * depth * height * 2.7 / 1000" } } }],
            };

            // Act
            const result = occt.design.build({ document, configuration: "L", parameters: { finish: "black" } });

            // Assert
            const part = result.parts[0]!;
            expect(result.issues).toEqual([]);
            expect([part.id, part.name, part.body]).toEqual(["plate", "Base plate", "plate"]);
            expect(part.properties).toEqual({ partNumber: "PL-100x10-L", description: "Plate 100 mm, black", stocked: true, weightGrams: 54 });
            expect(part.material).toEqual({ id: "alu", name: "Aluminium", standard: "EN AW-6061", density: 2700, properties: { supplier: "Mill black" } });
            expect(part.volume).toBeCloseTo(100 * 20 * 10, 6);
            expect(part.mass).toBeCloseTo(100 * 20 * 10 * 1e-9 * 2700, 9);
        });

        it("should take the mass from the document's length unit and leave it out without a density", () => {
            // Arrange
            const inches: Document = { ...plate([], { width: 2, depth: 1, height: 1 }), units: { length: "in" }, materials: [{ id: "steel", density: 7850 }], parts: [{ id: "p", body: "plate", material: "steel" }] };
            const bare: Document = { ...plate(), materials: [{ id: "steel" }], parts: [{ id: "p", body: "plate", material: "steel" }] };

            // Act
            const inchPart = occt.design.build({ document: inches }).parts[0]!;
            const barePart = occt.design.build({ document: bare }).parts[0]!;

            // Assert
            expect(inchPart.mass).toBeCloseTo(2 * 0.0254 ** 3 * 7850, 9);
            expect(barePart.mass).toBeUndefined();
            expect(barePart.material).toEqual({ id: "steel", properties: {} });
        });

        it("should merge the material's look under the part's and colour the faces a reference names", () => {
            // Arrange
            const document: Document = {
                ...plate(),
                materials: [{ id: "steel", appearance: { color: "#808080", metallic: 1, roughness: "0.5" } }],
                parts: [{ id: "plate", body: "plate", material: "steel", appearance: { roughness: 0.2, faces: [{ faces: { of: "plate", role: "end" }, color: "#ff0000", opacity: 0.5 }] } }],
            };

            // Act
            const result = occt.design.build({ document });

            // Assert
            const part = result.parts[0]!;
            expect(part.appearance).toEqual({ color: "#808080", metallic: 1, roughness: 0.2, faces: [{ indexes: facesNamed(part.faceNames, "plate:end"), color: "#ff0000", opacity: 0.5 }] });
            expect(part.appearance!.faces[0]!.indexes).toHaveLength(1);
        });

        it("should give a part the same shape hash in every build of the same shape and a new one when its shape changes", () => {
            // Arrange
            const document: Document = {
                ...plate([rectangle("pin", 2, 2, { plane: "XY" }, [100, 0]), { id: "post", type: "extrude", profile: "pin", distance: 5 }]),
                parts: [{ id: "plate", body: "plate" }, { id: "post", body: "post" }],
            };

            // Act
            const first = occt.design.build({ document });
            const again = occt.design.build({ document });
            const taller = occt.design.build({ document, parameters: { height: 12 } });

            // Assert
            const [plateHash, postHash] = first.parts.map(part => part.shapeHash);
            expect(plateHash).toMatch(/^[0-9a-z]+$/);
            expect(again.parts.map(part => part.shapeHash)).toEqual([plateHash, postHash]);
            expect(taller.parts[0]!.shapeHash).not.toBe(plateHash);
            expect(taller.parts[1]!.shapeHash).toBe(postHash);
        });

        it("should carry the glow a material gives under the part's and a face entry's own, and keep the material's when a part's strength is negative", () => {
            // Arrange
            const document: Document = {
                ...plate(),
                parameters: { ...plate().parameters, glow: 2.5 },
                materials: [{ id: "ring", appearance: { color: "#3cf2ff", emissive: "#3cf2ff", emissiveStrength: "glow" } }],
                parts: [
                    { id: "plate", body: "plate", material: "ring", appearance: { faces: [{ faces: { of: "plate", role: "end" }, emissive: "#ffffff", emissiveStrength: 4 }] } },
                    { id: "dark", body: "plate", material: "ring", appearance: { emissiveStrength: "-glow" } },
                ],
            };

            // Act
            const result = occt.design.build({ document });

            // Assert
            const [glowing, dark] = result.parts.map(part => part.appearance!);
            expect(glowing).toMatchObject({ color: "#3cf2ff", emissive: "#3cf2ff", emissiveStrength: 2.5 });
            expect(glowing!.faces[0]).toMatchObject({ emissive: "#ffffff", emissiveStrength: 4 });
            expect(glowing!.faces[0]!.indexes).toHaveLength(1);
            expect(dark).toEqual({ color: "#3cf2ff", emissive: "#3cf2ff", emissiveStrength: 2.5, faces: [] });
            expect(result.issues.map(issue => [issue.path, issue.message])).toEqual([["/parts/1/appearance/emissiveStrength", "emissiveStrength is from 0, not -2.5"]]);
        });

        it("should carry the material's edge colour under the part's and colour the edges a reference names", () => {
            // Arrange
            const topEdges: Models.OCCT.DesignEdgeReference = { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 4 };
            const document: Document = {
                ...plate(),
                materials: [{ id: "steel", appearance: { color: "#808080", edgeColor: "#111111" } }],
                parts: [
                    { id: "plate", body: "plate", material: "steel", appearance: { edges: [{ edges: topEdges, color: "#ff0000" }] } },
                    { id: "again", body: "plate", material: "steel", appearance: { edgeColor: "#222222" } },
                ],
            };

            // Act
            const result = occt.design.build({ document });

            // Assert
            const [plateLook, againLook] = result.parts.map(part => part.appearance!);
            expect(plateLook!.edgeColor).toBe("#111111");
            expect(plateLook!.edges).toHaveLength(1);
            expect(plateLook!.edges![0]!.color).toBe("#ff0000");
            expect(plateLook!.edges![0]!.indexes).toHaveLength(4);
            expect(new Set(plateLook!.edges![0]!.indexes).size).toBe(4);
            expect(againLook).toEqual({ color: "#808080", edgeColor: "#222222", faces: [] });
        });

        it("should report an edge reference it cannot resolve and leave that entry out", () => {
            // Arrange
            const document: Document = {
                ...plate(),
                parts: [{ id: "plate", body: "plate", appearance: { edges: [
                    { edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 3 }, color: "#ff0000" },
                    { edges: { between: [{ of: "plate", role: "start" }, { of: "plate", role: "side" }], count: 4 } },
                ] } }],
            };

            // Act
            const result = occt.design.build({ document });

            // Assert
            expect(result.issues).toHaveLength(1);
            expect(result.issues[0]!.path).toBe("/parts/0/appearance/edges/0/edges");
            expect(result.issues[0]!.message).toContain("expects 3 edges and finds 4");
            expect(result.parts[0]!.appearance!.edges).toHaveLength(1);
            expect(result.parts[0]!.appearance!.edges![0]!.color).toBeUndefined();
        });

        it("should report what it cannot evaluate after the features ran and leave it out", () => {
            // Arrange
            const document: Document = {
                ...plate([{ id: "huge", type: "fillet", body: "other", radius: 50, edges: { between: [{ of: "other", role: "end" }, { of: "other", role: "side" }], count: 4 } }]),
                features: [
                    ...plate().features,
                    rectangle("o", 2, 2, { plane: "XY" }, [100, 0]),
                    { id: "other", type: "extrude", profile: "o", distance: 2 },
                    { id: "huge", type: "fillet", body: "other", radius: 50, edges: { between: [{ of: "other", role: "end" }, { of: "other", role: "side" }], count: 4 } },
                ],
                materials: [{ id: "light", density: "height - 20" }, { id: "shiny", appearance: { metallic: 2 } }],
                parts: [
                    { id: "plate", body: "plate", material: "light", properties: { code: "{1 / (height - 10)}", fine: "ok" }, appearance: { opacity: "-1", faces: [{ faces: { of: "plate", role: "rim" }, color: "#000000" }] } },
                    { id: "again", body: "plate", material: "light" },
                    { id: "shiny", body: "plate", material: "shiny" },
                    { id: "other", body: "other" },
                ],
            };

            // Act
            const result = occt.design.build({ document });

            // Assert
            expect(result.issues).toEqual([
                { path: "/materials/0/density", message: "a density is above 0, not -10" },
                { path: "/parts/0/appearance/opacity", message: "opacity is from 0 to 1, not -1" },
                { path: "/parts/0/appearance/faces/0/faces", message: "the reference finds no faces" },
                { path: "/parts/0/properties/code", message: "\"/\" gives Infinity, not a finite number" },
                { path: "/materials/1/appearance/metallic", message: "metallic is from 0 to 1, not 2" },
                { path: "/parts/3/body", message: "the body \"other\" failed, so the part was not built" },
            ]);
            expect(result.parts.map(part => part.id)).toEqual(["plate", "again", "shiny"]);
            expect(result.parts[0]!.properties).toEqual({ fine: "ok" });
            expect(result.parts[0]!.material).toBeUndefined();
            expect(result.parts[0]!.mass).toBeUndefined();
            expect(result.parts[0]!.appearance).toEqual({ faces: [] });
            expect(result.parts[2]!.appearance).toEqual({ faces: [] });
        });

        it("should rebuild no feature when only a parameter the properties read changes", () => {
            // Arrange
            const document: Document = { ...plate([], { width: 40, depth: 20, height: 10, revision: { type: "text", value: "A" } }), parts: [{ id: "plate", body: "plate", properties: { revision: "{revision}" } }] };
            occt.design.build({ document });

            // Act
            const revised = occt.design.build({ document, parameters: { revision: "B" } });

            // Assert
            expect(revised.report.map(entry => entry.cached)).toEqual([true, true]);
            expect(revised.parts[0]!.properties).toEqual({ revision: "B" });
        });
    });

    describe("failures", () => {
        it("should hand a trap inside the kernel on to the caller rather than report a failed feature, and forget what it had kept", () => {
            // Arrange
            const document = plate();
            occt.design.build({ document });
            const trapping: Document = plate([{ id: "box", type: "operation", operation: "occt.shapes.solid.createBox", params: { width: 1, length: 1, height: 1, center: [0, 0, 0] } }]);
            occt.shapes.solid.createBox = (): never => {
                throw new WebAssembly.RuntimeError("unreachable");
            };

            // Act
            let thrown: unknown;
            try {
                occt.design.build({ document: trapping });
            } catch (error) {
                thrown = error;
            } finally {
                Reflect.deleteProperty(occt.shapes.solid, "createBox");
            }
            const after = occt.design.build({ document });

            // Assert
            expect(thrown).toBeInstanceOf(WebAssembly.RuntimeError);
            expect(after.report.map(entry => entry.cached)).toEqual([false, false]);
        });

        it("should refuse a pattern of more copies than the limit, before making any", () => {
            // Arrange
            const row = plate([{ id: "row", type: "linearPattern", body: "plate", direction: [1, 0, 0], spacing: 50, count: "10^4" }]);
            const ring = plate([{ id: "ring", type: "polarPattern", body: "plate", axis: { origin: [0, 0, 0], direction: [0, 0, 1] }, count: 1001 }]);

            // Act
            const rowReport = occt.design.build({ document: row }).report[2]!;
            const ringReport = occt.design.build({ document: ring }).report[2]!;

            // Assert
            expect([rowReport.status, ringReport.status]).toEqual(["failed", "failed"]);
            expect(rowReport.messages).toEqual(["/features/2/count: a count of at most 1000 is expected, not 10000"]);
            expect(ringReport.messages).toEqual(["/features/2/count: a count of at most 1000 is expected, not 1001"]);
        });

        it("should keep a body it was given when an operation hands it back inside a structure it refuses", () => {
            // Arrange
            const document = plate([
                rectangle("cutter", 2, 2, { plane: "XY" }, [1, 1]),
                { id: "tool", type: "extrude", profile: "cutter", distance: 30 },
                { id: "cut", type: "operation", operation: "occt.booleans.differenceWithHistory", params: { shape: { body: "plate" }, shapes: [{ body: "tool" }] } },
            ]);
            occt.booleans.differenceWithHistory = (inputs: { shape: TopoDS_Shape }): Models.OCCT.ShapeWithHistories<TopoDS_Shape> => ({ shape: inputs.shape, histories: [] });

            // Act
            let built: Models.OCCT.DesignBuildResult<TopoDS_Shape>;
            try {
                built = occt.design.build({ document });
            } finally {
                Reflect.deleteProperty(occt.booleans, "differenceWithHistory");
            }

            // Assert
            expect(built.report.map(entry => entry.status)).toEqual(["ok", "ok", "ok", "ok", "failed"]);
            expect(volume(built.parts.find(part => part.id === "plate")!.shape)).toBeCloseTo(40 * 20 * 10, 6);
        });

        it("should free the shapes an operation hands back inside a structure when it is refused, and keep the bodies it was given", () => {
            // Arrange
            const document = plate([
                rectangle("cutter", 2, 2, { plane: "XY" }, [1, 1]),
                { id: "tool", type: "extrude", profile: "cutter", distance: 30 },
                { id: "cut", type: "operation", operation: "occt.booleans.differenceWithHistory", params: { shape: { body: "plate" }, shapes: [{ body: "tool" }] } },
            ]);
            const differenceWithHistory = occt.booleans.differenceWithHistory.bind(occt.booleans);
            const made: TopoDS_Shape[] = [];
            occt.booleans.differenceWithHistory = (inputs: Parameters<typeof differenceWithHistory>[0]) => {
                const result = differenceWithHistory(inputs);
                made.push(result.shape);
                return result;
            };

            // Act
            let built: Models.OCCT.DesignBuildResult<TopoDS_Shape>;
            try {
                built = occt.design.build({ document });
            } finally {
                Reflect.deleteProperty(occt.booleans, "differenceWithHistory");
            }

            // Assert
            expect(built.report.map(entry => entry.status)).toEqual(["ok", "ok", "ok", "ok", "failed"]);
            expect(made).toHaveLength(1);
            expect(made[0]!.isDeleted()).toBe(true);
            expect(volume(built.parts.find(part => part.id === "plate")!.shape)).toBeCloseTo(40 * 20 * 10, 6);
        });
        it("should fail a feature whose edge reference finds another count, naming what it found, and skip what reads its body", () => {
            // Arrange
            const document = plate([
                { id: "round", type: "fillet", body: "plate", radius: 1, edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 3 } },
                { id: "bevel", type: "chamfer", body: "plate", distance: 1, edges: { between: [{ of: "plate", role: "start" }, { of: "plate", role: "side" }], count: 4 } },
                rectangle("apart", 2, 2, { plane: "XY" }, [100, 0]),
                { id: "other", type: "extrude", profile: "apart", distance: 2 },
            ]);

            // Act
            const result = occt.design.build({ document });

            // Assert
            expect(result.report.map(entry => entry.status)).toEqual(["ok", "ok", "failed", "skipped", "ok", "ok"]);
            expect(result.report[2]!.messages[0]).toMatch(/^\/features\/2\/edges: the reference expects 3 edges and finds 4 \(\d+, \d+, \d+, \d+\)$/);
            expect(result.report[3]!.messages).toEqual(["body \"plate\" failed earlier"]);
            expect(result.parts.map(body => body.id)).toEqual(["other"]);
        });

        it("should report a kernel failure and an operation that makes no shape as failed features", () => {
            // Arrange
            const document = plate([
                { id: "huge", type: "fillet", body: "plate", radius: 50, edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 4 } },
                { id: "measure", type: "operation", operation: "occt.analysis.signatures", params: { shape: { body: "plate" } } },
                { id: "negative", type: "operation", operation: "occt.shapes.solid.createBox", params: { width: -1, length: 1, height: 1 } },
            ]);

            // Act
            const result = occt.design.build({ document });

            // Assert
            expect(result.report.map(entry => entry.status)).toEqual(["ok", "ok", "failed", "skipped", "failed"]);
            expect(result.report[2]!.messages[0]!.length).toBeGreaterThan(0);
            expect(result.report[4]!.messages[0]).toMatch(/^\/features\/4\/params\/width: /);
            expect(result.parts).toEqual([]);
        });

        it("should fail an operation whose result is not one shape", () => {
            // Arrange
            const document = plate([{ id: "measure", type: "operation", operation: "occt.analysis.signatures", params: { shape: { body: "plate" } } }]);

            // Act
            const result = occt.design.build({ document });

            // Assert
            expect(result.report[2]!.status).toBe("failed");
            expect(result.report[2]!.messages).toEqual(["/features/2/operation: occt.analysis.signatures makes neither a shape nor a list of shapes"]);
            expect(result.parts.map(body => body.id)).toEqual(["plate"]);
        });

        it("should refuse a document with problems and an override of a parameter it does not have", () => {
            // Arrange
            const broken = plate([{ id: "round", type: "fillet", body: "nothing", radius: 1, edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 4 } }]);

            // Act
            const refusedDocument = (): unknown => occt.design.build({ document: broken });
            const refusedOverride = (): unknown => occt.design.build({ document: plate(), parameters: { nope: 1 } });

            // Assert
            expect(refusedDocument).toThrow(InputError);
            expect(refusedDocument).toThrow("The design document has a problem: /features/2/body: \"nothing\" is not a body made by an earlier feature, or it was used up.");
            expect(refusedOverride).toThrow(InputError);
            expect(refusedOverride).toThrow("/parameters/nope: \"nope\" is not a parameter of this document.");
        });
    });

    describe("reuse", () => {
        it("should reuse every feature on a second build and only rebuild what a changed parameter reaches", () => {
            // Arrange
            const document = plate([{ id: "round", type: "fillet", body: "plate", radius: "corner", edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 4 } }], { width: 40, depth: 20, height: 10, corner: 1 });
            occt.design.build({ document });

            // Act
            const again = occt.design.build({ document });
            const rounder = occt.design.build({ document, parameters: { corner: 2 } });
            const taller = occt.design.build({ document, parameters: { height: 12 } });

            // Assert
            expect(again.report.map(entry => entry.cached)).toEqual([true, true, true]);
            expect(rounder.report.map(entry => entry.cached)).toEqual([true, true, false]);
            expect(taller.report.map(entry => entry.cached)).toEqual([true, false, false]);
        });

        it("should hand back bodies the caller can free without spoiling a later build", () => {
            // Arrange
            const document = plate([], { width: 12, depth: 12, height: 12 });
            const first = occt.design.build({ document });
            first.parts.forEach(body => body.shape.delete());

            // Act
            const second = occt.design.build({ document });

            // Assert
            expect(second.report.map(entry => entry.cached)).toEqual([true, true]);
            expect(volume(second.parts[0]!.shape)).toBeCloseTo(12 * 12 * 12, 6);
        });
    });

    describe("validation", () => {
        const pathsOf = (document: unknown): string[] => occt.design.validate({ document: document as Document }).map(issue => issue.path);

        it("should accept a document that builds", () => {
            // Act
            const issues = occt.design.validate({ document: plate() });

            // Assert
            expect(issues).toEqual([]);
        });

        it("should point at every value that refers to something not made before it", () => {
            // Arrange
            const document = {
                schemaVersion: 1,
                parameters: { width: 10, loop: "loop + 1" },
                features: [
                    { id: "plate", type: "extrude", profile: "missing", distance: "height" },
                    rectangle("base", "width", 4),
                    { id: "post", type: "extrude", profile: "base", distance: 2 },
                    { id: "joined", type: "boolean", operation: "union", body: "plate", tools: ["post"] },
                    { id: "again", type: "fillet", body: "post", radius: 1, edges: { between: [{ of: "post", role: "end" }, { of: "post", role: "side" }], count: 4 } },
                    { id: "call", type: "operation", operation: "design.build", params: {} },
                ],
                parts: [{ id: "ghost", body: "ghost" }],
            };

            // Act
            const paths = pathsOf(document);

            // Assert
            expect(paths).toEqual(["/parameters/loop", "/features/0/profile", "/features/4/body", "/features/5/operation", "/parts/0/body"]);
        });

        it("should take a feature with a problem as made, so the features after it are read against it", () => {
            // Arrange
            const document = plate([{ id: "round", type: "fillet", body: "plate", radius: "nope", edges: { between: [{ of: "plate", role: "end" }, { of: "plate", role: "side" }], count: 4 } }, { id: "bevel", type: "chamfer", body: "plate", distance: 1, edges: { between: [{ of: "round", role: "round" }, { of: "plate", role: "side" }], count: 4 } }]);

            // Act
            const paths = pathsOf(document);

            // Assert
            expect(paths).toEqual(["/features/2/radius"]);
        });

        it("should refuse a document that is not one", () => {
            // Act
            const notObject = pathsOf("text");
            const wrongVersion = pathsOf({ schemaVersion: 2, features: [] });
            const noFeatures = pathsOf({ schemaVersion: 1 });

            // Assert
            expect(notObject).toEqual([""]);
            expect(wrongVersion).toEqual(["/schemaVersion"]);
            expect(noFeatures).toEqual(["/features"]);
        });
    });
});
