import { OccHelper } from '../../occ-helper';
import { OpenCascadeInstance } from 'opencascade.js';
import * as Inputs from '../../../../api/inputs/inputs';

export class OCCTSolid {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    createBox(inputs: Inputs.OCCT.BoxDto): any {
        return this.och.bRepPrimAPIMakeBox(inputs.width, inputs.length, inputs.height, inputs.center);
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
}
