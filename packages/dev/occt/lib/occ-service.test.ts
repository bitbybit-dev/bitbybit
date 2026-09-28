import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "./occ-helper";
import { VectorHelperService } from "./api/vector-helper.service";
import { ShapesHelperService } from "./api/shapes-helper.service";
import { OCCTService } from "./occ-service";

describe("OCCT service unit tests", () => {
    let occt: BitbybitOcctModule;
    let occHelper: OccHelper;
    let service: OCCTService;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        service = new OCCTService(occt, occHelper);
    });

    it("should have service initialsied", () => {
        expect(service).toBeDefined();
    });

    it("should convert shape to mesh", () => {
        const sphere = service.shapes.solid.createSphere({ radius: 10, center: [0, 0, 0] });
        const meshDef = service.shapeToMesh({shape: sphere, precision: 0.01, adjustYtoZ: false});
        expect(meshDef).toBeDefined();
        expect(meshDef.faceList.length).toBe(1);
        expect(meshDef.faceList[0]!.vertexCoord.length).toBe(15318);
        expect(meshDef.faceList[0]!.vertexCoord[0]).toEqual(6.123233995736766e-16);
        expect(meshDef.faceList[0]!.vertexCoord[1]).toEqual(-1.4997597826618578e-31);
        expect(meshDef.faceList[0]!.vertexCoord[2]).toEqual(10);
        expect(meshDef.edgeList.length).toBe(3);
        expect(meshDef.pointsList.length).toBe(8);
    });

    it("should convert shape to mesh and adjust y to z", () => {
        const sphere = service.shapes.solid.createSphere({ radius: 10, center: [0, 0, 0] });
        const meshDef = service.shapeToMesh({shape: sphere, precision: 0.01, adjustYtoZ: true});
        expect(meshDef).toBeDefined();
        expect(meshDef.faceList.length).toBe(1);
        expect(meshDef.faceList[0]!.vertexCoord.length).toBe(15318);
        expect(meshDef.faceList[0]!.vertexCoord[0]).toEqual(6.123233995736766e-16);
        expect(meshDef.faceList[0]!.vertexCoord[1]).toEqual(10);
        expect(meshDef.faceList[0]!.vertexCoord[2]).toEqual(-1.1102230246251567e-15);
        expect(meshDef.edgeList.length).toBe(3);
        expect(meshDef.pointsList.length).toBe(8);
    });


    it("should convert shapes to meshes", () => {
        const sphere = service.shapes.solid.createSphere({ radius: 10, center: [0, 0, 0] });
        const cube = service.shapes.solid.createCube({ size: 5, center: [0, 0, 0] });


        const meshDef = service.shapesToMeshes({shapes: [sphere, cube], precision: 0.01, adjustYtoZ: true});
        expect(meshDef).toBeDefined();
        expect(meshDef.length).toBe(2);
        const sphereDef = meshDef[0]!;
        expect(sphereDef.faceList.length).toBe(1);
        expect(sphereDef.faceList[0]!.vertexCoord.length).toBe(15318);
        expect(sphereDef.faceList[0]!.vertexCoord[0]).toEqual(6.123233995736766e-16);
        expect(sphereDef.faceList[0]!.vertexCoord[1]).toEqual(10);
        expect(sphereDef.faceList[0]!.vertexCoord[2]).toEqual(-1.1102230246251567e-15);
        expect(sphereDef.edgeList.length).toBe(3);
        expect(sphereDef.pointsList.length).toBe(8);
        const cubeDef = meshDef[1]!;
        expect(cubeDef.faceList.length).toBe(6);
        expect(cubeDef.faceList[0]!.vertexCoord.length).toBe(12);
        expect(cubeDef.faceList[0]!.vertexCoord[0]).toEqual(-2.5);
        expect(cubeDef.faceList[0]!.vertexCoord[1]).toEqual(-2.5000000000000004);
        expect(cubeDef.faceList[0]!.vertexCoord[2]).toEqual(-2.4999999999999996);
        expect(cubeDef.edgeList.length).toBe(12);
        expect(cubeDef.pointsList.length).toBe(48);
    });

    describe("shapeToManifoldMesh", () => {
        const signedVolume = (mesh: { vertProperties: ArrayLike<number>, triVerts: ArrayLike<number> }): number => {
            const at = (vertex: number): number[] => [0, 1, 2].map(axis => mesh.vertProperties[3 * vertex + axis]!);
            let sixfold = 0;
            for (let index = 0; index + 2 < mesh.triVerts.length; index += 3) {
                const [a, b, c] = [at(mesh.triVerts[index]!), at(mesh.triVerts[index + 1]!), at(mesh.triVerts[index + 2]!)];
                sixfold += a[0]! * (b[1]! * c[2]! - b[2]! * c[1]!) - a[1]! * (b[0]! * c[2]! - b[2]! * c[0]!) + a[2]! * (b[0]! * c[1]! - b[1]! * c[0]!);
            }
            return sixfold / 6;
        };

        const closed = (triVerts: ArrayLike<number>): boolean => {
            const directed = new Map<string, number>();
            for (let index = 0; index + 2 < triVerts.length; index += 3) {
                for (let side = 0; side < 3; side++) {
                    const key = `${triVerts[index + side]}>${triVerts[index + (side + 1) % 3]}`;
                    directed.set(key, (directed.get(key) ?? 0) + 1);
                }
            }
            return [...directed].every(([key, count]) => {
                const [from, to] = key.split(">");
                return count === 1 && directed.get(`${to}>${from}`) === 1;
            });
        };

        it("should mesh a box into its eight shared corners and twelve triangles, wound outward", () => {
            // Arrange
            const box = service.shapes.solid.createBox({ width: 2, length: 2, height: 2, center: [0, 0, 0] });

            // Act
            const mesh = service.shapeToManifoldMesh({ shape: box, precision: 0.01 });

            // Assert
            expect(mesh.numProp).toBe(3);
            expect(mesh.vertProperties).toHaveLength(24);
            expect(mesh.triVerts).toHaveLength(36);
            expect(closed(mesh.triVerts)).toBe(true);
            expect(signedVolume(mesh)).toBeCloseTo(8, 10);
        });

        it("should close a sphere across its seam and poles", () => {
            // Arrange
            const sphere = service.shapes.solid.createSphere({ radius: 1, center: [0, 0, 0] });

            // Act
            const mesh = service.shapeToManifoldMesh({ shape: sphere, precision: 0.01 });

            // Assert
            expect(closed(mesh.triVerts)).toBe(true);
            expect(Math.abs(signedVolume(mesh) / (4 / 3 * Math.PI) - 1)).toBeLessThan(0.02);
        });

        it("should refuse an empty shape as an input error", () => {
            // Act
            const act = (): unknown => service.shapeToManifoldMesh({ shape: new occt.TopoDS_Shape(), precision: 0.01 });

            // Assert
            expect(act).toThrow(expect.objectContaining({ name: "InputError", property: "shape" }));
        });
    });
});
