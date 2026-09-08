import { describe, it, expect, beforeEach } from "vitest";
import { ManifoldWorkerManager } from "../manifold-worker/manifold-worker-manager";
import { ManifoldWorkerMock } from "../manifold-worker/manifold-worker-mock";
import { ManifoldBitByBit } from "./manifold-bitbybit";
import { Manifold } from "./manifold/manifold";
import { ManifoldCrossSection } from "./cross-section/cross-section";
import { Mesh } from "./mesh/mesh";
import * as Inputs from "@bitbybit-dev/manifold/lib/api/inputs";

// The API layer under lib/api is generated from the kernel: every method is one call posting its own
// dotted path to the worker. check:worker-api pins what is generated and check:worker-parity pins the
// set of paths, but neither runs a line of it. This suite does.

type PostedCall = { action: { functionName: string; inputs: unknown }; uid: string };

// The worker the manager talks to, recording what reaches it instead of running anything. It is the
// stand-in the package itself ships, with the one method under test replaced, so the suite is typed
// against the same contract a host would satisfy.
class RecordingWorker extends ManifoldWorkerMock {
    readonly posted: PostedCall[] = [];

    override postMessage(message: PostedCall | "busy"): void {
        if (message !== "busy") {
            this.posted.push(message);
        }
    }
}

const CUBE_SIZE = 2;

// One object stands in for every method's inputs. Each method hands its argument straight to the
// manager without reading it, so what the argument is cannot matter - only that the same object
// arrives on the wire. It is declared opaque and handed to each method as whatever that method
// takes, which is the one thing about it the test does not want checked.
const SENTINEL_INPUTS: unknown = { sentinel: "delegation" };
const asInputs = <T>(): T => SENTINEL_INPUTS as T;

// Every generated method, with the path it must post. A method missing here is a method no test
// runs; a path spelled wrong here fails against the kernel the generator read.
const DELEGATIONS: [string, (manifold: ManifoldBitByBit) => unknown][] = [
    ["crossSection.booleans.add", (m) => m.crossSection.booleans.add(asInputs())],
    ["crossSection.booleans.difference", (m) => m.crossSection.booleans.difference(asInputs())],
    ["crossSection.booleans.differenceTwo", (m) => m.crossSection.booleans.differenceTwo(asInputs())],
    ["crossSection.booleans.intersect", (m) => m.crossSection.booleans.intersect(asInputs())],
    ["crossSection.booleans.intersection", (m) => m.crossSection.booleans.intersection(asInputs())],
    ["crossSection.booleans.intersectionTwo", (m) => m.crossSection.booleans.intersectionTwo(asInputs())],
    ["crossSection.booleans.subtract", (m) => m.crossSection.booleans.subtract(asInputs())],
    ["crossSection.booleans.union", (m) => m.crossSection.booleans.union(asInputs())],
    ["crossSection.booleans.unionTwo", (m) => m.crossSection.booleans.unionTwo(asInputs())],
    ["crossSection.crossSectionFromPoints", (m) => m.crossSection.crossSectionFromPoints(asInputs())],
    ["crossSection.crossSectionFromPolygons", (m) => m.crossSection.crossSectionFromPolygons(asInputs())],
    ["crossSection.crossSectionToPoints", (m) => m.crossSection.crossSectionToPoints(asInputs())],
    ["crossSection.crossSectionToPolygons", (m) => m.crossSection.crossSectionToPolygons(asInputs())],
    ["crossSection.crossSectionsToPoints", (m) => m.crossSection.crossSectionsToPoints(asInputs())],
    ["crossSection.crossSectionsToPolygons", (m) => m.crossSection.crossSectionsToPolygons(asInputs())],
    ["crossSection.evaluate.area", (m) => m.crossSection.evaluate.area(asInputs())],
    ["crossSection.evaluate.bounds", (m) => m.crossSection.evaluate.bounds(asInputs())],
    ["crossSection.evaluate.isEmpty", (m) => m.crossSection.evaluate.isEmpty(asInputs())],
    ["crossSection.evaluate.numContour", (m) => m.crossSection.evaluate.numContour(asInputs())],
    ["crossSection.evaluate.numVert", (m) => m.crossSection.evaluate.numVert(asInputs())],
    ["crossSection.operations.compose", (m) => m.crossSection.operations.compose(asInputs())],
    ["crossSection.operations.decompose", (m) => m.crossSection.operations.decompose(asInputs())],
    ["crossSection.operations.extrude", (m) => m.crossSection.operations.extrude(asInputs())],
    ["crossSection.operations.hull", (m) => m.crossSection.operations.hull(asInputs())],
    ["crossSection.operations.offset", (m) => m.crossSection.operations.offset(asInputs())],
    ["crossSection.operations.revolve", (m) => m.crossSection.operations.revolve(asInputs())],
    ["crossSection.operations.simplify", (m) => m.crossSection.operations.simplify(asInputs())],
    ["crossSection.shapes.circle", (m) => m.crossSection.shapes.circle(asInputs())],
    ["crossSection.shapes.create", (m) => m.crossSection.shapes.create(asInputs())],
    ["crossSection.shapes.rectangle", (m) => m.crossSection.shapes.rectangle(asInputs())],
    ["crossSection.shapes.square", (m) => m.crossSection.shapes.square(asInputs())],
    ["crossSection.transforms.mirror", (m) => m.crossSection.transforms.mirror(asInputs())],
    ["crossSection.transforms.rotate", (m) => m.crossSection.transforms.rotate(asInputs())],
    ["crossSection.transforms.scale", (m) => m.crossSection.transforms.scale(asInputs())],
    ["crossSection.transforms.scale2D", (m) => m.crossSection.transforms.scale2D(asInputs())],
    ["crossSection.transforms.transform", (m) => m.crossSection.transforms.transform(asInputs())],
    ["crossSection.transforms.translate", (m) => m.crossSection.transforms.translate(asInputs())],
    ["crossSection.transforms.translateXY", (m) => m.crossSection.transforms.translateXY(asInputs())],
    ["crossSection.transforms.warp", (m) => m.crossSection.transforms.warp(asInputs())],
    ["decomposeManifoldOrCrossSection", (m) => m.decomposeManifoldOrCrossSection(asInputs())],
    ["decomposeManifoldsOrCrossSections", (m) => m.decomposeManifoldsOrCrossSections(asInputs())],
    ["deleteManifoldOrCrossSection", (m) => m.deleteManifoldOrCrossSection(asInputs())],
    ["deleteManifoldsOrCrossSections", (m) => m.deleteManifoldsOrCrossSections(asInputs())],
    ["manifold.booleans.add", (m) => m.manifold.booleans.add(asInputs())],
    ["manifold.booleans.difference", (m) => m.manifold.booleans.difference(asInputs())],
    ["manifold.booleans.differenceTwo", (m) => m.manifold.booleans.differenceTwo(asInputs())],
    ["manifold.booleans.intersect", (m) => m.manifold.booleans.intersect(asInputs())],
    ["manifold.booleans.intersection", (m) => m.manifold.booleans.intersection(asInputs())],
    ["manifold.booleans.intersectionTwo", (m) => m.manifold.booleans.intersectionTwo(asInputs())],
    ["manifold.booleans.split", (m) => m.manifold.booleans.split(asInputs())],
    ["manifold.booleans.splitByPlane", (m) => m.manifold.booleans.splitByPlane(asInputs())],
    ["manifold.booleans.splitByPlaneOnOffsets", (m) => m.manifold.booleans.splitByPlaneOnOffsets(asInputs())],
    ["manifold.booleans.subtract", (m) => m.manifold.booleans.subtract(asInputs())],
    ["manifold.booleans.trimByPlane", (m) => m.manifold.booleans.trimByPlane(asInputs())],
    ["manifold.booleans.union", (m) => m.manifold.booleans.union(asInputs())],
    ["manifold.booleans.unionTwo", (m) => m.manifold.booleans.unionTwo(asInputs())],
    ["manifold.evaluate.boundingBox", (m) => m.manifold.evaluate.boundingBox(asInputs())],
    ["manifold.evaluate.genus", (m) => m.manifold.evaluate.genus(asInputs())],
    ["manifold.evaluate.isEmpty", (m) => m.manifold.evaluate.isEmpty(asInputs())],
    ["manifold.evaluate.minGap", (m) => m.manifold.evaluate.minGap(asInputs())],
    ["manifold.evaluate.numEdge", (m) => m.manifold.evaluate.numEdge(asInputs())],
    ["manifold.evaluate.numProp", (m) => m.manifold.evaluate.numProp(asInputs())],
    ["manifold.evaluate.numPropVert", (m) => m.manifold.evaluate.numPropVert(asInputs())],
    ["manifold.evaluate.numTri", (m) => m.manifold.evaluate.numTri(asInputs())],
    ["manifold.evaluate.numVert", (m) => m.manifold.evaluate.numVert(asInputs())],
    ["manifold.evaluate.originalID", (m) => m.manifold.evaluate.originalID(asInputs())],
    ["manifold.evaluate.status", (m) => m.manifold.evaluate.status(asInputs())],
    ["manifold.evaluate.surfaceArea", (m) => m.manifold.evaluate.surfaceArea(asInputs())],
    ["manifold.evaluate.tolerance", (m) => m.manifold.evaluate.tolerance(asInputs())],
    ["manifold.evaluate.volume", (m) => m.manifold.evaluate.volume(asInputs())],
    ["manifold.manifoldToMesh", (m) => m.manifold.manifoldToMesh(asInputs())],
    ["manifold.manifoldsToMeshes", (m) => m.manifold.manifoldsToMeshes(asInputs())],
    ["manifold.operations.asOriginal", (m) => m.manifold.operations.asOriginal(asInputs())],
    ["manifold.operations.calculateCurvature", (m) => m.manifold.operations.calculateCurvature(asInputs())],
    ["manifold.operations.calculateNormals", (m) => m.manifold.operations.calculateNormals(asInputs())],
    ["manifold.operations.compose", (m) => m.manifold.operations.compose(asInputs())],
    ["manifold.operations.decompose", (m) => m.manifold.operations.decompose(asInputs())],
    ["manifold.operations.hull", (m) => m.manifold.operations.hull(asInputs())],
    ["manifold.operations.hullPoints", (m) => m.manifold.operations.hullPoints(asInputs())],
    ["manifold.operations.project", (m) => m.manifold.operations.project(asInputs())],
    ["manifold.operations.refine", (m) => m.manifold.operations.refine(asInputs())],
    ["manifold.operations.refineToLength", (m) => m.manifold.operations.refineToLength(asInputs())],
    ["manifold.operations.refineToTolerance", (m) => m.manifold.operations.refineToTolerance(asInputs())],
    ["manifold.operations.reserveIds", (m) => m.manifold.operations.reserveIds(asInputs())],
    ["manifold.operations.setProperties", (m) => m.manifold.operations.setProperties(asInputs())],
    ["manifold.operations.setTolerance", (m) => m.manifold.operations.setTolerance(asInputs())],
    ["manifold.operations.simplify", (m) => m.manifold.operations.simplify(asInputs())],
    ["manifold.operations.slice", (m) => m.manifold.operations.slice(asInputs())],
    ["manifold.operations.smoothByNormals", (m) => m.manifold.operations.smoothByNormals(asInputs())],
    ["manifold.operations.smoothOut", (m) => m.manifold.operations.smoothOut(asInputs())],
    ["manifold.shapes.cube", (m) => m.manifold.shapes.cube(asInputs())],
    ["manifold.shapes.cylinder", (m) => m.manifold.shapes.cylinder(asInputs())],
    ["manifold.shapes.fromPolygonPoints", (m) => m.manifold.shapes.fromPolygonPoints(asInputs())],
    ["manifold.shapes.manifoldFromMesh", (m) => m.manifold.shapes.manifoldFromMesh(asInputs())],
    ["manifold.shapes.sphere", (m) => m.manifold.shapes.sphere(asInputs())],
    ["manifold.transforms.mirror", (m) => m.manifold.transforms.mirror(asInputs())],
    ["manifold.transforms.rotate", (m) => m.manifold.transforms.rotate(asInputs())],
    ["manifold.transforms.rotateXYZ", (m) => m.manifold.transforms.rotateXYZ(asInputs())],
    ["manifold.transforms.scale", (m) => m.manifold.transforms.scale(asInputs())],
    ["manifold.transforms.scale3D", (m) => m.manifold.transforms.scale3D(asInputs())],
    ["manifold.transforms.transform", (m) => m.manifold.transforms.transform(asInputs())],
    ["manifold.transforms.transforms", (m) => m.manifold.transforms.transforms(asInputs())],
    ["manifold.transforms.translate", (m) => m.manifold.transforms.translate(asInputs())],
    ["manifold.transforms.translateByVectors", (m) => m.manifold.transforms.translateByVectors(asInputs())],
    ["manifold.transforms.translateXYZ", (m) => m.manifold.transforms.translateXYZ(asInputs())],
    ["manifold.transforms.warp", (m) => m.manifold.transforms.warp(asInputs())],
    ["manifoldToMeshPointer", (m) => m.manifoldToMeshPointer(asInputs())],
    ["mesh.evaluate.extras", (m) => m.mesh.evaluate.extras(asInputs())],
    ["mesh.evaluate.numProp", (m) => m.mesh.evaluate.numProp(asInputs())],
    ["mesh.evaluate.numRun", (m) => m.mesh.evaluate.numRun(asInputs())],
    ["mesh.evaluate.numTri", (m) => m.mesh.evaluate.numTri(asInputs())],
    ["mesh.evaluate.numVert", (m) => m.mesh.evaluate.numVert(asInputs())],
    ["mesh.evaluate.position", (m) => m.mesh.evaluate.position(asInputs())],
    ["mesh.evaluate.tangent", (m) => m.mesh.evaluate.tangent(asInputs())],
    ["mesh.evaluate.transform", (m) => m.mesh.evaluate.transform(asInputs())],
    ["mesh.evaluate.verts", (m) => m.mesh.evaluate.verts(asInputs())],
    ["mesh.operations.merge", (m) => m.mesh.operations.merge(asInputs())],
    ["toPolygonPoints", (m) => m.toPolygonPoints(asInputs())],
];

describe("the generated worker API", () => {
    let worker: RecordingWorker;
    let manifold: ManifoldBitByBit;
    let posted: PostedCall[];

    beforeEach(() => {
        const manager = new ManifoldWorkerManager();
        worker = new RecordingWorker();
        manager.setManifoldWorker(worker);
        posted = worker.posted;
        manifold = new ManifoldBitByBit(manager);
    });

    describe("service wiring", () => {
        it("should build the manifold service", () => {
            expect(manifold.manifold).toBeInstanceOf(Manifold);
        });

        it("should build the cross section service", () => {
            expect(manifold.crossSection).toBeInstanceOf(ManifoldCrossSection);
        });

        it("should build the mesh service", () => {
            expect(manifold.mesh).toBeInstanceOf(Mesh);
        });
    });

    describe("every generated method", () => {
        it.each(DELEGATIONS)("should post %s when that method is called", (path, call) => {
            // Act
            void call(manifold);

            // Assert
            expect(posted).toHaveLength(1);
            expect((posted[0] as PostedCall).action.functionName).toBe(path);
        });

        it.each(DELEGATIONS)("should hand %s its own inputs untouched", (_path, call) => {
            // Act
            void call(manifold);

            // Assert
            expect((posted[0] as PostedCall).action.inputs).toBe(SENTINEL_INPUTS);
        });
    });

    describe("call identity", () => {
        it("should post the dotted path of the method that was called", () => {
            // Arrange
            const inputs = new Inputs.Manifold.CubeDto(true, CUBE_SIZE);

            // Act
            void manifold.manifold.shapes.cube(inputs);

            // Assert
            expect(posted).toHaveLength(1);
            const [call] = posted as [PostedCall];
            expect(call.action.functionName).toBe("manifold.shapes.cube");
            expect(call.action.inputs).toBe(inputs);
        });

        it("should keep the three top-level services on their own paths", () => {
            // Act
            void manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));
            void manifold.crossSection.shapes.circle(asInputs());
            void manifold.mesh.evaluate.numProp(asInputs());

            // Assert
            expect(posted.map((call) => call.action.functionName)).toEqual([
                "manifold.shapes.cube",
                "crossSection.shapes.circle",
                "mesh.evaluate.numProp",
            ]);
        });

        it("should post the tetrahedron path with no inputs of its own", () => {
            // Act
            void manifold.manifold.shapes.tetrahedron();

            // Assert
            expect((posted[0] as PostedCall).action).toEqual({ functionName: "manifold.shapes.tetrahedron", inputs: {} });
        });

        it("should give every call its own uid", () => {
            // Act
            void manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));
            void manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));

            // Assert
            expect((posted[0] as PostedCall).uid).not.toBe((posted[1] as PostedCall).uid);
        });

        it("should settle the call when the worker answers with its identity", async () => {
            // Arrange
            const expected = "a-manifold";
            const pending = manifold.manifold.shapes.cube(new Inputs.Manifold.CubeDto(true, CUBE_SIZE));

            // Act
            worker.onmessage({ data: { uid: (posted[0] as PostedCall).uid, result: expected } });

            // Assert
            await expect(pending).resolves.toBe(expected);
        });
    });
});
