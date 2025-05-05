import { Inputs } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";

export class OCCTBooleans {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Joins separate objects
     * @param inputs Objects to join
     * @returns OpenCascade joined shape
     * @group booleans
     * @shortname union
     * @drawable true
     */
    union(inputs: Inputs.OCCT.UnionDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("booleans.union", inputs);
    }

    /**
     * Does boolean difference operation between a main shape and given shapes
     * @param inputs Main shape and shapes to differ
     * @returns OpenCascade difference shape
     * @group booleans
     * @shortname difference
     * @drawable true
     */
    difference(inputs: Inputs.OCCT.DifferenceDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("booleans.difference", inputs);
    }

    /**
     * Does boolean intersection operation between a main shape and given shapes
     * @param inputs Main shape and shapes to differ
     * @returns OpenCascade intersection of shapes
     * @group booleans
     * @shortname intersection
     * @drawable true
     */
    intersection(inputs: Inputs.OCCT.IntersectionDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("booleans.intersection", inputs);
    }

    /**
     * Does mesh mesh intersection operation between two shapes - both shapes can have their own  meshing precision.
     * This algorithm intersects the meshes and returns the wires of the intersection, which are polylines or polygons.
     * @param inputs Two shapes to intersect
     * @returns Wires where shapes intersect
     * @group mesh based
     * @shortname mesh mesh intersection as wires
     * @drawable true
     */
    meshMeshIntersectionWires(inputs: Inputs.OCCT.MeshMeshIntersectionTwoShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSWirePointer[]>{
        return this.occWorkerManager.genericCallToWorkerPromise("booleans.meshMeshIntersectionWires", inputs);
    }

    /**
     * Does mesh mesh intersection operation between two shapes - both shapes can have their own  meshing precision.
     * This algorithm intersects the meshes and returns the points of the intersection, which are polylines or polygons.
     * @param inputs Two shapes to intersect
     * @returns Points where shapes intersect
     * @group mesh based
     * @shortname mesh mesh intersection as points
     * @drawable true
     */
    meshMeshIntersectionPoints(inputs: Inputs.OCCT.MeshMeshIntersectionTwoShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[][]>{
        return this.occWorkerManager.genericCallToWorkerPromise("booleans.meshMeshIntersectionPoints", inputs);
    }

    /**
     * Does mesh mesh intersection operation between the shape and multiple other shapes - all shapes can have their own meshing precision.
     * This algorithm intersects the meshes and returns the wires of the intersection, which are polylines or polygons.
     * @param inputs Two shapes to intersect
     * @returns Wires where shapes intersect
     * @group mesh based
     * @shortname mesh mesh intersection of shapes as wires
     * @drawable true
     */
    meshMeshIntersectionOfShapesWires(inputs: Inputs.OCCT.MeshMeshesIntersectionOfShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSWirePointer[]>{
        return this.occWorkerManager.genericCallToWorkerPromise("booleans.meshMeshIntersectionOfShapesWires", inputs);
    }

    /**
     * Does mesh mesh intersection operation between the shape and multiple other shapes - all shapes can have their own meshing precision.
     * This algorithm intersects the meshes and returns the points of the intersection.
     * @param inputs Two shapes to intersect
     * @returns Wires where shapes intersect
     * @group mesh based
     * @shortname mesh mesh intersection of shapes as points
     * @drawable true
     */
    meshMeshIntersectionOfShapesPoints(inputs: Inputs.OCCT.MeshMeshesIntersectionOfShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[][]>{
        return this.occWorkerManager.genericCallToWorkerPromise("booleans.meshMeshIntersectionOfShapesPoints", inputs);
    }
}
