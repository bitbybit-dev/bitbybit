import { BitbybitOcctModule, Handle_TDocStd_Document, TopoDS_Shape } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "./api/inputs";
import { OCCTBooleans } from "./services/booleans";
import { OCCTGeom } from "./services/geom/geom";
import { OCCTIO } from "./services/io";
import { OCCTOperations } from "./services/operations";
import { OCCTShapes } from "./services/shapes/shapes";
import { OCCTTransforms } from "./services/transforms";
import { OCCTFillets } from "./services/fillets";
import { OCCTDimensions } from "./services/dimensions";
import { OCCTAssembly } from "./services/assembly/assembly";
import { OCCTBrepGraph } from "./services/brep-graph/brep-graph";
import { OCCTCorners } from "./services/corners/corners";
import { OCCTDraft } from "./services/draft/draft";
import { OccHelper } from "./occ-helper";
import { OCCTShapeFix } from "./services/shape-fix";
import { OCCTPath } from "./services/path";
import { OCCTSVG } from "./services/svg";

/**
 * Contains various methods for OpenCascade implementation
 */
export class OCCTService {
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
    public readonly io: OCCTIO;
    public readonly path: OCCTPath;
    public readonly svg: OCCTSVG;
    public plugins?: { dependencies: { [key: string]: unknown }, [key: string]: unknown };

    constructor(
        occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
        this.shapes = new OCCTShapes(occ, och);
        this.geom = new OCCTGeom(occ, och);
        this.fillets = new OCCTFillets(occ, och);
        this.transforms = new OCCTTransforms(occ, och);
        this.operations = new OCCTOperations(occ, och);
        this.booleans = new OCCTBooleans(occ, och);
        this.dimensions = new OCCTDimensions(occ, och);
        this.shapeFix = new OCCTShapeFix(occ, och);
        this.assembly = new OCCTAssembly(occ, och);
        this.brepGraph = new OCCTBrepGraph(occ, och);
        this.corners = new OCCTCorners(occ, och);
        this.draft = new OCCTDraft(occ, och);
        this.io = new OCCTIO(occ, och);
        this.path = new OCCTPath(occ, och);
        this.svg = new OCCTSVG(occ, och);
    }

    /**
     * Creates polygon points from the shape faces
     * @param inputs shape
     * @group convert
     * @shortname faces to polygon points
     * @drawable false
     */
    shapeFacesToPolygonPoints(inputs: Inputs.OCCT.ShapeFacesToPolygonPointsDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        return this.och.meshingService.shapeFacesToPolygonPoints(inputs);
    }

    /**
     * Creates mesh from the shape
     * @param inputs shape
     * @group convert
     * @shortname shape to mesh
     * @drawable false
     */
    shapeToMesh(inputs: Inputs.OCCT.ShapeToMeshDto<TopoDS_Shape>): Inputs.OCCT.DecomposedMeshDto {
        return this.och.meshingService.shapeToMesh(inputs);
    }

    /**
     * Creates mesh from the shape
     * @param inputs shape
     * @group convert
     * @shortname shape to mesh
     * @drawable false
     */
    shapesToMeshes(inputs: Inputs.OCCT.ShapesToMeshesDto<TopoDS_Shape>): Inputs.OCCT.DecomposedMeshDto[] {
        return this.och.meshingService.shapesToMeshes(inputs);
    }

    /**
     * Meshes an XCAF document's free (top-level) shapes as one combined mesh, resolving per-face colours
     * into the colorGroups map of the output.
     * @param inputs document
     * @ignore true
     */
    docToMesh(inputs: Inputs.OCCT.DocToMeshDto<Handle_TDocStd_Document>): Inputs.OCCT.DecomposedMeshDto {
        return this.och.meshingService.docToMesh(inputs);
    }

    /**
     * Meshes an XCAF document's free (top-level) shapes into separate meshes (one per shape), resolving
     * per-face colours into each output's colorGroups map.
     * @param inputs document
     * @ignore true
     */
    docToMeshes(inputs: Inputs.OCCT.DocToMeshesDto<Handle_TDocStd_Document>): Inputs.OCCT.DecomposedMeshDto[] {
        return this.och.meshingService.docToMeshes(inputs);
    }


}
