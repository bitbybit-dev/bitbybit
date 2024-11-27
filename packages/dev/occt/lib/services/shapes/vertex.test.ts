import initOpenCascade, { OpenCascadeInstance } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { VectorHelperService } from "../../api/vector-helper.service";
import { ShapesHelperService } from "../../api/shapes-helper.service";
import { OCCTVertex } from "./vertex";
import { OCCTSolid } from "./solid";
import * as Inputs from "../../api/inputs/inputs";
import { OCCTCompound } from "./compound";

describe("OCCT vertex unit tests", () => {
    let occt: OpenCascadeInstance;
    let vertex: OCCTVertex;
    let solid: OCCTSolid;
    let occHelper: OccHelper;
    let compound: OCCTCompound;

    beforeAll(async () => {
        occt = await initOpenCascade();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        vertex = new OCCTVertex(occt, occHelper);
        solid = new OCCTSolid(occt, occHelper);
        compound = new OCCTCompound(occt, occHelper);
    });

    it("should recreate a vertex from point", () => {
        const vertexFromPoint = vertex.vertexFromPoint({ point: [1, 3, 6] });
        expect(vertexFromPoint).toBeDefined();
        vertexFromPoint.delete();
    });

    it("should recreate a vertex from point and turn it back to point", () => {
        const vertexFromPoint = vertex.vertexFromPoint({ point: [1, 3, 6] });
        const point = vertex.vertexToPoint({ shape: vertexFromPoint });
        expect(vertexFromPoint).toBeDefined();
        expect(point).toEqual([1, 3, 6]);
        vertexFromPoint.delete();
    });

    it("should create vertices from points", () => {
        const vertices = vertex.verticesFromPoints({ points: [[1, 3, 6], [2, 4, 7]] });
        expect(vertices.length).toBe(2);
        vertices.forEach(v => v.delete());
    });

    it("should create vertices from points and turn them back to points", () => {
        const vertices = vertex.verticesFromPoints({ points: [[1, 3, 6], [2, 4, 7]] });
        const points = vertex.verticesToPoints({ shapes: vertices });
        expect(points.length).toBe(2);
        expect(points[0]).toEqual([1, 3, 6]);
        expect(points[1]).toEqual([2, 4, 7]);
        vertices.forEach(v => v.delete());
    });

    it("should get vertices of a shape", () => {
        const box = solid.createBox({ width: 1, height: 2, length: 3, center: [0, 0, 0] });
        const vertices = vertex.getVertices({ shape: box });
        expect(vertices.length).toBe(48);
        vertices.forEach(v => v.delete());
    });

    it("should get vertices of a shape as points", () => {
        const box = solid.createBox({ width: 1, height: 2, length: 3, center: [0, 0, 0] });
        const vertices = vertex.getVerticesAsPoints({ shape: box });
        expect(vertices.length).toBe(48);
        expect(vertices).toEqual([
            [-0.5, -1, 1.5], [-0.5, -1, -1.5], [-0.5, 1, 1.5],
            [-0.5, -1, 1.5], [-0.5, 1, 1.5], [-0.5, 1, -1.5],
            [-0.5, 1, -1.5], [-0.5, -1, -1.5], [0.5, -1, 1.5],
            [0.5, -1, -1.5], [0.5, 1, 1.5], [0.5, -1, 1.5],
            [0.5, 1, 1.5], [0.5, 1, -1.5], [0.5, 1, -1.5],
            [0.5, -1, -1.5], [0.5, -1, -1.5], [-0.5, -1, -1.5],
            [0.5, -1, 1.5], [0.5, -1, -1.5], [0.5, -1, 1.5],
            [-0.5, -1, 1.5], [-0.5, -1, 1.5], [-0.5, -1, -1.5],
            [0.5, 1, -1.5], [-0.5, 1, -1.5], [0.5, 1, 1.5],
            [0.5, 1, -1.5], [0.5, 1, 1.5], [-0.5, 1, 1.5],
            [-0.5, 1, 1.5], [-0.5, 1, -1.5], [-0.5, 1, -1.5],
            [-0.5, -1, -1.5], [0.5, 1, -1.5], [-0.5, 1, -1.5],
            [0.5, 1, -1.5], [0.5, -1, -1.5], [0.5, -1, -1.5],
            [-0.5, -1, -1.5], [-0.5, 1, 1.5], [-0.5, -1, 1.5],
            [0.5, 1, 1.5], [-0.5, 1, 1.5], [0.5, 1, 1.5],
            [0.5, -1, 1.5], [0.5, -1, 1.5], [-0.5, -1, 1.5]
        ]);
    });

    it("should create a compound of vertices", () => {
        const compound = vertex.verticesCompoundFromPoints({ points: [[1, 3, 6], [2, 4, 7]] });
        expect(compound).toBeDefined();
        compound.delete();
    });

    it("should project points on a shape", () => {
        const sphere = solid.createSphere({ radius: 1, center: [0, 0, 0] });
        const points = vertex.projectPoints({ points: [[0.1, -2.3, 0.6], [0.2, -3.4, 0.7]], shape: sphere, direction: [0, 10, 0], projectionType: Inputs.OCCT.pointProjectionTypeEnum.all });
        expect(points.length).toBe(4);
        expect(points).toEqual(
            [
                [0.1, -0.7937253933193773, 0.6],
                [0.1, 0.7937253933193773, 0.6],
                [0.2, -0.6855654600401055, 0.7],
                [0.2, 0.6855654600401055, 0.7]
            ]
        );
    });

    it("should return only closest project points on a shape", () => {
        const sphere = solid.createSphere({ radius: 1, center: [0, 0, 0] });
        const points = vertex.projectPoints({ points: [[0.1, -2.3, 0.6], [0.2, -3.4, 0.7]], shape: sphere, direction: [0, 10, 0], projectionType: Inputs.OCCT.pointProjectionTypeEnum.closest });
        expect(points.length).toBe(2);
        expect(points).toEqual(
            [
                [0.1, -0.7937253933193773, 0.6],
                [0.2, -0.6855654600401055, 0.7],
            ]
        );
    });

    it("should return only furthest project points on a shape", () => {
        const sphere = solid.createSphere({ radius: 1, center: [0, 0, 0] });
        const points = vertex.projectPoints({ points: [[0.1, -2.3, 0.6], [0.2, -3.4, 0.7]], shape: sphere, direction: [0, 10, 0], projectionType: Inputs.OCCT.pointProjectionTypeEnum.furthest });
        expect(points.length).toBe(2);
        expect(points).toEqual(
            [
                [0.1, 0.7937253933193773, 0.6],
                [0.2, 0.6855654600401055, 0.7]
            ]
        );
    });

    it("should return multiple intersections for compound shape", () => {
        const box = solid.createBox({ width: 2, height: 0.5, length: 2, center: [0, 2, 0] });
        const sphere = solid.createSphere({ radius: 1, center: [0, 0, 0] });
        const c = compound.makeCompound({ shapes: [box, sphere] });
        const points = vertex.projectPoints({ points: [[0.1, -2.3, 0.6], [0.2, -3.4, 0.7]], shape: c, direction: [0, 20, 0], projectionType: Inputs.OCCT.pointProjectionTypeEnum.all });
        expect(points.length).toBe(8);
        expect(points).toEqual(
            [
                [0.1, -0.7937253933193773, 0.6],
                [0.1, 0.7937253933193773, 0.6],
                [0.1, 1.75, 0.6],
                [0.1, 2.25, 0.6],
                [0.2, -0.6855654600401055, 0.7],
                [0.2, 0.6855654600401055, 0.7],
                [0.2, 1.7500000000000004, 0.7],
                [0.2, 2.2500000000000004, 0.7]
            ]
        );
    });

    it("should only return projections of outer shape if second one is inside the first", () => {
        const box = solid.createBox({ width: 2, height: 0.5, length: 2, center: [0, 0, 0] });
        const sphere = solid.createSphere({ radius: 1, center: [0, 0, 0] });
        const c = compound.makeCompound({ shapes: [box, sphere] });
        const points = vertex.projectPoints({ points: [[0.1, -2.3, 0.6], [0.2, -3.4, 0.7]], shape: c, direction: [0, 20, 0], projectionType: Inputs.OCCT.pointProjectionTypeEnum.all });
        expect(points.length).toBe(4);
        expect(points).toEqual(
            [
                [0.1, -0.7937253933193773, 0.6],
                [0.1, 0.7937253933193773, 0.6],
                [0.2, -0.6855654600401055, 0.7],
                [0.2, 0.6855654600401055, 0.7]
            ]
        );
    });

    it("should return closest and furthest points of intersection", () => {
        const box = solid.createBox({ width: 2, height: 0.5, length: 2, center: [0, 2, 0] });
        const sphere = solid.createSphere({ radius: 1, center: [0, 0, 0] });
        const c = compound.makeCompound({ shapes: [box, sphere] });
        const points = vertex.projectPoints({ points: [[0.1, -2.3, 0.6], [0.2, -3.4, 0.7]], shape: c, direction: [0, 20, 0], projectionType: Inputs.OCCT.pointProjectionTypeEnum.closestAndFurthest });
        expect(points.length).toBe(4);
        expect(points).toEqual(
            [
                [0.1, -0.7937253933193773, 0.6],
                [0.1, 2.25, 0.6],
                [0.2, -0.6855654600401055, 0.7],
                [0.2, 2.2500000000000004, 0.7]
            ]
        );
    });
});

