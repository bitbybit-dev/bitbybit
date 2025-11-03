import { Inputs } from "@bitbybit-dev/occt";
import { OCCTWorkerManager } from "../../../occ-worker/occ-worker-manager";

export class OCCTSolid {

    constructor(
        private readonly occWorkerManager: OCCTWorkerManager,
    ) {
    }

    /**
     * Creates Solid From shell that must be closed
     * @param inputs Closed shell to make into solid
     * @returns OpenCascade Solid
     * @group from
     * @shortname solid from closed shell
     * @drawable true
     */
    fromClosedShell(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShellPointer>): Promise<Inputs.OCCT.TopoDSSolidPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.fromClosedShell", inputs);
    }

    /**
     * Creates OpenCascade Box
     * @param inputs Box size and center
     * @returns OpenCascade Box
     * @group primitives
     * @shortname box
     * @drawable true
     */
    createBox(inputs: Inputs.OCCT.BoxDto): Promise<Inputs.OCCT.TopoDSSolidPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.createBox", inputs);
    }

    /**
     * Creates OpenCascade Cube
     * @param inputs Cube size and center
     * @returns OpenCascade Cube
     * @group primitives
     * @shortname cube
     * @drawable true
     */
    createCube(inputs: Inputs.OCCT.CubeDto): Promise<Inputs.OCCT.TopoDSSolidPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.createCube", inputs);
    }

    /**
     * Creates OpenCascade Box from corner
     * @param inputs Box size and corner coordinates
     * @returns OpenCascade Box
     * @group primitives
     * @shortname box corner
     * @drawable true
     */
    createBoxFromCorner(inputs: Inputs.OCCT.BoxFromCornerDto): Promise<Inputs.OCCT.TopoDSSolidPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.createBoxFromCorner", inputs);
    }

    /**
     * Creates OpenCascade Cylinder
     * @param inputs Cylinder parameters
     * @returns OpenCascade Cylinder
     * @group primitives
     * @shortname cylinder
     * @drawable true
     */
    createCylinder(inputs: Inputs.OCCT.CylinderDto): Promise<Inputs.OCCT.TopoDSSolidPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.createCylinder", inputs);
    }

    /**
     * Creates OpenCascade Cylinders on simple bit by bit lines represented by two points
     * @param inputs Cylinder parameters
     * @returns OpenCascade Cylinder
     * @group primitives
     * @shortname cylinders on lines
     * @drawable true
     */
    createCylindersOnLines(inputs: Inputs.OCCT.CylindersOnLinesDto): Promise<Inputs.OCCT.TopoDSSolidPointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.createCylindersOnLines", inputs);
    }

    /**
     * Creates OpenCascade Sphere
     * @param inputs Sphere radius and center
     * @returns OpenCascade Sphere
     * @group primitives
     * @shortname sphere
     * @drawable true
     */
    createSphere(inputs: Inputs.OCCT.SphereDto): Promise<Inputs.OCCT.TopoDSSolidPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.createSphere", inputs);
    }

    /**
     * Creates OpenCascade Cone
     * @param inputs Cone parameters
     * @returns OpenCascade cone shape
     * @group primitives
     * @shortname cone
     * @drawable true
     */
    createCone(inputs: Inputs.OCCT.ConeDto): Promise<Inputs.OCCT.TopoDSSolidPointer> {
        inputs.angle = inputs.angle * (Math.PI / 180);
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.createCone", inputs);
    }

    /**
     * Creates OpenCascade star solid
     * @param inputs Star solid parameters
     * @returns OpenCascade star solid
     * @group primitives
     * @shortname star
     * @drawable true
     */
    createStarSolid(inputs: Inputs.OCCT.StarSolidDto): Promise<Inputs.OCCT.TopoDSSolidPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.createStarSolid", inputs);
    }

    /**
     * Creates OpenCascade n-gon solid
     * @param inputs N-gon solid parameters
     * @returns OpenCascade n-gon solid
     * @group primitives
     * @shortname n-gon
     * @drawable true
     */
    createNGonSolid(inputs: Inputs.OCCT.NGonSolidDto): Promise<Inputs.OCCT.TopoDSSolidPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.createNGonSolid", inputs);
    }

    /**
     * Creates OpenCascade parallelogram solid
     * @param inputs Parallelogram solid parameters
     * @returns OpenCascade parallelogram solid
     * @group primitives
     * @shortname parallelogram
     * @drawable true
     */
    createParallelogramSolid(inputs: Inputs.OCCT.ParallelogramSolidDto): Promise<Inputs.OCCT.TopoDSSolidPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.createParallelogramSolid", inputs);
    }

    /**
     * Creates OpenCascade heart solid
     * @param inputs Heart solid parameters
     * @returns OpenCascade heart solid
     * @group primitives
     * @shortname heart
     * @drawable true
     */
    createHeartSolid(inputs: Inputs.OCCT.HeartSolidDto): Promise<Inputs.OCCT.TopoDSSolidPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.createHeartSolid", inputs);
    }

    /**
     * Creates OpenCascade christmas tree solid
     * @param inputs Christmas tree solid parameters
     * @returns OpenCascade christmas tree solid
     * @group primitives
     * @shortname christmas tree
     * @drawable true
     */
    createChristmasTreeSolid(inputs: Inputs.OCCT.ChristmasTreeSolidDto): Promise<Inputs.OCCT.TopoDSSolidPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.createChristmasTreeSolid", inputs);
    }

    /**
     * Creates OpenCascade L-polygon solid
     * @param inputs L-polygon solid parameters
     * @returns OpenCascade L-polygon solid
     * @group primitives
     * @shortname L-polygon
     * @drawable true
     */
    createLPolygonSolid(inputs: Inputs.OCCT.LPolygonSolidDto): Promise<Inputs.OCCT.TopoDSSolidPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.createLPolygonSolid", inputs);
    }

    /**
     * Creates OpenCascade I-beam profile solid
     * @param inputs I-beam profile solid parameters
     * @returns OpenCascade I-beam profile solid
     * @group beam
     * @shortname I-beam profile
     * @drawable true
     */
    createIBeamProfileSolid(inputs: Inputs.OCCT.IBeamProfileSolidDto): Promise<Inputs.OCCT.TopoDSSolidPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.createIBeamProfileSolid", inputs);
    }

    /**
     * Creates OpenCascade H-beam profile solid
     * @param inputs H-beam profile solid parameters
     * @returns OpenCascade H-beam profile solid
     * @group beam
     * @shortname H-beam profile
     * @drawable true
     */
    createHBeamProfileSolid(inputs: Inputs.OCCT.HBeamProfileSolidDto): Promise<Inputs.OCCT.TopoDSSolidPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.createHBeamProfileSolid", inputs);
    }

    /**
     * Creates OpenCascade T-beam profile solid
     * @param inputs T-beam profile solid parameters
     * @returns OpenCascade T-beam profile solid
     * @group beam
     * @shortname T-beam profile
     * @drawable true
     */
    createTBeamProfileSolid(inputs: Inputs.OCCT.TBeamProfileSolidDto): Promise<Inputs.OCCT.TopoDSSolidPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.createTBeamProfileSolid", inputs);
    }

    /**
     * Creates OpenCascade U-beam profile solid
     * @param inputs U-beam profile solid parameters
     * @returns OpenCascade U-beam profile solid
     * @group beam
     * @shortname U-beam profile
     * @drawable true
     */
    createUBeamProfileSolid(inputs: Inputs.OCCT.UBeamProfileSolidDto): Promise<Inputs.OCCT.TopoDSSolidPointer> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.createUBeamProfileSolid", inputs);
    }

    /**
     * Get solid surface area
     * @param inputs Closed solid shape
     * @returns Surface area
     * @group get
     * @shortname area
     * @drawable false
     */
    getSolidSurfaceArea(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<number> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.getSolidSurfaceArea", inputs);
    }

    /**
    * Get solid volume
    * @param inputs Closed solid shape
    * @returns volume
    * @group get
    * @shortname volume
    * @drawable false
    */
    getSolidVolume(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<number> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.getSolidVolume", inputs);
    }

    /**
    * Get solids volumes
    * @param inputs Closed solid shapes
    * @returns volumes
    * @group get
    * @shortname volumes
    * @drawable false
    */
    getSolidsVolumes(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<number[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.getSolidsVolumes", inputs);
    }

    /**
    * Get solid center of mass
    * @param inputs Closed solid shape
    * @returns center of mass point
    * @group get
    * @shortname center of mass
    * @drawable true
    */
    getSolidCenterOfMass(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<Inputs.Base.Point3> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.getSolidCenterOfMass", inputs);
    }

    /**
     * Get centers of mass of solids
     * @param inputs Closed solid shapes
     * @returns Points indicating centers of mass
    * @group get
    * @shortname centers of mass
    * @drawable true
     */
    getSolidsCentersOfMass(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.getSolidsCentersOfMass", inputs);
    }

    /**
     * Gets the solids of the shape in a list
     * @param inputs Shape
     * @returns OpenCascade solids array
     * @group get
     * @shortname solids
     * @drawable true
     */
    getSolids(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.TopoDSSolidPointer[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.getSolids", inputs);
    }

    /**
     * Filters collection of points based on relationship with the solid. You can choose whether to output in, on or out points.
     * @param inputs OpenCascade solid and collection of points with options
     * @returns filtered points
     * @group filter
     * @shortname filter solid points
     * @drawable true
     */
    filterSolidPoints(inputs: Inputs.OCCT.FilterSolidPointsDto<Inputs.OCCT.TopoDSSolidPointer>): Promise<Inputs.Base.Point3[]> {
        return this.occWorkerManager.genericCallToWorkerPromise("shapes.solid.filterSolidPoints", inputs);
    }
}
