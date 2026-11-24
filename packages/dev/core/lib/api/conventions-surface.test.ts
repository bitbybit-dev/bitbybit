import { beforeAll, describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { occtDtoRegistry } from "@bitbybit-dev/occt";
import { jscadDtoRegistry } from "@bitbybit-dev/jscad";
import { manifoldDtoRegistry } from "@bitbybit-dev/manifold";
import { CURRENT_CONVENTIONS } from "@bitbybit-dev/base";
import { CONVENTION_CHANGES, CONVENTIONS_SURFACE, conventionSensitiveMentions, isConventionSensitive } from "./conventions-surface";
import type { OperationRoot } from "./__test__/coordinate-system-readers";
import { operationsReachingTheSetting } from "./__test__/coordinate-system-readers";

type Registry = Record<string, { constraints?: Record<string, unknown> }>;

const REGISTRIES: [string, Registry][] = [["occt", occtDtoRegistry], ["jscad", jscadDtoRegistry], ["manifold", manifoldDtoRegistry]];
const NAMES_AN_UP_AXIS_OR_A_HAND = ["upAxis", "adjustYtoZ", "adjustZtoY", "fromRightHanded", "clockwise", "helixAngle"];
const TURN_SENSE_IN_A_FLAT_PLANE = ["jscad.path.appendArc"];

const PACKAGES = resolve(process.cwd(), "..");
const SCANNED = ["base", "occt", "jscad", "manifold", "core", "babylonjs", "threejs", "playcanvas"];
const ROOTS: OperationRoot[] = [
    { prefix: "occt.", file: "occt/lib/occ-service.ts", className: "OCCTService", operations: Object.keys(occtDtoRegistry) },
    { prefix: "jscad.", file: "jscad/lib/api/jscad-service.ts", className: "Jscad", operations: Object.keys(jscadDtoRegistry) },
    { prefix: "manifold.", file: "manifold/lib/api/manifold-service.ts", className: "ManifoldService", operations: Object.keys(manifoldDtoRegistry) },
    ...["babylonjs", "threejs", "playcanvas"].map((renderer): OperationRoot => ({ prefix: "", file: `${renderer}/lib/api/bitbybit-base.ts`, className: "BitByBitBase" })),
];
const MESHES_IN_THE_MODEL_AXES = "meshes the shapes in the model's own axes, which no setting turns";
const LABEL_TURNED_BACK = "lays its label with text that follows the coordinate system, then turns it back, so the label stays where it always was";
const ONLY_STL_IS_TURNED = "loads glb bytes; of the files a scene loads, only an STL is turned by the setting";
const GRID_IN_THE_FACE_PARAMETERS = "lays its hexagon grid off the ground, in the face's own parameters, which no setting turns";
const READS_IT_YET_KEEPS_ITS_RESULT: Record<string, string> = {
    "occt.analysis.clashes.betweenShapes": MESHES_IN_THE_MODEL_AXES,
    "occt.booleans.meshMeshIntersectionPoints": MESHES_IN_THE_MODEL_AXES,
    "occt.booleans.meshMeshIntersectionWires": MESHES_IN_THE_MODEL_AXES,
    "occt.booleans.meshMeshIntersectionOfShapesPoints": MESHES_IN_THE_MODEL_AXES,
    "occt.booleans.meshMeshIntersectionOfShapesWires": MESHES_IN_THE_MODEL_AXES,
    "occt.dimensions.pinWithLabel": LABEL_TURNED_BACK,
    "occt.dimensions.simpleAngularDimension": LABEL_TURNED_BACK,
    "occt.dimensions.simpleLinearLengthDimension": LABEL_TURNED_BACK,
    "occt.shapes.face.subdivideToHexagonWires": GRID_IN_THE_FACE_PARAMETERS,
    "occt.shapes.face.subdivideToHexagonHoles": GRID_IN_THE_FACE_PARAMETERS,
    "babylon.io.loadGlbFromArrayBuffer": ONLY_STL_IS_TURNED,
    "babylon.io.loadGlbFromArrayBufferNoReturn": ONLY_STL_IS_TURNED,
};
const TRACED_THROUGH_HELPERS = [
    "occt.svg.loadSVG", "occt.io.saveShapeSTEP", "occt.shapes.face.hexagonsInGrid", "occt.shapeToMesh", "point.hexGridScaledToFit",
    "text.vectorText", "jscad.downloadSolidSTL", "manifold.recipes.build", "babylon.io.exportMeshToStl", "babylon.scene.clearAllDrawn",
];
const GRAPH_BUILT_WITHIN_MS = 120_000;

describe("the operations a conventions level changes", () => {
    it("should hold every registered operation whose inputs name an up axis or a hand, but the turn sense of a flat arc", () => {
        // Act
        const missing = REGISTRIES.flatMap(([kernel, registry]) => Object.entries(registry)
            .filter(([, entry]) => Object.keys(entry.constraints ?? {}).some((name) => NAMES_AN_UP_AXIS_OR_A_HAND.includes(name)))
            .map(([path]) => `${kernel}.${path}`)
            .filter((path) => !isConventionSensitive(path)));

        // Assert
        expect(missing).toEqual(TURN_SENSE_IN_A_FLAT_PLANE);
    });

    it("should name only operations and services the kernels have", () => {
        // Act
        const unknown = CONVENTIONS_SURFACE.filter((entry) => {
            const registry = REGISTRIES.find(([kernel]) => entry.startsWith(`${kernel}.`));
            if (registry === undefined) {
                return false;
            }
            const paths = Object.keys(registry[1]).map((path) => `${registry[0]}.${path}`);
            return entry.endsWith(".") ? !paths.some((path) => path.startsWith(entry)) : !paths.includes(entry);
        });

        // Assert
        expect(unknown).toEqual([]);
    });

    it("should describe every operation once for each level that changes it, a service entry counting for every operation under it", () => {
        // Act
        const listed = CONVENTION_CHANGES.flatMap((change) => change.entries.map((entry) => ({ level: change.level, entry })));
        const overlapping = listed.flatMap((one, at) => listed
            .filter((other, otherAt) => otherAt !== at && other.level === one.level && (other.entry === one.entry || (one.entry.endsWith(".") && other.entry.startsWith(one.entry))))
            .map((other) => `level ${one.level}: ${one.entry} and ${other.entry}`));

        // Assert
        expect(overlapping).toEqual([]);
    });

    it("should make each change at a level from 1 to the newest the libraries know", () => {
        // Act
        const levels = CONVENTION_CHANGES.map((change) => change.level);

        // Assert
        expect(levels.filter((level) => !Number.isSafeInteger(level) || level < 1 || level > CURRENT_CONVENTIONS)).toEqual([]);
    });

    it("should say what each change is about before what changes, and change something", () => {
        // Act
        const unworded = CONVENTION_CHANGES.filter((change) => change.entries.length === 0 || !/^[A-Z0-9][^:]+: \S/.test(change.change));

        // Assert
        expect(unworded).toEqual([]);
    });

    describe("reaching the coordinate system", () => {
        let reaching: Map<string, string>;

        beforeAll(() => {
            reaching = operationsReachingTheSetting(PACKAGES, SCANNED, ROOTS);
        }, GRAPH_BUILT_WITHIN_MS);

        it("should trace the setting through every helper and class between a read and the operation that reaches it", () => {
            // Act
            const traced = TRACED_THROUGH_HELPERS.filter((path) => reaching.has(path));

            // Assert
            expect(traced).toEqual(TRACED_THROUGH_HELPERS);
        });

        it("should hold every public operation whose code reaches the coordinate system, but those that keep their result", () => {
            // Act
            const missing = [...reaching].filter(([path]) => !isConventionSensitive(path) && READS_IT_YET_KEEPS_ITS_RESULT[path] === undefined).map(([path, method]) => `${path} (${method})`);

            // Assert
            expect(missing).toEqual([]);
        });

        it("should say an operation keeps its result only while it still reaches the coordinate system", () => {
            // Act
            const stale = Object.keys(READS_IT_YET_KEEPS_ITS_RESULT).filter((path) => !reaching.has(path));

            // Assert
            expect(stale).toEqual([]);
        });
    });

    it.each([
        ["an operation listed by its own path", "occt.shapes.wire.createHelixWire", true],
        ["one under a listed service", "occt.io.saveShapeSTEP", true],
        ["one written with the root object in front", "bitbybit.manifold.recipes.build", true],
        ["an SVG drawing laid on the ground", "occt.svg.loadSVG", true],
        ["an SVG drawing laid on the ground with its structure", "occt.svg.loadSVGStructured", true],
        ["one character laid on the ground", "text.vectorChar", true],
        ["a neighbour whose name only starts the same", "occt.shapes.wire.createHelixWireFromPoints", false],
        ["a service whose name only starts the same", "occt.ioTools.read", false],
        ["an operation that names no file, hand or ground", "occt.shapes.solid.createBox", false],
    ])("should tell %s", (_name, path, sensitive) => {
        // Act
        const told = isConventionSensitive(path);

        // Assert
        expect(told).toBe(sensitive);
    });

    it("should take an application's own entries beside its own", () => {
        // Act
        const told = [isConventionSensitive("myApp.labels.create"), isConventionSensitive("myApp.labels.create", ["myApp.labels."])];

        // Assert
        expect(told).toEqual([false, true]);
    });

    it("should find nothing in code that builds, cuts and draws without a file, a hand or the ground", () => {
        // Arrange
        const code = "const box = await bitbybit.occt.shapes.solid.createBox({ width: 2, length: 3, height: 4, center: [0, 0, 0] });\nconst rounded = await bitbybit.occt.fillets.filletEdges({ shape: box, radius: 0.2 });\nawait bitbybit.draw.drawAnyAsync({ entity: rounded });";

        // Act
        const mentions = conventionSensitiveMentions(code);

        // Assert
        expect(mentions).toEqual([]);
    });

    it.each([
        ["called in full", "await bitbybit.occt.io.saveShapeSTEP({ shape, fileName: \"a.step\", adjustYtoZ: true });", ["occt.io."]],
        ["reached through a service taken apart first", "const { io } = bitbybit.occt;\nawait io.saveShapeSTEP({ shape });", ["occt.io."]],
        ["reached through an alias", "const wires = bitbybit.occt.shapes.wire;\nconst coil = await wires.createHelixWire({ radius: 1, pitch: 1, height: 3 });", ["occt.shapes.wire.createHelixWire"]],
        ["named in an application's own entry", "await bitbybit.myApp.labels.create(options);", ["myApp.labels."]],
        ["that only loads an SVG drawing", "const drawing = await bitbybit.occt.svg.loadSVG({ svg, keepOrigin: true });", ["occt.svg."]],
    ])("should find an operation %s", (_name, code, expected) => {
        // Act
        const mentions = conventionSensitiveMentions(code, ["myApp.labels."]);

        // Assert
        expect(mentions).toEqual(expected);
    });

    it("should not take a longer name that holds a listed one for it", () => {
        // Act
        const mentions = conventionSensitiveMentions("const radio = 1; const audio = radio; const shapeToMeshes = 2; const myifc = 3;");

        // Assert
        expect(mentions).toEqual([]);
    });
});
