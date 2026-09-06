import {
    BitbybitOcctModule, TopoDS_Compound, TopoDS_Edge, TopoDS_Shape, TopoDS_Wire, TopoDS_Face
} from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs";

export class OCCTOperations {

    constructor(
        _occ: BitbybitOcctModule,
        private readonly och: OccHelper
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
    loft(inputs: Inputs.OCCT.LoftDto<TopoDS_Wire | TopoDS_Edge>): TopoDS_Shape {
        return this.och.operationsService.loft(inputs);
    }

    /**
     * Lofts wires into a shell by using many advanced options
     * @param inputs Advanced loft parameters
     * @returns Resulting loft shell
     * @group lofts
     * @shortname loft adv.
     * @drawable true
     */
    loftAdvanced(inputs: Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire | TopoDS_Edge>): TopoDS_Shape {
        return this.och.operationsService.loftAdvanced(inputs);
    }

    /**
     * Computes two closest points between two shapes
     * @param inputs two shapes
     * @returns Resulting points
     * @group closest pts
     * @shortname two shapes
     * @drawable true
     */
    closestPointsBetweenTwoShapes(inputs: Inputs.OCCT.ClosestPointsBetweenTwoShapesDto<TopoDS_Shape>): [Inputs.Base.Point3, Inputs.Base.Point3] {
        return this.och.operationsService.closestPointsBetweenTwoShapes(inputs.shape1, inputs.shape2);
    }

    /**
     * Computes closest points between a list of points and a given shape
     * @param inputs a list of points and a shape
     * @returns Resulting points
     * @group closest pts
     * @shortname on shape
     * @drawable true
     */
    closestPointsOnShapeFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapeFromPointsDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        return this.och.operationsService.closestPointsOnShapeFromPoints(inputs);
    }

    /**
     * Computes closest points between a list of points and shapes
     * @param inputs a list of points and a list of shapes
     * @returns Resulting points
     * @group closest pts
     * @shortname on shapes
     * @drawable true
     */
    closestPointsOnShapesFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapesFromPointsDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        return this.och.operationsService.closestPointsOnShapesFromPoints(inputs);
    }

    /**
     * Computes distances between a list of points and a corresponding closest points on shapes.
     * @param inputs a list of points and a shapes
     * @returns Resulting distances
     * @group measure
     * @shortname distances points to shape
     * @drawable false
     */
    distancesToShapeFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapeFromPointsDto<TopoDS_Shape>): number[] {
        return this.och.operationsService.distancesToShapeFromPoints(inputs);
    }

    /**
     * Computes bounding box parameters of the shape
     * @param inputs a shape
     * @returns Min, max center and size of the bounding box
     * @group measure
     * @shortname bbox of shape
     * @drawable false
     */
    boundingBoxOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.OCCT.BoundingBoxPropsDto {
        return this.och.operationsService.boundingBoxOfShape(inputs);
    }

    /**
     * Get min point of the bounding box of the shape
     * @param inputs a shape
     * @returns Min point of the bounding box
     * @group measure
     * @shortname bbox min of shape
     * @drawable true
     */
    boundingBoxMinOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3 {
        const bbox = this.och.operationsService.boundingBoxOfShape(inputs);
        return bbox.min;
    }

    /**
     * Get max point of the bounding box of the shape
     * @param inputs a shape
     * @returns Max point of the bounding box
     * @group measure
     * @shortname bbox max of shape
     * @drawable true
     */
    boundingBoxMaxOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3 {
        const bbox = this.och.operationsService.boundingBoxOfShape(inputs);
        return bbox.max;
    }

    /**
     * Get center point of the bounding box of the shape
     * @param inputs a shape
     * @returns Center point of the bounding box
     * @group measure
     * @shortname bbox center of shape
     * @drawable true
     */
    boundingBoxCenterOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3 {
        const bbox = this.och.operationsService.boundingBoxOfShape(inputs);
        return bbox.center;
    }

    /**
     * Get size point of the bounding box of the shape
     * @param inputs a shape
     * @returns Center point of the bounding box
     * @group measure
     * @shortname bbox size of shape
     * @drawable false
     */
    boundingBoxSizeOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Vector3 {
        const bbox = this.och.operationsService.boundingBoxOfShape(inputs);
        return bbox.size;
    }

    /**
     * Get bounding box shape of the shape
     * @param inputs a shape
     * @returns shape of the bounding box
     * @group measure
     * @shortname bbox shape of shape
     * @drawable true
     */
    boundingBoxShapeOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.operationsService.boundingBoxShapeOfShape(inputs);
    }

    /**
     * Computes bounding sphere parameters of the shape
     * @param inputs a shape
     * @returns Center and radius of the bounding sphere
     * @group measure
     * @shortname bsphere of shape
     * @drawable false
     */
    boundingSphereOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.OCCT.BoundingSpherePropsDto {
        return this.och.operationsService.boundingSphereOfShape(inputs);
    }

    /**
     * Get center point of the bounding sphere of the shape
     * @param inputs a shape
     * @returns Center point of the bounding sphere
     * @group measure
     * @shortname bsphere center of shape
     * @drawable false
     */
    boundingSphereCenterOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): Inputs.Base.Point3 {
        const sphere = this.och.operationsService.boundingSphereOfShape(inputs);
        return sphere.center;
    }

    /**
     * Get radius of the bounding sphere of the shape
     * @param inputs a shape
     * @returns Radius of the bounding sphere
     * @group measure
     * @shortname bsphere radius of shape
     * @drawable false
     */
    boundingSphereRadiusOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): number {
        const sphere = this.och.operationsService.boundingSphereOfShape(inputs);
        return sphere.radius;
    }

    /**
     * Get bounding sphere shape of the shape
     * @param inputs a shape
     * @returns shape of the bounding sphere
     * @group measure
     * @shortname bsphere shape of shape
     * @drawable true
     */
    boundingSphereShapeOfShape(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.operationsService.boundingSphereShapeOfShape(inputs);
    }

    /**
     * Extrudes the shape along direction - wire will produce shell, face will produce solid
     * @param inputs Shape to extrude and direction parameter with tolerance
     * @returns Resulting extruded shape
     * @group extrusions
     * @shortname extrude
     * @drawable true
     */
    extrude(inputs: Inputs.OCCT.ExtrudeDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.operationsService.extrude(inputs);
    }

    /**
     * Extrudes the shapes along direction
     * @param inputs Shapes to extrude and direction parameter with tolerance
     * @returns Resulting extruded shapes
     * @group extrusions
     * @shortname extrude shapes
     * @drawable true
     */
    extrudeShapes(inputs: Inputs.OCCT.ExtrudeShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        return this.och.operationsService.extrudeShapes(inputs);
    }

    /**
     * Splits the shape with shapes
     * @param inputs Shape to split and shapes to split with
     * @returns Resulting shapes
     * @group divisions
     * @shortname split
     * @drawable true
     */
    splitShapeWithShapes(inputs: Inputs.OCCT.SplitDto<TopoDS_Shape>): TopoDS_Shape[] {
        return this.och.operationsService.splitShapeWithShapes(inputs);
    }

    /**
     * Revolves the shape around the given direction
     * @param inputs Revolve parameters
     * @returns Resulting revolved shape
     * @group revolutions
     * @shortname revolve
     * @drawable true
     */
    revolve(inputs: Inputs.OCCT.RevolveDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.operationsService.revolve(inputs);
    }

    /**
     * Rotated extrude that is perofrmed on the shape
     * @param inputs Rotated extrusion inputs
     * @returns OpenCascade shape
     * @group extrusions
     * @shortname rotated extrude
     * @drawable true
     */
    rotatedExtrude(inputs: Inputs.OCCT.RotationExtrudeDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.operationsService.rotatedExtrude(inputs);
    }

    /**
     * Pipe shapes along the wire
     * @param inputs Path wire and shapes along the path
     * @returns OpenCascade shape
     * @group pipeing
     * @shortname pipe
     * @drawable true
     */
    pipe(inputs: Inputs.OCCT.ShapeShapesDto<TopoDS_Wire, TopoDS_Shape>): TopoDS_Shape {
        return this.och.operationsService.pipe(inputs);
    }

    /**
     * Pipes polyline wire with ngon profile.
     * @param inputs Path polyline wire
     * @returns OpenCascade piped shapes
     * @group pipeing
     * @shortname pipe polyline ngon
     * @drawable true
     */
    pipePolylineWireNGon(inputs: Inputs.OCCT.PipePolygonWireNGonDto<TopoDS_Wire>): TopoDS_Shape {
        return this.och.operationsService.pipePolylineWireNGon(inputs);
    }

    /**
     * Pipe wires with cylindrical shape
     * @param inputs Path wires and radius
     * @returns OpenCascade piped shapes
     * @group pipeing
     * @shortname pipe wires cylindrical
     * @drawable true
     */
    pipeWiresCylindrical(inputs: Inputs.OCCT.PipeWiresCylindricalDto<TopoDS_Wire>): TopoDS_Shape[] {
        return this.och.operationsService.pipeWiresCylindrical(inputs);
    }

    /**
     * Pipe wire with cylindrical shape
     * @param inputs Path wire and radius
     * @returns OpenCascade piped shapes
     * @group pipeing
     * @shortname pipe wire cylindrical
     * @drawable true
     */
    pipeWireCylindrical(inputs: Inputs.OCCT.PipeWireCylindricalDto<TopoDS_Wire>): TopoDS_Shape {
        return this.och.operationsService.pipeWireCylindrical(inputs);
    }

    /**
     * Offset for various shapes
     * @param inputs Shape to offset and distance with tolerance
     * @returns Resulting offset shape
     * @group offsets
     * @shortname offset
     * @drawable true
     */
    offset(inputs: Inputs.OCCT.OffsetDto<TopoDS_Shape, TopoDS_Face>): TopoDS_Shape {
        return this.och.operationsService.offset(inputs);
    }

    /**
     * Offset advanced that give more options for offset, such as joinType for edges and corners
     * @param inputs Shape to offset and advanced parameters
     * @returns Resulting offset shape
     * @group offsets
     * @shortname offset adv.
     * @drawable true
     */
    offsetAdv(inputs: Inputs.OCCT.OffsetAdvancedDto<TopoDS_Shape, TopoDS_Face>): TopoDS_Shape {
        return this.och.operationsService.offsetAdv(inputs);
    }

    /**
     * Thickens the shape into a solid by an offset distance
     * @param inputs OpenCascade shape
     * @returns OpenCascade solid shape
     * @group offsets
     * @shortname thicken
     * @drawable true
     */
    makeThickSolidSimple(inputs: Inputs.OCCT.ThisckSolidSimpleDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.operationsService.makeThickSolidSimple(inputs);
    }

    /**
     * Thickens the shape into a solid by joining
     * @param inputs OpenCascade shape and options for thickening
     * @returns OpenCascade solid shape
     * @group offsets
     * @shortname joined thicken
     * @drawable true
     */
    makeThickSolidByJoin(inputs: Inputs.OCCT.ThickSolidByJoinDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.operationsService.makeThickSolidByJoin(inputs);
    }

    /**
     * Slices the shape
     * @param inputs OpenCascade shape and options for slicing
     * @returns OpenCascade shape
     * @group divisions
     * @shortname slice
     * @drawable true
     */
    slice(inputs: Inputs.OCCT.SliceDto<TopoDS_Shape>): TopoDS_Compound {
        return this.och.operationsService.slice(inputs);
    }

    /**
     * Slices the shape in step pattern
     * @param inputs OpenCascade shape and options for slicing
     * @returns OpenCascade shape
     * @group divisions
     * @shortname slice in step pattern
     * @drawable true
     */
    sliceInStepPattern(inputs: Inputs.OCCT.SliceInStepPatternDto<TopoDS_Shape>): TopoDS_Compound {
        return this.och.operationsService.sliceInStepPattern(inputs);
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
    offset3DWire(inputs: Inputs.OCCT.Offset3DWireDto<TopoDS_Wire>): TopoDS_Wire | TopoDS_Edge[] {
        return this.och.operationsService.offset3DWire(inputs);
    }
}
