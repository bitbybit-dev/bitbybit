import { Inputs } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";

export class OCCTOperations {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Lofts wires into a shell
     * @param inputs Loft wires
     * @returns Resulting loft shape
     * @group lofts
     * @shortname loft
     * @drawable true
     */
    loft(inputs: Inputs.OCCT.LoftDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.loft", inputs);
    }

    /**
     * Lofts wires into a shell by using many advanced options
     * @param inputs Advanced loft parameters
     * @returns Resulting loft shell
     * @group lofts
     * @shortname loft adv.
     * @drawable true
     */
    loftAdvanced(inputs: Inputs.OCCT.LoftAdvancedDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.loftAdvanced", inputs);
    }

    /**
     * Computes two closest points between two shapes
     * @param inputs two shapes
     * @returns Resulting points
     * @group closest pts
     * @shortname two shapes
     * @drawable true
     */
    closestPointsBetweenTwoShapes(inputs: Inputs.OCCT.ClosestPointsBetweenTwoShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.closestPointsBetweenTwoShapes", inputs);
    }

    /**
     * Computes closest points between a list of points and a given shape
     * @param inputs a list of points and a shape
     * @returns Resulting points
     * @group closest pts
     * @shortname on shape
     * @drawable true
     */
    closestPointsOnShapeFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapeFromPointsDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.closestPointsOnShapeFromPoints", inputs);
    }

    /**
     * Computes closest points between a list of points and shapes
     * @param inputs a list of points and a list of shapes
     * @returns Resulting points
     * @group closest pts
     * @shortname on shapes
     * @drawable true
     */
    closestPointsOnShapesFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapesFromPointsDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.closestPointsOnShapesFromPoints", inputs);
    }

    /**
     * Computes distances between a list of points and a corresponding closest points on shapes.
     * @param inputs a list of points and a shapes
     * @returns Resulting distances
     * @group measure
     * @shortname distances points to shape
     * @drawable false
     */
    distancesToShapeFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapeFromPointsDto<Inputs.OCCT.TopoDSShapePointer>): Promise<number[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.distancesToShapeFromPoints", inputs);
    }

    /**
     * Extrudes the face along direction
     * @param inputs Shape to extrude and direction parameter with tolerance
     * @returns Resulting extruded shape
     * @group extrusions
     * @shortname extrude
     * @drawable true
     */
    extrude(inputs: Inputs.OCCT.ExtrudeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.extrude", inputs);
    }

    /**
     * Extrudes the shapes along direction
     * @param inputs Shapes to extrude and direction parameter with tolerance
     * @returns Resulting extruded shapes
     * @group extrusions
     * @shortname extrude shapes
     * @drawable true
     */
    extrudeShapes(inputs: Inputs.OCCT.ExtrudeShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.extrudeShapes", inputs);
    }

    /**
     * Splits the face with edges
     * @param inputs Face to split and edges to split with
     * @returns Resulting split shape
     * @group divisions
     * @shortname split
     * @drawable true
     */
    splitShapeWithShapes(inputs: Inputs.OCCT.SplitDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.splitShapeWithShapes", inputs);
    }

    /**
     * Revolves the shape around the given direction
     * @param inputs Revolve parameters
     * @returns Resulting revolved shape
     * @group revolutions
     * @shortname revolve
     * @drawable true
     */
    revolve(inputs: Inputs.OCCT.RevolveDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.revolve", inputs);
    }

    /**
     * Rotated extrude that is perofrmed on the shape
     * @param inputs Rotated extrusion inputs
     * @returns OpenCascade shape
     * @group extrusions
     * @shortname rotated extrude
     * @drawable true
     */
    rotatedExtrude(inputs: Inputs.OCCT.RotationExtrudeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.rotatedExtrude", inputs);
    }

    /**
     * Pipe shapes along the wire
     * @param inputs Path wire and shapes along the path
     * @returns OpenCascade shape
     * @group pipeing
     * @shortname pipe
     * @drawable true
     */
    pipe(inputs: Inputs.OCCT.ShapeShapesDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.pipe", inputs);
    }

    /**
     * Pipes polyline wire with ngon profile.
     * @param inputs Path polyline wire
     * @returns OpenCascade piped shapes
     * @group pipeing
     * @shortname pipe polyline ngon
     * @drawable true
     */
    pipePolylineWireNGon(inputs: Inputs.OCCT.PipePolygonWireNGonDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.pipePolylineWireNGon", inputs);
    }

    /**
     * Pipe wires with cylindrical shape
     * @param inputs Path wires and radius
     * @returns OpenCascade piped shapes
     * @group pipeing
     * @shortname pipe wires cylindrical
     * @drawable true
     */
    pipeWiresCylindrical(inputs: Inputs.OCCT.PipeWiresCylindricalDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.pipeWiresCylindrical", inputs);
    }

    /**
     * Pipe wire with cylindrical shape
     * @param inputs Path wire and radius
     * @returns OpenCascade piped shapes
     * @group pipeing
     * @shortname pipe wire cylindrical
     * @drawable true
     */
    pipeWireCylindrical(inputs: Inputs.OCCT.PipeWireCylindricalDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.pipeWireCylindrical", inputs);
    }

    /**
     * Offset for various shapes
     * @param inputs Shape to offset and distance with tolerance
     * @returns Resulting offset shape
     * @group offsets
     * @shortname offset
     * @drawable true
     */
    offset(inputs: Inputs.OCCT.OffsetDto<Inputs.OCCT.TopoDSShapePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.offset", inputs);
    }

    /**
     * Offset advanced that give more options for offset, such as joinType for edges and corners
     * @param inputs Shape to offset and advanced parameters
     * @returns Resulting offset shape
     * @group offsets
     * @shortname offset adv.
     * @drawable true
     */
    offsetAdv(inputs: Inputs.OCCT.OffsetAdvancedDto<Inputs.OCCT.TopoDSShapePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.offsetAdv", inputs);
    }

    /**
     * Thickens the shape into a solid by an offset distance
     * @param inputs OpenCascade shape
     * @returns OpenCascade solid shape
     * @group offsets
     * @shortname thicken
     * @drawable true
     */
    makeThickSolidSimple(inputs: Inputs.OCCT.ThisckSolidSimpleDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.makeThickSolidSimple", inputs);
    }

    /**
     * Thickens the shape into a solid by joining
     * @param inputs OpenCascade shape and options for thickening
     * @returns OpenCascade solid shape
     * @group offsets
     * @shortname joined thicken
     * @drawable true
     */
    makeThickSolidByJoin(inputs: Inputs.OCCT.ThickSolidByJoinDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.makeThickSolidByJoin", inputs);
    }

    /**
     * Slices the shape
     * @param inputs OpenCascade shape and options for slicing
     * @returns OpenCascade shape
     * @group divisions
     * @shortname slice
     * @drawable true
     */
    slice(inputs: Inputs.OCCT.SliceDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSCompoundPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.slice", inputs);
    }

    /**
     * Slices the shape in step pattern
     * @param inputs OpenCascade shape and options for slicing
     * @returns OpenCascade shape
     * @group divisions
     * @shortname slice in step pattern
     * @drawable true
     */
    sliceInStepPattern(inputs: Inputs.OCCT.SliceInStepPatternDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSCompoundPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.sliceInStepPattern", inputs);
    }

    /**
     * Offset the 3D wire. When using this method consider using it on filleted wires that do not contain sharp corners.
     * You can use fillet 3D on it.
     * @param inputs wire and shape
     * @returns OpenCascade compound
     * @group offsets
     * @shortname offset 3d wire
     * @drawable true
     */
    offset3DWire(inputs: Inputs.OCCT.Offset3DWireDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("operations.offset3DWire", inputs);
    }
}
