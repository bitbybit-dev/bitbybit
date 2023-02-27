export const occtWorkerDeclarations = `declare class BitByBitOCCT {
    occtWorkerManager: OCCTWorkerManager;
    occt: OCCT;
    constructor();
    init(occt: Worker): void;
}class BitByBitOCCT {
    constructor() {
        this.occtWorkerManager = new OCCTWorkerManager();
        this.occt = new OCCT(this.occtWorkerManager);
    }
    init(occt) {
        if (occt) {
            this.occtWorkerManager.setOccWorker(occt);
        }
    }
}declare class OCCTAssembly {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Scans assembly
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_assembly.OCCTAssembly.html#scan
     * @param inputs Shape to scan
     * @returns Data for assembly preview
     */
    scan(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<any>;
}class OCCTAssembly {
    constructor(occWorkerManager) {
        this.occWorkerManager = occWorkerManager;
    }
    /**
     * Scans assembly
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_assembly.OCCTAssembly.html#scan
     * @param inputs Shape to scan
     * @returns Data for assembly preview
     */
    scan(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('assembly.scan', inputs);
    }
}declare class OCCTBooleans {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Joins separate objects
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_booleans.OCCTBooleans.html#union
     * @param inputs Objects to join
     * @returns OpenCascade joined shape
     */
    union(inputs: Inputs.OCCT.UnionDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Does boolean difference operation between a main shape and given shapes
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_booleans.OCCTBooleans.html#difference
     * @param inputs Main shape and shapes to differ
     * @returns OpenCascade difference shape
     */
    difference(inputs: Inputs.OCCT.DifferenceDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Does boolean intersection operation between a main shape and given shapes
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_booleans.OCCTBooleans.html#intersection
     * @param inputs Main shape and shapes to differ
     * @returns OpenCascade intersection of shapes
     */
    intersection(inputs: Inputs.OCCT.IntersectionDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
}class OCCTBooleans {
    constructor(occWorkerManager) {
        this.occWorkerManager = occWorkerManager;
    }
    /**
     * Joins separate objects
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_booleans.OCCTBooleans.html#union
     * @param inputs Objects to join
     * @returns OpenCascade joined shape
     */
    union(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('booleans.union', inputs);
    }
    /**
     * Does boolean difference operation between a main shape and given shapes
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_booleans.OCCTBooleans.html#difference
     * @param inputs Main shape and shapes to differ
     * @returns OpenCascade difference shape
     */
    difference(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('booleans.difference', inputs);
    }
    /**
     * Does boolean intersection operation between a main shape and given shapes
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_booleans.OCCTBooleans.html#intersection
     * @param inputs Main shape and shapes to differ
     * @returns OpenCascade intersection of shapes
     */
    intersection(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('booleans.intersection', inputs);
    }
}declare class OCCTFillets {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
    * Fillets OpenCascade Shapes
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_fillets.OCCTFillets.html#filletEdges
    * @param inputs Shape, radius and edge indexes to fillet
    * @returns OpenCascade shape with filleted edges
    */
    filletEdges(inputs: Inputs.OCCT.FilletDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Chamfer OpenCascade Shape edges
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_fillets.OCCTFillets.html#chamferEdges
     * @param inputs Shape, distance and edge indexes to chamfer
     * @returns OpenCascade shape with chamfered edges
     */
    chamferEdges(inputs: Inputs.OCCT.ChamferDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Fillets 2d wires or faces
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_fillets.OCCTFillets.html#fillet2d
     * @param inputs Shape
     * @returns OpenCascade filleted shape result
     */
    fillet2d(inputs: Inputs.OCCT.FilletDto<Inputs.OCCT.TopoDSWirePointer | Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSWirePointer | Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Fillets two planar edges into a wire by providing a radius, plane, edges and possible solution index if more than one result exists
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_fillets.OCCTFillets.html#filletTwoEdgesInPlaneIntoAWire
     * @param inputs Definition for fillets
     * @returns OpenCascade wire shape if solution is found
     */
    filletTwoEdgesInPlaneIntoAWire(inputs: Inputs.OCCT.FilletTwoEdgesInPlaneDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
}class OCCTFillets {
    constructor(occWorkerManager) {
        this.occWorkerManager = occWorkerManager;
    }
    /**
    * Fillets OpenCascade Shapes
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_fillets.OCCTFillets.html#filletEdges
    * @param inputs Shape, radius and edge indexes to fillet
    * @returns OpenCascade shape with filleted edges
    */
    filletEdges(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('fillets.filletEdges', inputs);
    }
    /**
     * Chamfer OpenCascade Shape edges
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_fillets.OCCTFillets.html#chamferEdges
     * @param inputs Shape, distance and edge indexes to chamfer
     * @returns OpenCascade shape with chamfered edges
     */
    chamferEdges(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('fillets.chamferEdges', inputs);
    }
    /**
     * Fillets 2d wires or faces
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_fillets.OCCTFillets.html#fillet2d
     * @param inputs Shape
     * @returns OpenCascade filleted shape result
     */
    fillet2d(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('fillets.fillet2d', inputs);
    }
    /**
     * Fillets two planar edges into a wire by providing a radius, plane, edges and possible solution index if more than one result exists
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_fillets.OCCTFillets.html#filletTwoEdgesInPlaneIntoAWire
     * @param inputs Definition for fillets
     * @returns OpenCascade wire shape if solution is found
     */
    filletTwoEdgesInPlaneIntoAWire(inputs) {
        inputs.shapes = [inputs.edge1, inputs.edge2];
        return this.occWorkerManager.genericCallToWorkerPromise('fillets.filletTwoEdgesInPlaneIntoAWire', inputs);
    }
}declare class OCCTCurves {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Creates a 2d ellipse. Be sure to use this geometry only for constructive purposes of modeling, but not for representation. You need to transform these curves to edges in order to draw them.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_curves.OCCTCurves.html#geom2dEllipse
     * @param inputs 2D Ellipse parameters
     * @returns OpenCascade Geom2d_ellipse
     */
    geom2dEllipse(inputs: Inputs.OCCT.Geom2dEllipseDto): Promise<Inputs.OCCT.Geom2dCurvePointer>;
    /**
     * Creates a trimmed curve from the basis curve limited between U1 and U2. This curve can't be drawn.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_curves.OCCTCurves.html#geom2dTrimmedCurve
     * @param inputs Bounds and strategy for trimming the curve
     * @returns OpenCascade Geom2d_TrimmedCurve
     */
    geom2dTrimmedCurve(inputs: Inputs.OCCT.Geom2dTrimmedCurveDto<Inputs.OCCT.Geom2dCurvePointer>): Promise<Inputs.OCCT.Geom2dCurvePointer>;
    /**
     * Creates a trimmed 2d curve segment between two 2d points. This curve can't be drawn.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_curves.OCCTCurves.html#geom2dSegment
     * @param inputs Two 2d points for start and end
     * @returns OpenCascade Geom2d_Segment
     */
    geom2dSegment(inputs: Inputs.OCCT.Geom2dSegmentDto): Promise<Inputs.OCCT.Geom2dCurvePointer>;
    /**
     * Gets 2d point represented by [number, number] on a curve at parameter.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_curves.OCCTCurves.html#get2dPointFrom2dCurveOnParam
     * @param inputs 2D Curve shape and parameter
     * @returns Point as array of 2 numbers
     */
    get2dPointFrom2dCurveOnParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.Geom2dCurvePointer>): Promise<Inputs.Base.Point2>;
    /**
     * Creates a circle geom curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_curves.OCCTCurves.html#geomCircleCurve
     * @param inputs Axis information and radius
     * @returns Opencascade Geom_Circle curve
     */
    geomCircleCurve(inputs: Inputs.OCCT.CircleDto): Promise<Inputs.OCCT.GeomCurvePointer>;
    /**
     * Creates an ellipse geom curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_curves.OCCTCurves.html#geomEllipseCurve
     * @param inputs Axis information and radius
     * @returns Opencascade Geom_Ellipse curve
     */
    geomEllipseCurve(inputs: Inputs.OCCT.EllipseDto): Promise<Inputs.OCCT.GeomCurvePointer>;
}class OCCTCurves {
    constructor(occWorkerManager) {
        this.occWorkerManager = occWorkerManager;
    }
    /**
     * Creates a 2d ellipse. Be sure to use this geometry only for constructive purposes of modeling, but not for representation. You need to transform these curves to edges in order to draw them.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_curves.OCCTCurves.html#geom2dEllipse
     * @param inputs 2D Ellipse parameters
     * @returns OpenCascade Geom2d_ellipse
     */
    geom2dEllipse(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('geom.curves.geom2dEllipse', inputs);
    }
    /**
     * Creates a trimmed curve from the basis curve limited between U1 and U2. This curve can't be drawn.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_curves.OCCTCurves.html#geom2dTrimmedCurve
     * @param inputs Bounds and strategy for trimming the curve
     * @returns OpenCascade Geom2d_TrimmedCurve
     */
    geom2dTrimmedCurve(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('geom.curves.geom2dTrimmedCurve', inputs);
    }
    /**
     * Creates a trimmed 2d curve segment between two 2d points. This curve can't be drawn.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_curves.OCCTCurves.html#geom2dSegment
     * @param inputs Two 2d points for start and end
     * @returns OpenCascade Geom2d_Segment
     */
    geom2dSegment(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('geom.curves.geom2dSegment', inputs);
    }
    /**
     * Gets 2d point represented by [number, number] on a curve at parameter.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_curves.OCCTCurves.html#get2dPointFrom2dCurveOnParam
     * @param inputs 2D Curve shape and parameter
     * @returns Point as array of 2 numbers
     */
    get2dPointFrom2dCurveOnParam(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('geom.curves.get2dPointFrom2dCurveOnParam', inputs);
    }
    /**
     * Creates a circle geom curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_curves.OCCTCurves.html#geomCircleCurve
     * @param inputs Axis information and radius
     * @returns Opencascade Geom_Circle curve
     */
    geomCircleCurve(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('geom.curves.geomCircleCurve', inputs);
    }
    /**
     * Creates an ellipse geom curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_curves.OCCTCurves.html#geomEllipseCurve
     * @param inputs Axis information and radius
     * @returns Opencascade Geom_Ellipse curve
     */
    geomEllipseCurve(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('geom.curves.geomEllipseCurve', inputs);
    }
}declare class OCCTGeom {
    readonly curves: OCCTCurves;
    readonly surfaces: OCCTSurfaces;
    constructor(occWorkerManager: OCCTWorkerManager);
}class OCCTGeom {
    constructor(occWorkerManager) {
        this.curves = new OCCTCurves(occWorkerManager);
        this.surfaces = new OCCTSurfaces(occWorkerManager);
    }
}declare class OCCTSurfaces {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Creates an infinite cylindrical surface that can not be drawn. Be sure to use this geometry only for constructive purposes of modeling, but not for representation.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_surfaces.OCCTSurfaces.html#cylindricalSurface
     * @param inputs Cylinder parameters
     * @returns OpenCascade cylindrical surface
     */
    cylindricalSurface(inputs: Inputs.OCCT.GeomCylindricalSurfaceDto): Promise<Inputs.OCCT.GeomSurfacePointer>;
    /**
     * Creates a surface from the face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_surfaces.OCCTSurfaces.html#surfaceFromFace
     * @param inputs Face shape
     * @returns OpenCascade geom surface
     */
    surfaceFromFace(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.GeomSurfacePointer>;
}class OCCTSurfaces {
    constructor(occWorkerManager) {
        this.occWorkerManager = occWorkerManager;
    }
    /**
     * Creates an infinite cylindrical surface that can not be drawn. Be sure to use this geometry only for constructive purposes of modeling, but not for representation.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_surfaces.OCCTSurfaces.html#cylindricalSurface
     * @param inputs Cylinder parameters
     * @returns OpenCascade cylindrical surface
     */
    cylindricalSurface(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('geom.surfaces.cylindricalSurface', inputs);
    }
    /**
     * Creates a surface from the face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_surfaces.OCCTSurfaces.html#surfaceFromFace
     * @param inputs Face shape
     * @returns OpenCascade geom surface
     */
    surfaceFromFace(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('geom.surfaces.surfaceFromFace', inputs);
    }
}declare class OCCTIO {
    readonly occWorkerManager: OCCTWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Saves the step file
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_io.OCCTIO.html#saveShapeSTEP
     * @param inputs STEP filename and shape to be saved
     * @returns String of a step file
     */
    saveShapeSTEP(inputs: Inputs.OCCT.SaveStepDto<Inputs.OCCT.TopoDSShapePointer>): Promise<string>;
}class OCCTIO {
    constructor(occWorkerManager) {
        this.occWorkerManager = occWorkerManager;
    }
    /**
     * Saves the step file
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_io.OCCTIO.html#saveShapeSTEP
     * @param inputs STEP filename and shape to be saved
     * @returns String of a step file
     */
    saveShapeSTEP(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('io.saveShapeSTEP', inputs).then(s => {
            const blob = new Blob([s], { type: 'text/plain' });
            const blobUrl = URL.createObjectURL(blob);
            const fileName = inputs.filename ? inputs.filename : 'bitbybit-dev.step';
            const fileLink = document.createElement('a');
            fileLink.href = blobUrl;
            fileLink.target = '_self';
            fileLink.download = fileName;
            fileLink.click();
            fileLink.remove();
            return s;
        });
    }
}/**
 * Contains various methods for OpenCascade implementation
 */
declare class OCCT {
    readonly occWorkerManager: OCCTWorkerManager;
    readonly shapes: OCCTShapes;
    readonly geom: OCCTGeom;
    readonly assembly: OCCTAssembly;
    readonly fillets: OCCTFillets;
    readonly transforms: OCCTTransforms;
    readonly operations: OCCTOperations;
    readonly booleans: OCCTBooleans;
    io: OCCTIO;
    constructor(occWorkerManager: OCCTWorkerManager);
    shapeToMesh(inputs: Inputs.OCCT.ShapeToMeshDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.DecomposedMeshDto>;
    deleteShape(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
    deleteShapes(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void>;
}var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Contains various methods for OpenCascade implementation
 */
class OCCT {
    constructor(occWorkerManager) {
        this.occWorkerManager = occWorkerManager;
        this.shapes = new OCCTShapes(occWorkerManager);
        this.geom = new OCCTGeom(occWorkerManager);
        this.assembly = new OCCTAssembly(occWorkerManager);
        this.transforms = new OCCTTransforms(occWorkerManager);
        this.operations = new OCCTOperations(occWorkerManager);
        this.booleans = new OCCTBooleans(occWorkerManager);
        this.fillets = new OCCTFillets(occWorkerManager);
        this.io = new OCCTIO(occWorkerManager);
    }
    shapeToMesh(inputs) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.occWorkerManager.genericCallToWorkerPromise('shapeToMesh', inputs);
        });
    }
    deleteShape(inputs) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.occWorkerManager.genericCallToWorkerPromise('deleteShape', inputs);
        });
    }
    deleteShapes(inputs) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.occWorkerManager.genericCallToWorkerPromise('deleteShapes', inputs);
        });
    }
}declare class OCCTOperations {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Lofts wires into a shell
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#loft
     * @param inputs Loft wires
     * @returns Resulting loft shape
     */
    loft(inputs: Inputs.OCCT.LoftDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Lofts wires into a shell by using many advanced options
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#loftAdvanced
     * @param inputs Advanced loft parameters
     * @returns Resulting loft shell
     */
    loftAdvanced(inputs: Inputs.OCCT.LoftAdvancedDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Offset for various shapes
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#offset
     * @param inputs Shape to offset and distance with tolerance
     * @returns Resulting offset shape
     */
    offset(inputs: Inputs.OCCT.OffsetDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Extrudes the face along direction
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#extrude
     * @param inputs Shape to extrude and direction parameter with tolerance
     * @returns Resulting extruded shape
     */
    extrude(inputs: Inputs.OCCT.ExtrudeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Extrudes the shapes along direction
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#extrudeShapes
     * @param inputs Shapes to extrude and direction parameter with tolerance
     * @returns Resulting extruded shapes
     */
    extrudeShapes(inputs: Inputs.OCCT.ExtrudeShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Splits the face with edges
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#splitShapeWithShapes
     * @param inputs Face to split and edges to split with
     * @returns Resulting split shape
     */
    splitShapeWithShapes(inputs: Inputs.OCCT.SplitDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Revolves the shape around the given direction
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#revolve
     * @param inputs Revolve parameters
     * @returns Resulting revolved shape
     */
    revolve(inputs: Inputs.OCCT.RevolveDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Rotated extrude that is perofrmed on the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#rotatedExtrude
     * @param inputs Rotated extrusion inputs
     * @returns OpenCascade shape
     */
    rotatedExtrude(inputs: Inputs.OCCT.RotationExtrudeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Pipe shapes along the wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#pipe
     * @param inputs Path wire and shapes along the path
     * @returns OpenCascade shape
     */
    pipe(inputs: Inputs.OCCT.ShapeShapesDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Thickens the shape into a solid by an offset distance
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#makeThickSolidSimple
     * @param inputs OpenCascade shape
     * @returns OpenCascade solid shape
     */
    makeThickSolidSimple(inputs: Inputs.OCCT.ThisckSolidSimpleDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Thickens the shape into a solid by joining
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#makeThickSolidByJoin
     * @param inputs OpenCascade shape and options for thickening
     * @returns OpenCascade solid shape
     */
    makeThickSolidByJoin(inputs: Inputs.OCCT.ThickSolidByJoinDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
}class OCCTOperations {
    constructor(occWorkerManager) {
        this.occWorkerManager = occWorkerManager;
    }
    /**
     * Lofts wires into a shell
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#loft
     * @param inputs Loft wires
     * @returns Resulting loft shape
     */
    loft(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.loft', inputs);
    }
    /**
     * Lofts wires into a shell by using many advanced options
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#loftAdvanced
     * @param inputs Advanced loft parameters
     * @returns Resulting loft shell
     */
    loftAdvanced(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.loftAdvanced', inputs);
    }
    /**
     * Offset for various shapes
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#offset
     * @param inputs Shape to offset and distance with tolerance
     * @returns Resulting offset shape
     */
    offset(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.offset', inputs);
    }
    /**
     * Extrudes the face along direction
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#extrude
     * @param inputs Shape to extrude and direction parameter with tolerance
     * @returns Resulting extruded shape
     */
    extrude(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.extrude', inputs);
    }
    /**
     * Extrudes the shapes along direction
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#extrudeShapes
     * @param inputs Shapes to extrude and direction parameter with tolerance
     * @returns Resulting extruded shapes
     */
    extrudeShapes(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.extrudeShapes', inputs);
    }
    /**
     * Splits the face with edges
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#splitShapeWithShapes
     * @param inputs Face to split and edges to split with
     * @returns Resulting split shape
     */
    splitShapeWithShapes(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.splitShapeWithShapes', inputs);
    }
    /**
     * Revolves the shape around the given direction
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#revolve
     * @param inputs Revolve parameters
     * @returns Resulting revolved shape
     */
    revolve(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.revolve', inputs);
    }
    /**
     * Rotated extrude that is perofrmed on the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#rotatedExtrude
     * @param inputs Rotated extrusion inputs
     * @returns OpenCascade shape
     */
    rotatedExtrude(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.rotatedExtrude', inputs);
    }
    /**
     * Pipe shapes along the wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#pipe
     * @param inputs Path wire and shapes along the path
     * @returns OpenCascade shape
     */
    pipe(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.pipe', inputs);
    }
    /**
     * Thickens the shape into a solid by an offset distance
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#makeThickSolidSimple
     * @param inputs OpenCascade shape
     * @returns OpenCascade solid shape
     */
    makeThickSolidSimple(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.makeThickSolidSimple', inputs);
    }
    /**
     * Thickens the shape into a solid by joining
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.OCCTOperations.html#makeThickSolidByJoin
     * @param inputs OpenCascade shape and options for thickening
     * @returns OpenCascade solid shape
     */
    makeThickSolidByJoin(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('operations.makeThickSolidByJoin', inputs);
    }
}declare class OCCTCompound {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Makes the compound shape, which can include any kind of shapes
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_compound.OCCTCompound.html#makeCompound
     * @param inputs OpenCascade shapes
     * @returns OpenCascade compounded shape
     */
    makeCompound(inputs: Inputs.OCCT.CompoundShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSCompoundPointer>;
}class OCCTCompound {
    constructor(occWorkerManager) {
        this.occWorkerManager = occWorkerManager;
    }
    /**
     * Makes the compound shape, which can include any kind of shapes
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_compound.OCCTCompound.html#makeCompound
     * @param inputs OpenCascade shapes
     * @returns OpenCascade compounded shape
     */
    makeCompound(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.compound.makeCompound', inputs);
    }
}declare class OCCTEdge {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Creates linear edge between two points
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#line
     * @param inputs Two points between which edge should be created
     * @returns OpenCascade edge
     */
    line(inputs: Inputs.OCCT.LineDto): Promise<Inputs.OCCT.TopoDSEdgePointer>;
    /**
     * Creates arc edge between three points
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#arcThroughThreePoints
     * @param inputs Shape, radius and edge indexes to fillet
     * @returns OpenCascade edge
     */
    arcThroughThreePoints(inputs: Inputs.OCCT.ArcEdgeThreePointsDto): Promise<Inputs.OCCT.TopoDSEdgePointer>;
    /**
     * Creates OpenCascade circle edge
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#createCircleEdge
     * @param inputs Circle parameters
     * @returns OpenCascade circle edge
     */
    createCircleEdge(inputs: Inputs.OCCT.CircleDto): Promise<Inputs.OCCT.TopoDSEdgePointer>;
    /**
     * Creates OpenCascade ellipse edge
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#createEllipseEdge
     * @param inputs Ellipse parameters
     * @returns OpenCascade ellipse edge
     */
    createEllipseEdge(inputs: Inputs.OCCT.EllipseDto): Promise<Inputs.OCCT.TopoDSEdgePointer>;
    /**
     * Removes internal faces for the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#removeInternalEdges
     * @param inputs Shape
     * @returns OpenCascade shape with no internal edges
     */
    removeInternalEdges(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Gets the edge by providing an index from the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#getEdge
     * @param inputs Shape
     * @returns OpenCascade edge
     */
    getEdge(inputs: Inputs.OCCT.ShapeIndexDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSEdgePointer>;
    /**
     * Gets the edges of a shape in a list
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#getEdges
     * @param inputs Shape
     * @returns OpenCascade edge list
     */
    getEdges(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSEdgePointer[]>;
    /**
     * Creates an edge from geom curve and geom surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#makeEdgeFromGeom2dCurveAndSurface
     * @param inputs shapes are expected to contain 2 array elements - first is geom curve, second geom surface
     * @returns OpenCascade TopoDS_Edge
     */
    makeEdgeFromGeom2dCurveAndSurface(inputs: Inputs.OCCT.EdgeFromGeom2dCurveAndSurfaceDto<Inputs.OCCT.Geom2dCurvePointer, Inputs.OCCT.GeomSurfacePointer>): Promise<Inputs.OCCT.TopoDSEdgePointer>;
    /**
     * Gets corner points of edges for a shape. There's no order guarantee here. All duplicates are removed, so when three edges form one corner, that will be represented by a single point in the list.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#getCornerPointsOfEdgesForShape
     * @param inputs Shape that contains edges - wire, face, shell, solid
     * @returns List of points
     */
    getCornerPointsOfEdgesForShape(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[]>;
    /**
     * Gets the edge length
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#getEdgeLength
     * @param inputs edge
     * @returns Length
     */
    getEdgeLength(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<number>;
    /**
     * Gets the lengths of the edges
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#getEdgesLengths
     * @param inputs edges
     * @returns Lengths
     */
    getEdgesLengths(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<number[]>;
    /**
     * Gets the center of mass for the edge
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#getEdgeCenterOfMass
     * @param inputs edge
     * @returns Point representing center of mass
     */
    getEdgeCenterOfMass(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
    /**
     * Gets the centers of mass for the edges
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#getEdgesCentersOfMass
     * @param inputs edges
     * @returns Points representing centers of mass
     */
    getEdgesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3[]>;
    /**
     * Gets the point on edge at param
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#pointOnEdgeAtParam
     * @param input edge
     * @returns Point on param
     */
    pointOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
    /**
     * Gets the tangent vector on edge at param
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#tangentOnEdgeAtParam
     * @param input edge
     * @returns Tangent vector on param
     */
    tangentOnEdgeAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
    /**
     * Gets the point on edge at length
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#pointOnEdgeAtLength
     * @param input edge and length
     * @returns Point on edge
     */
    pointOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
    /**
     * Gets the tangent vector on edge at length
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#tangentOnEdgeAtLength
     * @param input edge and length
     * @returns Tangent vector on edge
     */
    tangentOnEdgeAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
    /**
     * Gets the start point on edge
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#startPointOnEdge
     * @param input edge
     * @returns Start point
     */
    startPointOnEdge(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
    /**
     * Gets the end point on edge
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#endPointOnEdge
     * @param input edge
     * @returns End point
     */
    endPointOnEdge(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3>;
    /**
     * Divides edge by params to points
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#divideEdgeByParamsToPoints
     * @param input edge and division params
     * @returns Points
     */
    divideEdgeByParamsToPoints(inputs: Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3[]>;
    /**
     * Divides edge by length to points
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#divideEdgeByEqualDistanceToPoints
     * @param input edge and division params
     * @returns Points
     */
    divideEdgeByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.Base.Point3[]>;
}class OCCTEdge {
    constructor(occWorkerManager) {
        this.occWorkerManager = occWorkerManager;
    }
    /**
     * Creates linear edge between two points
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#line
     * @param inputs Two points between which edge should be created
     * @returns OpenCascade edge
     */
    line(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.line', inputs);
    }
    /**
     * Creates arc edge between three points
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#arcThroughThreePoints
     * @param inputs Shape, radius and edge indexes to fillet
     * @returns OpenCascade edge
     */
    arcThroughThreePoints(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.arcThroughThreePoints', inputs);
    }
    /**
     * Creates OpenCascade circle edge
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#createCircleEdge
     * @param inputs Circle parameters
     * @returns OpenCascade circle edge
     */
    createCircleEdge(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.createCircleEdge', inputs);
    }
    /**
     * Creates OpenCascade ellipse edge
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#createEllipseEdge
     * @param inputs Ellipse parameters
     * @returns OpenCascade ellipse edge
     */
    createEllipseEdge(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.createEllipseEdge', inputs);
    }
    /**
     * Removes internal faces for the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#removeInternalEdges
     * @param inputs Shape
     * @returns OpenCascade shape with no internal edges
     */
    removeInternalEdges(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.removeInternalEdges', inputs);
    }
    /**
     * Gets the edge by providing an index from the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#getEdge
     * @param inputs Shape
     * @returns OpenCascade edge
     */
    getEdge(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.getEdge', inputs);
    }
    /**
     * Gets the edges of a shape in a list
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#getEdges
     * @param inputs Shape
     * @returns OpenCascade edge list
     */
    getEdges(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.getEdges', inputs);
    }
    /**
     * Creates an edge from geom curve and geom surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#makeEdgeFromGeom2dCurveAndSurface
     * @param inputs shapes are expected to contain 2 array elements - first is geom curve, second geom surface
     * @returns OpenCascade TopoDS_Edge
     */
    makeEdgeFromGeom2dCurveAndSurface(inputs) {
        inputs.shapes = [inputs.curve, inputs.surface];
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.makeEdgeFromGeom2dCurveAndSurface', inputs);
    }
    /**
     * Gets corner points of edges for a shape. There's no order guarantee here. All duplicates are removed, so when three edges form one corner, that will be represented by a single point in the list.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#getCornerPointsOfEdgesForShape
     * @param inputs Shape that contains edges - wire, face, shell, solid
     * @returns List of points
     */
    getCornerPointsOfEdgesForShape(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.getCornerPointsOfEdgesForShape', inputs);
    }
    /**
     * Gets the edge length
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#getEdgeLength
     * @param inputs edge
     * @returns Length
     */
    getEdgeLength(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.getEdgeLength', inputs);
    }
    /**
     * Gets the lengths of the edges
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#getEdgesLengths
     * @param inputs edges
     * @returns Lengths
     */
    getEdgesLengths(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.getEdgesLengths', inputs);
    }
    /**
     * Gets the center of mass for the edge
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#getEdgeCenterOfMass
     * @param inputs edge
     * @returns Point representing center of mass
     */
    getEdgeCenterOfMass(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.getEdgeCenterOfMass', inputs);
    }
    /**
     * Gets the centers of mass for the edges
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#getEdgesCentersOfMass
     * @param inputs edges
     * @returns Points representing centers of mass
     */
    getEdgesCentersOfMass(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.getEdgesCentersOfMass', inputs);
    }
    /**
     * Gets the point on edge at param
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#pointOnEdgeAtParam
     * @param input edge
     * @returns Point on param
     */
    pointOnEdgeAtParam(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.pointOnEdgeAtParam', inputs);
    }
    /**
     * Gets the tangent vector on edge at param
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#tangentOnEdgeAtParam
     * @param input edge
     * @returns Tangent vector on param
     */
    tangentOnEdgeAtParam(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.tangentOnEdgeAtParam', inputs);
    }
    /**
     * Gets the point on edge at length
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#pointOnEdgeAtLength
     * @param input edge and length
     * @returns Point on edge
     */
    pointOnEdgeAtLength(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.pointOnEdgeAtLength', inputs);
    }
    /**
     * Gets the tangent vector on edge at length
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#tangentOnEdgeAtLength
     * @param input edge and length
     * @returns Tangent vector on edge
     */
    tangentOnEdgeAtLength(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.tangentOnEdgeAtLength', inputs);
    }
    /**
     * Gets the start point on edge
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#startPointOnEdge
     * @param input edge
     * @returns Start point
     */
    startPointOnEdge(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.startPointOnEdge', inputs);
    }
    /**
     * Gets the end point on edge
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#endPointOnEdge
     * @param input edge
     * @returns End point
     */
    endPointOnEdge(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.endPointOnEdge', inputs);
    }
    /**
     * Divides edge by params to points
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#divideEdgeByParamsToPoints
     * @param input edge and division params
     * @returns Points
     */
    divideEdgeByParamsToPoints(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.divideEdgeByParamsToPoints', inputs);
    }
    /**
     * Divides edge by length to points
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.OCCTEdge.html#divideEdgeByEqualDistanceToPoints
     * @param input edge and division params
     * @returns Points
     */
    divideEdgeByEqualDistanceToPoints(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.edge.divideEdgeByEqualDistanceToPoints', inputs);
    }
}declare class OCCTFace {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Creates a face from wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#createFaceFromWire
     * @param inputs OpenCascade wire shape and indication if face should be planar
     * @returns OpenCascade face shape
     */
    createFaceFromWire(inputs: Inputs.OCCT.FaceFromWireDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Creates faces from wires
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#createFacesFromWires
     * @param inputs OpenCascade wire shape and indication if face should be planar
     * @returns OpenCascade face shape
     */
    createFacesFromWires(inputs: Inputs.OCCT.FaceFromWireDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSFacePointer[]>;
    /**
     * Creates a face from the surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_surfaces.OCCTSurfaces.html#faceFromSurface
     * @param inputs Face shape
     * @returns OpenCascade surface
     */
    faceFromSurface(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.GeomSurfacePointer>): Promise<Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Creates a face from the surface and a wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_surfaces.OCCTSurfaces.html#faceFromSurfaceAndWire
     * @param inputs OpenCascade surface, a wire and indication wether face should be created inside or not
     * @returns Face shape
     */
    faceFromSurfaceAndWire(inputs: Inputs.OCCT.FaceFromSurfaceAndWireDto<Inputs.OCCT.GeomSurfacePointer, Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Creates OpenCascade Polygon face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#createPolygonFace
     * @param inputs Polygon points
     * @returns OpenCascade polygon face
     */
    createPolygonFace(inputs: Inputs.OCCT.PolygonDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Creates OpenCascade circle face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#createCircleFace
     * @param inputs Circle parameters
     * @returns OpenCascade circle face
     */
    createCircleFace(inputs: Inputs.OCCT.CircleDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Creates OpenCascade ellipse face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#createEllipseFace
     * @param inputs Ellipse parameters
     * @returns OpenCascade ellipse face
     */
    createEllipseFace(inputs: Inputs.OCCT.EllipseDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Creates OpenCascade square face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#createSquareFace
     * @param inputs Square parameters
     * @returns OpenCascade square face
     */
    createSquareFace(inputs: Inputs.OCCT.SquareDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Creates OpenCascade rectangle face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#createRectangleFace
     * @param inputs rectangle parameters
     * @returns OpenCascade rectangle
     */
    createRectangleFace(inputs: Inputs.OCCT.RectangleDto): Promise<Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Gets the face by providing an index from the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getFace
     * @param inputs Shape
     * @returns OpenCascade face
     */
    getFace(inputs: Inputs.OCCT.ShapeIndexDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Gets the faces of the shape in a list
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getFaces
     * @param inputs Shape
     * @returns OpenCascade faces array
     */
    getFaces(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSFacePointer[]>;
    /**
     * Computes reversed face from input face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#reversedFace
     * @param inputs Face
     * @returns OpenCascade face
     */
    reversedFace(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSFacePointer>;
    /**
     * Subdivides a face to point grid
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#subdivideToPoints
     * @param inputs Face and params for subdivision
     * @returns points
     */
    subdivideToPoints(inputs: Inputs.OCCT.FaceSubdivisionDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[]>;
    /**
     * Subdivides a face to normals grid
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#subdivideToNormals
     * @param inputs Face and params for subdivision
     * @returns normal vectors
     */
    subdivideToNormals(inputs: Inputs.OCCT.FaceSubdivisionDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Vector3[]>;
    /**
     * Subdivides a face to uv grid
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#subdivideToUV
     * @param inputs Face and params for subdivision
     * @returns uv params in array
     */
    subdivideToUV(inputs: Inputs.OCCT.FaceSubdivisionDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point2[]>;
    /**
     * Get point on UV where U and V are described between 0 and 1. These will be mapped to real bounds.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#pointOnUV
     * @param inputs Face and params for subdivision
     * @returns point
     */
    pointOnUV(inputs: Inputs.OCCT.DataOnUVDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3>;
    /**
     * Get normal on UV where U and V are described between 0 and 1. These will be mapped to real bounds.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#normalOnUV
     * @param inputs Face and params for subdivision
     * @returns normal vector
     */
    normalOnUV(inputs: Inputs.OCCT.DataOnUVDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Vector3>;
    /**
     * Get points on UVs where U and V are described between 0 and 1 in two dimensional arrays. These will be mapped to real bounds.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#pointOnUV
     * @param inputs Face and params for subdivision
     * @returns points
     */
    pointsOnUVs(inputs: Inputs.OCCT.DataOnUVsDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[]>;
    /**
     * Get normals on UVs where U and V are described between 0 and 1 in two dimensional arrays. These will be mapped to real bounds.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#normalsOnUVs
     * @param inputs Face and params for subdivision
     * @returns normals
     */
    normalsOnUVs(inputs: Inputs.OCCT.DataOnUVsDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Vector3[]>;
    /**
     * Subdivides a face to points along a line on parameter
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#subdivideToPointsOnParam
     * @param inputs Face and params for subdivision
     * @returns points
     */
    subdivideToPointsOnParam(inputs: Inputs.OCCT.FaceLinearSubdivisionDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[]>;
    /**
     * Gets the U min bound of the face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getUMinBound
     * @param inputs OCCT Face
     * @returns u min bound
     */
    getUMinBound(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number>;
    /**
     * Gets the U max bound of the face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getUMaxBound
     * @param inputs OCCT Face
     * @returns u max bound
     */
    getUMaxBound(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number>;
    /**
     * Gets the V min bound of the face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getVMinBound
     * @param inputs OCCT Face
     * @returns v min bound
     */
    getVMinBound(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number>;
    /**
     * Gets the V max bound of the face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getVMaxBound
     * @param inputs OCCT Face
     * @returns v max bound
     */
    getVMaxBound(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number>;
    /**
     * Get the area of the face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getFaceArea
     * @param inputs OCCT Face
     * @returns area
     */
    getFaceArea(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number>;
    /**
     * Get the areas of the faces
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getFacesAreas
     * @param inputs OCCT Faces
     * @returns areas
     */
    getFacesAreas(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSFacePointer>): Promise<number[]>;
    /**
     * Get the face center of mass point
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getFaceCenterOfMass
     * @param inputs OCCT Face
     * @returns point
     */
    getFaceCenterOfMass(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3>;
    /**
     * Get the face center of mass point
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getFaceCenterOfMass
     * @param inputs OCCT Faces
     * @returns points
     */
    getFacesCentersOfMass(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.Base.Point3[]>;
}class OCCTFace {
    constructor(occWorkerManager) {
        this.occWorkerManager = occWorkerManager;
    }
    /**
     * Creates a face from wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#createFaceFromWire
     * @param inputs OpenCascade wire shape and indication if face should be planar
     * @returns OpenCascade face shape
     */
    createFaceFromWire(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.createFaceFromWire', inputs);
    }
    /**
     * Creates faces from wires
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#createFacesFromWires
     * @param inputs OpenCascade wire shape and indication if face should be planar
     * @returns OpenCascade face shape
     */
    createFacesFromWires(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.createFacesFromWires', inputs);
    }
    /**
     * Creates a face from the surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_surfaces.OCCTSurfaces.html#faceFromSurface
     * @param inputs Face shape
     * @returns OpenCascade surface
     */
    faceFromSurface(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.faceFromSurface', inputs);
    }
    /**
     * Creates a face from the surface and a wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_geom_surfaces.OCCTSurfaces.html#faceFromSurfaceAndWire
     * @param inputs OpenCascade surface, a wire and indication wether face should be created inside or not
     * @returns Face shape
     */
    faceFromSurfaceAndWire(inputs) {
        inputs.shapes = [inputs.surface, inputs.wire];
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.faceFromSurfaceAndWire', inputs);
    }
    /**
     * Creates OpenCascade Polygon face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#createPolygonFace
     * @param inputs Polygon points
     * @returns OpenCascade polygon face
     */
    createPolygonFace(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.createPolygonFace', inputs);
    }
    /**
     * Creates OpenCascade circle face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#createCircleFace
     * @param inputs Circle parameters
     * @returns OpenCascade circle face
     */
    createCircleFace(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.createCircleFace', inputs);
    }
    /**
     * Creates OpenCascade ellipse face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#createEllipseFace
     * @param inputs Ellipse parameters
     * @returns OpenCascade ellipse face
     */
    createEllipseFace(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.createEllipseFace', inputs);
    }
    /**
     * Creates OpenCascade square face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#createSquareFace
     * @param inputs Square parameters
     * @returns OpenCascade square face
     */
    createSquareFace(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.createSquareFace', inputs);
    }
    /**
     * Creates OpenCascade rectangle face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#createRectangleFace
     * @param inputs rectangle parameters
     * @returns OpenCascade rectangle
     */
    createRectangleFace(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.createRectangleFace', inputs);
    }
    /**
     * Gets the face by providing an index from the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getFace
     * @param inputs Shape
     * @returns OpenCascade face
     */
    getFace(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.getFace', inputs);
    }
    /**
     * Gets the faces of the shape in a list
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getFaces
     * @param inputs Shape
     * @returns OpenCascade faces array
     */
    getFaces(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.getFaces', inputs);
    }
    /**
     * Computes reversed face from input face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#reversedFace
     * @param inputs Face
     * @returns OpenCascade face
     */
    reversedFace(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.reversedFace', inputs);
    }
    /**
     * Subdivides a face to point grid
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#subdivideToPoints
     * @param inputs Face and params for subdivision
     * @returns points
     */
    subdivideToPoints(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.subdivideToPoints', inputs);
    }
    /**
     * Subdivides a face to normals grid
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#subdivideToNormals
     * @param inputs Face and params for subdivision
     * @returns normal vectors
     */
    subdivideToNormals(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.subdivideToNormals', inputs);
    }
    /**
     * Subdivides a face to uv grid
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#subdivideToUV
     * @param inputs Face and params for subdivision
     * @returns uv params in array
     */
    subdivideToUV(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.subdivideToUV', inputs);
    }
    /**
     * Get point on UV where U and V are described between 0 and 1. These will be mapped to real bounds.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#pointOnUV
     * @param inputs Face and params for subdivision
     * @returns point
     */
    pointOnUV(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.pointOnUV', inputs);
    }
    /**
     * Get normal on UV where U and V are described between 0 and 1. These will be mapped to real bounds.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#normalOnUV
     * @param inputs Face and params for subdivision
     * @returns normal vector
     */
    normalOnUV(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.normalOnUV', inputs);
    }
    /**
     * Get points on UVs where U and V are described between 0 and 1 in two dimensional arrays. These will be mapped to real bounds.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#pointOnUV
     * @param inputs Face and params for subdivision
     * @returns points
     */
    pointsOnUVs(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.pointsOnUVs', inputs);
    }
    /**
     * Get normals on UVs where U and V are described between 0 and 1 in two dimensional arrays. These will be mapped to real bounds.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#normalsOnUVs
     * @param inputs Face and params for subdivision
     * @returns normals
     */
    normalsOnUVs(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.normalsOnUVs', inputs);
    }
    /**
     * Subdivides a face to points along a line on parameter
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#subdivideToPointsOnParam
     * @param inputs Face and params for subdivision
     * @returns points
     */
    subdivideToPointsOnParam(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.subdivideToPointsOnParam', inputs);
    }
    /**
     * Gets the U min bound of the face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getUMinBound
     * @param inputs OCCT Face
     * @returns u min bound
     */
    getUMinBound(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.getUMinBound', inputs);
    }
    /**
     * Gets the U max bound of the face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getUMaxBound
     * @param inputs OCCT Face
     * @returns u max bound
     */
    getUMaxBound(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.getUMaxBound', inputs);
    }
    /**
     * Gets the V min bound of the face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getVMinBound
     * @param inputs OCCT Face
     * @returns v min bound
     */
    getVMinBound(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.getVMinBound', inputs);
    }
    /**
     * Gets the V max bound of the face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getVMaxBound
     * @param inputs OCCT Face
     * @returns v max bound
     */
    getVMaxBound(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.getVMaxBound', inputs);
    }
    /**
     * Get the area of the face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getFaceArea
     * @param inputs OCCT Face
     * @returns area
     */
    getFaceArea(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.getFaceArea', inputs);
    }
    /**
     * Get the areas of the faces
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getFacesAreas
     * @param inputs OCCT Faces
     * @returns areas
     */
    getFacesAreas(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.getFacesAreas', inputs);
    }
    /**
     * Get the face center of mass point
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getFaceCenterOfMass
     * @param inputs OCCT Face
     * @returns point
     */
    getFaceCenterOfMass(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.getFaceCenterOfMass', inputs);
    }
    /**
     * Get the face center of mass point
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.OCCTFace.html#getFaceCenterOfMass
     * @param inputs OCCT Faces
     * @returns points
     */
    getFacesCentersOfMass(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.face.getFacesCentersOfMass', inputs);
    }
}declare class OCCTShapes {
    readonly edge: OCCTEdge;
    readonly wire: OCCTWire;
    readonly face: OCCTFace;
    readonly shell: OCCTShell;
    readonly solid: OCCTSolid;
    readonly compound: OCCTCompound;
    constructor(occWorkerManager: OCCTWorkerManager);
}class OCCTShapes {
    constructor(occWorkerManager) {
        this.edge = new OCCTEdge(occWorkerManager);
        this.wire = new OCCTWire(occWorkerManager);
        this.face = new OCCTFace(occWorkerManager);
        this.shell = new OCCTShell(occWorkerManager);
        this.solid = new OCCTSolid(occWorkerManager);
        this.compound = new OCCTCompound(occWorkerManager);
    }
}declare class OCCTShell {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Creates a shell from faces
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_shell.OCCTShell.html#sewFaces
     * @param inputs OpenCascade shell and faces
     * @returns OpenCascade shell
     */
    sewFaces(inputs: Inputs.OCCT.SewDto<Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSShellPointer>;
    /**
     * Get shell surface area
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_shell.OCCTShell.html#getShellSurfaceArea
     * @param inputs shell shape
     * @returns Surface area
     */
    getShellSurfaceArea(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShellPointer>): Promise<number>;
}class OCCTShell {
    constructor(occWorkerManager) {
        this.occWorkerManager = occWorkerManager;
    }
    /**
     * Creates a shell from faces
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_shell.OCCTShell.html#sewFaces
     * @param inputs OpenCascade shell and faces
     * @returns OpenCascade shell
     */
    sewFaces(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.shell.sewFaces', inputs);
    }
    /**
     * Get shell surface area
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_shell.OCCTShell.html#getShellSurfaceArea
     * @param inputs shell shape
     * @returns Surface area
     */
    getShellSurfaceArea(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.shell.getShellSurfaceArea', inputs);
    }
}declare class OCCTSolid {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Creates Solid From shell that must be closed
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#createBox
     * @param inputs Closed shell to make into solid
     * @returns OpenCascade Solid
     */
    fromClosedShell(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShellPointer>): Promise<Inputs.OCCT.TopoDSSolidPointer>;
    /**
     * Creates OpenCascade Box
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#createBox
     * @param inputs Box size and center
     * @returns OpenCascade Box
     */
    createBox(inputs: Inputs.OCCT.BoxDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
    /**
     * Creates OpenCascade Box from corner
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#createBoxFromCorner
     * @param inputs Box size and corner coordinates
     * @returns OpenCascade Box
     */
    createBoxFromCorner(inputs: Inputs.OCCT.BoxFromCornerDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
    /**
     * Creates OpenCascade Cylinder
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#createCylinder
     * @param inputs Cylinder parameters
     * @returns OpenCascade Cylinder
     */
    createCylinder(inputs: Inputs.OCCT.CylinderDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
    /**
     * Creates OpenCascade Cylinders on simple bit by bit lines represented by two points
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#createCylindersOnLines
     * @param inputs Cylinder parameters
     * @returns OpenCascade Cylinder
     */
    createCylindersOnLines(inputs: Inputs.OCCT.CylindersOnLinesDto): Promise<Inputs.OCCT.TopoDSSolidPointer[]>;
    /**
     * Creates OpenCascade Sphere
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#createSphere
     * @param inputs Sphere radius and center
     * @returns OpenCascade Sphere
     */
    createSphere(inputs: Inputs.OCCT.SphereDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
    /**
     * Creates OpenCascade Cone
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#createCone
     * @param inputs Cone parameters
     * @returns OpenCascade cone shape
     */
    createCone(inputs: Inputs.OCCT.ConeDto): Promise<Inputs.OCCT.TopoDSSolidPointer>;
    /**
     * Get solid surface area
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#getSolidSurfaceArea
     * @param inputs Closed solid shape
     * @returns Surface area
     */
    getSolidSurfaceArea(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<number>;
    /**
    * Get solid volume
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#getSolidVolume
    * @param inputs Closed solid shape
    * @returns volume
    */
    getSolidVolume(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<number>;
    /**
    * Get solids volumes
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#getSolidsVolumes
    * @param inputs Closed solid shapes
    * @returns volumes
    */
    getSolidsVolumes(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<number[]>;
    /**
    * Get solid center of mass
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#getSolidCenterOfMass
    * @param inputs Closed solid shape
    * @returns center of mass point
    */
    getSolidCenterOfMass(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<Inputs.Base.Point3>;
    /**
     * Get centers of mass of solids
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#getSolidsCentersOfMass
     * @param inputs Closed solid shapes
     * @returns Points indicating centers of mass
     */
    getSolidsCentersOfMass(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<Inputs.Base.Point3[]>;
}class OCCTSolid {
    constructor(occWorkerManager) {
        this.occWorkerManager = occWorkerManager;
    }
    /**
     * Creates Solid From shell that must be closed
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#createBox
     * @param inputs Closed shell to make into solid
     * @returns OpenCascade Solid
     */
    fromClosedShell(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.solid.fromClosedShell', inputs);
    }
    /**
     * Creates OpenCascade Box
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#createBox
     * @param inputs Box size and center
     * @returns OpenCascade Box
     */
    createBox(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.solid.createBox', inputs);
    }
    /**
     * Creates OpenCascade Box from corner
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#createBoxFromCorner
     * @param inputs Box size and corner coordinates
     * @returns OpenCascade Box
     */
    createBoxFromCorner(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.solid.createBoxFromCorner', inputs);
    }
    /**
     * Creates OpenCascade Cylinder
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#createCylinder
     * @param inputs Cylinder parameters
     * @returns OpenCascade Cylinder
     */
    createCylinder(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.solid.createCylinder', inputs);
    }
    /**
     * Creates OpenCascade Cylinders on simple bit by bit lines represented by two points
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#createCylindersOnLines
     * @param inputs Cylinder parameters
     * @returns OpenCascade Cylinder
     */
    createCylindersOnLines(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.solid.createCylindersOnLines', inputs);
    }
    /**
     * Creates OpenCascade Sphere
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#createSphere
     * @param inputs Sphere radius and center
     * @returns OpenCascade Sphere
     */
    createSphere(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.solid.createSphere', inputs);
    }
    /**
     * Creates OpenCascade Cone
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#createCone
     * @param inputs Cone parameters
     * @returns OpenCascade cone shape
     */
    createCone(inputs) {
        inputs.angle = inputs.angle * (Math.PI / 180);
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.solid.createCone', inputs);
    }
    /**
     * Get solid surface area
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#getSolidSurfaceArea
     * @param inputs Closed solid shape
     * @returns Surface area
     */
    getSolidSurfaceArea(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.solid.getSolidSurfaceArea', inputs);
    }
    /**
    * Get solid volume
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#getSolidVolume
    * @param inputs Closed solid shape
    * @returns volume
    */
    getSolidVolume(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.solid.getSolidVolume', inputs);
    }
    /**
    * Get solids volumes
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#getSolidsVolumes
    * @param inputs Closed solid shapes
    * @returns volumes
    */
    getSolidsVolumes(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.solid.getSolidsVolumes', inputs);
    }
    /**
    * Get solid center of mass
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#getSolidCenterOfMass
    * @param inputs Closed solid shape
    * @returns center of mass point
    */
    getSolidCenterOfMass(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.solid.getSolidCenterOfMass', inputs);
    }
    /**
     * Get centers of mass of solids
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.OCCTSolid.html#getSolidsCentersOfMass
     * @param inputs Closed solid shapes
     * @returns Points indicating centers of mass
     */
    getSolidsCentersOfMass(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.solid.getSolidsCentersOfMass', inputs);
    }
}declare class OCCTWire {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Creates OpenCascade Polygon wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createPolygonWire
     * @param inputs Polygon points
     * @returns OpenCascade polygon wire shape
     */
    createPolygonWire(inputs: Inputs.OCCT.PolygonDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Combines OpenCascade edges and wires into a single wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#combineEdgesAndWiresIntoAWire
     * @param inputs List of shapes of edges and wires
     * @returns OpenCascade wire
     */
    combineEdgesAndWiresIntoAWire(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSWirePointer | Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Adds OpenCascade edges and wires into another wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#addEdgesAndWiresToWire
     * @param inputs List of shapes of edges and wires and a single shape wire to which edges need to be added
     * @returns OpenCascade wire
     */
    addEdgesAndWiresToWire(inputs: Inputs.OCCT.ShapeShapesDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSWirePointer | Inputs.OCCT.TopoDSEdgePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Creates OpenCascade BSPline wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createBSpline
     * @param inputs Points through which to make BSpline
     * @returns OpenCascade BSpline wire
     */
    createBSpline(inputs: Inputs.OCCT.BSplineDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
    * Divides OpenCascade wire to points blindly following its parametric space
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#divideWireByParamsToPoints
    * @param inputs Describes into how many points should the wire be divided
    * @returns Points on wire
    */
    divideWireByParamsToPoints(inputs: Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3[]>;
    /**
    * Divides OpenCascade wire to equal distance points
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#divideWireByEqualDistanceToPoints
    * @param inputs Describes into how many points should the wire be divided
    * @returns Points on wire
    */
    divideWireByEqualDistanceToPoints(inputs: Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3[]>;
    /**
    * Evaluates point on a wire at parameter value between 0 and 1, being start and end points
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#pointOnWireAtParam
    * @param inputs Wire shape and parameter
    * @returns Point as array of 3 numbers
    */
    pointOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3>;
    /**
    * Evaluates point on a wire at certain length
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#pointOnWireAtLength
    * @param inputs Wire shape and length value
    * @returns Point as array of 3 numbers
    */
    pointOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3>;
    /**
    * Evaluates tangent vector on a wire at parameter value between 0 and 1, being start and end points
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#tangentOnWireAtParam
    * @param inputs Wire shape and parameter
    * @returns Tangent vector as array of 3 numbers
    */
    tangentOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Vector3>;
    /**
    * Evaluates tangent vector on a wire at certain length
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#pointOnWireAtLength
    * @param inputs Wire shape and length value
    * @returns Tangent vector as array of 3 numbers
    */
    tangentOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Vector3>;
    /**
    * Computes 3 derivative vectors of a curve at a given length
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#derivativesOnWireAtLength
    * @param inputs Wire shape and length value
    * @returns Three arrays of vectors. Each vector represents derivatives in order - first, second, third
    */
    derivativesOnWireAtLength(inputs: Inputs.OCCT.DataOnGeometryAtLengthDto<Inputs.OCCT.TopoDSWirePointer>): Promise<[Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3]>;
    /**
    * Computes 3 derivative vectors of a curve on parameter between 0 and 1.
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#derivativesOnWireAtParam
    * @param inputs Wire shape and parameter value
    * @returns Three arrays of vectors. Each vector represents derivatives in order - first, second, third
    */
    derivativesOnWireAtParam(inputs: Inputs.OCCT.DataOnGeometryAtParamDto<Inputs.OCCT.TopoDSWirePointer>): Promise<[Inputs.Base.Vector3, Inputs.Base.Vector3, Inputs.Base.Vector3]>;
    /**
    * Computes the star point on the wire at param 0
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#startPointOnWire
    * @param inputs Wire shape
    * @returns The length of the wire
    */
    startPointOnWire(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3>;
    /**
    * Computes the end point on the wire at param 1
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#endPointOnWire
    * @param inputs Wire shape
    * @returns The length of the wire
    */
    endPointOnWire(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.Base.Point3>;
    /**
     * Creates OpenCascade Bezier wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createBezier
     * @param inputs Points through which to make bezier curve
     * @returns OpenCascade Bezier wire
     */
    createBezier(inputs: Inputs.OCCT.BezierDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Creates OpenCascade BSpline wire from points. This method can be used to create nicely shaped (periodic) loops.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#interpolatePoints
     * @param inputs Points through which to make the curve, periodic bool and tolerance
     * @returns OpenCascade BSpline wire
     */
    interpolatePoints(inputs: Inputs.OCCT.InterpolationDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Creates OpenCascade circle wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createCircleWire
     * @param inputs Circle parameters
     * @returns OpenCascade circle wire
     */
    createCircleWire(inputs: Inputs.OCCT.CircleDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Creates OpenCascade square wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createSquareWire
     * @param inputs Square parameters
     * @returns OpenCascade square wire
     */
    createSquareWire(inputs: Inputs.OCCT.SquareDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Creates OpenCascade star wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createStarWire
     * @param inputs star parameters
     * @returns OpenCascade star wire
     */
    createStarWire(inputs: Inputs.OCCT.StarDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Creates OpenCascade n-gon wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createNGonWire
     * @param inputs ngon parameters
     * @returns OpenCascade ngon wire
     */
    createNGonWire(inputs: Inputs.OCCT.NGonWireDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Creates n  parallelogram wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createParallelogramWire
     * @param inputs parallelogram parameters
     * @returns OpenCascade star wire
     */
    createParallelogramWire(inputs: Inputs.OCCT.ParallelogramDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Creates OpenCascade rectangle wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createRectangleWire
     * @param inputs rectangle parameters
     * @returns OpenCascade rectangle
     */
    createRectangleWire(inputs: Inputs.OCCT.RectangleDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Creates OpenCascade ellipse wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createEllipseWire
     * @param inputs Ellipse parameters
     * @returns OpenCascade ellipse wire
     */
    createEllipseWire(inputs: Inputs.OCCT.EllipseDto): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Gets the wire by providing an index from the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#getWire
     * @param inputs Shape
     * @returns OpenCascade wire
     */
    getWire(inputs: Inputs.OCCT.ShapeIndexDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Gets the wires by providing an index from the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#getWires
     * @param inputs Shape
     * @returns OpenCascade wires
     */
    getWires(inputs: Inputs.OCCT.ShapeIndexDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Computes reversed wire from input wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#reversedWire
     * @param inputs Shape
     * @returns OpenCascade wire
     */
    reversedWire(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Places a wire on the face by mapping it's 2d coordinates to UV space. Wire must be positioned on the ground XZ plane for this to work.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#placeWireOnFace
     * @param inputs two shapes - first a wire and second a face
     * @returns OpenCascade wire
     */
    placeWireOnFace(inputs: Inputs.OCCT.WireOnFaceDto<Inputs.OCCT.TopoDSWirePointer, Inputs.OCCT.TopoDSFacePointer>): Promise<Inputs.OCCT.TopoDSWirePointer>;
    /**
     * Places multiple wires on the face by mapping it's 2d coordinates to UV space. Wires must be positioned on the ground XZ plane for this to work.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#placeWiresOnFace
     * @param inputs a face and a list of wires
     * @returns OpenCascade wires
     */
    placeWiresOnFace(inputs: Inputs.OCCT.ShapeShapesDto<Inputs.OCCT.TopoDSFacePointer, Inputs.OCCT.TopoDSWirePointer>): Promise<Inputs.OCCT.TopoDSWirePointer[]>;
    /**
     * Gets the wire length
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#getWireLength
     * @param inputs wire
     * @returns Length
     */
    getWireLength(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>): Promise<number>;
    /**
     * Gets the lengths of wires
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#getWiresLengths
     * @param inputs wires
     * @returns Lengths
     */
    getWiresLengths(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSWirePointer>): Promise<number[]>;
}class OCCTWire {
    constructor(occWorkerManager) {
        this.occWorkerManager = occWorkerManager;
    }
    /**
     * Creates OpenCascade Polygon wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createPolygonWire
     * @param inputs Polygon points
     * @returns OpenCascade polygon wire shape
     */
    createPolygonWire(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.createPolygonWire', inputs);
    }
    /**
     * Combines OpenCascade edges and wires into a single wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#combineEdgesAndWiresIntoAWire
     * @param inputs List of shapes of edges and wires
     * @returns OpenCascade wire
     */
    combineEdgesAndWiresIntoAWire(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.combineEdgesAndWiresIntoAWire', inputs);
    }
    /**
     * Adds OpenCascade edges and wires into another wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#addEdgesAndWiresToWire
     * @param inputs List of shapes of edges and wires and a single shape wire to which edges need to be added
     * @returns OpenCascade wire
     */
    addEdgesAndWiresToWire(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.addEdgesAndWiresToWire', inputs);
    }
    /**
     * Creates OpenCascade BSPline wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createBSpline
     * @param inputs Points through which to make BSpline
     * @returns OpenCascade BSpline wire
     */
    createBSpline(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.createBSpline', inputs);
    }
    /**
    * Divides OpenCascade wire to points blindly following its parametric space
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#divideWireByParamsToPoints
    * @param inputs Describes into how many points should the wire be divided
    * @returns Points on wire
    */
    divideWireByParamsToPoints(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.divideWireByParamsToPoints', inputs);
    }
    /**
    * Divides OpenCascade wire to equal distance points
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#divideWireByEqualDistanceToPoints
    * @param inputs Describes into how many points should the wire be divided
    * @returns Points on wire
    */
    divideWireByEqualDistanceToPoints(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.divideWireByEqualDistanceToPoints', inputs);
    }
    /**
    * Evaluates point on a wire at parameter value between 0 and 1, being start and end points
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#pointOnWireAtParam
    * @param inputs Wire shape and parameter
    * @returns Point as array of 3 numbers
    */
    pointOnWireAtParam(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.pointOnWireAtParam', inputs);
    }
    /**
    * Evaluates point on a wire at certain length
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#pointOnWireAtLength
    * @param inputs Wire shape and length value
    * @returns Point as array of 3 numbers
    */
    pointOnWireAtLength(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.pointOnWireAtLength', inputs);
    }
    /**
    * Evaluates tangent vector on a wire at parameter value between 0 and 1, being start and end points
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#tangentOnWireAtParam
    * @param inputs Wire shape and parameter
    * @returns Tangent vector as array of 3 numbers
    */
    tangentOnWireAtParam(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.tangentOnWireAtParam', inputs);
    }
    /**
    * Evaluates tangent vector on a wire at certain length
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#pointOnWireAtLength
    * @param inputs Wire shape and length value
    * @returns Tangent vector as array of 3 numbers
    */
    tangentOnWireAtLength(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.tangentOnWireAtLength', inputs);
    }
    /**
    * Computes 3 derivative vectors of a curve at a given length
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#derivativesOnWireAtLength
    * @param inputs Wire shape and length value
    * @returns Three arrays of vectors. Each vector represents derivatives in order - first, second, third
    */
    derivativesOnWireAtLength(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.derivativesOnWireAtLength', inputs);
    }
    /**
    * Computes 3 derivative vectors of a curve on parameter between 0 and 1.
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#derivativesOnWireAtParam
    * @param inputs Wire shape and parameter value
    * @returns Three arrays of vectors. Each vector represents derivatives in order - first, second, third
    */
    derivativesOnWireAtParam(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.derivativesOnWireAtParam', inputs);
    }
    /**
    * Computes the star point on the wire at param 0
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#startPointOnWire
    * @param inputs Wire shape
    * @returns The length of the wire
    */
    startPointOnWire(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.startPointOnWire', inputs);
    }
    /**
    * Computes the end point on the wire at param 1
    * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#endPointOnWire
    * @param inputs Wire shape
    * @returns The length of the wire
    */
    endPointOnWire(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.endPointOnWire', inputs);
    }
    // /**
    //  * Creates OpenCascade BSPline wire
    //  * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createbspline
    //  * @param inputs Points through which to make BSpline
    //  * @returns OpenCascade BSpline wire
    //  */
    // createInterpolation(inputs: Inputs.OCCT.BSplineDto): Promise<any> {
    //     return this.occWorkerManager.genericCallToWorkerPromise('createInterpolation', inputs);
    // }
    /**
     * Creates OpenCascade Bezier wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createBezier
     * @param inputs Points through which to make bezier curve
     * @returns OpenCascade Bezier wire
     */
    createBezier(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.createBezier', inputs);
    }
    /**
     * Creates OpenCascade BSpline wire from points. This method can be used to create nicely shaped (periodic) loops.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#interpolatePoints
     * @param inputs Points through which to make the curve, periodic bool and tolerance
     * @returns OpenCascade BSpline wire
     */
    interpolatePoints(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.interpolatePoints', inputs);
    }
    /**
     * Creates OpenCascade circle wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createCircleWire
     * @param inputs Circle parameters
     * @returns OpenCascade circle wire
     */
    createCircleWire(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.createCircleWire', inputs);
    }
    /**
     * Creates OpenCascade square wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createSquareWire
     * @param inputs Square parameters
     * @returns OpenCascade square wire
     */
    createSquareWire(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.createSquareWire', inputs);
    }
    /**
     * Creates OpenCascade star wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createStarWire
     * @param inputs star parameters
     * @returns OpenCascade star wire
     */
    createStarWire(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.createStarWire', inputs);
    }
    /**
     * Creates OpenCascade n-gon wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createNGonWire
     * @param inputs ngon parameters
     * @returns OpenCascade ngon wire
     */
    createNGonWire(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.createNGonWire', inputs);
    }
    /**
     * Creates n  parallelogram wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createParallelogramWire
     * @param inputs parallelogram parameters
     * @returns OpenCascade star wire
     */
    createParallelogramWire(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.createParallelogramWire', inputs);
    }
    /**
     * Creates OpenCascade rectangle wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createRectangleWire
     * @param inputs rectangle parameters
     * @returns OpenCascade rectangle
     */
    createRectangleWire(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.createRectangleWire', inputs);
    }
    /**
     * Creates OpenCascade ellipse wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#createEllipseWire
     * @param inputs Ellipse parameters
     * @returns OpenCascade ellipse wire
     */
    createEllipseWire(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.createEllipseWire', inputs);
    }
    /**
     * Gets the wire by providing an index from the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#getWire
     * @param inputs Shape
     * @returns OpenCascade wire
     */
    getWire(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.getWire', inputs);
    }
    /**
     * Gets the wires by providing an index from the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#getWires
     * @param inputs Shape
     * @returns OpenCascade wires
     */
    getWires(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.getWires', inputs);
    }
    /**
     * Computes reversed wire from input wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#reversedWire
     * @param inputs Shape
     * @returns OpenCascade wire
     */
    reversedWire(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.reversedWire', inputs);
    }
    /**
     * Places a wire on the face by mapping it's 2d coordinates to UV space. Wire must be positioned on the ground XZ plane for this to work.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#placeWireOnFace
     * @param inputs two shapes - first a wire and second a face
     * @returns OpenCascade wire
     */
    placeWireOnFace(inputs) {
        inputs.shapes = [inputs.wire, inputs.face];
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.placeWireOnFace', inputs);
    }
    /**
     * Places multiple wires on the face by mapping it's 2d coordinates to UV space. Wires must be positioned on the ground XZ plane for this to work.
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#placeWiresOnFace
     * @param inputs a face and a list of wires
     * @returns OpenCascade wires
     */
    placeWiresOnFace(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.placeWiresOnFace', inputs);
    }
    /**
     * Gets the wire length
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#getWireLength
     * @param inputs wire
     * @returns Length
     */
    getWireLength(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.getWireLength', inputs);
    }
    /**
     * Gets the lengths of wires
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.OCCTWire.html#getWiresLengths
     * @param inputs wires
     * @returns Lengths
     */
    getWiresLengths(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('shapes.wire.getWiresLengths', inputs);
    }
}declare class OCCTTransforms {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Transforms the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#transform
     * @param inputs Transformation description
     * @returns OpenCascade shape
     */
    transform(inputs: Inputs.OCCT.TransformDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Rotate the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#rotate
     * @param inputs Rotation description
     * @returns OpenCascade shape
     */
    rotate(inputs: Inputs.OCCT.RotateDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Align the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#align
     * @param inputs Align description
     * @returns OpenCascade shape
     */
    align(inputs: Inputs.OCCT.AlignDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Translates the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#translate
     * @param inputs Translation description
     * @returns OpenCascade shape
     */
    translate(inputs: Inputs.OCCT.TranslateDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Scales the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#scale
     * @param inputs Scale description
     * @returns OpenCascade shape
     */
    scale(inputs: Inputs.OCCT.ScaleDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Scales the shape in 3D
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#scale3d
     * @param inputs Scale 3D description
     * @returns OpenCascade scaled shape
     */
    scale3d(inputs: Inputs.OCCT.Scale3DDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Mirrors the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#mirror
     * @param inputs Mirror axis origin, axis direction and shape
     * @returns OpenCascade shape
     */
    mirror(inputs: Inputs.OCCT.MirrorDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Mirrors the shape along the normal and origin
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#mirrorAlongNormal
     * @param inputs Normal for mirroring with origin
     * @returns OpenCascade shape
     */
    mirrorAlongNormal(inputs: Inputs.OCCT.MirrorAlongNormalDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer>;
    /**
     * Transforms the array of shapes with transformations
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#transformShapes
     * @param inputs Transformation descriptions
     * @returns OpenCascade shapes
     */
    transformShapes(inputs: Inputs.OCCT.TransformShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
    /**
     * Rotate the shapes with rotations
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#rotateShapes
     * @param inputs Rotation descriptions
     * @returns OpenCascade shapes
     */
    rotateShapes(inputs: Inputs.OCCT.RotateShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
    /**
     * Align the shapes with alignments
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#alignShapes
     * @param inputs Align descriptions
     * @returns OpenCascade shapes
     */
    alignShapes(inputs: Inputs.OCCT.AlignShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
    /**
     * Translates the shapes with translations
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#translateShapes
     * @param inputs Translation descriptions
     * @returns OpenCascade shapes
     */
    translateShapes(inputs: Inputs.OCCT.TranslateShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
    /**
     * Scales the shapes with scale factors
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#scaleShapes
     * @param inputs Scale descriptions
     * @returns OpenCascade shapes
     */
    scaleShapes(inputs: Inputs.OCCT.ScaleShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
    /**
     * Scales the shape in 3D
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#scale3dShapes
     * @param inputs Scale 3D descriptions
     * @returns OpenCascade scaled shapes
     */
    scale3dShapes(inputs: Inputs.OCCT.Scale3DShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
    /**
     * Mirrors the shapes with multiple mirrors
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#mirrorShapes
     * @param inputs Mirror axis origins, axis directions and shapes
     * @returns OpenCascade shapes
     */
    mirrorShapes(inputs: Inputs.OCCT.MirrorShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
    /**
     * Mirrors the shapes along the normal and origin
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#mirrorAlongNormalShapes
     * @param inputs Normals for mirroring with origins
     * @returns OpenCascade shapes
     */
    mirrorAlongNormalShapes(inputs: Inputs.OCCT.MirrorAlongNormalShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSShapePointer[]>;
}class OCCTTransforms {
    constructor(occWorkerManager) {
        this.occWorkerManager = occWorkerManager;
    }
    /**
     * Transforms the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#transform
     * @param inputs Transformation description
     * @returns OpenCascade shape
     */
    transform(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.transform', inputs);
    }
    /**
     * Rotate the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#rotate
     * @param inputs Rotation description
     * @returns OpenCascade shape
     */
    rotate(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.rotate', inputs);
    }
    /**
     * Align the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#align
     * @param inputs Align description
     * @returns OpenCascade shape
     */
    align(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.align', inputs);
    }
    /**
     * Translates the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#translate
     * @param inputs Translation description
     * @returns OpenCascade shape
     */
    translate(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.translate', inputs);
    }
    /**
     * Scales the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#scale
     * @param inputs Scale description
     * @returns OpenCascade shape
     */
    scale(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.scale', inputs);
    }
    /**
     * Scales the shape in 3D
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#scale3d
     * @param inputs Scale 3D description
     * @returns OpenCascade scaled shape
     */
    scale3d(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.scale3d', inputs);
    }
    /**
     * Mirrors the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#mirror
     * @param inputs Mirror axis origin, axis direction and shape
     * @returns OpenCascade shape
     */
    mirror(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.mirror', inputs);
    }
    /**
     * Mirrors the shape along the normal and origin
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#mirrorAlongNormal
     * @param inputs Normal for mirroring with origin
     * @returns OpenCascade shape
     */
    mirrorAlongNormal(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.mirrorAlongNormal', inputs);
    }
    /**
     * Transforms the array of shapes with transformations
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#transformShapes
     * @param inputs Transformation descriptions
     * @returns OpenCascade shapes
     */
    transformShapes(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.transformShapes', inputs);
    }
    /**
     * Rotate the shapes with rotations
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#rotateShapes
     * @param inputs Rotation descriptions
     * @returns OpenCascade shapes
     */
    rotateShapes(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.rotateShapes', inputs);
    }
    /**
     * Align the shapes with alignments
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#alignShapes
     * @param inputs Align descriptions
     * @returns OpenCascade shapes
     */
    alignShapes(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.alignShapes', inputs);
    }
    /**
     * Translates the shapes with translations
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#translateShapes
     * @param inputs Translation descriptions
     * @returns OpenCascade shapes
     */
    translateShapes(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.translateShapes', inputs);
    }
    /**
     * Scales the shapes with scale factors
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#scaleShapes
     * @param inputs Scale descriptions
     * @returns OpenCascade shapes
     */
    scaleShapes(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.scaleShapes', inputs);
    }
    /**
     * Scales the shape in 3D
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#scale3dShapes
     * @param inputs Scale 3D descriptions
     * @returns OpenCascade scaled shapes
     */
    scale3dShapes(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.scale3dShapes', inputs);
    }
    /**
     * Mirrors the shapes with multiple mirrors
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#mirrorShapes
     * @param inputs Mirror axis origins, axis directions and shapes
     * @returns OpenCascade shapes
     */
    mirrorShapes(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.mirrorShapes', inputs);
    }
    /**
     * Mirrors the shapes along the normal and origin
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.OCCTTransforms.html#mirrorAlongNormalShapes
     * @param inputs Normals for mirroring with origins
     * @returns OpenCascade shapes
     */
    mirrorAlongNormalShapes(inputs) {
        return this.occWorkerManager.genericCallToWorkerPromise('transforms.mirrorAlongNormalShapes', inputs);
    }
}`;
    