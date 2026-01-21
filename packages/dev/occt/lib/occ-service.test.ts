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
        expect(meshDef.faceList[0].vertex_coord.length).toBe(15318);
        expect(meshDef.faceList[0].vertex_coord[0]).toEqual(6.123233995736766e-16);
        expect(meshDef.faceList[0].vertex_coord[1]).toEqual(-1.4997597826618578e-31);
        expect(meshDef.faceList[0].vertex_coord[2]).toEqual(10);
        expect(meshDef.edgeList.length).toBe(3);
        expect(meshDef.pointsList.length).toBe(8);
    });

    it("should convert shape to mesh and adjust y to z", () => {
        const sphere = service.shapes.solid.createSphere({ radius: 10, center: [0, 0, 0] });
        const meshDef = service.shapeToMesh({shape: sphere, precision: 0.01, adjustYtoZ: true});
        expect(meshDef).toBeDefined();
        expect(meshDef.faceList.length).toBe(1);
        expect(meshDef.faceList[0].vertex_coord.length).toBe(15318);
        expect(meshDef.faceList[0].vertex_coord[0]).toEqual(6.123233995736766e-16);
        expect(meshDef.faceList[0].vertex_coord[1]).toEqual(10);
        expect(meshDef.faceList[0].vertex_coord[2]).toEqual(-1.1102230246251567e-15);
        expect(meshDef.edgeList.length).toBe(3);
        expect(meshDef.pointsList.length).toBe(8);
    });


    it("should convert shapes to meshes", () => {
        const sphere = service.shapes.solid.createSphere({ radius: 10, center: [0, 0, 0] });
        const cube = service.shapes.solid.createCube({ size: 5, center: [0, 0, 0] });


        const meshDef = service.shapesToMeshes({shapes: [sphere, cube], precision: 0.01, adjustYtoZ: true});
        expect(meshDef).toBeDefined();
        expect(meshDef.length).toBe(2);
        const sphereDef = meshDef[0];
        expect(sphereDef.faceList.length).toBe(1);
        expect(sphereDef.faceList[0].vertex_coord.length).toBe(15318);
        expect(sphereDef.faceList[0].vertex_coord[0]).toEqual(6.123233995736766e-16);
        expect(sphereDef.faceList[0].vertex_coord[1]).toEqual(10);
        expect(sphereDef.faceList[0].vertex_coord[2]).toEqual(-1.1102230246251567e-15);
        expect(sphereDef.edgeList.length).toBe(3);
        expect(sphereDef.pointsList.length).toBe(8);
        const cubeDef = meshDef[1];
        expect(cubeDef.faceList.length).toBe(6);
        expect(cubeDef.faceList[0].vertex_coord.length).toBe(12);
        expect(cubeDef.faceList[0].vertex_coord[0]).toEqual(-2.5);
        expect(cubeDef.faceList[0].vertex_coord[1]).toEqual(-2.5000000000000004);
        expect(cubeDef.faceList[0].vertex_coord[2]).toEqual(-2.4999999999999996);
        expect(cubeDef.edgeList.length).toBe(12);
        expect(cubeDef.pointsList.length).toBe(48);
    });
});
