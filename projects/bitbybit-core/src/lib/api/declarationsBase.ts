export const baseDeclarations = `declare class Asset {
    private readonly assetManager;
    constructor(assetManager: AssetManager);
    /**
     * Gets the asset file
     * @link https://docs.bitbybit.dev/classes/bitbybit_asset_get.assetget.html#get
     * @param inputs file name to get from project assets
     * @returns Blob of asset
     */
    getFile(inputs: Inputs.Asset.GetAssetDto): Promise<File>;
}declare namespace BaseTypes {
    /**
     * Interval represents an object that has two properties - min and max.
     */
    class IntervalDto {
        /**
         * Minimum value of the interval
         * @link https://docs.bitbybit.dev/classes/bitbybit_base_types.basetypes.intervaldto.html#min
         */
        min: number;
        /**
         * Maximum value of the interval
         * @link https://docs.bitbybit.dev/classes/bitbybit_base_types.basetypes.intervaldto.html#max
         */
        max: number;
    }
    /**
     * UV usually represents 2D coordinates on 3D or 2D surfaces. It is similar to XY coordinates in planes.
     */
    class UVDto {
        /**
         * U coordinate of the surface
         * @link https://docs.bitbybit.dev/classes/bitbybit_base_types.basetypes.uvdto.html#u
         */
        u: number;
        /**
         * V coordinate of the surface
         * @link https://docs.bitbybit.dev/classes/bitbybit_base_types.basetypes.uvdto.html#v
         */
        v: number;
    }
    /**
     * Intersection result of curve curve
     */
    class CurveCurveIntersection {
        /**
         * Point of intersection on the first curve
         */
        point0: number[];
        /**
         * Point of intersection on the second curve
         */
        point1: number[];
        /**
         * Parameter of intersection on the first curve
         */
        u0: number;
        /**
         * Parameter of intersection on the second curve
         */
        u1: number;
    }
    /**
     * Intersection result of curve and surface
     */
    class CurveSurfaceIntersection {
        /**
         * Parameter of intersection on the curve
         */
        u: number;
        /**
         * UV Parameters of intersection on the surface
         */
        uv: UVDto;
        /**
         * Point of intersection on the curve
         */
        curvePoint: number[];
        /**
         * Point of intersection on the surface
         */
        surfacePoint: number[];
    }
    /**
     * Intersection point between two surfaces
     */
    class SurfaceSurfaceIntersectionPoint {
        /**
         * UV parameters of intersection on first surface
         */
        uv0: UVDto;
        /**
         * UV parameters of intersection on second surface
         */
        uv1: UVDto;
        /**
         * Point of intersection
         */
        point: number[];
        /**
         * Distance
         */
        dist: number;
    }
}/**
 * Contains various functions for Solid booleans from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADBooleans {
    private readonly context;
    constructor(context: Context);
    /**
     * Intersect multiple solid mesh objects
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_booleans.jscadbooleans.html#intersect
     * @param inputs Contains multiple solids for intersection
     * @returns Solid mesh
     */
    intersect(inputs: Inputs.JSCAD.BooleanObjectsDto): any;
    /**
     * Subtract multiple solid mesh objects
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_booleans.jscadbooleans.html#subtract
     * @param inputs Contains multiple solids for subtraction
     * @returns Solid mesh
     */
    subtract(inputs: Inputs.JSCAD.BooleanObjectsDto): any;
    /**
     * Union multiple solid mesh objects
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_booleans.jscadbooleans.html#union
     * @param inputs Contains multiple solids for union
     * @returns Solid mesh
     */
    union(inputs: Inputs.JSCAD.BooleanObjectsDto): any;
}/**
 * Contains various functions for Solid expansions from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADExpansions {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Expand geometries of solid category
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_expansions.jscadexpansions.html#expand
     * @param inputs Contains options and geometries for expansion
     * @returns Expanded geometry
     */
    expand(inputs: Inputs.JSCAD.ExpansionDto): any | any[];
    /**
     * Offset 2d geometries of solid category
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_expansions.jscadexpansions.html#offset
     * @param inputs Contains options and geometries for offset
     * @returns Expanded geometry
     */
    offset(inputs: Inputs.JSCAD.ExpansionDto): any | any[];
}/**
 * Contains various functions for Solid extrusions from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADExtrusions {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Linear extrude 2D geometries of solid category
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_extrusions.jscadextrusions.html#extrudelinear
     * @param inputs Contains options and geometries for linear extrude
     * @returns Extruded geometry
     */
    extrudeLinear(inputs: Inputs.JSCAD.ExtrudeLinearDto): any | any[];
    /**
     * Rectangular extrude 2D geometries of solid category. Creates a wall-type extrusion of certain height and size.
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_extrusions.jscadextrusions.html#extruderectangular
     * @param inputs Contains options and geometries for rectangular extrude
     * @returns Extruded geometry
     */
    extrudeRectangular(inputs: Inputs.JSCAD.ExtrudeRectangularDto): any | any[];
    /**
     * Rectangular extrude a list of 2D points. Creates a wall-type extrusion of certain height and size.
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_extrusions.jscadextrusions.html#extruderectangularpoints
     * @param inputs Contains options and points for extrusion
     * @returns Extruded geometry
     */
    extrudeRectangularPoints(inputs: Inputs.JSCAD.ExtrudeRectangularPointsDto): any;
    /**
     * Rectangular extrude a list of 2D points. Creates a wall-type extrusion of certain height and size.
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_extrusions.jscadextrusions.html#extruderotate
     * @param inputs Contains options and points for extrusion
     * @returns Extruded geometry
     */
    extrudeRotate(inputs: Inputs.JSCAD.ExtrudeRotateDto): any;
}/**
 * Contains various functions for Solid hulls from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADHulls {
    private readonly context;
    constructor(context: Context);
    /**
     * Hull chain connects solids or 2d geometries by filling an empty space in between objects in order.
     * Geometries need to be of the same type.
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_hulls.jscadhulls.html#chainhull
     * @param inputs Geometries
     * @returns Chain hulled geometry
     */
    hullChain(inputs: Inputs.JSCAD.HullDto): any | any[];
    /**
     * Convex hull connects solids or 2d geometries by filling an empty space in between without following order.
     * Geometries need to be of the same type.
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_hulls.jscadhulls.html#chainhull
     * @param inputs Geometries
     * @returns Hulled geometry
     */
    hull(inputs: Inputs.JSCAD.HullDto): any | any[];
}/**
 * Contains various functions for Path from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADPath {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Create a 2D path from a list of points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#createfrompoints
     * @param inputs Points and indication if we want a closed path or not
     * @returns Path
     */
    createFromPoints(inputs: Inputs.JSCAD.PathFromPointsDto): any;
    /**
     * Create a 2D path from a polyline
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#createfrompolyline
     * @param inputs Polyline and indication if we want a closed path or not
     * @returns Path
     */
    createFromPolyline(inputs: Inputs.JSCAD.PathFromPolylineDto): any;
    /**
     * Create a 2D path from a curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#createfromcurve
     * @param inputs Curve and indication if we want a closed path or not
     * @returns Path
     */
    createFromCurve(inputs: Inputs.JSCAD.PathFromCurveDto): any;
    /**
     * Create empty 2D path
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#createempty
     * @returns Emprty path
     */
    createEmpty(): any;
    /**
     * Closes an open 2D path
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#close
     * @param inputs Path
     * @returns Closed path
     */
    close(inputs: Inputs.JSCAD.PathDto): any;
    /**
     * Append the path with 2D points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#appendpoints
     * @param inputs Path to append and points
     * @returns Appended path
     */
    appendPoints(inputs: Inputs.JSCAD.PathAppendPointsDto): any;
    /**
     * Append the path with polyline
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#appendpolyline
     * @param inputs Path to append and polyline
     * @returns Appended path
     */
    appendPolyline(inputs: Inputs.JSCAD.PathAppendPolylineDto): any;
    /**
     * Append the path with the curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#appendcurve
     * @param inputs Path to append and a curve
     * @returns Appended path
     */
    appendCurve(inputs: Inputs.JSCAD.PathAppendCurveDto): any;
    /**
     * Append the arc to the path
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_path.jscadpath.html#appendarc
     * @param inputs Path and arc parameters
     * @returns Appended path
     */
    appendArc(inputs: Inputs.JSCAD.PathAppendArcDto): any;
    private removeDuplicatesAndCreateFromPoints;
}/**
 * Contains various functions for Polygon from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADPolygon {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Create a 2D polygon from a list of points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#createfrompoints
     * @param inputs Points
     * @returns Path
     */
    createFromPoints(inputs: Inputs.Point.PointsDto): any;
    /**
     * Create a 2D polygon from a polyline
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#createfrompolyline
     * @param inputs Polyline
     * @returns Polygon
     */
    createFromPolyline(inputs: Inputs.Polyline.PolylineDto): any;
    /**
     * Create a 2D polygon from a curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#createfromcurve
     * @param inputs Nurbs curve
     * @returns Polygon
     */
    createFromCurve(inputs: Inputs.Verb.CurveDto): any;
    /**
     * Create a 2D polygon from a path
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#createfrompath
     * @param inputs Path
     * @returns Polygon
     */
    createFromPath(inputs: Inputs.JSCAD.PathDto): any;
    /**
     * Create a 2D polygon circle
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#circle
     * @param inputs Circle parameters
     * @returns Circle polygon
     */
    circle(inputs: Inputs.JSCAD.CircleDto): any;
    /**
     * Create a 2D polygon ellipse
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#ellipse
     * @param inputs Ellipse parameters
     * @returns Ellipse polygon
     */
    ellipse(inputs: Inputs.JSCAD.EllipseDto): any;
    /**
     * Create a 2D polygon rectangle
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#rectangle
     * @param inputs Rectangle parameters
     * @returns Rectangle polygon
     */
    rectangle(inputs: Inputs.JSCAD.RectangleDto): any;
    /**
     * Create a 2D rounded rectangle
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#roundedrectangle
     * @param inputs Rounded rectangle parameters
     * @returns Rounded rectangle polygon
     */
    roundedRectangle(inputs: Inputs.JSCAD.RoundedRectangleDto): any;
    /**
     * Create a 2D polygon square
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#square
     * @param inputs Square parameters
     * @returns Square polygon
     */
    square(inputs: Inputs.JSCAD.SquareDto): any;
    /**
     * Create a 2D polygon star
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_polygon.jscadpolygon.html#star
     * @param inputs Star parameters
     * @returns Star polygon
     */
    star(inputs: Inputs.JSCAD.StarDto): any;
    private removeDuplicatesAndCreateFromPoints;
}/**
 * Contains various functions for solid 3D shapes from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADShapes {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Create a 3D cube shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#cube
     * @param inputs Cube parameters
     * @returns Cube solid
     */
    cube(inputs: Inputs.JSCAD.CubeDto): any;
    /**
     * Create a 3D cubes on multiple center points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#cubesoncenterpoints
     * @param inputs Cube with multiple center points parameters
     * @returns List of cube solids
     */
    cubesOnCenterPoints(inputs: Inputs.JSCAD.CubeCentersDto): any[];
    /**
     * Create a 3D cuboid shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#cuboid
     * @param inputs Cuboid parameters
     * @returns Cuboid solid
     */
    cuboid(inputs: Inputs.JSCAD.CuboidDto): any;
    /**
     * Create a 3D cuboids on multiple center points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#cuboidsoncenterpoints
     * @param inputs Cuboids with multiple center point parameters
     * @returns List of cuboid solids
     */
    cuboidsOnCenterPoints(inputs: Inputs.JSCAD.CuboidCentersDto): any[];
    /**
     * Create a 3D elliptic cylinder solid
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#cylinderelliptic
     * @param inputs Elliptic cylinder parameters
     * @returns Elliptic cylinder solid
     */
    cylinderElliptic(inputs: Inputs.JSCAD.CylidnerEllipticDto): any;
    /**
     * Create a 3D elliptic cylinders on multiple center points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#cylinderellipticoncenterpoints
     * @param inputs Elliptic cylinders with multiple center point parameters
     * @returns List of elliptic cylinders solids
     */
    cylinderEllipticOnCenterPoints(inputs: Inputs.JSCAD.CylidnerCentersEllipticDto): any[];
    /**
     * Create a 3D cylinder solid
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#cylinder
     * @param inputs Cylinder parameters
     * @returns Cylinder solid
     */
    cylinder(inputs: Inputs.JSCAD.CylidnerDto): any;
    /**
     * Create a 3D cylinders on multiple center points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#cylinderoncenterpoints
     * @param inputs Cylinders with multiple center point parameters
     * @returns List of cylinder solids
     */
    cylindersOnCenterPoints(inputs: Inputs.JSCAD.CylidnerCentersDto): any[];
    /**
     * Create a 3D ellipsoid solid
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#ellipsoid
     * @param inputs Ellipsoid parameters
     * @returns Ellipsoid solid
     */
    ellipsoid(inputs: Inputs.JSCAD.EllipsoidDto): any;
    /**
     * Create a 3D ellipsoids on multiple center points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#ellipsoidsoncenterpoints
     * @param inputs Ellipsoid parameters with multiple center points
     * @returns List of ellipsoid solids
     */
    ellipsoidsOnCenterPoints(inputs: Inputs.JSCAD.EllipsoidCentersDto): any[];
    /**
     * Create a 3D geodesic sphere solid
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#geodesicsphere
     * @param inputs Geodesic sphere parameters
     * @returns Geodesic sphere solid
     */
    geodesicSphere(inputs: Inputs.JSCAD.GeodesicSphereDto): any;
    /**
     * Create a 3D geodesic spheres on multiple center points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#geodesicspheresoncenterpoints
     * @param inputs Geodesic sphere parameters with multiple center points
     * @returns List of geodesic spheres
     */
    geodesicSpheresOnCenterPoints(inputs: Inputs.JSCAD.GeodesicSphereCentersDto): any[];
    /**
     * Create a 3D rounded cuboid solid
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#roundedcuboid
     * @param inputs Rounded cuboid parameters
     * @returns Rounded cuboid solid
     */
    roundedCuboid(inputs: Inputs.JSCAD.RoundedCuboidDto): any;
    /**
     * Create a 3D rounded cuboids on multiple center points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#roundedcuboidsoncenterpoints
     * @param inputs Rounded cuboids parameters with multiple center points
     * @returns List of rounded cuboids
     */
    roundedCuboidsOnCenterPoints(inputs: Inputs.JSCAD.RoundedCuboidCentersDto): any[];
    /**
     * Create a 3D rounded cylinder solid
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#roundedcylinder
     * @param inputs Rounded cylinder parameters
     * @returns Rounded cylinder solid
     */
    roundedCylinder(inputs: Inputs.JSCAD.RoundedCylidnerDto): any;
    /**
     * Create a 3D rounded cylinders on multiple center points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#roundedcylindersoncenterpoints
     * @param inputs Rounded cylinders parameters with multiple center points
     * @returns List of rounded cylinders
     */
    roundedCylindersOnCenterPoints(inputs: Inputs.JSCAD.RoundedCylidnerCentersDto): any[];
    /**
     * Create a 3D sphere solid
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#sphere
     * @param inputs Sphere parameters
     * @returns Sphere solid
     */
    sphere(inputs: Inputs.JSCAD.SphereDto): any;
    /**
     * Create a 3D sphere on multiple center points
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#spheresoncenterpoints
     * @param inputs Sphere parameters with multiple center points
     * @returns List of spheres
     */
    spheresOnCenterPoints(inputs: Inputs.JSCAD.SphereCentersDto): any[];
    /**
     * Create a 3D torus solid
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_shapes.jscadshapes.html#torus
     * @param inputs Torus parameters
     * @returns Torus solid
     */
    torus(inputs: Inputs.JSCAD.TorusDto): any;
}/**
 * Contains various functions for solid 3D texts from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCADText {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates a text that is based on chain hulling cylinders
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_text.jscadtext.html#cylindricaltext
     * @param inputs Cylindrical text parameters
     * @returns List of solids for text
     */
    cylindricalText(inputs: Inputs.JSCAD.CylinderTextDto): any[];
    /**
     * Creates a text that is based on chain hulling spheres
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad_text.jscadtext.html#sphericalText
     * @param inputs Spherical text parameters
     * @returns List of solids for text
     */
    sphericalText(inputs: Inputs.JSCAD.SphereTextDto): any[];
    private adjustTextToBeOnCenter;
    createVectorText(inputs: Inputs.JSCAD.TextDto): number[][];
}/**
 * Contains various functions for Solid meshes from JSCAD library http://openjscad.org
 * Thanks JSCAD community for developing this kernel
 */
declare class JSCAD {
    readonly booleans: JSCADBooleans;
    readonly expansions: JSCADExpansions;
    readonly extrusions: JSCADExtrusions;
    readonly hulls: JSCADHulls;
    readonly path: JSCADPath;
    readonly polygon: JSCADPolygon;
    readonly shapes: JSCADShapes;
    readonly text: JSCADText;
    private readonly context;
    private readonly geometryHelper;
    constructor(booleans: JSCADBooleans, expansions: JSCADExpansions, extrusions: JSCADExtrusions, hulls: JSCADHulls, path: JSCADPath, polygon: JSCADPolygon, shapes: JSCADShapes, text: JSCADText, context: Context, geometryHelper: GeometryHelper);
    /**
     * Draws a single solids
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#drawsolidorpolygonmesh
     * @param inputs Contains a solid or polygon and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSolidOrPolygonMesh(inputs: Inputs.JSCAD.DrawSolidMeshDto): Mesh;
    /**
     * Draws multiple solids
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#drawsolidorpolygonmeshes
     * @param inputs Contains solids or polygons and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSolidOrPolygonMeshes(inputs: Inputs.JSCAD.DrawSolidsMeshDto): Mesh;
    /**
     * Draws a 2D path
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#drawpath
     * @param inputs Contains a path and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawPath(inputs: Inputs.JSCAD.DrawPathDto): LinesMesh;
    /**
     * Transforms the Jscad solid meshes with a given list of transformations.
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#transformsolids
     * @param inputs Solids with the transformation matrixes
     * @returns Solids with a transformation
     */
    transformSolids(inputs: Inputs.JSCAD.TransformSolidsDto): any;
    /**
     * Transforms the Jscad solid mesh with a given list of transformations.
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#transformsolid
     * @param inputs Solid with the transformation matrixes
     * @returns Solid with a transformation
     */
    transformSolid(inputs: Inputs.JSCAD.TransformSolidDto): any;
    /**
     * Downloads the binary STL file from a 3D solid
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#downloadsolidstl
     * @param inputs 3D Solid
     */
    downloadSolidSTL(inputs: Inputs.JSCAD.DownloadSolidDto): void;
    /**
     * Downloads the binary STL file from a 3D solids
     * @link https://docs.bitbybit.dev/classes/bitbybit_jscad.jscad.html#downloadsolidsstl
     * @param inputs 3D Solid
     */
    downloadSolidsSTL(inputs: Inputs.JSCAD.DownloadSolidsDto): void;
    private downloadSTL;
    private createMesh;
}/**
 * Contains various methods for lines. Line in bitbybit is a simple object that has star and end point properties.
 * { start: [ x, y, z ], end: [ x, y, z ] }
 */
declare class Line {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Draws a single line
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#drawline
     * @param inputs Contains a line to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawLine(inputs: Inputs.Line.DrawLineDto): LinesMesh;
    /**
     * Draws multiple lines
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#drawlines
     * @param inputs Contains a line to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawLines(inputs: Inputs.Line.DrawLinesDto): LinesMesh;
    /**
     * Converts a line to a NURBS line curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#converttonurbscurve
     * Returns the verbnurbs Line object
     * @link http://verbnurbs.com/docs/geom/Line/
     * @param inputs Line to be transformed to curve
     * @returns Verb nurbs curve
     */
    convertToNurbsCurve(inputs: Inputs.Line.LineDto): any;
    /**
     * Converts lines to a NURBS curves
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#convertlinestonurbscurves
     * Returns array of the verbnurbs Line objects
     * @link http://verbnurbs.com/docs/geom/Line/
     * @param inputs Lines to be transformed to curves
     * @returns Verb nurbs curves
     */
    convertLinesToNurbsCurves(inputs: Inputs.Line.LinesDto): any[];
    /**
     * Gets the start point of the line
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#getstartpoint
     * @param inputs Line to be queried
     * @returns Start point
     */
    getStartPoint(inputs: Inputs.Line.LineDto): number[];
    /**
     * Gets the end point of the line
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#getendpoint
     * @param inputs Line to be queried
     * @returns End point
     */
    getEndPoint(inputs: Inputs.Line.LineDto): number[];
    /**
     * Gets the length of the line
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#length
     * @param inputs Line to be queried
     * @returns Length of the line
     */
    length(inputs: Inputs.Line.LineDto): number;
    /**
     * Reverse the endpoints of the line
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#reverse
     * @param inputs Line to be reversed
     * @returns Reversed line
     */
    reverse(inputs: Inputs.Line.LineDto): Inputs.Line.LinePointsDto;
    /**
     * Transform the line
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#transformline
     * @param inputs Line to be transformed
     * @returns Transformed line
     */
    transformLine(inputs: Inputs.Line.TransformLineDto): Inputs.Line.LinePointsDto;
    /**
     * Create the line
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#create
     * @param inputs Endpoints of the line
     * @returns Line
     */
    create(inputs: Inputs.Line.LinePointsDto): Inputs.Line.LinePointsDto;
    /**
     * Create the line segments between all of the points in a list
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#linesbetweenpoints
     * @param inputs Lines in a list
     * @returns Lines
     */
    linesBetweenPoints(inputs: Inputs.Line.PointsLinesDto): Inputs.Line.LinePointsDto[];
    /**
     * Create the lines between two lists of start and end points of equal length
     * @link https://docs.bitbybit.dev/classes/bitbybit_line.line.html#linesbetweenstartandendpoints
     * @param inputs Two lists of start and end points
     * @returns Lines
     */
    linesBetweenStartAndEndPoints(inputs: Inputs.Line.LineStartEndPointsDto): Inputs.Line.LinePointsDto[];
    private createLineSystemMesh;
}/**
 * Nodes help understand the space and construct more complicated space structures. Nodes can be nested together
 * into child parent relationships to simplify the creation of 3D objects.
 */
declare class Node {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Draws a node of given size with given colours for every axis
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#drawnode
     * @param inputs Contains node data that includes size and colour information
     */
    drawNode(inputs: Inputs.Node.DrawNodeDto): void;
    /**
     * Draws a nodes of given size with given colours for every axis
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#drawnodes
     * @param inputs Contains node data that includes size and colour information
     */
    drawNodes(inputs: Inputs.Node.DrawNodesDto): void;
    /**
     * Creates a node on the origin with the given rotations in the parent coordinate system
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#createnodefromrotation
     * @param inputs Contains information for origin, rotation and parent node
     * @returns A new node
     */
    createNodeFromRotation(inputs: Inputs.Node.CreateNodeFromRotationDto): TransformNode;
    /**
     * Creates a world node which has root node as his parent
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#createworldnode
     * @returns A new node whos parent is the root node of the scene
     */
    createWorldNode(): TransformNode;
    /**
     * Gets the absolute forward facing vector in world space
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getabsoluteforwardvector
     * @param inputs Node from which to get the forward vector
     * @returns Vector as an array of numbers
     */
    getAbsoluteForwardVector(inputs: Inputs.Node.NodeDto): number[];
    /**
     * Gets the absolute right facing vector in world space
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getabsoluterightvector
     * @param inputs Node from which to get the right vector
     * @returns Vector as an array of numbers
     */
    getAbsoluteRightVector(inputs: Inputs.Node.NodeDto): number[];
    /**
     * Gets the absolute up facing vector in world space
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getabsoluteupvector
     * @param inputs Node from which to get the up vector
     * @returns Vector as an array of numbers
     */
    getAbsoluteUpVector(inputs: Inputs.Node.NodeDto): number[];
    /**
     * Gets the absolute position of the node as origin vector in world space
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getabsoluteposition
     * @param inputs Node from which to get the absolute position
     * @returns Vector as an array of numbers indicating location of origin in world space
     */
    getAbsolutePosition(inputs: Inputs.Node.NodeDto): number[];
    /**
     * Gets the absolute rotation of the node as a transformation matrix encoded in array of 16 numbers
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getabsoluterotationtransformation
     * @param inputs Node from which to get the rotation transformation
     * @returns Transformation as an array of 16 numbers
     */
    getAbsoluteRotationTransformation(inputs: Inputs.Node.NodeDto): number[];
    /**
     * Gets the rotation of the node in local parent coordinate space as a transformation matrix encoded in array of 16 numbers
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getrotationtransformation
     * @param inputs Node from which to get the rotation transformation
     * @returns Transformation as an array of 16 numbers
     */
    getRotationTransformation(inputs: Inputs.Node.NodeDto): number[];
    /**
     * Gets children of the node
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getchildren
     * @param inputs Node from which to get the children
     * @returns List of children nodes in the array
     */
    getChildren(inputs: Inputs.Node.NodeDto): BabylonNode[];
    /**
     * Gets parent of the node
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getparent
     * @param inputs Node from which to get a parent
     * @returns Parent node
     */
    getParent(inputs: Inputs.Node.NodeDto): BabylonNode;
    /**
     * Gets the position of the node expressed in local space
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getpositionexpressedinlocalspace
     * @param inputs Node from which to get the position in local space
     * @returns Position vector
     */
    getPositionExpressedInLocalSpace(inputs: Inputs.Node.NodeDto): number[];
    /**
     * Gets the root node
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getrootnode
     * @returns Root node
     */
    getRootNode(): TransformNode;
    /**
     * Gets the euler rotations
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#getrotation
     * @param inputs Node from which to get rotation
     * @returns Euler rotations of x, y and z angles in the number array
     */
    getRotation(inputs: Inputs.Node.NodeDto): number[];
    /**
     * Rotates the node around axis and given position by a given angle
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#rotatearoundaxiswithposition
     * @param inputs Rotation around axis information
     */
    rotateAroundAxisWithPosition(inputs: Inputs.Node.RotateAroundAxisNodeDto): void;
    /**
     * Rotates the node around the origin and given axis
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#rotate
     * @param inputs Rotation information
     */
    rotate(inputs: Inputs.Node.RotateNodeDto): void;
    /**
     * Sets the absolute position of the node
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#setabsoluteposition
     * @param inputs Node absolute position information
     */
    setAbsolutePosition(inputs: Inputs.Node.NodePositionDto): void;
    /**
     * Sets the direction of the node
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#setdirection
     * @param inputs Direction information
     */
    setDirection(inputs: Inputs.Node.NodeDirectionDto): void;
    /**
     * Sets the new parent to the node
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#setparent
     * @param inputs Node parent information
     */
    setParent(inputs: Inputs.Node.NodeParentDto): void;
    /**
     * Translates the node by a given direction vector and a distance
     * @link https://docs.bitbybit.dev/classes/bitbybit_node.node.html#translate
     * @param inputs Node translation information
     */
    translate(inputs: Inputs.Node.NodeTranslationDto): void;
}declare class OCCTBooleans {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Joins separate objects
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_booleans.occtbooleans.html#union
     * @param inputs Objects to join
     * @returns OpenCascade joined shape
     */
    union(inputs: Inputs.OCCT.UnionDto): Promise<any>;
    /**
     * Does boolean difference operation between a main shape and given shapes
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_booleans.occtbooleans.html#difference
     * @param inputs Main shape and shapes to differ
     * @returns OpenCascade difference shape
     */
    difference(inputs: Inputs.OCCT.DifferenceDto): Promise<any>;
    /**
     * Does boolean intersection operation between a main shape and given shapes
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_booleans.occtbooleans.html#difference
     * @param inputs Main shape and shapes to differ
     * @returns OpenCascade difference shape
     */
    intersection(inputs: Inputs.OCCT.IntersectionDto): Promise<any>;
}declare class OCCTIO {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Saves the step file
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_io.occtio.html#saveshapestep
     * @param inputs STEP filename and shape to be saved
     * @returns String of a step file
     */
    saveShapeSTEP(inputs: Inputs.OCCT.SaveStepDto): Promise<string>;
    /**
     * Imports the step or iges asset file
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_io.occtio.html#loadsteporiges
     * @returns OCCT Shape
     */
    loadSTEPorIGES(inputs: Inputs.OCCT.ImportStepIgesDto): Promise<any>;
}/**
 * Contains various methods for OpenCascade implementation
 * Much of the work is done by Johnathon Selstad and Sebastian Alff to port OCC to JavaScript
 * I'm super grateful for their work!
 */
declare class OCCT {
    readonly shapes: OCCTShapes;
    readonly transforms: OCCTTransforms;
    readonly operations: OCCTOperations;
    readonly booleans: OCCTBooleans;
    readonly io: OCCTIO;
    private readonly context;
    private readonly geometryHelper;
    private readonly solidText;
    private readonly vector;
    private readonly occWorkerManager;
    constructor(shapes: OCCTShapes, transforms: OCCTTransforms, operations: OCCTOperations, booleans: OCCTBooleans, io: OCCTIO, context: Context, geometryHelper: GeometryHelper, solidText: JSCADText, vector: Vector, occWorkerManager: OCCTWorkerManager);
    /**
     * Draws OpenCascade shape by going through faces and edges
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt.occt.html#drawshape
     * @param inputs Contains a shape to be drawn and additional information
     * @returns BabylonJS Mesh
     */
    drawShape(inputs: Inputs.OCCT.DrawShapeDto): Promise<Mesh>;
    private computeFaceMiddlePos;
    private computeEdgeMiddlePos;
}declare class OCCTOperations {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Lofts wires into a shell
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.occtoperations.html#loft
     * @param inputs Circle parameters
     * @returns Resulting loft shell
     */
    loft(inputs: Inputs.OCCT.LoftDto): Promise<any>;
    /**
     * Offset for various shapes
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.occtoperations.html#offset
     * @param inputs Shape to offset and distance with tolerance
     * @returns Resulting offset shape
     */
    offset(inputs: Inputs.OCCT.OffsetDto): Promise<any>;
    /**
     * Extrudes the face along direction
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.occtoperations.html#extrude
     * @param inputs Shape to extrude and direction parameter with tolerance
     * @returns Resulting extruded shape
     */
    extrude(inputs: Inputs.OCCT.ExtrudeDto): Promise<any>;
    /**
     * Revolves the shape around the given direction
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.occtoperations.html#revolve
     * @param inputs Revolve parameters
     * @returns Resulting revolved shape
     */
    revolve(inputs: Inputs.OCCT.RevolveDto): Promise<any>;
    /**
     * Rotated extrude that is perofrmed on the wire shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.occtoperations.html#rotatedextrude
     * @param inputs Rotated extrusion inputs
     * @returns OpenCascade shape
     */
    rotatedExtrude(inputs: Inputs.OCCT.RotationExtrudeDto): Promise<any>;
    /**
     * Pipe shapes along the wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.occtoperations.html#pipe
     * @param inputs Path wire and shapes along the path
     * @returns OpenCascade shape
     */
    pipe(inputs: Inputs.OCCT.PipeDto): Promise<any>;
    /**
     * Thickens the shape into a solid by an offset distance
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_operations.occtoperations.html#makethicksolidsimple
     * @param inputs OpenCascade shape
     * @returns OpenCascade solid shape
     */
    makeThickSolidSimple(inputs: Inputs.OCCT.ThisckSolidSimpleDto): Promise<any>;
}declare class OCCTCompound {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Makes the compound shape, which can include any kind of shapes
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_compound.occtcompound.html#makecompound
     * @param inputs OpenCascade shapes
     * @returns OpenCascade compounded shape
     */
    makeCompound(inputs: Inputs.OCCT.CompoundShapesDto): Promise<any>;
}declare class OCCTEdge {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Fillets OpenCascade Shapes
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.occtedge.html#filletedges
     * @param inputs Shape, radius and edge indexes to fillet
     * @returns OpenCascade shape with filleted edges
     */
    filletEdges(inputs: Inputs.OCCT.FilletDto): Promise<any>;
    /**
     * Chamfer OpenCascade Shape edges
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.occtedge.html#chamferedges
     * @param inputs Shape, distance and edge indexes to fillet
     * @returns OpenCascade shape with filleted edges
     */
    chamferEdges(inputs: Inputs.OCCT.ChamferDto): Promise<any>;
    /**
     * Removes internal faces for the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.occtedge.html#removeinternaledges
     * @param inputs Shape
     * @returns OpenCascade shape with no internal edges
     */
    removeInternalEdges(inputs: Inputs.OCCT.ShapeDto): Promise<any>;
    /**
     * Gets the edge by providing an index from the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_edge.occtedge.html#getedge
     * @param inputs Shape
     * @returns OpenCascade edge
     */
    getEdge(inputs: Inputs.OCCT.ShapeIndexDto): Promise<any>;
}declare class OCCTFace {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Creates a face from wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.occtface.html#createfacefromwire
     * @param inputs OpenCascade wire shape and indication if face should be planar
     * @returns OpenCascade face shape
     */
    createFaceFromWire(inputs: Inputs.OCCT.FaceFromWireDto): Promise<any>;
    /**
     * Creates OpenCascade Polygon face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.occtface.html#createpolygonface
     * @param inputs Polygon points
     * @returns OpenCascade polygon face
     */
    createPolygonFace(inputs: Inputs.OCCT.PolygonDto): Promise<any>;
    /**
     * Creates OpenCascade circle face
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.occtface.html#createcircleface
     * @param inputs Circle parameters
     * @returns OpenCascade circle face
     */
    createCircleFace(inputs: Inputs.OCCT.CircleDto): Promise<any>;
    /**
     * Gets the face by providing an index from the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_face.occtface.html#getface
     * @param inputs Shape
     * @returns OpenCascade face
     */
    getFace(inputs: Inputs.OCCT.ShapeIndexDto): Promise<any>;
}declare class OCCTShapes {
    readonly edge: OCCTEdge;
    readonly wire: OCCTWire;
    readonly face: OCCTFace;
    readonly solid: OCCTSolid;
    readonly compound: OCCTCompound;
    constructor(edge: OCCTEdge, wire: OCCTWire, face: OCCTFace, solid: OCCTSolid, compound: OCCTCompound);
}declare class OCCTSolid {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Creates OpenCascade Box
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.occtsolid.html#createbox
     * @param inputs Box size and center
     * @returns OpenCascade Box
     */
    createBox(inputs: Inputs.OCCT.BoxDto): Promise<any>;
    /**
     * Creates OpenCascade Cylinder
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.occtsolid.html#createcylinder
     * @param inputs Cylinder parameters
     * @returns OpenCascade Cylinder
     */
    createCylinder(inputs: Inputs.OCCT.CylinderDto): Promise<any>;
    /**
     * Creates OpenCascade Sphere
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.occtsolid.html#createsphere
     * @param inputs Sphere radius and center
     * @returns OpenCascade Sphere
     */
    createSphere(inputs: Inputs.OCCT.SphereDto): Promise<any>;
    /**
     * Creates OpenCascade Cone
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_solid.occtsolid.html#createcone
     * @param inputs Cone parameters
     * @returns OpenCascade cone shape
     */
    createCone(inputs: Inputs.OCCT.ConeDto): Promise<any>;
}declare class OCCTWire {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Creates OpenCascade Polygon wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.occtwire.html#createpolygonwire
     * @param inputs Polygon points
     * @returns OpenCascade polygon wire shape
     */
    createPolygonWire(inputs: Inputs.OCCT.PolygonDto): Promise<any>;
    /**
     * Creates OpenCascade BSPline wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.occtwire.html#createbspline
     * @param inputs Points through which to make BSpline
     * @returns OpenCascade BSpline wire
     */
    createBSpline(inputs: Inputs.OCCT.BSplineDto): Promise<any>;
    /**
     * Creates OpenCascade BSPline wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.occtwire.html#createbspline
     * @param inputs Points through which to make BSpline
     * @returns OpenCascade BSpline wire
     */
    /**
     * Creates OpenCascade Bezier wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.occtwire.html#createbezier
     * @param inputs Points through which to make bezier curve
     * @returns OpenCascade Bezier wire
     */
    createBezier(inputs: Inputs.OCCT.BezierDto): Promise<any>;
    /**
     * Creates OpenCascade circle wire
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.occtwire.html#createcirclewire
     * @param inputs Circle parameters
     * @returns OpenCascade circle wire
     */
    createCircleWire(inputs: Inputs.OCCT.CircleDto): Promise<any>;
    /**
     * Gets the wire by providing an index from the shape
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_shapes_wire.occtwire.html#getwire
     * @param inputs Shape
     * @returns OpenCascade wire
     */
    getWire(inputs: Inputs.OCCT.ShapeIndexDto): Promise<any>;
}declare class OCCTTransforms {
    private readonly occWorkerManager;
    constructor(occWorkerManager: OCCTWorkerManager);
    /**
     * Transforms the array of shapes
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.occttransforms.html#transform
     * @param inputs Transformation description
     * @returns OpenCascade shapes
     */
    transform(inputs: Inputs.OCCT.TransformDto): Promise<any>;
    /**
     * Rotate the shapes
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.occttransforms.html#rotate
     * @param inputs Rotation description
     * @returns OpenCascade shapes
     */
    rotate(inputs: Inputs.OCCT.RotateDto): Promise<any>;
    /**
     * Translates the shapes
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.occttransforms.html#translate
     * @param inputs Translation description
     * @returns OpenCascade shapes
     */
    translate(inputs: Inputs.OCCT.TranslateDto): Promise<any>;
    /**
     * Scales the shapes
     * @link https://docs.bitbybit.dev/classes/bitbybit_occt_transforms.occttransforms.html#scale
     * @param inputs Scale description
     * @returns OpenCascade shapes
     */
    scale(inputs: Inputs.OCCT.ScaleDto): Promise<any>;
}/**
 * Contains various methods for points. Point in bitbybit is simply an array containing 3 numbers for [x, y, z].
 * Because of this form Point can be interchanged with Vector, which also is an array in [x, y, z] form.
 * When creating 2D points, z coordinate is simply set to 0 - [x, y, 0].
 */
declare class Point {
    private readonly context;
    private readonly geometryHelper;
    private readonly line;
    constructor(context: Context, geometryHelper: GeometryHelper, line: Line);
    /**
     * Draws a single point
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#drawpoint
     * @param inputs Contains a point to be drawn
     * @returns Mesh that is being drawn by Babylon
     */
    drawPoint(inputs: Inputs.Point.DrawPointDto): Mesh;
    /**
     * Draws multiple points
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#drawpoints
     * @param inputs Contains a point array to be drawn
     * @returns Mesh that is being drawn by Babylon
     */
    drawPoints(inputs: Inputs.Point.DrawPointsDto): Mesh;
    /**
     * Transforms the single point
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#transformpoint
     * @param inputs Contains a point and the transformations to apply
     * @returns Transformed point
     */
    transformPoint(inputs: Inputs.Point.TransformPointDto): number[];
    /**
     * Transforms multiple points
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#transformpoints
     * @param inputs Contains points and the transformations to apply
     * @returns Transformed points
     */
    transformPoints(inputs: Inputs.Point.TransformPointsDto): number[][];
    /**
     * Measures the closest distance between a point and a collection of points
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#closestpointfrompointsdistance
     * @param inputs Point from which to measure and points to measure the distance against
     * @returns Distance to closest point
     */
    closestPointFromPointsDistance(inputs: Inputs.Point.ClosestPointFromPointsDto): number;
    /**
     * Finds the closest point index between a point and a collection of points. Caution, index is not 0 based, it starts with 1.
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#closestpointfrompointsindex
     * @param inputs Point from which to find the index in a collection of points
     * @returns Closest point index
     */
    closestPointFromPointsIndex(inputs: Inputs.Point.ClosestPointFromPointsDto): number;
    /**
     * Finds the closest point in a collection
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#closestpointfrompoints
     * @param inputs Point and points collection to find the closest point in
     * @returns Closest point
     */
    closestPointFromPoints(inputs: Inputs.Point.ClosestPointFromPointsDto): number[];
    /**
     * Finds the distance between two points
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#distance
     * @param inputs Coordinates of start and end points
     * @returns Distance
     */
    distance(inputs: Inputs.Point.StartEndPointsDto): number;
    /**
     * Multiply point by a specified amount
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#multiplypoint
     * @param inputs The point to be multiplied and the amount of points to create
     * @returns Distance
     */
    multiplyPoint(inputs: Inputs.Point.MultiplyPointDto): number[][];
    /**
     * Get x coordinate of the point
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#getx
     * @param inputs The point
     * @returns X coordinate
     */
    getX(inputs: Inputs.Point.PointDto): number;
    /**
     * Get y coordinate of the point
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#gety
     * @param inputs The point
     * @returns Y coordinate
     */
    getY(inputs: Inputs.Point.PointDto): number;
    /**
     * Get z coordinate of the point
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#getz
     * @param inputs The point
     * @returns Z coordinate
     */
    getZ(inputs: Inputs.Point.PointDto): number;
    /**
     * Creates the spiral out of multiple points
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#spiral
     * @param inputs Spiral information
     * @returns Specified number of points in the array along the spiral
     */
    spiral(inputs: Inputs.Point.SpiralDto): number[][];
    /**
     * Creates a flat point grid on XY plane. This grid contains center points for hexagons of the given radius.
     * Be aware that we control only the nr of hexagons to be made and not the length and width of the grid.
     * @link https://docs.bitbybit.dev/classes/bitbybit_point.point.html#hexgrid
     * @param inputs Information about hexagon and the grid
     * @returns Points in the array on the grid
     */
    hexGrid(inputs: Inputs.Point.HexGridCentersDto): number[][];
    private closestPointFromPointData;
    private createNewMesh;
    private updatePoints;
    private setUpPositionsAndColours;
}/**
 * Contains various methods for polyline. Polyline in bitbybit is a simple object that has points property containing an array of points.
 * { points: number[][] }
 */
declare class Polyline {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Draws a single polyline
     * @link https://docs.bitbybit.dev/classes/bitbybit_polyline.polyline.html#drawpolyline
     * @param inputs Contains a polyline to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawPolyline(inputs: Inputs.Polyline.DrawPolylineDto): LinesMesh;
    /**
     * Draws multiple polylines
     * @link https://docs.bitbybit.dev/classes/bitbybit_polyline.polyline.html#drawpolylines
     * @param inputs Contains a polyline to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawPolylines(inputs: Inputs.Polyline.DrawPolylinesDto): LinesMesh;
    /**
     * Converts a polyline to a NURBS curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_polyline.polyline.html#converttonurbscurve
     * Returns the verbnurbs NurbsCurve object
     * @link http://verbnurbs.com/docs/geom/NurbsCurve/
     * @param inputs Polyline to be transformed to curve
     * @returns Verb nurbs curve
     */
    convertToNurbsCurve(inputs: Inputs.Polyline.PolylineDto): any;
    /**
     * Gets the length of the polyline
     * @link https://docs.bitbybit.dev/classes/bitbybit_polyline.polyline.html#length
     * @param inputs Polyline to be queried
     * @returns Length of the polyline
     */
    length(inputs: Inputs.Polyline.PolylineDto): number;
    /**
     * Gets the number of points in the polyline
     * @link https://docs.bitbybit.dev/classes/bitbybit_polyline.polyline.html#countpoints
     * @param inputs Polyline to be queried
     * @returns Number of points in polyline
     */
    countPoints(inputs: Inputs.Polyline.PolylineDto): number;
    /**
     * Gets the points of the polyline
     * @link https://docs.bitbybit.dev/classes/bitbybit_polyline.polyline.html#getpoints
     * @param inputs Polyline to be queried
     * @returns Points of the polyline
     */
    getPoints(inputs: Inputs.Polyline.PolylineDto): number[][];
    /**
     * Reverse the points of the polyline
     * @link https://docs.bitbybit.dev/classes/bitbybit_polyline.polyline.html#reverse
     * @param inputs Polyline to be reversed
     * @returns Reversed polyline
     */
    reverse(inputs: Inputs.Polyline.PolylineDto): Inputs.Polyline.PolylinePropertiesDto;
    /**
     * Transform the polyline
     * @link https://docs.bitbybit.dev/classes/bitbybit_polyline.polyline.html#transformpolyline
     * @param inputs Polyline to be transformed
     * @returns Transformed polyline
     */
    transformPolyline(inputs: Inputs.Polyline.TransformPolylineDto): Inputs.Polyline.PolylinePropertiesDto;
    /**
     * Create the polyline
     * @link https://docs.bitbybit.dev/classes/bitbybit_polyline.polyline.html#create
     * @param inputs Points of the polyline
     * @returns Polyline
     */
    create(inputs: Inputs.Polyline.PolylinePropertiesDto): Inputs.Polyline.PolylinePropertiesDto;
}declare class Scene {
    private readonly context;
    constructor(context: Context);
    /**
     * Changes the scene background colour for 3D space
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#backgroundcolour
     * @param inputs Describes the colour of the scene background
     */
    backgroundColour(inputs: Inputs.Scene.SceneBackgroundColourDto): void;
    /**
     * Draws a grid mesh on the ground plane in 3D space. This helps to orient yourself in the world.
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#drawgridmesh
     * @param inputs Describes various parameters of the grid mesh like size, colour, etc.
     */
    drawGridMesh(inputs: Inputs.Scene.SceneDrawGridMeshDto): Mesh;
    /**
     * Creates and draws a point light in the scene
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#drawpointlight
     * @param inputs Describes the light source
     * @returns BabylonJS point light
     */
    drawPointLight(inputs: Inputs.Scene.PointLightDto): PointLight;
    /**
     * Adjusts the active arc rotate camera with configuration parameters
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#adjustactivearcrotatecamera
     */
    adjustActiveArcRotateCamera(inputs: Inputs.Scene.CameraConfigurationDto): void;
    /**
     * Clears all of the drawn objects in the 3D scene
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#clearalldrawn
     */
    clearAllDrawn(): void;
    /**
     * Creates mesh instance and transforms it for optimised rendering. These are optimised for max performance
     * when rendering many similar objects in the scene. If the mesh has children, then every child ges a mesh instance.
     * @link https://docs.bitbybit.dev/classes/bitbybit_scene.scene.html#createmeshinstanceandtransform
     */
    createMeshInstanceAndTransform(inputs: Inputs.Scene.MeshInstanceAndTransformDto): Promise<any>;
}/**
 * Tags help you to put text on top of your 3D objects. Tags are heavily used in data visualization scenarios
 * where you need to convery additional textual information.
 */
declare class Tag {
    /**
     * Creates a tag dto
     * @link https://docs.bitbybit.dev/classes/bitbybit_tag.tag.html#create
     * @param inputs Tag description
     * @returns A tag
     */
    create(inputs: Inputs.Tag.TagDto): Inputs.Tag.TagDto;
    /**
     * Draws a single tag
     * @link https://docs.bitbybit.dev/classes/bitbybit_tag.tag.html#drawtag
     * @param inputs Information to draw the tag
     * @returns A tag
     */
    drawTag(inputs: Inputs.Tag.DrawTagDto): Inputs.Tag.TagDto;
    /**
     * Draws multiple tags
     * @link https://docs.bitbybit.dev/classes/bitbybit_tag.tag.html#drawtags
     * @param inputs Information to draw the tags
     * @returns Tags
     */
    drawTags(inputs: Inputs.Tag.DrawTagsDto): Inputs.Tag.TagDto[];
}/**
 * Time functions help to create various interactions which happen in time
 */
declare class Time {
    /**
     * Registers a function to render loop
     * @link https://docs.bitbybit.dev/classes/bitbybit_time.time.html#registerrenderfunction
     * @param update The function to call in render loop
     */
    registerRenderFunction(update: (timePassedMs: number) => void): void;
}/**
 * Transformations help to move, scale, rotate and mirror objects. You can combine multiple transformations
 * for object to be placed exactly into position and orientation that you want.
 * Contains various methods for transformations that represent 4x4 matrixes in flat 16 number arrays.
 */
declare class Transforms {
    /**
     * Creates a rotation transformations around the center and an axis
     * @link https://docs.bitbybit.dev/classes/bitbybit_transforms.transforms.html#rotationcenteraxis
     * @param inputs Rotation around center with an axis information
     * @returns array of transformations
     */
    rotationCenterAxis(inputs: Inputs.Transforms.RotationCenterAxisDto): number[][];
    /**
     * Creates a rotation transformations around the center and an X axis
     * @link https://docs.bitbybit.dev/classes/bitbybit_transforms.transforms.html#rotationcenterx
     * @param inputs Rotation around center with an X axis information
     * @returns array of transformations
     */
    rotationCenterX(inputs: Inputs.Transforms.RotationCenterDto): number[][];
    /**
     * Creates a rotation transformations around the center and an Y axis
     * @link https://docs.bitbybit.dev/classes/bitbybit_transforms.transforms.html#rotationcentery
     * @param inputs Rotation around center with an Y axis information
     * @returns array of transformations
     */
    rotationCenterY(inputs: Inputs.Transforms.RotationCenterDto): number[][];
    /**
     * Creates a rotation transformations around the center and an Z axis
     * @link https://docs.bitbybit.dev/classes/bitbybit_transforms.transforms.html#rotationcenterz
     * @param inputs Rotation around center with an Z axis information
     * @returns array of transformations
     */
    rotationCenterZ(inputs: Inputs.Transforms.RotationCenterDto): number[][];
    /**
     * Creates a rotation transformations with yaw pitch and roll
     * @link https://docs.bitbybit.dev/classes/bitbybit_transforms.transforms.html#rotationcenteryawpitchroll
     * @param inputs Yaw pitch roll rotation information
     * @returns array of transformations
     */
    rotationCenterYawPitchRoll(inputs: Inputs.Transforms.RotationCenterYawPitchRollDto): number[][];
    /**
     * Scale transformation around center and xyz directions
     * @link https://docs.bitbybit.dev/classes/bitbybit_transforms.transforms.html#scalecenterxyz
     * @param inputs Scale center xyz trnansformation
     * @returns array of transformations
     */
    scaleCenterXYZ(inputs: Inputs.Transforms.ScaleCenterXYZDto): number[][];
    /**
     * Creates the scale transformation in x, y and z directions
     * @link https://docs.bitbybit.dev/classes/bitbybit_transforms.transforms.html#scalexyz
     * @param inputs Scale XYZ number array information
     * @returns transformation
     */
    scaleXYZ(inputs: Inputs.Transforms.ScaleXYZDto): number[][];
    /**
     * Creates uniform scale transformation
     * @link https://docs.bitbybit.dev/classes/bitbybit_transforms.transforms.html#uniformscale
     * @param inputs Scale Dto
     * @returns transformation
     */
    uniformScale(inputs: Inputs.Transforms.UniformScaleDto): number[][];
    /**
     * Creates uniform scale transformation from the center
     * @link https://docs.bitbybit.dev/classes/bitbybit_transforms.transforms.html#uniformscalefromcenter
     * @param inputs Scale Dto with center point information
     * @returns array of transformations
     */
    uniformScaleFromCenter(inputs: Inputs.Transforms.UniformScaleFromCenterDto): number[][];
    /**
     * Creates the translation transformation
     * @link https://docs.bitbybit.dev/classes/bitbybit_transforms.transforms.html#translationxyz
     * @param inputs Translation information
     * @returns transformation
     */
    translationXYZ(inputs: Inputs.Transforms.TranslationXYZDto): number[][];
}/**
 * Contains various methods for vector mathematics. Vector in bitbybit is simply an array, usually containing numbers.
 * In 3D [x, y, z] form describes space, where y is the up vector.
 * Because of this form Vector can be interchanged with Point, which also is an array in [x, y, z] form.
 */
declare class Vector {
    private readonly context;
    constructor(context: Context);
    /**
     * Measures the angle between two vectors in degrees
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#anglebetween
     * @param inputs Contains two vectors represented as number arrays
     * @returns Number in degrees
     */
    angleBetween(inputs: Inputs.Vector.TwoVectorsDto): number;
    /**
     * Measures the normalized 2d angle between two vectors in degrees
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#anglebetweennormalized2d
     * @param inputs Contains two vectors represented as number arrays
     * @returns Number in degrees
     */
    angleBetweenNormalized2d(inputs: Inputs.Vector.TwoVectorsDto): number;
    /**
     * Measures a positive angle between two vectors given the reference vector in degrees
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#positiveanglebetween
     * @param inputs Contains information of two vectors and a reference vector
     * @returns Number in degrees
     */
    positiveAngleBetween(inputs: Inputs.Vector.TwoVectorsReferenceDto): number;
    /**
     * Adds all vector xyz values together and create a new vector
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#addall
     * @param inputs Vectors to be added
     * @returns New vector that has xyz values as sums of all the vectors
     */
    addAll(inputs: Inputs.Vector.VectorsDto): number[];
    /**
     * Adds two vectors together
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#add
     * @param inputs Two vectors to be added
     * @returns Number array representing vector
     */
    add(inputs: Inputs.Vector.TwoVectorsDto): number[];
    /**
     * Checks if the boolean array contains only true values, if there's a single false it will return false.
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#all
     * @param inputs Vectors to be checked
     * @returns Boolean indicating if vector contains only true values
     */
    all(inputs: Inputs.Vector.VectorBoolDto): boolean;
    /**
     * Cross two vectors
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#cross
     * @param inputs Two vectors to be crossed
     * @returns Crossed vector
     */
    cross(inputs: Inputs.Vector.TwoVectorsDto): number[];
    /**
     * Squared distance between two vectors
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#distsquared
     * @param inputs Two vectors
     * @returns Number representing squared distance between two vectors
     */
    distSquared(inputs: Inputs.Vector.TwoVectorsDto): number;
    /**
     * Distance between two vectors
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#dist
     * @param inputs Two vectors
     * @returns Number representing distance between two vectors
     */
    dist(inputs: Inputs.Vector.TwoVectorsDto): number;
    /**
     * Divide the vector by a scalar value/
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#div
     * @param inputs Contains vector and a scalar
     * @returns Vector that is a result of division by a scalar
     */
    div(inputs: Inputs.Vector.VectorScalarDto): number[];
    /**
     * Computes the domain between minimum and maximum values of the vector
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#domain
     * @param inputs Vector information
     * @returns Number representing distance between two vectors
     */
    domain(inputs: Inputs.Vector.VectorDto): number;
    /**
     * Dot product between two vectors
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#dot
     * @param inputs Two vectors
     * @returns Number representing dot product of the vector
     */
    dot(inputs: Inputs.Vector.TwoVectorsDto): number;
    /**
     * Checks if vector is finite for each number and returns a boolean array
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#finite
     * @param inputs Vector with possibly infinite values
     * @returns Vector array that contains boolean values for each number in the input
     * vector that identifies if value is finite (true) or infinite (false)
     */
    finite(inputs: Inputs.Vector.VectorDto): boolean[];
    /**
     * Checks if the vector is zero length
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#iszero
     * @param inputs Vector to be checked
     * @returns Boolean that identifies if vector is zero length
     */
    isZero(inputs: Inputs.Vector.VectorDto): boolean;
    /**
     * Finds in between vector between two vectors by providing a fracture
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#lerp
     * @param inputs Information for finding vector between two vectors using a fraction
     * @returns Vector that is in between two vectors
     */
    lerp(inputs: Inputs.Vector.FractionTwoVectorsDto): number[];
    /**
     * Finds the maximum value in the vector
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#max
     * @param inputs Vector to be checked
     * @returns Largest number in the vector
     */
    max(inputs: Inputs.Vector.VectorDto): number;
    /**
     * Finds the minimum value in the vector
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#min
     * @param inputs Vector to be checked
     * @returns Lowest number in the vector
     */
    min(inputs: Inputs.Vector.VectorDto): number;
    /**
     * Multiple vector with the scalar
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#mul
     * @param inputs Vector with a scalar
     * @returns Vector that results from multiplication
     */
    mul(inputs: Inputs.Vector.VectorScalarDto): number[];
    /**
     * Negates the vector
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#neg
     * @param inputs Vector to negate
     * @returns Negative vector
     */
    neg(inputs: Inputs.Vector.VectorDto): number[];
    /**
     * Compute squared norm
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#normsquared
     * @param inputs Vector for squared norm
     * @returns Number that is squared norm
     */
    normSquared(inputs: Inputs.Vector.VectorDto): number;
    /**
     * Norm of the vector
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#norm
     * @param inputs Vector to compute the norm
     * @returns Number that is norm of the vector
     */
    norm(inputs: Inputs.Vector.VectorDto): number;
    /**
     * Normalize the vector into a unit vector, that has a length of 1
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#normalized
     * @param inputs Vector to normalize
     * @returns Unit vector that has length of 1
     */
    normalized(inputs: Inputs.Vector.VectorDto): number;
    /**
     * Finds a point coordinates on the given distance ray that spans between the point along the direction vector
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#onray
     * @param inputs Provide a point, vector and a distance for finding a point
     * @returns Vector representing point on the ray
     */
    onRay(inputs: Inputs.Vector.RayPointDto): number[];
    /**
     * Creates a vector of integers between 0 and maximum ceiling integer
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#range
     * @param inputs Max value for the range
     * @returns Vector containing items from 0 to max
     */
    range(inputs: Inputs.Vector.RangeMaxDto): number[];
    /**
     * Computes signed angle between two vectors and a reference. This will always return a smaller angle between two possible angles.
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#signedanglebetween
     * @param inputs Contains information of two vectors and a reference vector
     * @returns Signed angle in degrees
     */
    signedAngleBetween(inputs: Inputs.Vector.TwoVectorsReferenceDto): number;
    /**
     * Creates a vector that contains numbers spanning between minimum and maximum values at a given step
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#span
     * @param inputs Span information containing min, max and step values
     * @returns Vector containing number between min, max and increasing at a given step
     */
    span(inputs: Inputs.Vector.SpanDto): number[];
    /**
     * Subtract two vectors
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#sub
     * @param inputs Two vectors
     * @returns Vector that result by subtraction two vectors
     */
    sub(inputs: Inputs.Vector.TwoVectorsDto): number[];
    /**
     * Sums the values of the vector
     * @link https://docs.bitbybit.dev/classes/bitbybit_vector.vector.html#sum
     * @param inputs Vector to sum
     * @returns Number that results by adding up all values in the vector
     */
    sum(inputs: Inputs.Vector.VectorDto): number;
}/**
 * Contains various methods for nurbs circle.
 * These methods wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class VerbCurveCircle {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the circle Nurbs curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve_circle.verbcurvecircle.html#createcircle
     * @param inputs Circle parameters
     * @returns Circle Nurbs curve
     */
    createCircle(inputs: Inputs.Verb.CircleParametersDto): any;
    /**
     * Creates the arc Nurbs curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve_circle.verbcurvecircle.html#createarc
     * @param inputs Arc parameters
     * @returns Arc Nurbs curve
     */
    createArc(inputs: Inputs.Verb.ArcParametersDto): any;
    /**
     * Gets the center point of the circle or an arc
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve_circle.verbcurvecircle.html#center
     * @param inputs An arc or a circle Nurbs curve
     * @returns Point
     */
    center(inputs: Inputs.Verb.CircleDto): number[];
    /**
     * Gets the radius of the circle or an arc
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve_circle.verbcurvecircle.html#radius
     * @param inputs An arc or a circle Nurbs curve
     * @returns Radius
     */
    radius(inputs: Inputs.Verb.CircleDto): number;
    /**
     * Gets the max angle of the arc in degrees
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve_circle.verbcurvecircle.html#maxangle
     * @param inputs Arc
     * @returns Max angle in degrees
     */
    maxAngle(inputs: Inputs.Verb.CircleDto): number;
    /**
     * Gets the min angle of the arc in degrees
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve_circle.verbcurvecircle.html#minangle
     * @param inputs Arc
     * @returns Min angle in degrees
     */
    minAngle(inputs: Inputs.Verb.CircleDto): number;
    /**
     * Gets the x angle of the arc
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve_circle.verbcurvecircle.html#xaxis
     * @param inputs Circle
     * @returns X axis vector
     */
    xAxis(inputs: Inputs.Verb.CircleDto): number[];
    /**
     * Gets the y angle of the arc
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve_circle.verbcurvecircle.html#yaxis
     * @param inputs Circle
     * @returns Y axis vector
     */
    yAxis(inputs: Inputs.Verb.CircleDto): number[];
}/**
 * Contains various methods for nurbs ellipse.
 * These methods wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class VerbCurveEllipse {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the ellipse Nurbs curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve_ellipse.verbcurveellipse.html#createellipse
     * @param inputs Ellipse parameters
     * @returns Ellipse Nurbs curve
     */
    createEllipse(inputs: Inputs.Verb.EllipseParametersDto): any;
    /**
     * Creates the ellipse arc Nurbs curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve_ellipse.verbcurveellipse.html#createarc
     * @param inputs Ellipse arc parameters
     * @returns Ellipse arc Nurbs curve
     */
    createArc(inputs: Inputs.Verb.EllipseArcParametersDto): any;
    /**
     * Gets the center point of the ellipse or an arc
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve_ellipse.verbcurveellipse.html#center
     * @param inputs The arc or the ellipse Nurbs curve
     * @returns Point
     */
    center(inputs: Inputs.Verb.EllipseDto): number[];
    /**
     * Gets the max angle of the arc in degrees
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve_ellipse.verbcurveellipse.html#maxangle
     * @param inputs Arc
     * @returns Max angle in degrees
     */
    maxAngle(inputs: Inputs.Verb.EllipseDto): number;
    /**
     * Gets the min angle of the arc in degrees
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve_ellipse.verbcurveellipse.html#minangle
     * @param inputs Arc
     * @returns Min angle in degrees
     */
    minAngle(inputs: Inputs.Verb.EllipseDto): number;
    /**
     * Gets the x angle of the arc or an ellipse
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve_ellipse.verbcurveellipse.html#xaxis
     * @param inputs Ellipse or an arc
     * @returns X axis vector
     */
    xAxis(inputs: Inputs.Verb.EllipseDto): number[];
    /**
     * Gets the y angle of the arc or an ellipse
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve_ellipse.verbcurveellipse.html#yaxis
     * @param inputs Ellipse or an arc
     * @returns Y axis vector
     */
    yAxis(inputs: Inputs.Verb.EllipseDto): number[];
}/**
 * Contains various methods for nurbs curves.
 * These methods wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class VerbCurve {
    readonly circle: VerbCurveCircle;
    readonly ellipse: VerbCurveEllipse;
    private readonly context;
    private readonly geometryHelper;
    constructor(circle: VerbCurveCircle, ellipse: VerbCurveEllipse, context: Context, geometryHelper: GeometryHelper);
    /**
     * Draws a single curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#drawcurve
     * @param inputs Contains a curve to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawCurve(inputs: Inputs.Verb.DrawCurveDto): LinesMesh;
    /**
     * Draws multiple curves
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#drawcurves
     * @param inputs Contains curves to be drawn
     * @returns Lines mesh that is being drawn by Babylon
     */
    drawCurves(inputs: Inputs.Verb.DrawCurvesDto): LinesMesh;
    /**
     * Creates a Nurbs curve by providing knots, control points & weights
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#createcurvebyknotscontrolpointsweights
     * @param inputs Contains knots, control points and weights
     * @returns Nurbs curve
     */
    createCurveByKnotsControlPointsWeights(inputs: Inputs.Verb.CurveNurbsDataDto): any;
    /**
     * Creates a Nurbs curve by providing control points
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#createcurvebypoints
     * @param inputs Control points
     * @returns Nurbs curve
     */
    createCurveByPoints(inputs: Inputs.Verb.CurvePathDataDto): any;
    /**
     * Creates a Bezier Nurbs curve by providing control points and weights
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#createbeziercurve
     * @param inputs Control points
     * @returns Bezier Nurbs curve
     */
    createBezierCurve(inputs: Inputs.Verb.BezierCurveDto): any;
    /**
     * Clone the Nurbs curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#clone
     * @param inputs Nurbs curve
     * @returns Nurbs curve
     */
    clone(inputs: Inputs.Verb.CurveDto): any;
    /**
     * Finds the closest param on the Nurbs curve from the point
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#closestparam
     * @param inputs Nurbs curve with point
     * @returns Param number
     */
    closestParam(inputs: Inputs.Verb.ClosestPointDto): number;
    /**
     * Finds the closest params on the Nurbs curve from the points
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#closestparams
     * @param inputs Nurbs curve with points
     * @returns Param numbers
     */
    closestParams(inputs: Inputs.Verb.ClosestPointsDto): number[];
    /**
     * Finds the closest point on the Nurbs curve from the point
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#closestpoint
     * @param inputs Nurbs curve with point
     * @returns Point
     */
    closestPoint(inputs: Inputs.Verb.ClosestPointDto): number[];
    /**
     * Finds the closest points on the Nurbs curve from the list of points
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#closestpoints
     * @param inputs Nurbs curve with points
     * @returns Points
     */
    closestPoints(inputs: Inputs.Verb.ClosestPointsDto): number[][];
    /**
     * Finds the control points of the Nurbs curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#controlpoints
     * @param inputs Nurbs curve
     * @returns Points
     */
    controlPoints(inputs: Inputs.Verb.CurveDto): number[][];
    /**
     * Finds the degree of the Nurbs curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#degree
     * @param inputs Nurbs curve
     * @returns Degree number
     */
    degree(inputs: Inputs.Verb.CurveDto): number;
    /**
     * Finds the derivatives of the Nurbs curve at parameter
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#derivatives
     * @param inputs Nurbs curve with specified derivative number and parameter
     * @returns Derivatives
     */
    derivatives(inputs: Inputs.Verb.CurveDerivativesDto): number[];
    /**
     * Divides the curve by equal arc length to parameters
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#dividebyequalarclengthtoparams
     * @param inputs Nurbs curve
     * @returns Parameters
     */
    divideByEqualArcLengthToParams(inputs: Inputs.Verb.CurveSubdivisionsDto): number[];
    /**
     * Divides the curve by equal arc length to points
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#dividebyequalarclengthtopoints
     * @param inputs Nurbs curve
     * @returns Points
     */
    divideByEqualArcLengthToPoints(inputs: Inputs.Verb.CurveSubdivisionsDto): number[][];
    /**
     * Divides the curve by arc length to parameters
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#dividebyarclengthtoparams
     * @param inputs Nurbs curve
     * @returns Parameters
     */
    divideByArcLengthToParams(inputs: Inputs.Verb.CurveDivideLengthDto): number[];
    /**
     * Divides the curve by arc length to points
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#dividebyarclengthtopoints
     * @param inputs Nurbs curve
     * @returns Points
     */
    divideByArcLengthToPoints(inputs: Inputs.Verb.CurveDivideLengthDto): number[][];
    /**
     * Divides multiple curves by equal arc length to points
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#dividecurvesbyequalarclengthtopoints
     * @param inputs Nurbs curves
     * @returns Points placed for each curve in separate arrays
     */
    divideCurvesByEqualArcLengthToPoints(inputs: Inputs.Verb.CurvesSubdivisionsDto): number[][][];
    /**
     * Divides multiple curves by arc length to points
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#dividecurvesbyarclengthtopoints
     * @param inputs Nurbs curves
     * @returns Points placed for each curve in separate arrays
     */
    divideCurvesByArcLengthToPoints(inputs: Inputs.Verb.CurvesDivideLengthDto): number[][][];
    /**
     * Finds the domain interval of the curve parameters
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#domain
     * @param inputs Nurbs curve
     * @returns Interval domain
     */
    domain(inputs: Inputs.Verb.CurveDto): BaseTypes.IntervalDto;
    /**
     * Start point of the curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#startpoint
     * @param inputs Nurbs curve
     * @returns Start point
     */
    startPoint(inputs: Inputs.Verb.CurveDto): number[];
    /**
     * End point of the curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#endpoint
     * @param inputs Nurbs curve
     * @returns End point
     */
    endPoint(inputs: Inputs.Verb.CurveDto): number[];
    /**
     * Start points of the curves
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#startpoints
     * @param inputs Nurbs curves
     * @returns Start points
     */
    startPoints(inputs: Inputs.Verb.CurvesDto): number[][];
    /**
     * End points of the curves
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#endpoints
     * @param inputs Nurbs curves
     * @returns End points
     */
    endPoints(inputs: Inputs.Verb.CurvesDto): number[][];
    /**
     * Finds the knots of the Nurbs curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#knots
     * @param inputs Nurbs curve
     * @returns Knots
     */
    knots(inputs: Inputs.Verb.CurveDto): number[];
    /**
     * Gets the length of the Nurbs curve at specific parameter
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#lengthatparam
     * @param inputs Nurbs curve and parameter
     * @returns Length
     */
    lengthAtParam(inputs: Inputs.Verb.CurveParameterDto): number;
    /**
     * Gets the length of the Nurbs curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#length
     * @param inputs Nurbs curve
     * @returns Length
     */
    length(inputs: Inputs.Verb.CurveDto): number;
    /**
     * Gets the param at specified length on the Nurbs curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#paramatlength
     * @param inputs Nurbs curve, length and tolerance
     * @returns Parameter
     */
    paramAtLength(inputs: Inputs.Verb.CurveLengthToleranceDto): number;
    /**
     * Gets the point at specified parameter on the Nurbs curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#pointAtParam
     * @param inputs Nurbs curve and a parameter
     * @returns Point
     */
    pointAtParam(inputs: Inputs.Verb.CurveParameterDto): number[];
    /**
     * Gets the points at specified parameter on the Nurbs curves
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#pointAtParam
     * @param inputs Nurbs curves and a parameter
     * @returns Points in arrays for each curve
     */
    pointsAtParam(inputs: Inputs.Verb.CurvesParameterDto): number[][];
    /**
     * Reverses the Nurbs curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#reverse
     * @param inputs Nurbs curve
     * @returns Reversed Nurbs curve
     */
    reverse(inputs: Inputs.Verb.CurveDto): any;
    /**
     * Splits the Nurbs curve in two at a given parameter
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#split
     * @param inputs Nurbs curve with parameter
     * @returns Nurbs curves
     */
    split(inputs: Inputs.Verb.CurveParameterDto): any[];
    /**
     * Tangent of the Nurbs curve at a given parameter
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#tangent
     * @param inputs Nurbs curve with parameter
     * @returns Tangent vector
     */
    tangent(inputs: Inputs.Verb.CurveParameterDto): number[];
    /**
     * Tessellates the Nurbs curve into a list of points
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#tessellate
     * @param inputs Nurbs curve with tolerance
     * @returns Points
     */
    tessellate(inputs: Inputs.Verb.CurveToleranceDto): number[][];
    /**
     * Transforms the Nurbs curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#transform
     * @param inputs Nurbs curve with transformation matrixes
     * @returns Transformed curve
     */
    transform(inputs: Inputs.Verb.CurveTransformDto): any;
    /**
     * Transforms the Nurbs curves
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#transformcurves
     * @param inputs Nurbs curves with transformation matrixes
     * @returns Transformed curves
     */
    transformCurves(inputs: Inputs.Verb.CurvesTransformDto): any[];
    /**
     * Weights of the Nurbs curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_curve.verbcurve.html#weights
     * @param inputs Nurbs curve
     * @returns Weights
     */
    weights(inputs: Inputs.Verb.CurveDto): number[];
}/**
 * Functions that allow to intersect various geometric entities and get the results
 */
declare class VerbIntersect {
    private readonly context;
    private readonly geometryHelper;
    constructor(context: Context, geometryHelper: GeometryHelper);
    /**
     * Intersects two verb Nurbs curves together and returns intersection results
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_intersect.verbintersect.html#curves
     * @param inputs Two Nurbs curves
     * @returns Intersection results
     */
    curves(inputs: Inputs.Verb.CurveCurveDto): BaseTypes.CurveCurveIntersection[];
    /**
     * Intersects curve and surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_intersect.verbintersect.html#curveAndSurface
     * @param inputs Nurbs curve and a Nurbs surface
     * @returns Intersection results
     */
    curveAndSurface(inputs: Inputs.Verb.CurveSurfaceDto): BaseTypes.CurveSurfaceIntersection[];
    /**
     * Intersects two surfaces
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_intersect.verbintersect.html#surfaces
     * @param inputs Nurbs curve and a Nurbs surface
     * @returns Nurbs curves along the intersection
     */
    surfaces(inputs: Inputs.Verb.SurfaceSurfaceDto): any[];
    /**
     * Gets intersection parameters on the first curve from curve-curve intersection
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_intersect.verbintersect.html#curvecurvefirstparams
     * @param inputs Intersections data
     * @returns Parameters on first curve
     */
    curveCurveFirstParams(inputs: Inputs.Verb.CurveCurveIntersectionsDto): number[];
    /**
     * Gets intersection parameters on the second curve from curve-curve intersection
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_intersect.verbintersect.html#curvecurvesecondparams
     * @param inputs Intersections data
     * @returns Parameters on second curve
     */
    curveCurveSecondParams(inputs: Inputs.Verb.CurveCurveIntersectionsDto): number[];
    /**
     * Gets intersection points on the first curve from curve-curve intersection
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_intersect.verbintersect.html#curvecurvefirstpoints
     * @param inputs Intersections data
     * @returns Points on first curve
     */
    curveCurveFirstPoints(inputs: Inputs.Verb.CurveCurveIntersectionsDto): number[][];
    /**
     * Gets intersection points on the second curve from curve-curve intersection
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_intersect.verbintersect.html#curvecurvesecondpoints
     * @param inputs Intersections data
     * @returns Points on second curve
     */
    curveCurveSecondPoints(inputs: Inputs.Verb.CurveCurveIntersectionsDto): number[][];
    /**
     * Gets intersection parameters on the curve from curve-surface intersection
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_intersect.verbintersect.html#curvesurfacecurveparams
     * @param inputs Intersections data
     * @returns Parameters on the curve
     */
    curveSurfaceCurveParams(inputs: Inputs.Verb.CurveSurfaceIntersectionsDto): number[];
    /**
     * Gets intersection parameters on the surface from curve-surface intersection
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_intersect.verbintersect.html#curvesurfacesurfaceparams
     * @param inputs Intersections data
     * @returns Parameters on the surface
     */
    curveSurfaceSurfaceParams(inputs: Inputs.Verb.CurveSurfaceIntersectionsDto): BaseTypes.UVDto[];
    /**
     * Gets intersection points on the curve from curve-surface intersection
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_intersect.verbintersect.html#curvesurfacecurvepoints
     * @param inputs Intersections data
     * @returns Points on the curve
     */
    curveSurfaceCurvePoints(inputs: Inputs.Verb.CurveSurfaceIntersectionsDto): number[][];
    /**
     * Gets intersection points on the surface from curve-surface intersection
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_intersect.verbintersect.html#curvesurfacesurfacepoints
     * @param inputs Intersections data
     * @returns Points on the surface
     */
    curveSurfaceSurfacePoints(inputs: Inputs.Verb.CurveSurfaceIntersectionsDto): number[][];
}/**
 * Conical surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class VerbSurfaceConical {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the conical Nurbs surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_conical.verbsurfaceconical.html#create
     * @param inputs Parameters for Nurbs conical surface
     * @returns Conical Nurbs surface
     */
    create(inputs: Inputs.Verb.ConeAndCylinderParametersDto): any;
    /**
     * Get cone axis
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_conical.verbsurfaceconical.html#axis
     * @param inputs Nurbs conical surface
     * @returns Axis vector
     */
    axis(inputs: Inputs.Verb.ConeDto): number[];
    /**
     * Get cone base
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_conical.verbsurfaceconical.html#base
     * @param inputs Nurbs conical surface
     * @returns Base point
     */
    base(inputs: Inputs.Verb.ConeDto): number[];
    /**
     * Get cone height
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_conical.verbsurfaceconical.html#height
     * @param inputs Nurbs conical surface
     * @returns Height
     */
    height(inputs: Inputs.Verb.ConeDto): number;
    /**
     * Get cone radius
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_conical.verbsurfaceconical.html#radius
     * @param inputs Nurbs conical surface
     * @returns Radius
     */
    radius(inputs: Inputs.Verb.ConeDto): number;
    /**
     * Get cone x axis
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_conical.verbsurfaceconical.html#xaxis
     * @param inputs Nurbs conical surface
     * @returns X axis vector
     */
    xAxis(inputs: Inputs.Verb.ConeDto): number[];
}/**
 * Cylindrical surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class VerbSurfaceCylindrical {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the cylindrical Nurbs surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_cylindrical.verbsurfacecylindrical.html#create
     * @param inputs Parameters for cylindrical Nurbs surface
     * @returns Cylindrical Nurbs surface
     */
    create(inputs: Inputs.Verb.ConeAndCylinderParametersDto): any;
    /**
     * Get cylinder axis
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_cylindrical.verbsurfacecylindrical.html#axis
     * @param inputs Nurbs cylindrical surface
     * @returns Axis vector
     */
    axis(inputs: Inputs.Verb.CylinderDto): number[];
    /**
     * Get cylinder base
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_cylindrical.verbsurfacecylindrical.html#base
     * @param inputs Nurbs cylindrical surface
     * @returns Base point
     */
    base(inputs: Inputs.Verb.CylinderDto): number[];
    /**
     * Get cylinder height
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_cylindrical.verbsurfacecylindrical.html#height
     * @param inputs Nurbs cylindrical surface
     * @returns Height
     */
    height(inputs: Inputs.Verb.CylinderDto): number;
    /**
     * Get cylinder radius
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_cylindrical.verbsurfacecylindrical.html#radius
     * @param inputs Nurbs cylindrical surface
     * @returns Radius
     */
    radius(inputs: Inputs.Verb.CylinderDto): number;
    /**
     * Get cylinder x axis
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_cylindrical.verbsurfacecylindrical.html#xaxis
     * @param inputs Nurbs cylindrical surface
     * @returns X axis vector
     */
    xAxis(inputs: Inputs.Verb.CylinderDto): number[];
}/**
 * Extrusion surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class VerbSurfaceExtrusion {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the Nurbs surface extrusion from the curve
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_extrusion.verbsurfaceextrusion.html#create
     * @param inputs Nurbs profile curve and direction vector
     * @returns Nurbs surface
     */
    create(inputs: Inputs.Verb.ExtrusionParametersDto): any;
    /**
     * Gets the direction vector of the extrusion
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_extrusion.verbsurfaceextrusion.html#direction
     * @param inputs Extruded Nurbs surface
     * @returns Vector
     */
    direction(inputs: Inputs.Verb.ExtrusionDto): number[];
    /**
     * Gets the profile Nurbs curve of the extrusion
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_extrusion.verbsurfaceextrusion.html#profile
     * @param inputs Extruded Nurbs surface
     * @returns Profile Nurbs curve
     */
    profile(inputs: Inputs.Verb.ExtrusionDto): number[];
}/**
 * Revolved surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class VerbSurfaceRevolved {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the revolved Nurbs surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_revolved.verbsurfacerevolved.html#create
     * @param inputs Parameters for Nurbs revolved surface
     * @returns Revolved Nurbs surface
     */
    create(inputs: Inputs.Verb.RevolutionParametersDto): any;
    /**
     * Get the profile Nurbs curve of the revolved Nurbs surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_revolved.verbsurfacerevolved.html#profile
     * @param inputs Revolved Nurbs surface
     * @returns Nurbs curve
     */
    profile(inputs: Inputs.Verb.RevolutionDto): any;
    /**
     * Get the center Nurbs curve of the revolved Nurbs surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_revolved.verbsurfacerevolved.html#center
     * @param inputs Revolved Nurbs surface
     * @returns Center point
     */
    center(inputs: Inputs.Verb.RevolutionDto): number[];
    /**
     * Get the rotation axis of the revolved Nurbs surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_revolved.verbsurfacerevolved.html#axis
     * @param inputs Revolved Nurbs surface
     * @returns Axis vector of rotation
     */
    axis(inputs: Inputs.Verb.RevolutionDto): number[];
    /**
     * Get the angle of rotation from revolved Nurbs surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_revolved.verbsurfacerevolved.html#angle
     * @param inputs Revolved Nurbs surface
     * @returns Angle in degrees
     */
    angle(inputs: Inputs.Verb.RevolutionDto): number;
}/**
 * Spherical surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class VerbSurfaceSpherical {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the spherical Nurbs surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_spherical.verbsurfacespherical.html#create
     * @param inputs Parameters for Nurbs spherical surface
     * @returns Spherical Nurbs surface
     */
    create(inputs: Inputs.Verb.SphericalParametersDto): any;
    /**
     * Get the radius of the spherical Nurbs surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_spherical.verbsurfacespherical.html#radius
     * @param inputs Spherical Nurbs surface
     * @returns Radius
     */
    radius(inputs: Inputs.Verb.SphereDto): number;
    /**
     * Get the center of the spherical Nurbs surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_spherical.verbsurfacespherical.html#center
     * @param inputs Spherical Nurbs surface
     * @returns Center point
     */
    center(inputs: Inputs.Verb.SphereDto): number[];
}/**
 * Sweep surface functions.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class VerbSurfaceSweep {
    private readonly context;
    constructor(context: Context);
    /**
     * Creates the sweep Nurbs surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_sweep.verbsurfacesweep.html#create
     * @param inputs Parameters for Nurbs sweep surface
     * @returns Sweep Nurbs surface
     */
    create(inputs: Inputs.Verb.SweepParametersDto): any;
    /**
     * Get the profile Nurbs curve of the swept Nurbs surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_sweep.verbsurfacesweep.html#profile
     * @param inputs Sweep Nurbs surface
     * @returns Profile Nurbs curve
     */
    profile(inputs: Inputs.Verb.SweepDto): any;
    /**
     * Get the rail Nurbs curve of the swept Nurbs surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface_sweep.verbsurfacesweep.html#rail
     * @param inputs Sweep Nurbs surface
     * @returns Rail Nurbs curve
     */
    rail(inputs: Inputs.Verb.SweepDto): any;
}/**
 * Contains various functions for Nurbs surfaces.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class VerbSurface {
    readonly cone: VerbSurfaceConical;
    readonly cylinder: VerbSurfaceCylindrical;
    readonly extrusion: VerbSurfaceExtrusion;
    readonly sphere: VerbSurfaceSpherical;
    readonly revolved: VerbSurfaceRevolved;
    readonly sweep: VerbSurfaceSweep;
    private readonly context;
    private readonly geometryHelper;
    constructor(cone: VerbSurfaceConical, cylinder: VerbSurfaceCylindrical, extrusion: VerbSurfaceExtrusion, sphere: VerbSurfaceSpherical, revolved: VerbSurfaceRevolved, sweep: VerbSurfaceSweep, context: Context, geometryHelper: GeometryHelper);
    /**
     * Draws a single surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#drawsurface
     * @param inputs Contains a surface and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSurface(inputs: Inputs.Verb.DrawSurfaceDto): Mesh;
    /**
     * Draws multiple surfaces
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#drawsurfaces
     * @param inputs Contains the Nurbs surfaces and information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSurfaces(inputs: Inputs.Verb.DrawSurfacesDto): Mesh;
    /**
     * Draws multiple surfaces with multiple colours. Number of colours has to be equal to number of surfaces
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#drawsurfacesmulticolour
     * @param inputs Contains the Nurbs surfaces, colours and other information for drawing
     * @returns Mesh that is being drawn by Babylon
     */
    drawSurfacesMultiColour(inputs: Inputs.Verb.DrawSurfacesColoursDto): Mesh;
    /**
     * Gets the boundary edge Nurbs curves of the surface in a list
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#boundaries
     * @param inputs Nurbs surface
     * @returns Array of curves
     */
    boundaries(inputs: Inputs.Verb.SurfaceDto): any[];
    /**
     * Creates the surface by providing 4 points as corners
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#createsurfacebycorners
     * @param inputs 4 points
     * @returns Nurbs surface
     */
    createSurfaceByCorners(inputs: Inputs.Verb.CornersDto): any;
    /**
     * Creates the Nurbs surface by providing uv knots, uv degrees, points and weights
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#createsurfacebyknotscontrolpointsweights
     * @param inputs Surface creation information
     * @returns Nurbs surface
     */
    createSurfaceByKnotsControlPointsWeights(inputs: Inputs.Verb.KnotsControlPointsWeightsDto): any;
    /**
     * Creates the Nurbs surface by lofting curves
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#createsurfacebyloftingcurves
     * @param inputs Curves to loft through
     * @returns Nurbs surface
     */
    createSurfaceByLoftingCurves(inputs: Inputs.Verb.LoftCurvesDto): any;
    /**
     * Clone the Nurbs surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#clone
     * @param inputs Nurbs surface
     * @returns Nurbs surface
     */
    clone(inputs: Inputs.Verb.SurfaceDto): any;
    /**
     * Finds the closest parameter on the surface from the point
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#closestparam
     * @param inputs Nurbs surface with a point
     * @returns UV parameters
     */
    closestParam(inputs: Inputs.Verb.SurfaceParamDto): BaseTypes.UVDto;
    /**
     * Finds the closest point on the surface from the point
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#closestpoint
     * @param inputs Nurbs surface with a point
     * @returns Point
     */
    closestPoint(inputs: Inputs.Verb.SurfaceParamDto): number[];
    /**
     * Gets the control points on the surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#controlpoints
     * @param inputs Nurbs surface
     * @returns Two dimensional array of points
     */
    controlPoints(inputs: Inputs.Verb.SurfaceDto): number[][][];
    /**
     * Gets the U degree of the surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#degreeu
     * @param inputs Nurbs surface
     * @returns U degree
     */
    degreeU(inputs: Inputs.Verb.SurfaceDto): number;
    /**
     * Gets the V degree of the surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#degreev
     * @param inputs Nurbs surface
     * @returns V degree
     */
    degreeV(inputs: Inputs.Verb.SurfaceDto): number;
    /**
     * Gets the derivatives of the surface at specified uv coordinate
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#derivatives
     * @param inputs Nurbs surface
     * @returns Two dimensional array of vectors
     */
    derivatives(inputs: Inputs.Verb.DerivativesDto): number[][][];
    /**
     * Gets the U domain of the surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#domainu
     * @param inputs Nurbs surface
     * @returns U domain as interval
     */
    domainU(inputs: Inputs.Verb.SurfaceDto): BaseTypes.IntervalDto;
    /**
     * Gets the V domain of the surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#domainv
     * @param inputs Nurbs surface
     * @returns V domain as interval
     */
    domainV(inputs: Inputs.Verb.SurfaceDto): BaseTypes.IntervalDto;
    /**
     * Gets the Nurbs isocurve on the surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#isocurve
     * @param inputs Nurbs surface
     * @returns Nurbs curve
     */
    isocurve(inputs: Inputs.Verb.SurfaceParameterDto): any;
    /**
     * Subdivides surface into preferred number of isocurves
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#isocurvesubdivision
     * @param inputs Nurbs surface
     * @returns Nurbs curves
     */
    isocurvesSubdivision(inputs: Inputs.Verb.IsocurveSubdivisionDto): any[];
    /**
     * Subdivides surface into isocurves on specified array of parameters
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#isocurvesatparams
     * @param inputs Nurbs surface
     * @returns Nurbs curves
     */
    isocurvesAtParams(inputs: Inputs.Verb.IsocurvesParametersDto): any[];
    /**
     * Gets the U knots of the surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#knotsu
     * @param inputs Nurbs surface
     * @returns Knots on u direction
     */
    knotsU(inputs: Inputs.Verb.SurfaceDto): number[];
    /**
     * Gets the V knots of the surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#knotsv
     * @param inputs Nurbs surface
     * @returns Knots on v direction
     */
    knotsV(inputs: Inputs.Verb.SurfaceDto): number[];
    /**
     * Gets the normal on the surface at uv coordinate
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#normal
     * @param inputs Nurbs surface
     * @returns Normal vector
     */
    normal(inputs: Inputs.Verb.SurfaceLocationDto): number[];
    /**
     * Gets the point on the surface at uv coordinate
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#point
     * @param inputs Nurbs surface
     * @returns Point
     */
    point(inputs: Inputs.Verb.SurfaceLocationDto): number[];
    /**
     * Reverse the Nurbs surface. This will reverse the UV origin and isocurve directions
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#reverse
     * @param inputs Nurbs surface
     * @returns Nurbs surface
     */
    reverse(inputs: Inputs.Verb.SurfaceDto): any;
    /**
     * Splits the Nurbs surface in two halfs.
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#split
     * @param inputs Nurbs surface
     * @returns Two Nurbs surfaces
     */
    split(inputs: Inputs.Verb.SurfaceParameterDto): any[];
    /**
     * Transforms the Nurbs surface with a given list of transformations.
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#transformsurface
     * @param inputs Nurbs surface with transforms
     * @returns Nurbs surface
     */
    transformSurface(inputs: Inputs.Verb.SurfaceTransformDto): any;
    /**
     * Gets the weights of the surface
     * @link https://docs.bitbybit.dev/classes/bitbybit_verb_surface.verbsurface.html#weights
     * @param inputs Nurbs surface
     * @returns Two dimensional array of weights
     */
    weights(inputs: Inputs.Verb.SurfaceDto): number[][];
    private parseFaces;
}/**
 * Contains various functions for Nurbs curves and surfaces.
 * These functions wrap around Verbnurbs library that you can find here http://verbnurbs.com/.
 * Thanks Peter Boyer for his work.
 */
declare class Verb {
    readonly curve: VerbCurve;
    readonly surface: VerbSurface;
    readonly intersect: VerbIntersect;
    constructor(curve: VerbCurve, surface: VerbSurface, intersect: VerbIntersect);
}`;
