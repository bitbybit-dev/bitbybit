import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";
import { OCCTShapes } from "./shapes/shapes";
import { OCCTTransforms } from "./transforms";
import { OCCTOperations } from "./operations";
import { OCCTBooleans } from "./booleans";
import { OCCTIO } from "./io";
import { OCCTGeom } from "./geom/geom";
// import { OCCTAssembly } from './assembly/assembly';
import { OCCTFillets } from "./fillets";
import { Inputs } from "@bitbybit-dev/occt";
import { OCCTShapeFix } from "./shape-fix";
import { OCCTDimensions } from "./dimensions";

/**
 * Contains various methods for OpenCascade implementation
 */
export class OCCT {
    public readonly shapes: OCCTShapes;
    public readonly geom: OCCTGeom;
    public readonly fillets: OCCTFillets;
    public readonly transforms: OCCTTransforms;
    public readonly operations: OCCTOperations;
    public readonly booleans: OCCTBooleans;
    public readonly dimensions: OCCTDimensions;
    public readonly shapeFix: OCCTShapeFix;
    public io: OCCTIO;

    constructor(
        public readonly occWorkerManager: OCCTWorkerManager,
    ) {
        this.shapes = new OCCTShapes(occWorkerManager);
        this.geom = new OCCTGeom(occWorkerManager);
        this.transforms = new OCCTTransforms(occWorkerManager);
        this.operations = new OCCTOperations(occWorkerManager);
        this.booleans = new OCCTBooleans(occWorkerManager);
        this.fillets = new OCCTFillets(occWorkerManager);
        this.shapeFix = new OCCTShapeFix(occWorkerManager);
        this.dimensions = new OCCTDimensions(occWorkerManager);
        this.io = new OCCTIO(occWorkerManager);
    }

    /**
     * Creates mesh from the shape
     * @param inputs shape
     * @group drawing
     * @shortname shape to mesh
     * @drawable false
     * @ignore true
     */
    async shapeToMesh(inputs: Inputs.OCCT.ShapeToMeshDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.DecomposedMeshDto> {
        return await this.occWorkerManager.genericCallToWorkerPromise("shapeToMesh", inputs);
    }

    /**
     * Creates mesh from the shape
     * @param inputs shape
     * @group drawing
     * @shortname shape to mesh
     * @drawable false
     * @ignore true
     */
    async shapesToMeshes(inputs: Inputs.OCCT.ShapesToMeshesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.DecomposedMeshDto[]> {
        return await this.occWorkerManager.genericCallToWorkerPromise("shapesToMeshes", inputs);
    }

    /**
     * Deletes shape from the cache to keep memory usage low
     * @param inputs shape
     * @group memory
     * @shortname delete shape
     */
    async deleteShape(inputs: Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void> {
        return await this.occWorkerManager.genericCallToWorkerPromise("deleteShape", inputs);
    }

    /**
     * Deletes shapes from the cache to keep memory usage low
     * @param inputs shape
     * @group memory
     * @shortname delete shapes
     */
    async deleteShapes(inputs: Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<void> {
        return await this.occWorkerManager.genericCallToWorkerPromise("deleteShapes", inputs);
    }
    /**
     * Cleans all cache and all shapes from the memory
     * @param inputs shape
     * @group memory
     * @shortname clean all cache
     */
    async cleanAllCache(): Promise<void> {
        return await this.occWorkerManager.genericCallToWorkerPromise("cleanAllCache", {});
    }
}
