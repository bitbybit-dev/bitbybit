import { OpenCascadeInstance } from 'opencascade.js';
import { OccHelper } from '../occ-helper';
import * as Inputs from '../../../api/inputs/inputs';

export class OCCTTransforms {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    transform(inputs: Inputs.OCCT.TransformDto): any {
        return this.translate(
            {
                translation: inputs.translation,
                shape: this.rotate({
                    axis: inputs.rotationAxis,
                    angle: inputs.rotationAngle,
                    shape: this.scale({
                        factor: inputs.scaleFactor,
                        shape: inputs.shape,
                    })
                })
            }
        );
    }


    rotate(inputs: Inputs.OCCT.RotateDto): any {
        return this.och.rotate(inputs);
    }

 
    translate(inputs: Inputs.OCCT.TranslateDto): any {
        return this.och.translate(inputs);
    }

    scale(inputs: Inputs.OCCT.ScaleDto): any {
        const transformation = new this.occ.gp_Trsf_1();
        const gpPnt = this.och.gpPnt([0, 0, 0]);
        transformation.SetScale(gpPnt, inputs.factor);
        const scaling = new this.occ.TopLoc_Location_2(transformation);
        return this.och.getActualTypeOfShape(inputs.shape.Moved(scaling));
    }

    mirror(inputs: Inputs.OCCT.MirrorDto): any {
        const transformation = new this.occ.gp_Trsf_1();
        const ax1 = this.och.gpAx1(inputs.origin, inputs.direction);
        transformation.SetMirror_2(ax1);
        const transformed = new this.occ.BRepBuilderAPI_Transform_2(inputs.shape, transformation, true);
        return this.och.getActualTypeOfShape(transformed.Shape());
    }

}
