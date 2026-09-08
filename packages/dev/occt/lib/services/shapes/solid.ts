import { OccHelper } from "../../occ-helper";
import { BitbybitOcctModule, TopoDS_Shape, TopoDS_Shell, TopoDS_Solid } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import { Base } from "../../api/inputs";
import * as Models from "../../api/models";

export class OCCTSolid {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Returns debug info about the solid: face/edge counts, surface area, volume and per-face surface
     * debug info (type, U/V degree, poles/knots, bounds, area, ...).
     * @param inputs solid
     * @returns Solid debug info
     * @group debug
     * @shortname solid debug info
     * @drawable false
     */
    debugInfo(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): Models.OCCT.SolidDebugInfo {
        if (!inputs.shape || inputs.shape.IsNull()) {
            return { valid: false, nbFaces: 0, nbEdges: 0, area: 0, volume: 0, faces: [] };
        }
        const faces = this.och.shapeGettersService.getFaces({ shape: inputs.shape });
        const faceInfos = faces.map((f) => JSON.parse(this.occ.FaceDebugInfoJson(f)) as Models.OCCT.FaceDebugInfo);
        const edges = this.och.shapeGettersService.getEdges({ shape: inputs.shape });
        const area = faceInfos.reduce((sum, f) => sum + (f.area ?? 0), 0);
        const volume = this.och.solidsService.getSolidVolume({ shape: inputs.shape });
        return { valid: true, nbFaces: faces.length, nbEdges: edges.length, area, volume, faces: faceInfos };
    }

    /**
     * Creates Solid From shell that must be closed
     * @param inputs Closed shell to make into solid
     * @returns OpenCascade Solid
     * @group from
     * @shortname solid from closed shell
     * @drawable true
     */
    fromClosedShell(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shell>): TopoDS_Solid {
        return this.och.solidsService.fromClosedShell(inputs);
    }

    /**
     * Creates OpenCascade Box
     * @param inputs Box size and center
     * @returns OpenCascade Box
     * @group primitives
     * @shortname box
     * @drawable true
     */
    createBox(inputs: Inputs.OCCT.BoxDto): TopoDS_Solid {
        return this.och.solidsService.createBox(inputs);
    }

    /**
     * Creates OpenCascade Cube
     * @param inputs Cube size and center
     * @returns OpenCascade Cube
     * @group primitives
     * @shortname cube
     * @drawable true
     */
    createCube(inputs: Inputs.OCCT.CubeDto): TopoDS_Solid {
        return this.och.solidsService.createCube(inputs);
    }

    /**
     * Creates OpenCascade Box from corner
     * @param inputs Box size and corner coordinates
     * @returns OpenCascade Box
     * @group primitives
     * @shortname box corner
     * @drawable true
     */
    createBoxFromCorner(inputs: Inputs.OCCT.BoxFromCornerDto): TopoDS_Solid {
        return this.och.solidsService.createBoxFromCorner(inputs);
    }

    /**
     * Creates OpenCascade Cylinder
     * @param inputs Cylinder parameters
     * @returns OpenCascade Cylinder
     * @group primitives
     * @shortname cylinder
     * @drawable true
     */
    createCylinder(inputs: Inputs.OCCT.CylinderDto): TopoDS_Solid {
        return this.och.solidsService.createCylinder(inputs);
    }

    /**
     * Creates OpenCascade Cylinders on simple bit by bit lines represented by two points
     * @param inputs Cylinder parameters
     * @returns OpenCascade Cylinder
     * @group primitives
     * @shortname cylinders on lines
     * @drawable true
     */
    createCylindersOnLines(inputs: Inputs.OCCT.CylindersOnLinesDto): TopoDS_Solid[] {
        return this.och.solidsService.createCylindersOnLines(inputs);
    }

    /**
     * Creates OpenCascade Sphere
     * @param inputs Sphere radius and center
     * @returns OpenCascade Sphere
     * @group primitives
     * @shortname sphere
     * @drawable true
     */
    createSphere(inputs: Inputs.OCCT.SphereDto): TopoDS_Solid {
        return this.och.solidsService.createSphere(inputs);
    }

    /**
     * Creates OpenCascade Cone
     * @param inputs Cone parameters
     * @returns OpenCascade cone shape
     * @group primitives
     * @shortname cone
     * @drawable true
     */
    createCone(inputs: Inputs.OCCT.ConeDto): TopoDS_Solid {
        return this.och.solidsService.createCone(inputs);
    }

    /**
     * Creates OpenCascade Torus
     * @param inputs Torus parameters
     * @returns OpenCascade torus shape
     * @group primitives
     * @shortname torus
     * @drawable true
     */
    createTorus(inputs: Inputs.OCCT.TorusDto): TopoDS_Solid {
        return this.och.solidsService.createTorus(inputs);
    }

    /**
     * Creates OpenCascade star solid
     * @param inputs Star solid parameters
     * @returns OpenCascade star solid
     * @group primitives
     * @shortname star
     * @drawable true
     */
    createStarSolid(inputs: Inputs.OCCT.StarSolidDto): TopoDS_Solid {
        const wire = this.och.wiresService.createStarWire(inputs);
        const face = this.och.facesService.createFaceFromWire({ shape: wire, planar: true });
        return this.extrudeFaceToSolid(face, inputs.extrusionLengthFront, inputs.extrusionLengthBack);
    }

    /**
     * Creates OpenCascade n-gon solid
     * @param inputs N-gon solid parameters
     * @returns OpenCascade n-gon solid
     * @group primitives
     * @shortname n-gon
     * @drawable true
     */
    createNGonSolid(inputs: Inputs.OCCT.NGonSolidDto): TopoDS_Solid {
        const wire = this.och.wiresService.createNGonWire(inputs);
        const face = this.och.facesService.createFaceFromWire({ shape: wire, planar: true });
        return this.extrudeFaceToSolid(face, inputs.extrusionLengthFront, inputs.extrusionLengthBack);
    }

    /**
     * Creates OpenCascade parallelogram solid
     * @param inputs Parallelogram solid parameters
     * @returns OpenCascade parallelogram solid
     * @group primitives
     * @shortname parallelogram
     * @drawable true
     */
    createParallelogramSolid(inputs: Inputs.OCCT.ParallelogramSolidDto): TopoDS_Solid {
        const wire = this.och.wiresService.createParallelogramWire(inputs);
        const face = this.och.facesService.createFaceFromWire({ shape: wire, planar: true });
        return this.extrudeFaceToSolid(face, inputs.extrusionLengthFront, inputs.extrusionLengthBack);
    }

    /**
     * Creates OpenCascade heart solid
     * @param inputs Heart solid parameters
     * @returns OpenCascade heart solid
     * @group primitives
     * @shortname heart
     * @drawable true
     */
    createHeartSolid(inputs: Inputs.OCCT.HeartSolidDto): TopoDS_Solid {
        const wire = this.och.wiresService.createHeartWire(inputs);
        const face = this.och.facesService.createFaceFromWire({ shape: wire, planar: true });
        return this.extrudeFaceToSolid(face, inputs.extrusionLengthFront, inputs.extrusionLengthBack);
    }

    /**
     * Creates OpenCascade christmas tree solid
     * @param inputs Christmas tree solid parameters
     * @returns OpenCascade christmas tree solid
     * @group primitives
     * @shortname christmas tree
     * @drawable true
     */
    createChristmasTreeSolid(inputs: Inputs.OCCT.ChristmasTreeSolidDto): TopoDS_Solid {
        const wire = this.och.wiresService.createChristmasTreeWire(inputs);
        const face = this.och.facesService.createFaceFromWire({ shape: wire, planar: true });
        return this.extrudeFaceToSolid(face, inputs.extrusionLengthFront, inputs.extrusionLengthBack);
    }

    /**
     * Creates OpenCascade L-polygon solid
     * @param inputs L-polygon solid parameters
     * @returns OpenCascade L-polygon solid
     * @group primitives
     * @shortname L-polygon
     * @drawable true
     */
    createLPolygonSolid(inputs: Inputs.OCCT.LPolygonSolidDto): TopoDS_Solid {
        const wire = this.och.wiresService.createLPolygonWire(inputs);
        const face = this.och.facesService.createFaceFromWire({ shape: wire, planar: true });
        return this.extrudeFaceToSolid(face, inputs.extrusionLengthFront, inputs.extrusionLengthBack);
    }

    /**
     * Creates OpenCascade I-beam profile solid
     * @param inputs I-beam profile solid parameters
     * @returns OpenCascade I-beam profile solid
     * @group beam
     * @shortname I-beam profile
     * @drawable true
     */
    createIBeamProfileSolid(inputs: Inputs.OCCT.IBeamProfileSolidDto): TopoDS_Solid {
        const wire = this.och.wiresService.createIBeamProfileWire(inputs);
        const face = this.och.facesService.createFaceFromWire({ shape: wire, planar: true });
        return this.extrudeFaceToSolid(face, inputs.extrusionLengthFront, inputs.extrusionLengthBack);
    }

    /**
     * Creates OpenCascade H-beam profile solid
     * @param inputs H-beam profile solid parameters
     * @returns OpenCascade H-beam profile solid
     * @group beam
     * @shortname H-beam profile
     * @drawable true
     */
    createHBeamProfileSolid(inputs: Inputs.OCCT.HBeamProfileSolidDto): TopoDS_Solid {
        const wire = this.och.wiresService.createHBeamProfileWire(inputs);
        const face = this.och.facesService.createFaceFromWire({ shape: wire, planar: true });
        return this.extrudeFaceToSolid(face, inputs.extrusionLengthFront, inputs.extrusionLengthBack);
    }

    /**
     * Creates OpenCascade T-beam profile solid
     * @param inputs T-beam profile solid parameters
     * @returns OpenCascade T-beam profile solid
     * @group beam
     * @shortname T-beam profile
     * @drawable true
     */
    createTBeamProfileSolid(inputs: Inputs.OCCT.TBeamProfileSolidDto): TopoDS_Solid {
        const wire = this.och.wiresService.createTBeamProfileWire(inputs);
        const face = this.och.facesService.createFaceFromWire({ shape: wire, planar: true });
        return this.extrudeFaceToSolid(face, inputs.extrusionLengthFront, inputs.extrusionLengthBack);
    }

    /**
     * Creates OpenCascade U-beam profile solid
     * @param inputs U-beam profile solid parameters
     * @returns OpenCascade U-beam profile solid
     * @group beam
     * @shortname U-beam profile
     * @drawable true
     */
    createUBeamProfileSolid(inputs: Inputs.OCCT.UBeamProfileSolidDto): TopoDS_Solid {
        const wire = this.och.wiresService.createUBeamProfileWire(inputs);
        const face = this.och.facesService.createFaceFromWire({ shape: wire, planar: true });
        return this.extrudeFaceToSolid(face, inputs.extrusionLengthFront, inputs.extrusionLengthBack);
    }

    private extrudeFaceToSolid(face: TopoDS_Shape, lengthFront: number, lengthBack: number): TopoDS_Solid {
        if (lengthFront === 0 && lengthBack === 0) {
            face.delete();
            throw new Error("Cannot create solid: both extrusionLengthFront and extrusionLengthBack are 0");
        }

        const faceCasted = this.occ.CastToFace(face);
        
        const uMin = this.och.facesService.getUMinBound({ shape: faceCasted });
        const uMax = this.och.facesService.getUMaxBound({ shape: faceCasted });
        const vMin = this.och.facesService.getVMinBound({ shape: faceCasted });
        const vMax = this.och.facesService.getVMaxBound({ shape: faceCasted });
        
        const uMid = (uMin + uMax) / 2;
        const vMid = (vMin + vMax) / 2;
        
        const paramU = (uMid - uMin) / (uMax - uMin);
        const paramV = (vMid - vMin) / (vMax - vMin);
        
        const normalizedDir = this.och.facesService.normalOnUV({ 
            shape: faceCasted, 
            paramU, 
            paramV 
        });

        let result: TopoDS_Shape | undefined;

        if (lengthFront > 0) {
            const frontVec = new this.occ.gp_Vec(
                normalizedDir[0] * lengthFront,
                normalizedDir[1] * lengthFront,
                normalizedDir[2] * lengthFront
            );
            const frontPrism = new this.occ.BRepPrimAPI_MakePrism(face, frontVec);
            result = frontPrism.Shape();
            frontPrism.delete();
            frontVec.delete();
        }

        if (lengthBack > 0) {
            const backVec = new this.occ.gp_Vec(
                -normalizedDir[0] * lengthBack,
                -normalizedDir[1] * lengthBack,
                -normalizedDir[2] * lengthBack
            );
            const backPrism = new this.occ.BRepPrimAPI_MakePrism(face, backVec);
            const backShape = backPrism.Shape();
            backPrism.delete();
            backVec.delete();

            if (result) {
                const fused = this.och.booleansService.union({ shapes: [result, backShape], keepEdges: false });
                result.delete();
                backShape.delete();
                result = fused;
            } else {
                result = backShape;
            }
        }

        face.delete();
        if (!result) {
            throw new Error("Cannot create solid: extrusion lengths must be positive");
        }
        return this.och.converterService.getActualTypeOfShape(result);
    }

    /**
     * Get solid surface area
     * @param inputs Closed solid shape
     * @returns Surface area
     * @group get
     * @shortname area
     * @drawable false
     */
    getSolidSurfaceArea(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): number {
        return this.och.solidsService.getSolidSurfaceArea(inputs);
    }

    /**
     * Get solid volume
     * @param inputs Closed solid shape
     * @returns volume
     * @group get
     * @shortname volume
     * @drawable false
     */
    getSolidVolume(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): number {
        return this.och.solidsService.getSolidVolume(inputs);
    }

    /**
     * Get solids volumes
     * @param inputs Closed solid shapes
     * @returns volumes
     * @group get
     * @shortname volumes
     * @drawable false
     */
    getSolidsVolumes(inputs: Inputs.OCCT.ShapesDto<TopoDS_Solid>): number[] {
        return this.och.solidsService.getSolidsVolumes(inputs);
    }

    /**
     * Get solid center of mass
     * @param inputs Closed solid shape
     * @returns center of mass point
     * @group get
     * @shortname center of mass
     * @drawable true
     */
    getSolidCenterOfMass(inputs: Inputs.OCCT.ShapeDto<TopoDS_Solid>): Base.Point3 {
        return this.och.solidsService.getSolidCenterOfMass(inputs);
    }

    /**
     * Get centers of mass of solids
     * @param inputs Closed solid shapes
     * @returns Points indicating centers of mass
     * @group get
     * @shortname centers of mass
     * @drawable true
     */
    getSolidsCentersOfMass(inputs: Inputs.OCCT.ShapesDto<TopoDS_Solid>): Base.Point3[] {
        return this.och.solidsService.getSolidsCentersOfMass(inputs);
    }

    /**
     * Gets the solids of the shape in a list
     * @param inputs Shape
     * @returns OpenCascade solids array
     * @group get
     * @shortname solids
     * @drawable true
     */
    getSolids(inputs: Inputs.OCCT.ShapeDto<TopoDS_Shape>): TopoDS_Solid[] {
        return this.och.solidsService.getSolids(inputs);
    }

    /**
     * Filters collection of points based on relationship with the solid. You can choose whether to output in, on or out points.
     * @param inputs OpenCascade solid and collection of points with options
     * @returns filtered points
     * @group filter
     * @shortname filter solid points
     * @drawable true
     */
    filterSolidPoints(inputs: Inputs.OCCT.FilterSolidPointsDto<TopoDS_Solid>): Base.Point3[] {
        return this.och.solidsService.filterSolidPoints(inputs);
    }
}
