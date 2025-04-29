import { OpenCascadeInstance, Handle_Poly_Triangulation, TopoDS_Shape } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "./api/inputs/inputs";
import { OCCTBooleans } from "./services/booleans";
import { OCCTGeom } from "./services/geom/geom";
import { OCCTIO } from "./services/io";
import { OCCTOperations } from "./services/operations";
import { OCCTShapes } from "./services/shapes/shapes";
import { OCCTTransforms } from "./services/transforms";
import { OCCTFillets } from "./services/fillets";
import { OCCTDimensions } from "./services/dimensions";

// import { OCCTAssembly } from "./services/assembly";
import { OccHelper } from "./occ-helper";
import { OCCTShapeFix } from "./services/shape-fix";

export class OCCTService {
    public readonly shapes: OCCTShapes;
    public readonly geom: OCCTGeom;
    public readonly transforms: OCCTTransforms;
    public readonly operations: OCCTOperations;
    public readonly booleans: OCCTBooleans;
    public readonly fillets: OCCTFillets;
    public readonly dimensions: OCCTDimensions;
    // public readonly assembly: OCCTAssembly;
    public readonly shapeFix: OCCTShapeFix;
    public readonly io: OCCTIO;
    public plugins?;

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
        this.shapes = new OCCTShapes(occ, och);
        this.geom = new OCCTGeom(occ, och);
        this.transforms = new OCCTTransforms(occ, och);
        this.operations = new OCCTOperations(occ, och);
        this.booleans = new OCCTBooleans(occ, och);
        this.fillets = new OCCTFillets(occ, och);
        this.shapeFix = new OCCTShapeFix(occ, och);
        this.dimensions = new OCCTDimensions(occ, och);
        // this.assembly = new OCCTAssembly(occ, och);
        this.io = new OCCTIO(occ, och);
    }

    shapeFacesToPolygonPoints(inputs: Inputs.OCCT.ShapeFacesToPolygonPointsDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        const def = this.shapeToMesh(inputs);
        const res = [];
        def.faceList.forEach(face => {
            const vertices = face.vertex_coord;
            const indices = face.tri_indexes;
            for (let i = 0; i < indices.length; i += 3) {
                const p1 = indices[i];
                const p2 = indices[i + 1];
                const p3 = indices[i + 2];
                let pts =[
                    [vertices[p1 * 3], vertices[p1 * 3 + 1], vertices[p1 * 3 + 2]],
                    [vertices[p2 * 3], vertices[p2 * 3 + 1], vertices[p2 * 3 + 2]],
                    [vertices[p3 * 3], vertices[p3 * 3 + 1], vertices[p3 * 3 + 2]],
                ]; 
                if(inputs.reversedPoints){
                    pts = pts.reverse();
                }
                res.push(pts);
            }
        });

        return res;
    }

    shapesToMeshes(inputs: Inputs.OCCT.ShapesToMeshesDto<TopoDS_Shape>): Inputs.OCCT.DecomposedMeshDto[] {
        return inputs.shapes.map(shape => this.shapeToMesh({ shape, precision: inputs.precision, adjustYtoZ: inputs.adjustYtoZ }));
    }

    shapeToMesh(inputs: Inputs.OCCT.ShapeToMeshDto<TopoDS_Shape>): Inputs.OCCT.DecomposedMeshDto {

        const faceList: Inputs.OCCT.DecomposedFaceDto[] = [];
        const edgeList: Inputs.OCCT.DecomposedEdgeDto[] = [];
        const pointsList: Inputs.Base.Point3[] = [];
        let shapeToUse = inputs.shape;
        if (shapeToUse.IsNull()) return { faceList, edgeList, pointsList: [] };

        // This could be made optional...
        // Clean cached triangulation data for the shape.
        // This allows to get lower res models out of higher res that was once computed and cached.
        this.occ.BRepTools.Clean(shapeToUse, true);

        if (inputs.adjustYtoZ) {
            const shapeToUseRotated = this.och.transformsService.rotate({ shape: inputs.shape, axis: [1, 0, 0], angle: -90 });
            const shapeMirrored = this.och.transformsService.mirrorAlongNormal(
                { shape: shapeToUseRotated, origin: [0, 0, 0], normal: [0, 0, 1] }
            );
            shapeToUseRotated.delete();
            shapeToUse.delete();
            shapeToUse = shapeMirrored;
        }

        // Iterate through the faces and triangulate each one
        const triangulations: Handle_Poly_Triangulation[] = [];
        const faces = this.och.shapeGettersService.getFaces({ shape: shapeToUse });

        let incrementalMeshBuilder;
        if (faces && faces.length) {
            incrementalMeshBuilder = new this.occ.BRepMesh_IncrementalMesh_2(shapeToUse, inputs.precision, false, 0.5, false);
            faces.forEach((myFace, faceIndex) => {

                const aLocation = new this.occ.TopLoc_Location_1();
                const myT = this.occ.BRep_Tool.Triangulation(myFace, aLocation, 0);
                if (myT.IsNull()) { console.error("Encountered Null Face!"); return; }

                const thisFace: Inputs.OCCT.DecomposedFaceDto = {
                    vertex_coord: [],
                    normal_coord: [],
                    uvs: [],
                    tri_indexes: [],
                    vertex_coord_vec: [],
                    number_of_triangles: 0,
                    center_point: undefined,
                    center_normal: undefined,
                    face_index: faceIndex
                };

                thisFace.center_point = this.och.facesService.pointOnUV({ shape: myFace, paramU: 0.5, paramV: 0.5 });
                thisFace.center_normal = this.och.facesService.normalOnUV({ shape: myFace, paramU: 0.5, paramV: 0.5 });

                const pc = new this.occ.Poly_Connect_2(myT);
                const triangulation = myT.get();

                // write vertex buffer
                thisFace.vertex_coord = new Array(triangulation.NbNodes() * 3);
                thisFace.vertex_coord_vec = [];
                for (let i = 0; i < triangulation.NbNodes(); i++) {
                    const p = triangulation.Node(i + 1).Transformed(aLocation.Transformation());
                    const uv = triangulation.UVNode(i + 1);
                    thisFace.uvs[(i * 2) + 0] = uv.X();
                    thisFace.uvs[(i * 2) + 1] = uv.Y();
                    thisFace.vertex_coord[(i * 3) + 0] = p.X();
                    thisFace.vertex_coord[(i * 3) + 1] = p.Y();
                    thisFace.vertex_coord[(i * 3) + 2] = p.Z();
                    thisFace.vertex_coord_vec.push([p.X(), p.Y(), p.Z()]);
                }

                // write normal buffer
                const myNormal = new this.occ.TColgp_Array1OfDir_2(1, triangulation.NbNodes());
                this.occ.StdPrs_ToolTriangulatedShape.Normal(myFace, pc, myNormal);
                thisFace.normal_coord = new Array(myNormal.Length() * 3);
                for (let i = 0; i < myNormal.Length(); i++) {
                    const d = myNormal.Value(i + 1);
                    thisFace.normal_coord[(i * 3) + 0] = d.X();
                    thisFace.normal_coord[(i * 3) + 1] = d.Y();
                    thisFace.normal_coord[(i * 3) + 2] = d.Z();
                }

                // write triangle buffer
                const orient = myFace.Orientation_1();
                const triangles = myT.get().Triangles();
                thisFace.tri_indexes = new Array(triangles.Length() * 3);
                let validFaceTriCount = 0;
                for (let nt = 1; nt <= myT.get().NbTriangles(); nt++) {
                    const t = triangles.Value(nt);
                    let n1 = t.Value(1);
                    let n2 = t.Value(2);
                    const n3 = t.Value(3);
                    if (orient !== this.occ.TopAbs_Orientation.TopAbs_FORWARD) {
                        const tmp = n1;
                        n1 = n2;
                        n2 = tmp;
                    }
                    thisFace.tri_indexes[(validFaceTriCount * 3) + 0] = n1 - 1;
                    thisFace.tri_indexes[(validFaceTriCount * 3) + 1] = n2 - 1;
                    thisFace.tri_indexes[(validFaceTriCount * 3) + 2] = n3 - 1;
                    validFaceTriCount++;
                }
                thisFace.number_of_triangles = validFaceTriCount;
                faceList.push(thisFace);

                triangulations.push(myT);

                aLocation.delete();
                myNormal.delete();
                triangles.delete();
                pc.delete();

            });
        }

        // Nullify Triangulations between runs so they're not stored in the cache
        for (let i = 0; i < triangulations.length; i++) {
            triangulations[i].Nullify();
            triangulations[i].delete();
        }

        // Get the free edges that aren't on any triangulated face/surface
        const edges = this.och.shapeGettersService.getEdges({ shape: shapeToUse });
        edges.forEach((myEdge, index) => {
            const thisEdge: Inputs.OCCT.DecomposedEdgeDto = {
                vertex_coord: [],
                middle_point: undefined,
                edge_index: -1
            };

            thisEdge.middle_point = this.och.edgesService.pointOnEdgeAtParam({ shape: myEdge, param: 0.5 });
            const aLocation = new this.occ.TopLoc_Location_1();
            const adaptorCurve = new this.occ.BRepAdaptor_Curve_2(myEdge);
            const tangDef = new this.occ.GCPnts_TangentialDeflection_2(adaptorCurve, inputs.precision, 0.1, 2, 1.0e-9, 1.0e-7);

            // write vertex buffer
            thisEdge.vertex_coord = [];
            const nrPoints = tangDef.NbPoints();
            const tangDefValues = [];
            for (let j = 0; j < nrPoints; j++) {
                const tangDefVal = tangDef.Value(j + 1);
                thisEdge.vertex_coord.push([
                    tangDefVal.X(),
                    tangDefVal.Y(),
                    tangDefVal.Z()
                ]);
                tangDefValues.push(tangDefVal);
            }
            thisEdge.edge_index = index;

            edgeList.push(thisEdge);
            tangDefValues.forEach(v => v.delete());
            aLocation.delete();
            adaptorCurve.delete();
            tangDef.delete();
            this.occ.BRepTools.Clean(myEdge, true);
        });

        const vertices = this.och.shapeGettersService.getVertices({ shape: shapeToUse });
        if (vertices.length > 0) {
            vertices.forEach(v => {
                const pt = this.occ.BRep_Tool.Pnt(v);
                pointsList.push([pt.X(), pt.Y(), pt.Z()]);
                pt.delete();
            });
        }

        if (incrementalMeshBuilder) {
            incrementalMeshBuilder.Delete();
        }
        this.occ.BRepTools.Clean(shapeToUse, true);
        return { faceList, edgeList, pointsList };
    }


}
