import type { BitbybitOcctModule, Handle_TDocStd_Document, TopoDS_Shape } from "../bitbybit-dev-occt/bitbybit-dev-occt";
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
import { OCCTSelect } from "./services/select/select";
import { OCCTAnalysis } from "./services/analysis/analysis";
import { OCCTFeatures } from "./services/features/features";
import type { OccHelper } from "./occ-helper";
import { OCCTShapeFix } from "./services/shape-fix";
import { OCCTPath } from "./services/path";
import { OCCTSVG } from "./services/svg";
import { OCCTSketch } from "./services/sketch/sketch";
import { OCCTDesign } from "./services/design/design";
import { resolveDto } from "@bitbybit-dev/base";
import type * as Resolved from "./api/resolved-inputs";

/**
 * The entry point to the OpenCascade kernel: every OCCT feature is reached through one of its
 * properties. `shapes` builds and reads vertices, edges, wires, faces, shells, solids and
 * compounds; `operations`, `booleans`, `fillets`, `transforms`, `corners`, `draft` and `features`
 * change shapes; `select` picks faces and edges by what they are and where they lie; `analysis`
 * measures shapes; `geom` handles curves and surfaces; `io` reads and writes STEP, IGES, STL and
 * other files; `sketch` draws flat outlines with a pen; `design` builds models kept as data;
 * `assembly`, `dimensions`, `brepGraph`, `path` and `svg` cover documents, annotations, topology
 * graphs, machining paths and SVG. The methods on the service itself turn shapes into triangle
 * meshes for drawing.
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
    public readonly features: OCCTFeatures;
    public readonly select: OCCTSelect;
    public readonly analysis: OCCTAnalysis;
    public readonly io: OCCTIO;
    public readonly path: OCCTPath;
    public readonly sketch: OCCTSketch;
    public readonly svg: OCCTSVG;
    /** Experimental: parametric parts and assemblies kept as data, whose format may still change. @beta */
    public readonly design: OCCTDesign;
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
        this.features = new OCCTFeatures(occ, och);
        this.select = new OCCTSelect(occ);
        this.analysis = new OCCTAnalysis(occ, och);
        this.io = new OCCTIO(occ, och);
        this.path = new OCCTPath(occ, och);
        this.sketch = new OCCTSketch(occ, och, this.shapes, this.operations, this.booleans);
        this.svg = new OCCTSVG(occ, och);
        this.design = new OCCTDesign(occ, () => this, och.base);
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
        const resolved = resolveDto(Inputs.OCCT.ShapeFacesToPolygonPointsDto, inputs) as Resolved.OCCT.ShapeFacesToPolygonPointsDto<TopoDS_Shape>;
        return this.och.meshingService.shapeFacesToPolygonPoints(resolved);
    }

    /**
     * Triangulates a shape into a mesh for drawing: one entry per face with its vertices, normals,
     * UVs and triangle indexes, one per edge with its points, and the vertex points.
     *
     * `precision` is the meshing tolerance in model units. `isoCurvesU` and `isoCurvesV` add each
     * face's iso curves as polylines, and `surfaceAnalysis` a value per vertex. A null shape gives
     * empty lists.
     * @param inputs - The shape, the meshing precision and the options
     * @returns The mesh as face, edge and point lists, with iso curves and analysis values when asked for
     * @group convert
     * @shortname shape to mesh
     * @drawable false
     * @example
     * ```typescript
     * const mesh = await bitbybit.occt.shapeToMesh({ shape: sphere, precision: 0.01, isoCurvesU: 4, isoCurvesV: 4, surfaceAnalysis: Bit.Inputs.OCCT.surfaceAnalysisEnum.gaussian });
     * console.log(mesh.isoCurveList?.length, mesh.faceList[0]?.analysisValues);
     * ```
     */
    shapeToMesh(inputs: Inputs.OCCT.ShapeToMeshDto<TopoDS_Shape>): Inputs.OCCT.DecomposedMeshDto {
        const resolved = resolveDto(Inputs.OCCT.ShapeToMeshDto, inputs) as Resolved.OCCT.ShapeToMeshDto<TopoDS_Shape>;
        return this.och.meshingService.shapeToMesh(resolved);
    }

    /**
     * Meshes a shape into one indexed triangle mesh whose faces share vertices where they meet, the
     * form `manifold.shapes.manifoldFromMesh` takes, so an OCCT solid can carry on as a Manifold
     * solid.
     *
     * Vertices are shared through the shape's own edges, not by matching coordinates, so a closed
     * solid gives a closed mesh. `precision` is the meshing tolerance.
     * @param inputs - The shape and the meshing precision
     * @returns The mesh: three numbers per vertex and three vertex indexes per triangle
     * @group convert
     * @shortname shape to manifold mesh
     * @drawable false
     * @example
     * ```typescript
     * const mesh = await bitbybit.occt.shapeToManifoldMesh({ shape: solid, precision: 0.01 });
     * const manifold = await bitbybit.manifold.manifold.shapes.manifoldFromMesh({ mesh });
     * ```
     */
    shapeToManifoldMesh(inputs: Inputs.OCCT.ShapeToManifoldMeshDto<TopoDS_Shape>): Inputs.OCCT.DecomposedManifoldMeshDto {
        const resolved = resolveDto(Inputs.OCCT.ShapeToManifoldMeshDto, inputs) as Resolved.OCCT.ShapeToManifoldMeshDto<TopoDS_Shape>;
        return this.och.meshingService.shapeToManifoldMesh(resolved);
    }

    /**
     * Triangulates several shapes with the same settings, as `shapeToMesh` does for one, iso curves
     * and surface analysis included.
     * @param inputs - The shapes, the meshing precision and the options
     * @returns One mesh per shape, in the same order
     * @group convert
     * @shortname shape to mesh
     * @drawable false
     * @example
     * ```typescript
     * const meshes = await bitbybit.occt.shapesToMeshes({ shapes: [box, sphere], precision: 0.01, isoCurvesU: 2, isoCurvesV: 2 });
     * ```
     */
    shapesToMeshes(inputs: Inputs.OCCT.ShapesToMeshesDto<TopoDS_Shape>): Inputs.OCCT.DecomposedMeshDto[] {
        const resolved = resolveDto(Inputs.OCCT.ShapesToMeshesDto, inputs) as Resolved.OCCT.ShapesToMeshesDto<TopoDS_Shape>;
        return this.och.meshingService.shapesToMeshes(resolved);
    }

    /**
     * Triangulates the top-level shapes of an assembly document into one combined mesh, with the
     * face colors of the document collected into the mesh's color groups.
     * @param inputs - The document and the meshing options
     * @returns The combined mesh
     * @ignore true
     */
    docToMesh(inputs: Inputs.OCCT.DocToMeshDto<Handle_TDocStd_Document>): Inputs.OCCT.DecomposedMeshDto {
        const resolved = resolveDto(Inputs.OCCT.DocToMeshDto, inputs) as Resolved.OCCT.DocToMeshDto<Handle_TDocStd_Document>;
        return this.och.meshingService.docToMesh(resolved);
    }

    /**
     * Triangulates the top-level shapes of an assembly document into one mesh per shape, with the
     * face colors of the document collected into each mesh's color groups.
     * @param inputs - The document and the meshing options
     * @returns One mesh per top-level shape
     * @ignore true
     */
    docToMeshes(inputs: Inputs.OCCT.DocToMeshesDto<Handle_TDocStd_Document>): Inputs.OCCT.DecomposedMeshDto[] {
        const resolved = resolveDto(Inputs.OCCT.DocToMeshesDto, inputs) as Resolved.OCCT.DocToMeshesDto<Handle_TDocStd_Document>;
        return this.och.meshingService.docToMeshes(resolved);
    }


}
