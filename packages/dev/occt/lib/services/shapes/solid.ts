import { OccHelper } from "../../occ-helper";
import { OpenCascadeInstance, TopoDS_Shape, TopoDS_Shell, TopoDS_Solid } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";
import { Base } from "../../api/inputs/inputs";

export class OCCTSolid {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    fromClosedShell(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): TopoDS_Solid {
        return this.och.solidsService.fromClosedShell(inputs);
    }

    createBox(inputs: Inputs.OCCT.BoxDto): TopoDS_Solid {
        return this.och.solidsService.createBox(inputs);
    }

    createCube(inputs: Inputs.OCCT.CubeDto): TopoDS_Solid {
        return this.och.solidsService.createCube(inputs);
    }

    createBoxFromCorner(inputs: Inputs.OCCT.BoxFromCornerDto): TopoDS_Solid {
        return this.och.solidsService.createBoxFromCorner(inputs);
    }

    createCylinder(inputs: Inputs.OCCT.CylinderDto): TopoDS_Solid {
        return this.och.solidsService.createCylinder(inputs);
    }

    createCylindersOnLines(inputs: Inputs.OCCT.CylindersOnLinesDto): TopoDS_Solid[] {
        return this.och.solidsService.createCylindersOnLines(inputs);
    }

    createSphere(inputs: Inputs.OCCT.SphereDto): TopoDS_Shape {
        return this.och.solidsService.createSphere(inputs);
    }

    createCone(inputs: Inputs.OCCT.ConeDto): TopoDS_Shape {
        return this.och.solidsService.createCone(inputs);
    }

    getSolidSurfaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): number {
        return this.och.solidsService.getSolidSurfaceArea(inputs);
    }

    getSolidVolume(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): number {
        return this.och.solidsService.getSolidVolume(inputs);
    }

    getSolidsVolumes(inputs: Inputs.OCCT.ShapesDto<TopoDS_Solid>): number[] {
        return this.och.solidsService.getSolidsVolumes(inputs);
    }

    getSolidCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): Base.Point3 {
        return this.och.solidsService.getSolidCenterOfMass(inputs);
    }

    getSolidsCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Solid>): Base.Point3[] {
        return this.och.solidsService.getSolidsCentersOfMass(inputs);
    }

    getSolids(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Solid[] {
        return this.och.solidsService.getSolids(inputs);
    }

    filterSolidPoints(inputs: Inputs.OCCT.FilterSolidPointsDto<TopoDS_Solid>): Base.Point3[] {
        return this.och.solidsService.filterSolidPoints(inputs);
    }
}
