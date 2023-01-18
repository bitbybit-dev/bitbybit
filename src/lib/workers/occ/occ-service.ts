import { OpenCascadeInstance, TopoDS_Face } from '../../../bitbybit-dev-occt/bitbybit-dev-occt';
import * as Inputs from '../../api/inputs/inputs';
import { OccHelper } from './occ-helper';
import { OCCTBooleans } from './services/booleans';
import { OCCTGeom } from './services/geom/geom';
// import { OCCTAdvanced } from './services/advanced/advanced';
import { OCCTAdvanced } from './services/advanced-mock/advanced';
import { OCCTIO } from './services/io';
import { OCCTOperations } from './services/operations';
import { OCCTShapes } from './services/shapes/shapes';
import { OCCTTransforms } from './services/transforms';
import { OCCTAssembly } from './services/assembly/assembly';
import { OCCTFillets } from './services/fillets';


// Worker make an instance of this class itself
export class Occ {
    public readonly shapes: OCCTShapes;
    public readonly geom: OCCTGeom;
    public readonly transforms: OCCTTransforms;
    public readonly operations: OCCTOperations;
    public readonly assembly: OCCTAssembly;
    public readonly booleans: OCCTBooleans;
    public readonly advanced: OCCTAdvanced;
    public readonly fillets: OCCTFillets;
    public readonly io: OCCTIO;
    private inctementalMeshBuilder;

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
        this.shapes = new OCCTShapes(occ, och);
        this.geom = new OCCTGeom(occ, och);
        this.assembly = new OCCTAssembly(occ, och);
        this.transforms = new OCCTTransforms(occ, och);
        this.operations = new OCCTOperations(occ, och);
        this.booleans = new OCCTBooleans(occ, och);
        this.advanced = new OCCTAdvanced(occ, och);
        this.fillets = new OCCTFillets(occ, och);
        this.io = new OCCTIO(occ, och);
    }

    shapeToMesh(shape, maxDeviation, adjustYtoZ): {
        faceList: {
            face_index: number;
            normal_coord: number[];
            number_of_triangles: number;
            tri_indexes: number[];
            vertex_coord: number[];
            vertex_coord_vec: number[][];
        }[],
        edgeList: {
            edge_index: number;
            vertex_coord: number[][];
        }[]
    } {
        const faceList: {
            face_index: number;
            normal_coord: number[];
            number_of_triangles: number;
            tri_indexes: number[];
            vertex_coord: number[];
            vertex_coord_vec: number[][];
        }[] = [];
        const edgeList: {
            edge_index: number;
            vertex_coord: number[][];
        }[] = [];

        let shapeToUse = shape;

        if (adjustYtoZ) {
            shapeToUse = this.och.rotate({ shape, axis: [1, 0, 0], angle: -90 });
            shapeToUse = this.och.mirrorAlongNormal(
                { shape: shapeToUse, origin: [0, 0, 0], normal: [0, 0, 1] }
            );
        }

        // This could be made optional...
        // Clean cached triangulation data for the shape.
        // This allows to get lower res models out of higher res that was once computed and cached.
        this.occ.BRepTools.Clean(shapeToUse, true);

        const inctementalMeshBuilder = new this.occ.BRepMesh_IncrementalMesh_2(shapeToUse, maxDeviation, false, 0.5, true);

        // Construct the edge hashes to assign proper indices to the edges
        const fullShapeEdgeHashes2 = {};

        // Iterate through the faces and triangulate each one
        const triangulations = [];
        this.och.forEachFace(shapeToUse, (faceIndex, myFace: TopoDS_Face) => {
            const aLocation = new this.occ.TopLoc_Location_1();
            const myT = this.occ.BRep_Tool.Triangulation(myFace, aLocation, 0);
            if (myT.IsNull()) { console.error('Encountered Null Face!'); return; }
            const thisFace = {
                vertex_coord: [],
                normal_coord: [],
                tri_indexes: [],
                vertex_coord_vec: [],
                number_of_triangles: 0,
                face_index: faceIndex
            };

            const pc = new this.occ.Poly_Connect_2(myT);
            const triangulation = myT.get();

            // write vertex buffer
            thisFace.vertex_coord = new Array(triangulation.NbNodes() * 3);
            thisFace.vertex_coord_vec = [];
            for (let i = 0; i < triangulation.NbNodes(); i++) {
                const p = triangulation.Node(i + 1).Transformed(aLocation.Transformation());
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
                const d = myNormal.Value(i + 1).Transformed(aLocation.Transformation());
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
                // if(TriangleIsValid(Nodes.Value(1), Nodes.Value(n2), Nodes.Value(n3))) {
                thisFace.tri_indexes[(validFaceTriCount * 3) + 0] = n1 - 1;
                thisFace.tri_indexes[(validFaceTriCount * 3) + 1] = n2 - 1;
                thisFace.tri_indexes[(validFaceTriCount * 3) + 2] = n3 - 1;
                validFaceTriCount++;
                // }
            }
            thisFace.number_of_triangles = validFaceTriCount;
            faceList.push(thisFace);

            // this.forEachEdge(myFace, (index, myEdge) => {
            //     const edgeHash = myEdge.HashCode(100000000);
            //     if (fullShapeEdgeHashes2.hasOwnProperty(edgeHash)) {
            //         const thisEdge = {
            //             vertex_coord: [],
            //             edge_index: -1
            //         };

            //         const myP = this.occ.BRep_Tool.PolygonOnTriangulation_1(myEdge, myT, aLocation);
            //         const edgeNodes = myP.get().Nodes();

            //         // write vertex buffer
            //         thisEdge.vertex_coord = [];
            //         for (let j = 0; j < edgeNodes.Length(); j++) {
            //             const vertexIndex = edgeNodes.Value(j + 1);
            //             thisEdge.vertex_coord.push([
            //                 thisFace.vertex_coord[((vertexIndex - 1) * 3) + 0],
            //                 thisFace.vertex_coord[((vertexIndex - 1) * 3) + 1],
            //                 thisFace.vertex_coord[((vertexIndex - 1) * 3) + 2]
            //             ]);
            //         }

            //         console.log('haha ', index);
            //         thisEdge.edge_index = index;

            //         edgeList.push(thisEdge);
            //     } else {
            //         fullShapeEdgeHashes2[edgeHash] = edgeHash;
            //     }
            // });
            triangulations.push(myT);

            aLocation.delete();
            pc.delete();
        });
        // Nullify Triangulations between runs so they're not stored in the cache
        for (let i = 0; i < triangulations.length; i++) {
            triangulations[i].Nullify();
            triangulations[i].delete();
        }

        // Get the free edges that aren't on any triangulated face/surface
        this.och.forEachEdge(shapeToUse, (index, myEdge) => {
            const edgeHash = myEdge.HashCode(100000000);
            if (!fullShapeEdgeHashes2.hasOwnProperty(edgeHash)) {
                const thisEdge = {
                    vertex_coord: [],
                    edge_index: -1
                };

                const aLocation = new this.occ.TopLoc_Location_1();
                const adaptorCurve = new this.occ.BRepAdaptor_Curve_2(myEdge);
                const tangDef = new this.occ.GCPnts_TangentialDeflection_2(adaptorCurve, maxDeviation, 0.1, 2, 1.0e-9, 1.0e-7);

                // write vertex buffer
                thisEdge.vertex_coord = new Array(tangDef.NbPoints());
                for (let j = 0; j < tangDef.NbPoints(); j++) {
                    const vertex = tangDef.Value(j + 1).Transformed(aLocation.Transformation());
                    thisEdge.vertex_coord.push([
                        vertex.X(),
                        vertex.Y(),
                        vertex.Z()
                    ]);
                }
                thisEdge.edge_index = index;
                fullShapeEdgeHashes2[edgeHash] = edgeHash;

                edgeList.push(thisEdge);

                aLocation.delete();
                adaptorCurve.delete();
                tangDef.delete();
            }
        });
        inctementalMeshBuilder.delete();
        
        return { faceList, edgeList };
    }


}
