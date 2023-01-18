import { GeomAbs_Shape, Geom_Surface, OpenCascadeInstance, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from 'opencascade.js';
import { OccHelper, typeSpecificityEnum } from '../../occ-helper';
import * as Inputs from '../../../../api/inputs/inputs';
import { Base } from '../../../../api/inputs/inputs';

export class OCCTFace {

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
    }

    createFaceFromWire(inputs: Inputs.OCCT.FaceFromWireDto<TopoDS_Wire>): TopoDS_Face {
        let result;
        if (inputs.planar) {
            const wire = this.occ.TopoDS.Wire_1(inputs.shape);
            result = this.och.bRepBuilderAPIMakeFaceFromWire(wire, inputs.planar);
        } else {
            const Degree = 3;
            const NbPtsOnCur = 15;
            const NbIter = 2;
            const Anisotropie = false;
            const Tol2d = 0.00001;
            const Tol3d = 0.0001;
            const TolAng = 0.01;
            const TolCurv = 0.1;
            const MaxDeg = 8;
            const MaxSegments = 9;
            // )		

            const bs = new this.occ.BRepFill_Filling(Degree, NbPtsOnCur, NbIter, Anisotropie, Tol2d, Tol3d, TolAng, TolCurv, MaxDeg, MaxSegments);
            const edges = this.och.getEdges(inputs);
            edges.forEach(e => {
                bs.Add_1(e, this.occ.GeomAbs_Shape.GeomAbs_C0 as GeomAbs_Shape, true);
            });
            bs.Build();
            if (!bs.IsDone()) {
                throw new Error('Could not create non planar face');
            }
            result = bs.Face();
        }

        return result;
    }

    createFacesFromWires(inputs: Inputs.OCCT.FacesFromWiresDto<TopoDS_Wire>): TopoDS_Face[] {
        let result = inputs.shapes.map(shape => {
            return this.createFaceFromWire({ shape, planar: inputs.planar })
        })
        return result;
    }

    faceFromSurface(inputs: Inputs.OCCT.ShapeWithToleranceDto<Geom_Surface>) {
        const face = this.och.bRepBuilderAPIMakeFaceFromSurface(inputs.shape, inputs.tolerance) as TopoDS_Face;
        if (face.IsNull()) {
            throw new Error('Could not construct a face from the surface. Check if surface is not infinite.');
        } else {
            return face;
        }
    }

    faceFromSurfaceAndWire(inputs: Inputs.OCCT.FaceFromSurfaceAndWireDto<Geom_Surface | TopoDS_Wire, undefined>) {
        const face = this.och.bRepBuilderAPIMakeFaceFromSurfaceAndWire(inputs.shapes[0] as Geom_Surface, inputs.shapes[1] as TopoDS_Wire, inputs.inside) as TopoDS_Face;
        if (face.IsNull()) {
            throw new Error('Could not construct a face from the surface. Check if surface is not infinite.');
        } else {
            return face;
        }
    }

    getUMinBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): { result: number } {
        const face = inputs.shape;
        const { uMin } = this.och.getUVBounds(face);
        return { result: uMin };
    }

    getUMaxBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): { result: number } {
        const face = inputs.shape;
        const { uMax } = this.och.getUVBounds(face);
        return { result: uMax };
    }

    getVMinBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): { result: number } {
        const face = inputs.shape;
        const { vMin } = this.och.getUVBounds(face);
        return { result: vMin };
    }

    getVMaxBound(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): { result: number } {
        const face = inputs.shape;
        const { vMax } = this.och.getUVBounds(face);
        return { result: vMax };
    }

    subdivideToPoints(inputs: Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>) {
        const face = inputs.shape;
        let handle = this.occ.BRep_Tool.Surface_2(face)
        var surface = handle.get();
        const { uMin, uMax, vMin, vMax } = this.och.getUVBounds(face);
        const points = [];

        const uStartRemoval = inputs.removeStartEdgeU ? 1 : 0;
        const uEndRemoval = inputs.removeEndEdgeU ? 1 : 0;

        const vStartRemoval = inputs.removeStartEdgeV ? 1 : 0;
        const vEndRemoval = inputs.removeEndEdgeV ? 1 : 0;

        for (var i = 0 + uStartRemoval; i < inputs.nrDivisionsU - uEndRemoval; i++) {
            const stepU = (uMax - uMin) / (inputs.nrDivisionsU - 1);
            const halfStepU = stepU / 2;
            const stepsU = stepU * i;
            var u = uMin + (inputs.shiftHalfStepU ? halfStepU : 0) + stepsU;
            for (var j = 0 + vStartRemoval; j < inputs.nrDivisionsV - vEndRemoval; j++) {
                const stepV = (vMax - vMin) / (inputs.nrDivisionsV - 1);
                const halfStepV = stepV / 2;
                const stepsV = stepV * j;
                var v = vMin + (inputs.shiftHalfStepV ? halfStepV : 0) + stepsV;
                const gpPnt = this.och.gpPnt([0, 0, 0]);
                surface.D0(u, v, gpPnt);
                points.push([parseFloat(gpPnt.X().toString()), parseFloat(gpPnt.Y().toString()), parseFloat(gpPnt.Z().toString())]);
            }
        }
        return { result: points };
    }

    subdivideToNormals(inputs: Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>) {
        const face = inputs.shape;
        let handle = this.occ.BRep_Tool.Surface_2(face)
        const { uMin, uMax, vMin, vMax } = this.och.getUVBounds(face);
        const points = [];

        const uStartRemoval = inputs.removeStartEdgeU ? 1 : 0;
        const uEndRemoval = inputs.removeEndEdgeU ? 1 : 0;

        const vStartRemoval = inputs.removeStartEdgeV ? 1 : 0;
        const vEndRemoval = inputs.removeEndEdgeV ? 1 : 0;

        for (var i = 0 + uStartRemoval; i < inputs.nrDivisionsU - uEndRemoval; i++) {
            const stepU = (uMax - uMin) / (inputs.nrDivisionsU - 1);
            const halfStepU = stepU / 2;
            const stepsU = stepU * i;
            var u = uMin + (inputs.shiftHalfStepU ? halfStepU : 0) + stepsU;
            for (var j = 0 + vStartRemoval; j < inputs.nrDivisionsV - vEndRemoval; j++) {
                const stepV = (vMax - vMin) / (inputs.nrDivisionsV - 1);
                const halfStepV = stepV / 2;
                const stepsV = stepV * j;
                var v = vMin + (inputs.shiftHalfStepV ? halfStepV : 0) + stepsV;
                const gpDir = this.och.gpDir([0, 1, 0]);
                this.occ.GeomLib.NormEstim(handle, this.och.gpPnt2d([u, v]), 1e-7, gpDir);
                points.push([parseFloat(gpDir.X().toString()), parseFloat(gpDir.Y().toString()), parseFloat(gpDir.Z().toString())]);
            }
        }
        return { result: points };
    }

    subdivideToPointsOnParam(inputs: Inputs.OCCT.FaceLinearSubdivisionDto<TopoDS_Face>) {
        const face = inputs.shape;
        let handle = this.occ.BRep_Tool.Surface_2(face)
        var surface = handle.get();
        const { uMin, uMax, vMin, vMax } = this.och.getUVBounds(face);
        const points = [];
        const removeStart = inputs.removeStartPoint ? 1 : 0;
        const removeEnd = inputs.removeEndPoint ? 1 : 0;

        let param = inputs.param;
        if (inputs.isU) {
            param = uMin + (uMax - uMin) * param;
        } else {
            param = vMin + (vMax - vMin) * param;
        }
        for (var j = 0 + removeStart; j < inputs.nrPoints - removeEnd; j++) {
            let p;
            if (inputs.isU) {
                const stepV = (vMax - vMin) / (inputs.nrPoints - 1);
                const halfStepV = stepV / 2;
                const stepsV = stepV * j;
                p = vMin + (inputs.shiftHalfStep ? halfStepV : 0) + stepsV;
            } else {
                const stepU = (uMax - uMin) / (inputs.nrPoints - 1);
                const halfStepU = stepU / 2;
                const stepsU = stepU * j;
                p = uMin + (inputs.shiftHalfStep ? halfStepU : 0) + stepsU;
            }
            const gpPnt = this.och.gpPnt([0, 0, 0]);
            if (inputs.isU) {
                surface.D0(param, p, gpPnt);
            } else {
                surface.D0(p, param, gpPnt);
            }
            points.push([parseFloat(gpPnt.X().toString()), parseFloat(gpPnt.Y().toString()), parseFloat(gpPnt.Z().toString())]);
        }
        return { result: points };
    }

    subdivideToUVOnParam(inputs: Inputs.OCCT.FaceLinearSubdivisionDto<TopoDS_Face>) {
        const face = inputs.shape;
        const { uMin, uMax, vMin, vMax } = this.och.getUVBounds(face);
        const uvs = [];
        const removeStart = inputs.removeStartPoint ? 1 : 0;
        const removeEnd = inputs.removeEndPoint ? 1 : 0;

        let param = inputs.param;
        if (inputs.isU) {
            param = uMin + (uMax - uMin) * param;
        } else {
            param = vMin + (vMax - vMin) * param;
        }
        for (var j = 0 + removeStart; j < inputs.nrPoints - removeEnd; j++) {
            let p;
            if (inputs.isU) {
                const stepV = (vMax - vMin) / (inputs.nrPoints - 1);
                const halfStepV = stepV / 2;
                const stepsV = stepV * j;
                p = vMin + (inputs.shiftHalfStep ? halfStepV : 0) + stepsV;
            } else {
                const stepU = (uMax - uMin) / (inputs.nrPoints - 1);
                const halfStepU = stepU / 2;
                const stepsU = stepU * j;
                p = uMin + (inputs.shiftHalfStep ? halfStepU : 0) + stepsU;
            }
            let uv;
            if (inputs.isU) {
                uv = [param, p];
            } else {
                uv = [p, param];
            }
            uvs.push(uv);
        }
        return { result: uvs };
    }

    subdivideToUV(inputs: Inputs.OCCT.FaceSubdivisionDto<TopoDS_Face>) {
        const face = inputs.shape;
        const { uMin, uMax, vMin, vMax } = this.och.getUVBounds(face);

        const uvs = [];

        const uStartRemoval = inputs.removeStartEdgeU ? 1 : 0;
        const uEndRemoval = inputs.removeEndEdgeU ? 1 : 0;

        const vStartRemoval = inputs.removeStartEdgeV ? 1 : 0;
        const vEndRemoval = inputs.removeEndEdgeV ? 1 : 0;

        for (var i = 0 + uStartRemoval; i < inputs.nrDivisionsU - uEndRemoval; i++) {
            const stepU = (uMax - uMin) / (inputs.nrDivisionsU - 1);
            const halfStepU = stepU / 2;
            const stepsU = stepU * i;
            var u = uMin + (inputs.shiftHalfStepU ? halfStepU : 0) + stepsU;
            for (var j = 0 + vStartRemoval; j < inputs.nrDivisionsV - vEndRemoval; j++) {
                const stepV = (vMax - vMin) / (inputs.nrDivisionsV - 1);
                const halfStepV = stepV / 2;
                const stepsV = stepV * j;
                var v = vMin + (inputs.shiftHalfStepV ? halfStepV : 0) + stepsV;
                uvs.push([u, v]);
            }
        }
        return { result: uvs };
    }

    uvOnFace(inputs: Inputs.OCCT.DataOnUVDto<TopoDS_Face>) {
        const face = inputs.shape;
        const { uMin, uMax, vMin, vMax } = this.och.getUVBounds(face);
        var u = uMin + (uMax - uMin) * inputs.paramU;
        var v = vMin + (vMax - vMin) * inputs.paramV;
        return { result: [u, v] };
    }

    pointsOnUVs(inputs: Inputs.OCCT.DataOnUVsDto<TopoDS_Face>) {
        const face = inputs.shape;
        let handle = this.occ.BRep_Tool.Surface_2(face)
        var surface = handle.get();
        const { uMin, uMax, vMin, vMax } = this.och.getUVBounds(face);
        const pts = inputs.paramsUV.map(uv => {
            var u = uMin + (uMax - uMin) * uv[0];
            var v = vMin + (vMax - vMin) * uv[1];
            const gpPnt = this.och.gpPnt([0, 0, 0]);
            surface.D0(u, v, gpPnt);
            return [parseFloat(gpPnt.X().toString()), parseFloat(gpPnt.Y().toString()), parseFloat(gpPnt.Z().toString())];
        })
        return { result: pts };
    }

    normalsOnUVs(inputs: Inputs.OCCT.DataOnUVsDto<TopoDS_Face>): { result: Base.Vector3[] } {
        const face = inputs.shape;
        let handle = this.occ.BRep_Tool.Surface_2(face)
        const { uMin, uMax, vMin, vMax } = this.och.getUVBounds(face);
        const pts = inputs.paramsUV.map(uv => {
            var u = uMin + (uMax - uMin) * uv[0];
            var v = vMin + (vMax - vMin) * uv[1];
            const gpDir = this.och.gpDir([0, 1, 0]);
            this.occ.GeomLib.NormEstim(handle, this.och.gpPnt2d([u, v]), 1e-7, gpDir);
            return [parseFloat(gpDir.X().toString()), parseFloat(gpDir.Y().toString()), parseFloat(gpDir.Z().toString())] as Base.Vector3;
        })
        return { result: pts };
    }

    pointOnUV(inputs: Inputs.OCCT.DataOnUVDto<TopoDS_Face>) {
        const face = inputs.shape;
        let handle = this.occ.BRep_Tool.Surface_2(face)
        var surface = handle.get();
        const { uMin, uMax, vMin, vMax } = this.och.getUVBounds(face);
        var u = uMin + (uMax - uMin) * inputs.paramU;
        var v = vMin + (vMax - vMin) * inputs.paramV;
        const gpPnt = this.och.gpPnt([0, 0, 0]);
        surface.D0(u, v, gpPnt);
        return { result: [parseFloat(gpPnt.X().toString()), parseFloat(gpPnt.Y().toString()), parseFloat(gpPnt.Z().toString())] };
    }

    normalOnUV(inputs: Inputs.OCCT.DataOnUVDto<TopoDS_Face>) {
        const face = inputs.shape;
        let handle = this.occ.BRep_Tool.Surface_2(face)
        const { uMin, uMax, vMin, vMax } = this.och.getUVBounds(face);
        var u = uMin + (uMax - uMin) * inputs.paramU;
        var v = vMin + (vMax - vMin) * inputs.paramV;
        const gpDir = this.och.gpDir([0, 1, 0]);
        this.occ.GeomLib.NormEstim(handle, this.och.gpPnt2d([u, v]), 1e-7, gpDir);
        return { result: [parseFloat(gpDir.X().toString()), parseFloat(gpDir.Y().toString()), parseFloat(gpDir.Z().toString())] };
    }

    createPolygonFace(inputs: Inputs.OCCT.PolygonDto) {
        return this.och.bRepBuilderAPIMakeFaceFromWire(this.och.createPolygonWire(inputs), false);
    }

    createCircleFace(inputs: Inputs.OCCT.CircleDto): TopoDS_Face {
        return this.och.createCircle(inputs.radius, inputs.center, inputs.direction, typeSpecificityEnum.face) as TopoDS_Face;
    }

    createEllipseFace(inputs: Inputs.OCCT.EllipseDto): TopoDS_Face {
        return this.och.createEllipse(inputs.radiusMinor, inputs.radiusMajor, inputs.center, inputs.direction, typeSpecificityEnum.face) as TopoDS_Face
    }

    createSquareFace(inputs: Inputs.OCCT.SquareDto): TopoDS_Face {
        return this.och.createSquareFace(inputs);
    }

    createRectangleFace(inputs: Inputs.OCCT.RectangleDto): TopoDS_Face {
        return this.och.createRectangleFace(inputs);
    }

    getFace(inputs: Inputs.OCCT.ShapeIndexDto<TopoDS_Shape>): TopoDS_Face {
        if (!inputs.shape || inputs.shape.ShapeType() > this.occ.TopAbs_ShapeEnum.TopAbs_SHELL || inputs.shape.IsNull()) {
            throw (new Error('Shape is not provided or is of incorrect type'));
        }
        if (!inputs.index) { inputs.index = 0; }
        let innerFace = {}; let facesFound = 0;
        this.och.forEachFace(inputs.shape, (i, s) => {
            if (i === inputs.index) { innerFace = this.occ.TopoDS.Face_1(s); } facesFound++;
        });
        return innerFace as TopoDS_Face;
    }

    getFaces(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Face[] {
        return this.och.getFaces(inputs);
    }

    reversedFace(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): TopoDS_Face {
        const face = inputs.shape as TopoDS_Face;
        return this.och.getActualTypeOfShape(face.Reversed());
    }

    getFaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): { result: number } {
        return { result: this.och.getFaceArea(inputs) };
    }

    getFacesAreas(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): { result: number[] } {
        return { result: this.och.getFacesAreas(inputs) };
    }

    getFaceCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Face>): { result: Base.Point3 } {
        return { result: this.och.getFaceCenterOfMass(inputs) };
    }

    getFacesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Face>): { result: Base.Point3[] } {
        return { result: this.och.getFacesCentersOfMass(inputs) };
    }
}
