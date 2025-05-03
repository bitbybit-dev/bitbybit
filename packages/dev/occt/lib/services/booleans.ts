import { OpenCascadeInstance, TopoDS_Shape,TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import * as Inputs from "../api/inputs/inputs";

export class OCCTBooleans {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    union(inputs: Inputs.OCCT.UnionDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.booleansService.union(inputs);
    }

    difference(inputs: Inputs.OCCT.DifferenceDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.booleansService.difference(inputs);
    }

    intersection(inputs: Inputs.OCCT.IntersectionDto<TopoDS_Shape>): TopoDS_Shape {
        const int = this.och.booleansService.intersection(inputs);
        const res = this.och.converterService.makeCompound({ shapes: int });
        return res;
    }

    meshMeshIntersectionWires(inputs: Inputs.OCCT.MeshMeshIntersectionTwoShapesDto<TopoDS_Shape>): TopoDS_Wire[] {
        return this.och.meshingService.meshMeshIntersectionWires(inputs);
    }

    meshMeshIntersectionPoints(inputs: Inputs.OCCT.MeshMeshIntersectionTwoShapesDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        return this.och.meshingService.meshMeshIntersectionPoints(inputs);
    }

    meshMeshIntersectionOfShapesWires(inputs: Inputs.OCCT.MeshMeshesIntersectionOfShapesDto<TopoDS_Shape>): TopoDS_Wire[] {
        return this.och.meshingService.meshMeshIntersectionOfShapesWires(inputs);
    }

    meshMeshIntersectionOfShapesPoints(inputs: Inputs.OCCT.MeshMeshesIntersectionOfShapesDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        return this.och.meshingService.meshMeshIntersectionOfShapesPoints(inputs);
    }



}
