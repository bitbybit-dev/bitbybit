import { OccHelper } from '../../occ-helper';
import { OpenCascadeInstance, TopoDS_Shell, TopoDS_Solid } from '../../../../../bitbybit-dev-occt/bitbybit-dev-occt';
import * as Inputs from '../../../../api/inputs/inputs';
import { Base } from '../../../../api/inputs/inputs';

export class OCCTSolid {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    fromClosedShell(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): TopoDS_Solid {
        const shell = this.och.getActualTypeOfShape(inputs.shape);
        const builder = new this.occ.BRepBuilderAPI_MakeSolid_3(shell);
        return builder.Solid();
    }

    createBox(inputs: Inputs.OCCT.BoxDto): any {
        return this.och.bRepPrimAPIMakeBox(inputs.width, inputs.length, inputs.height, inputs.center);
    }

    createBoxFromCorner(inputs: Inputs.OCCT.BoxFromCornerDto): any {
        const box = this.och.bRepPrimAPIMakeBox(inputs.width, inputs.length, inputs.height, inputs.corner);
        const cornerBox = this.och.translate({ shape: box, translation: [inputs.width / 2, inputs.height / 2, inputs.length / 2] });
        return cornerBox;
    }

    createCylinder(inputs: Inputs.OCCT.CylinderDto): any {
        return this.och.bRepPrimAPIMakeCylinder(
            inputs.center,
            inputs.direction ? inputs.direction : [0., 1., 0.],
            inputs.radius,
            inputs.height
        );
    }

    createCylindersOnLines(inputs: Inputs.OCCT.CylindersOnLinesDto): any {
        const cylinders = inputs.lines.map(line => {
            return this.och.bRepPrimAPIMakeCylinderBetweenPoints(
                line.start,
                line.end,
                inputs.radius,
            );
        })
        return cylinders;
    }

    createSphere(inputs: Inputs.OCCT.SphereDto): any {
        return this.och.bRepPrimAPIMakeSphere(inputs.center, [0., 0., 1.], inputs.radius);
    }

    createCone(inputs: Inputs.OCCT.ConeDto): any {
        const ax = this.och.gpAx2(inputs.center, inputs.direction);
        return new this.occ.BRepPrimAPI_MakeCone_4(ax, inputs.radius1, inputs.radius2, inputs.height, inputs.angle).Shape();
    }

    getSolidSurfaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): { result: number } {
        return { result: this.och.getSolidSurfaceArea(inputs) };
    }

    getSolidVolume(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): { result: number } {
        return { result: this.och.getSolidVolume(inputs) };
    }

    getSolidsVolumes(inputs: Inputs.OCCT.ShapesDto<TopoDS_Solid>): { result: number[] } {
        return { result: this.och.getSolidsVolumes(inputs) };
    }

    getSolidCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): { result: Base.Point3 } {
        return { result: this.och.getSolidCenterOfMass(inputs) };
    }

    getSolidsCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Solid>): { result: Base.Point3[] } {
        return { result: this.och.getSolidsCentersOfMass(inputs) };
    }
}
