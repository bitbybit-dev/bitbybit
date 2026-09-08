import { describe, it, expect, beforeEach } from "vitest";
import { JSCADWorkerManager } from "../jscad-worker/jscad-worker-manager";
import { JSCADWorkerMock } from "../jscad-worker/jscad-worker-mock";
import { JSCAD } from "./jscad";
import { JSCADBooleans } from "./booleans";
import { JSCADColors } from "./colors";
import { JSCADExpansions } from "./expansions";
import { JSCADExtrusions } from "./extrusions";
import { JSCADHulls } from "./hulls";
import { JSCADPath } from "./path";
import { JSCADPolygon } from "./polygon";
import { JSCADShapes } from "./shapes";
import { JSCADText } from "./text";
import * as Inputs from "@bitbybit-dev/jscad/lib/api/inputs";

type PostedCall = { action: { functionName: string; inputs: unknown }; uid: string };

class RecordingWorker extends JSCADWorkerMock {
    readonly posted: PostedCall[] = [];

    override postMessage(message: PostedCall | "busy"): void {
        if (message !== "busy") {
            this.posted.push(message);
        }
    }
}

const CUBE_SIZE = 2;
const ORIGIN: Inputs.Base.Point3 = [0, 0, 0];

const SENTINEL_INPUTS: unknown = { sentinel: "delegation" };
const asInputs = <T>(): T => SENTINEL_INPUTS as T;

const DELEGATIONS: [string, (jscad: JSCAD) => unknown][] = [
    ["booleans.intersect", (j) => j.booleans.intersect(asInputs())],
    ["booleans.subtract", (j) => j.booleans.subtract(asInputs())],
    ["booleans.union", (j) => j.booleans.union(asInputs())],
    ["booleans.intersectTwo", (j) => j.booleans.intersectTwo(asInputs())],
    ["booleans.subtractTwo", (j) => j.booleans.subtractTwo(asInputs())],
    ["booleans.unionTwo", (j) => j.booleans.unionTwo(asInputs())],
    ["booleans.subtractFrom", (j) => j.booleans.subtractFrom(asInputs())],
    ["colors.colorize", (j) => j.colors.colorize(asInputs())],
    ["expansions.expand", (j) => j.expansions.expand(asInputs())],
    ["expansions.offset", (j) => j.expansions.offset(asInputs())],
    ["extrusions.extrudeLinear", (j) => j.extrusions.extrudeLinear(asInputs())],
    ["extrusions.extrudeRectangular", (j) => j.extrusions.extrudeRectangular(asInputs())],
    ["extrusions.extrudeRectangularPoints", (j) => j.extrusions.extrudeRectangularPoints(asInputs())],
    ["extrusions.extrudeRotate", (j) => j.extrusions.extrudeRotate(asInputs())],
    ["hulls.hullChain", (j) => j.hulls.hullChain(asInputs())],
    ["hulls.hull", (j) => j.hulls.hull(asInputs())],
    ["path.createFromPoints", (j) => j.path.createFromPoints(asInputs())],
    ["path.createPathsFromPoints", (j) => j.path.createPathsFromPoints(asInputs())],
    ["path.createFromPolyline", (j) => j.path.createFromPolyline(asInputs())],
    ["path.close", (j) => j.path.close(asInputs())],
    ["path.appendPoints", (j) => j.path.appendPoints(asInputs())],
    ["path.appendPolyline", (j) => j.path.appendPolyline(asInputs())],
    ["path.appendArc", (j) => j.path.appendArc(asInputs())],
    ["polygon.createFromPoints", (j) => j.polygon.createFromPoints(asInputs())],
    ["polygon.createFromPolyline", (j) => j.polygon.createFromPolyline(asInputs())],
    ["polygon.createFromCurve", (j) => j.polygon.createFromCurve(asInputs())],
    ["polygon.createFromPath", (j) => j.polygon.createFromPath(asInputs())],
    ["polygon.circle", (j) => j.polygon.circle(asInputs())],
    ["polygon.ellipse", (j) => j.polygon.ellipse(asInputs())],
    ["polygon.rectangle", (j) => j.polygon.rectangle(asInputs())],
    ["polygon.roundedRectangle", (j) => j.polygon.roundedRectangle(asInputs())],
    ["polygon.square", (j) => j.polygon.square(asInputs())],
    ["polygon.star", (j) => j.polygon.star(asInputs())],
    ["shapes.cube", (j) => j.shapes.cube(asInputs())],
    ["shapes.cubesOnCenterPoints", (j) => j.shapes.cubesOnCenterPoints(asInputs())],
    ["shapes.cuboid", (j) => j.shapes.cuboid(asInputs())],
    ["shapes.cuboidsOnCenterPoints", (j) => j.shapes.cuboidsOnCenterPoints(asInputs())],
    ["shapes.cylinderElliptic", (j) => j.shapes.cylinderElliptic(asInputs())],
    ["shapes.cylinderEllipticOnCenterPoints", (j) => j.shapes.cylinderEllipticOnCenterPoints(asInputs())],
    ["shapes.cylinder", (j) => j.shapes.cylinder(asInputs())],
    ["shapes.cylindersOnCenterPoints", (j) => j.shapes.cylindersOnCenterPoints(asInputs())],
    ["shapes.ellipsoid", (j) => j.shapes.ellipsoid(asInputs())],
    ["shapes.ellipsoidsOnCenterPoints", (j) => j.shapes.ellipsoidsOnCenterPoints(asInputs())],
    ["shapes.geodesicSphere", (j) => j.shapes.geodesicSphere(asInputs())],
    ["shapes.geodesicSpheresOnCenterPoints", (j) => j.shapes.geodesicSpheresOnCenterPoints(asInputs())],
    ["shapes.roundedCuboid", (j) => j.shapes.roundedCuboid(asInputs())],
    ["shapes.roundedCuboidsOnCenterPoints", (j) => j.shapes.roundedCuboidsOnCenterPoints(asInputs())],
    ["shapes.roundedCylinder", (j) => j.shapes.roundedCylinder(asInputs())],
    ["shapes.roundedCylindersOnCenterPoints", (j) => j.shapes.roundedCylindersOnCenterPoints(asInputs())],
    ["shapes.sphere", (j) => j.shapes.sphere(asInputs())],
    ["shapes.spheresOnCenterPoints", (j) => j.shapes.spheresOnCenterPoints(asInputs())],
    ["shapes.torus", (j) => j.shapes.torus(asInputs())],
    ["shapes.fromPolygonPoints", (j) => j.shapes.fromPolygonPoints(asInputs())],
    ["text.cylindricalText", (j) => j.text.cylindricalText(asInputs())],
    ["text.sphericalText", (j) => j.text.sphericalText(asInputs())],
    ["text.createVectorText", (j) => j.text.createVectorText(asInputs())],
    ["toPolygonPoints", (j) => j.toPolygonPoints(asInputs())],
    ["transformSolids", (j) => j.transformSolids(asInputs())],
    ["transformSolid", (j) => j.transformSolid(asInputs())],
];

describe("the generated worker API", () => {
    let worker: RecordingWorker;
    let jscad: JSCAD;
    let posted: PostedCall[];

    beforeEach(() => {
        const manager = new JSCADWorkerManager();
        worker = new RecordingWorker();
        manager.setJscadWorker(worker);
        posted = worker.posted;
        jscad = new JSCAD(manager);
    });

    describe("service wiring", () => {
        it("should build one service instance per class the kernel declares", () => {
            expect(jscad.booleans).toBeInstanceOf(JSCADBooleans);
            expect(jscad.colors).toBeInstanceOf(JSCADColors);
            expect(jscad.expansions).toBeInstanceOf(JSCADExpansions);
            expect(jscad.extrusions).toBeInstanceOf(JSCADExtrusions);
            expect(jscad.hulls).toBeInstanceOf(JSCADHulls);
        });

        it("should build the remaining services the kernel declares", () => {
            expect(jscad.path).toBeInstanceOf(JSCADPath);
            expect(jscad.polygon).toBeInstanceOf(JSCADPolygon);
            expect(jscad.shapes).toBeInstanceOf(JSCADShapes);
            expect(jscad.text).toBeInstanceOf(JSCADText);
        });
    });

    describe("every generated method", () => {
        it.each(DELEGATIONS)("should post %s when that method is called", (path, call) => {
            // Act
            void call(jscad);

            // Assert
            expect(posted).toHaveLength(1);
            expect((posted[0] as PostedCall).action.functionName).toBe(path);
        });

        it.each(DELEGATIONS)("should hand %s its own inputs untouched", (_path, call) => {
            // Act
            void call(jscad);

            // Assert
            expect((posted[0] as PostedCall).action.inputs).toBe(SENTINEL_INPUTS);
        });
    });

    describe("call identity", () => {
        it("should post the dotted path of the method that was called", () => {
            // Arrange
            const inputs = new Inputs.JSCAD.CubeDto(ORIGIN, CUBE_SIZE);

            // Act
            void jscad.shapes.cube(inputs);

            // Assert
            expect(posted).toHaveLength(1);
            const [call] = posted as [PostedCall];
            expect(call.action.functionName).toBe("shapes.cube");
            expect(call.action.inputs).toBe(inputs);
        });

        it("should keep each service on its own path", () => {
            // Act
            void jscad.shapes.cube(new Inputs.JSCAD.CubeDto(ORIGIN, CUBE_SIZE));
            void jscad.booleans.union({ meshes: [] });
            void jscad.expansions.expand(asInputs());

            // Assert
            expect(posted.map((call) => call.action.functionName)).toEqual([
                "shapes.cube",
                "booleans.union",
                "expansions.expand",
            ]);
        });

        it("should post the empty path with no inputs of its own", () => {
            // Act
            void jscad.path.createEmpty();

            // Assert
            expect((posted[0] as PostedCall).action).toEqual({ functionName: "path.createEmpty", inputs: {} });
        });

        it("should give every call its own uid", () => {
            // Act
            void jscad.shapes.cube(new Inputs.JSCAD.CubeDto(ORIGIN, CUBE_SIZE));
            void jscad.shapes.cube(new Inputs.JSCAD.CubeDto(ORIGIN, CUBE_SIZE));

            // Assert
            expect((posted[0] as PostedCall).uid).not.toBe((posted[1] as PostedCall).uid);
        });

        it("should settle the call when the worker answers with its identity", async () => {
            // Arrange
            const expected = "a-shape";
            const pending = jscad.shapes.cube(new Inputs.JSCAD.CubeDto(ORIGIN, CUBE_SIZE));

            // Act
            worker.onmessage({ data: { uid: (posted[0] as PostedCall).uid, result: expected } });

            // Assert
            await expect(pending).resolves.toBe(expected);
        });
    });
});
