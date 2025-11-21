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

    createIBeamProfileSolid(inputs: Inputs.OCCT.IBeamProfileSolidDto): TopoDS_Solid {
        const wire = this.och.wiresService.createIBeamProfileWire(inputs);
        const face = this.och.facesService.createFaceFromWire({ shape: wire, planar: true });
        return this.extrudeFaceToSolid(face, inputs.direction, inputs.extrusionLengthFront, inputs.extrusionLengthBack);
    }

    createHBeamProfileSolid(inputs: Inputs.OCCT.HBeamProfileSolidDto): TopoDS_Solid {
        const wire = this.och.wiresService.createHBeamProfileWire(inputs);
        const face = this.och.facesService.createFaceFromWire({ shape: wire, planar: true });
        return this.extrudeFaceToSolid(face, inputs.direction, inputs.extrusionLengthFront, inputs.extrusionLengthBack);
    }

    createTBeamProfileSolid(inputs: Inputs.OCCT.TBeamProfileSolidDto): TopoDS_Solid {
        const wire = this.och.wiresService.createTBeamProfileWire(inputs);
        const face = this.och.facesService.createFaceFromWire({ shape: wire, planar: true });
        return this.extrudeFaceToSolid(face, inputs.direction, inputs.extrusionLengthFront, inputs.extrusionLengthBack);
    }

    createUBeamProfileSolid(inputs: Inputs.OCCT.UBeamProfileSolidDto): TopoDS_Solid {
        const wire = this.och.wiresService.createUBeamProfileWire(inputs);
        const face = this.och.facesService.createFaceFromWire({ shape: wire, planar: true });
        return this.extrudeFaceToSolid(face, inputs.direction, inputs.extrusionLengthFront, inputs.extrusionLengthBack);
    }

    createStarSolid(inputs: Inputs.OCCT.StarSolidDto): TopoDS_Solid {
        const wire = this.och.wiresService.createStarWire(inputs);
        const face = this.och.facesService.createFaceFromWire({ shape: wire, planar: true });
        return this.extrudeFaceToSolid(face, inputs.direction, inputs.extrusionLengthFront, inputs.extrusionLengthBack);
    }

    createNGonSolid(inputs: Inputs.OCCT.NGonSolidDto): TopoDS_Solid {
        const wire = this.och.wiresService.createNGonWire(inputs);
        const face = this.och.facesService.createFaceFromWire({ shape: wire, planar: true });
        return this.extrudeFaceToSolid(face, inputs.direction, inputs.extrusionLengthFront, inputs.extrusionLengthBack);
    }

    createParallelogramSolid(inputs: Inputs.OCCT.ParallelogramSolidDto): TopoDS_Solid {
        const wire = this.och.wiresService.createParallelogramWire(inputs);
        const face = this.och.facesService.createFaceFromWire({ shape: wire, planar: true });
        return this.extrudeFaceToSolid(face, inputs.direction, inputs.extrusionLengthFront, inputs.extrusionLengthBack);
    }

    createHeartSolid(inputs: Inputs.OCCT.HeartSolidDto): TopoDS_Solid {
        const wire = this.och.wiresService.createHeartWire(inputs);
        const face = this.och.facesService.createFaceFromWire({ shape: wire, planar: true });
        return this.extrudeFaceToSolid(face, inputs.direction, inputs.extrusionLengthFront, inputs.extrusionLengthBack);
    }

    createChristmasTreeSolid(inputs: Inputs.OCCT.ChristmasTreeSolidDto): TopoDS_Solid {
        const wire = this.och.wiresService.createChristmasTreeWire(inputs);
        const face = this.och.facesService.createFaceFromWire({ shape: wire, planar: true });
        return this.extrudeFaceToSolid(face, inputs.direction, inputs.extrusionLengthFront, inputs.extrusionLengthBack);
    }

    createLPolygonSolid(inputs: Inputs.OCCT.LPolygonSolidDto): TopoDS_Solid {
        const wire = this.och.wiresService.createLPolygonWire(inputs);
        const face = this.och.facesService.createFaceFromWire({ shape: wire, planar: true });
        return this.extrudeFaceToSolid(face, inputs.direction, inputs.extrusionLengthFront, inputs.extrusionLengthBack);
    }

    private extrudeFaceToSolid(face: TopoDS_Shape, direction: Base.Vector3, lengthFront: number, lengthBack: number): TopoDS_Solid {
        // Check if both lengths are 0
        if (lengthFront === 0 && lengthBack === 0) {
            face.delete();
            throw new Error("Cannot create solid: both extrusionLengthFront and extrusionLengthBack are 0");
        }

        // Get the face normal to determine actual extrusion direction
        const faceCasted = this.occ.TopoDS.Face_1(face);
        
        // Use face service methods to get UV bounds and normal at center
        const uMin = this.och.facesService.getUMinBound({ shape: faceCasted });
        const uMax = this.och.facesService.getUMaxBound({ shape: faceCasted });
        const vMin = this.och.facesService.getVMinBound({ shape: faceCasted });
        const vMax = this.och.facesService.getVMaxBound({ shape: faceCasted });
        
        const uMid = (uMin + uMax) / 2;
        const vMid = (vMin + vMax) / 2;
        
        // Normalize to 0-1 range for normalOnUV method
        const paramU = (uMid - uMin) / (uMax - uMin);
        const paramV = (vMid - vMin) / (vMax - vMin);
        
        // Get face normal at the center using face service
        const normalizedDir = this.och.facesService.normalOnUV({ 
            shape: faceCasted, 
            paramU, 
            paramV 
        });

        let result: TopoDS_Shape;

        // Create forward extrusion if lengthFront > 0
        if (lengthFront > 0) {
            const frontVec = new this.occ.gp_Vec_4(
                normalizedDir[0] * lengthFront,
                normalizedDir[1] * lengthFront,
                normalizedDir[2] * lengthFront
            );
            const frontPrism = new this.occ.BRepPrimAPI_MakePrism_1(face, frontVec, false, true);
            result = frontPrism.Shape();
            frontPrism.delete();
            frontVec.delete();
        }

        // If there's backward extrusion, add it
        if (lengthBack > 0) {
            const backVec = new this.occ.gp_Vec_4(
                -normalizedDir[0] * lengthBack,
                -normalizedDir[1] * lengthBack,
                -normalizedDir[2] * lengthBack
            );
            const backPrism = new this.occ.BRepPrimAPI_MakePrism_1(face, backVec, false, true);
            const backShape = backPrism.Shape();
            backPrism.delete();
            backVec.delete();

            // If we have a forward extrusion, fuse them
            if (lengthFront > 0) {
                const fused = this.och.booleansService.union({ shapes: [result, backShape], keepEdges: false });
                result.delete();
                backShape.delete();
                result = fused;
            } else {
                // Only backward extrusion exists
                result = backShape;
            }
        }

        face.delete();
        return this.och.converterService.getActualTypeOfShape(result);
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
