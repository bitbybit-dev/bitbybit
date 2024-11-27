import {
    OpenCascadeInstance, TopoDS_Compound, TopoDS_Edge, TopoDS_Shape, TopoDS_Wire, TopoDS_Face
} from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs/inputs";

export class OCCTOperations {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    closestPointsBetweenTwoShapes(inputs: Inputs.OCCT.ClosestPointsBetweenTwoShapesDto<TopoDS_Shape>): [Inputs.Base.Point3, Inputs.Base.Point3] {
        return this.och.operationsService.closestPointsBetweenTwoShapes(inputs.shape1, inputs.shape2);
    }

    closestPointsOnShapeFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapeFromPointsDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        return this.och.operationsService.closestPointsOnShapeFromPoints(inputs);
    }

    closestPointsOnShapesFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapesFromPointsDto<TopoDS_Shape>): Inputs.Base.Point3[] {
        return this.och.operationsService.closestPointsOnShapesFromPoints(inputs);
    }

    distancesToShapeFromPoints(inputs: Inputs.OCCT.ClosestPointsOnShapeFromPointsDto<TopoDS_Shape>): number[] {
        return this.och.operationsService.distancesToShapeFromPoints(inputs);
    }

    loft(inputs: Inputs.OCCT.LoftDto<TopoDS_Wire | TopoDS_Edge>) {
        return this.och.operationsService.loft(inputs);
    }

    loftAdvanced(inputs: Inputs.OCCT.LoftAdvancedDto<TopoDS_Wire | TopoDS_Edge>) {
        return this.och.operationsService.loftAdvanced(inputs);
    }

    offset(inputs: Inputs.OCCT.OffsetDto<TopoDS_Shape, TopoDS_Face>) {
        return this.och.operationsService.offset(inputs);
    }

    offsetAdv(inputs: Inputs.OCCT.OffsetAdvancedDto<TopoDS_Shape, TopoDS_Face>) {
        return this.och.operationsService.offsetAdv(inputs);
    }

    offset3DWire(inputs: Inputs.OCCT.Offset3DWireDto<TopoDS_Wire>): TopoDS_Wire | TopoDS_Edge[] {
        return this.och.operationsService.offset3DWire(inputs);
    }

    extrudeShapes(inputs: Inputs.OCCT.ExtrudeShapesDto<TopoDS_Shape>): TopoDS_Shape[] {
        return this.och.operationsService.extrudeShapes(inputs);
    }

    extrude(inputs: Inputs.OCCT.ExtrudeDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.operationsService.extrude(inputs);
    }

    splitShapeWithShapes(inputs: Inputs.OCCT.SplitDto<TopoDS_Shape>) {
        return this.och.operationsService.splitShapeWithShapes(inputs);
    }

    revolve(inputs: Inputs.OCCT.RevolveDto<TopoDS_Shape>) {
        return this.och.operationsService.revolve(inputs);
    }

    rotatedExtrude(inputs: Inputs.OCCT.RotationExtrudeDto<TopoDS_Shape>) {
        return this.och.operationsService.rotatedExtrude(inputs);
    }

    pipe(inputs: Inputs.OCCT.ShapeShapesDto<TopoDS_Wire, TopoDS_Shape>) {
        return this.och.operationsService.pipe(inputs);
    }

    pipePolylineWireNGon(inputs: Inputs.OCCT.PipePolygonWireNGonDto<TopoDS_Wire>) {
        return this.och.operationsService.pipePolylineWireNGon(inputs);
    }

    pipeWireCylindrical(inputs: Inputs.OCCT.PipeWireCylindricalDto<TopoDS_Wire>) {
        return this.och.operationsService.pipeWireCylindrical(inputs);
    }

    pipeWiresCylindrical(inputs: Inputs.OCCT.PipeWiresCylindricalDto<TopoDS_Wire>) {
        return this.och.operationsService.pipeWiresCylindrical(inputs);
    }

    makeThickSolidSimple(inputs: Inputs.OCCT.ThisckSolidSimpleDto<TopoDS_Shape>) {
        return this.och.operationsService.makeThickSolidSimple(inputs);
    }

    makeThickSolidByJoin(inputs: Inputs.OCCT.ThickSolidByJoinDto<TopoDS_Shape>) {
        return this.och.operationsService.makeThickSolidByJoin(inputs);
    }

    slice(inputs: Inputs.OCCT.SliceDto<TopoDS_Shape>): TopoDS_Compound {
        return this.och.operationsService.slice(inputs);
    }

    sliceInStepPattern(inputs: Inputs.OCCT.SliceInStepPatternDto<TopoDS_Shape>): TopoDS_Compound {
        return this.och.operationsService.sliceInStepPattern(inputs);
    }
}
