import { OCCTWorkerManager } from "../../occ-worker/occ-worker-manager";
import { OCCTShapes } from "./shapes/shapes";
import { OCCTTransforms } from "./transforms";
import { OCCTOperations } from "./operations";
import { OCCTBooleans } from "./booleans";
import { OCCTIO } from "./io";
import { OCCTGeom } from "./geom/geom";
import { OCCTAssembly } from "./assembly/assembly";
import { OCCTBrepGraph } from "./brep-graph";
import { OCCTCorners } from "./corners";
import { OCCTDraft } from "./draft";
import { OCCTFillets } from "./fillets";
import { Inputs } from "@bitbybit-dev/occt";
import { OCCTShapeFix } from "./shape-fix";
import { OCCTDimensions } from "./dimensions";
import { OCCTPath } from "./path";
import { OCCTSVG } from "./svg";

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
    public readonly assembly: OCCTAssembly;
    public readonly brepGraph: OCCTBrepGraph;
    public readonly corners: OCCTCorners;
    public readonly draft: OCCTDraft;
    public io: OCCTIO;
    public readonly path: OCCTPath;
    public readonly svg: OCCTSVG;

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
        this.assembly = new OCCTAssembly(occWorkerManager);
        this.brepGraph = new OCCTBrepGraph(occWorkerManager);
        this.corners = new OCCTCorners(occWorkerManager);
        this.draft = new OCCTDraft(occWorkerManager);
        this.io = new OCCTIO(occWorkerManager);
        this.path = new OCCTPath(occWorkerManager);
        this.svg = new OCCTSVG(occWorkerManager);
    }

    /**
     * Creates polygon points from the shape faces
     * @param inputs shape
     * @group convert
     * @shortname faces to polygon points
     * @drawable false
     */
    async shapeFacesToPolygonPoints(inputs: Inputs.OCCT.ShapeFacesToPolygonPointsDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.Base.Point3[][]> {
        return await this.occWorkerManager.genericCallToWorkerPromise("shapeFacesToPolygonPoints", inputs);
    }

    /**
     * Creates mesh from the shape
     * @param inputs shape
     * @group convert
     * @shortname shape to mesh
     * @drawable false
     */
    async shapeToMesh(inputs: Inputs.OCCT.ShapeToMeshDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.DecomposedMeshDto> {
        return await this.occWorkerManager.genericCallToWorkerPromise("shapeToMesh", inputs);
    }

    /**
     * Creates mesh from the shape
     * @param inputs shape
     * @group convert
     * @shortname shape to mesh
     * @drawable false
     */
    async shapesToMeshes(inputs: Inputs.OCCT.ShapesToMeshesDto<Inputs.OCCT.TopoDSShapePointer>): Promise<Inputs.OCCT.DecomposedMeshDto[]> {
        return await this.occWorkerManager.genericCallToWorkerPromise("shapesToMeshes", inputs);
    }

    /**
     * Meshes an XCAF document's free (top-level) shapes as one combined mesh, resolving per-face colours
     * into the colorGroups map of the output.
     * @param inputs document
     * @ignore true
     */
    async docToMesh(inputs: Inputs.OCCT.DocToMeshDto<Inputs.OCCT.TDocStdDocumentPointer>): Promise<Inputs.OCCT.DecomposedMeshDto> {
        return await this.occWorkerManager.genericCallToWorkerPromise("docToMesh", inputs);
    }

    /**
     * Meshes an XCAF document's free (top-level) shapes into separate meshes (one per shape), resolving
     * per-face colours into each output's colorGroups map.
     * @param inputs document
     * @ignore true
     */
    async docToMeshes(inputs: Inputs.OCCT.DocToMeshesDto<Inputs.OCCT.TDocStdDocumentPointer>): Promise<Inputs.OCCT.DecomposedMeshDto[]> {
        return await this.occWorkerManager.genericCallToWorkerPromise("docToMeshes", inputs);
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
