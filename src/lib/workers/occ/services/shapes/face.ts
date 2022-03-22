import { OpenCascadeInstance, TopoDS_Face } from 'opencascade.js';
import { OccHelper, typeSpecificityEnum } from '../../occ-helper';
import * as Inputs from '../../../../api/inputs/inputs';

export class OCCTFace {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    createFaceFromWire(inputs: Inputs.OCCT.FaceFromWireDto): any {
        const wire = this.occ.TopoDS.Wire_1(inputs.shape);
        return this.och.bRepBuilderAPIMakeFaceFromWire(wire, inputs.planar);
    }

    faceFromSurface(inputs: Inputs.OCCT.ShapeWithToleranceDto) {
        const face = this.och.bRepBuilderAPIMakeFaceFromSurface(inputs.shape, inputs.tolerance) as TopoDS_Face;
        if (face.IsNull()) {
            throw new Error('Could not construct a face from the surface. Check if surface is not infinite.');
        } else {
            return face;
        }
    }

    faceFromSurfaceAndWire(inputs: Inputs.OCCT.FaceFromSurfaceAndWireDto) {
        const face = this.och.bRepBuilderAPIMakeFaceFromSurfaceAndWire(inputs.shapes[0], inputs.shapes[1], inputs.inside) as TopoDS_Face;
        if (face.IsNull()) {
            throw new Error('Could not construct a face from the surface. Check if surface is not infinite.');
        } else {
            return face;
        }
    }

    createPolygonFace(inputs: Inputs.OCCT.PolygonDto): any {
        return this.och.bRepBuilderAPIMakeFaceFromWire(this.och.createPolygonWire(inputs), false);
    }

    createCircleFace(inputs: Inputs.OCCT.CircleDto): any {
        return this.och.createCircle(inputs.radius, inputs.center, inputs.direction, typeSpecificityEnum.face);
    }

    createEllipseFace(inputs: Inputs.OCCT.EllipseDto) {
        return this.och.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, typeSpecificityEnum.face)
    }

    getFace(inputs: Inputs.OCCT.ShapeIndexDto): any {
        if (!inputs.shape || inputs.shape.ShapeType() > this.occ.TopAbs_ShapeEnum.TopAbs_SHELL || inputs.shape.IsNull()) {
            throw (new Error('Shape is not provided or is of incorrect type'));
        }
        if (!inputs.index) { inputs.index = 0; }
        let innerFace = {}; let facesFound = 0;
        this.och.forEachFace(inputs.shape, (i, s) => {
            if (i === inputs.index) { innerFace = this.occ.TopoDS.Face_1(s); } facesFound++;
        });
        return innerFace;
    }

    getFaces(inputs: Inputs.OCCT.ShapeDto) {
        const faces = [];
        this.och.forEachFace(inputs.shape, (faceIndex, myFace) => {
            faces.push(myFace);
        });
        return faces;
    }

    reversedFace(inputs: Inputs.OCCT.ShapeDto): any {
        const face = inputs.shape as TopoDS_Face;
        return face.Reversed();
    }

}
