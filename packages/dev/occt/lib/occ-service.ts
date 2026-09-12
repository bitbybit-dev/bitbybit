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
 * The entry point to the OpenCascade kernel: every OCCT feature is reached through one of its
 * properties. `shapes` builds and reads vertices, edges, wires, faces, shells, solids and
 * compounds; `operations`, `booleans`, `fillets`, `transforms`, `corners` and `draft` change
 * shapes; `geom` handles curves and surfaces; `io` reads and writes STEP, IGES, STL and other
 * files; `assembly`, `dimensions`, `brepGraph`, `path` and `svg` cover documents, annotations,
 * topology graphs, machining paths and SVG. The methods on the service itself turn shapes into
 * triangle meshes for drawing.
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
     * Triangulates a shape and returns every triangle as three points, in one flat list over all
     * faces.
     *
     * `precision` is the meshing tolerance in model units: smaller values follow curved surfaces
     * more closely and give more triangles. `adjustYtoZ` swaps the Y and Z axes for tools that
     * treat Z as up, and `reversedPoints` flips the winding of each triangle.
     * @param inputs - The shape, the meshing precision and the axis and winding options
     * @returns One list of three points per triangle
     * @group convert
     * @shortname faces to polygon points
     * @drawable false
     * @example
     * ```typescript
     * const triangles = await bitbybit.occt.shapeFacesToPolygonPoints({ shape: sphere, precision: 0.01, adjustYtoZ: false, reversedPoints: false });
     * ```
     */
    shapeFacesToPolygonPoints(inputs: Inputs.OCCT.ShapeFacesToPolygonPointsDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        return this.och.meshingService.shapeFacesToPolygonPoints(inputs);
    }

    /**
     * Triangulates a shape into a mesh for drawing: one entry per face with its vertices, normals,
     * UVs and triangle indexes, one per edge with its points, and the vertex points.
     *
     * `precision` is the meshing tolerance in model units; smaller values follow curved surfaces
     * more closely and cost more triangles. `adjustYtoZ` swaps Y and Z. A null shape gives empty
     * lists.
     * @param inputs - The shape, the meshing precision and the options
     * @returns The mesh as face, edge and point lists
     * @group convert
     * @shortname shape to mesh
     * @drawable false
     * @example
     * ```typescript
     * const mesh = await bitbybit.occt.shapeToMesh({ shape: sphere, precision: 0.01, adjustYtoZ: false });
     * console.log(mesh.faceList.length, mesh.edgeList.length);
     * ```
     */
    shapeToMesh(inputs: Inputs.OCCT.ShapeToMeshDto<TopoDS_Shape>): Inputs.OCCT.DecomposedMeshDto {
        return this.och.meshingService.shapeToMesh(inputs);
    }

    /**
     * Triangulates several shapes with the same settings, as `shapeToMesh` does for one.
     * @param inputs - The shapes, the meshing precision and the options
     * @returns One mesh per shape, in the same order
     * @group convert
     * @shortname shape to mesh
     * @drawable false
     * @example
     * ```typescript
     * const meshes = await bitbybit.occt.shapesToMeshes({ shapes: [box, sphere], precision: 0.01, adjustYtoZ: false });
     * ```
     */
    shapesToMeshes(inputs: Inputs.OCCT.ShapesToMeshesDto<TopoDS_Shape>): Inputs.OCCT.DecomposedMeshDto[] {
        return this.och.meshingService.shapesToMeshes(inputs);
    }

    /**
     * Triangulates the top-level shapes of an assembly document into one combined mesh, with the
     * face colors of the document collected into the mesh's color groups.
     * @param inputs - The document and the meshing options
     * @returns The combined mesh
     * @ignore true
     */
    docToMesh(inputs: Inputs.OCCT.DocToMeshDto<Handle_TDocStd_Document>): Inputs.OCCT.DecomposedMeshDto {
        return this.och.meshingService.docToMesh(inputs);
    }

    /**
     * Triangulates the top-level shapes of an assembly document into one mesh per shape, with the
     * face colors of the document collected into each mesh's color groups.
     * @param inputs - The document and the meshing options
     * @returns One mesh per top-level shape
     * @ignore true
     */
    docToMeshes(inputs: Inputs.OCCT.DocToMeshesDto<Handle_TDocStd_Document>): Inputs.OCCT.DecomposedMeshDto[] {
        return this.och.meshingService.docToMeshes(inputs);
    }


}
