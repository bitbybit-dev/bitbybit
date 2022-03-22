import {
    GeomAbs_IsoType,
    Geom_Curve,
    OpenCascadeInstance,
    TopoDS_Face
} from 'opencascade.js';
import * as Inputs from '../../api/inputs/inputs';
import { OccHelper } from './occ-helper';
import { OCCTBooleans } from './services/booleans';
import { OCCTGeom } from './services/geom/geom';
import { OCCTIO } from './services/io';
import { OCCTOperations } from './services/operations';
import { OCCTShapes } from './services/shapes/shapes';
import { OCCTTransforms } from './services/transforms';


// Worker make an instance of this class itself
export class Occ {
    public readonly shapes: OCCTShapes;
    public readonly geom: OCCTGeom;
    public readonly transforms: OCCTTransforms;
    public readonly operations: OCCTOperations;
    public readonly booleans: OCCTBooleans;
    public readonly io: OCCTIO;

    constructor(
        private readonly occ: OpenCascadeInstance,
        private readonly och: OccHelper
    ) {
        this.shapes = new OCCTShapes(occ, och);
        this.geom = new OCCTGeom(occ, och);
        this.transforms = new OCCTTransforms(occ, och);
        this.operations = new OCCTOperations(occ, och);
        this.booleans = new OCCTBooleans(occ, och);
        this.io = new OCCTIO(occ, och);
    }

    divideFaceToUVPointsByEqualLength(inputs: Inputs.OCCT.DivideFaceToUVPointsDto): any {

        const face = inputs.shape as TopoDS_Face;
        const bas = new this.occ.BRepAdaptor_Surface_2(face, false);
        const surface = bas.Surface();


        // const wire = inputs.shape as TopoDS_Wire;
        // const curve = new this.occ.BRepAdaptor_CompCurve_2(wire, false);
        // const curveLength = this.occ.GCPnts_AbscissaPoint.Length_5(curve, curve.FirstParameter(), curve.LastParameter());
        // const step = curveLength / inputs.nrOfDivisions;

        // const lengths = [];
        // if (inputs.excludeEndPoints) {
        //     for (let i = step; i < curveLength; i += step) {
        //         lengths.push(i);
        //     }
        // } else {
        //     for (let i = 0; i <= curveLength; i += step) {
        //         lengths.push(i);
        //     }
        // }

        // const paramsLength = lengths.map(l => {
        //     const absc = new this.occ.GCPnts_AbscissaPoint_2(curve, l, curve.FirstParameter());
        //     const param = absc.Parameter();
        //     return param;
        // })

        // const points = paramsLength.map(r => {
        //     const gpPnt = this.och.gpPnt([0, 0, 0]);
        //     curve.D0(r, gpPnt);
        //     return [gpPnt.X(), gpPnt.Y(), gpPnt.Z()] as Inputs.Base.Point3;
        // });

        // return { result: points };

    }

    isoCurveOnFaceAlongUDirOnParam(inputs: Inputs.OCCT.FaceIsoCurveAtParamDto): any {

        const face = inputs.shape as TopoDS_Face;

        const bas = new this.occ.BRepAdaptor_Surface_2(face, true);

        // const tCurve = new this.occ.Handle_Geom2d_Curve();
        // const cons = new this.occ.BRep_CurveOnSurface(tCurve, bas.Surface().Surface())

        const surface = bas.Surface();
        const sadapt = new this.occ.GeomAdaptor_HSurface_2(surface)

        const hsadapt = new this.occ.Handle_Adaptor3d_HSurface_2(sadapt);

        const s = new this.occ.Adaptor3d_CurveOnSurface_2(hsadapt);

        // const s = new this.occ.Draw

        const iso = new this.occ.Adaptor3d_IsoCurve_3(hsadapt, this.occ.GeomAbs_IsoType.GeomAbs_IsoU as GeomAbs_IsoType, 0);

        // const ddd = new this.occ.
        // const ln = iso.Line();

        // const d= iso.OffsetCurve();
        const isoh = new this.occ.Adaptor3d_HIsoCurve_2(iso);
        const c = isoh.GetCurve();
        const pt = c.Value(0.6);
        return { result: [pt.X(), pt.Y(), pt.Z()] };

        // const gadc = new this.occ.GeomAdaptor_Curve_2(isoh);
        // const crv = isoh.OffsetCurve();
        // const o = crv.get();
        // const h = crv.OffsetCurve();.
        // const d = h.get();

        // const x = new this.occ.Geom_Curve();
        // const edge = new this.occ.BRepBuilderAPI_MakeEdge_24(
        //     o.BasisCurve()
        // ).Edge();
        // return new this.occ.BRepBuilderAPI_MakeWire_2(edge).Wire();
    }

    fillet2D(inputs: Inputs.OCCT.FilletDto): any {
        const res = new this.occ.BRepFilletAPI_MakeFillet2d_2(inputs.shape);
    }

    makeEdgeFromGeomCurve(inputs: Inputs.OCCT.ShapesDto) {

        const curve2d = new this.occ.Handle_Geom2d_Curve_2(inputs.shapes[0]);
        const surface = new this.occ.Handle_Geom_Surface_2(inputs.shapes[1]);
        const res = new this.occ.BRepBuilderAPI_MakeEdge_30(curve2d, surface);
        return this.och.getActualTypeOfShape(res.Shape());
    }

    basicDifferenceTest(inputs: any) {
        const pt1 = new this.occ.gp_Pnt_3(0, 0, 0);
        const x1 = new this.occ.BRepPrimAPI_MakeBox_3(pt1, 1, 2, 3).Shape();
        const pt2 = new this.occ.gp_Pnt_3(0, 1, 0);
        const x2 = new this.occ.BRepPrimAPI_MakeBox_3(pt2, 1, 1, 1).Shape();

        const differenceCut = new this.occ.BRepAlgoAPI_Cut_3(x1, x2);
        differenceCut.Build();
        const resShape = differenceCut.Shape();
    }

    pointInFace(inputs: Inputs.OCCT.PointInFaceDto): any {
        const face = inputs.shapes[0];
        const edge = inputs.shapes[1];
        const pt = this.och.gpPnt([0, 0, 0]);
        const pt2d = this.och.gpPnt2d([0, 0]);
        // const c = this.occ.IntTools_Root;
        // const context = new this.occ.BOPTools_AlgoTools3D();

        const handle = new this.occ.Handle_IntTools_Context_1();

        const res = this.occ.BOPTools_AlgoTools3D.PointInFace_2(face, edge, inputs.tEdgeParam, inputs.distance2DParam, pt, pt2d, handle)
        if (res === 0) {
            return { result: [pt.X(), pt.Y(), pt.Z()] };
        } else {
            throw (new Error('Point in face was not found given criteria'));
        }
    }

    shapeToMesh(shape, maxDeviation): {
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

        // This could be made optional...
        // Clean cached triangulation data for the shape.
        // This allows to get lower res models out of higher res that was once computed and cached.
        this.occ.BRepTools.Clean(shape);

        const inctementalMeshBuilder = new this.occ.BRepMesh_IncrementalMesh_2(shape, maxDeviation, false, 0.5, true);

        // Construct the edge hashes to assign proper indices to the edges
        const fullShapeEdgeHashes2 = {};

        // Iterate through the faces and triangulate each one
        const triangulations = [];
        this.och.forEachFace(shape, (faceIndex, myFace) => {
            const aLocation = new this.occ.TopLoc_Location_1();
            const myT = this.occ.BRep_Tool.Triangulation(myFace, aLocation);
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
            const Nodes = myT.get().Nodes();

            // write vertex buffer
            thisFace.vertex_coord = new Array(Nodes.Length() * 3);
            thisFace.vertex_coord_vec = [];
            for (let i = 0; i < Nodes.Length(); i++) {
                const p = Nodes.Value(i + 1).Transformed(aLocation.Transformation());
                thisFace.vertex_coord[(i * 3) + 0] = p.X();
                thisFace.vertex_coord[(i * 3) + 1] = p.Y();
                thisFace.vertex_coord[(i * 3) + 2] = p.Z();
                thisFace.vertex_coord_vec.push([p.X(), p.Y(), p.Z()]);
            }

            // write normal buffer
            const myNormal = new this.occ.TColgp_Array1OfDir_2(Nodes.Lower(), Nodes.Upper());
            const SST = new this.occ.StdPrs_ToolTriangulatedShape();
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
        });
        // Nullify Triangulations between runs so they're not stored in the cache
        for (let i = 0; i < triangulations.length; i++) {
            triangulations[i].Nullify();
        }

        // Get the free edges that aren't on any triangulated face/surface
        this.och.forEachEdge(shape, (index, myEdge) => {
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
            }
        });
        return { faceList, edgeList };
    }



    intersectSurfaceSurface(inputs: Inputs.OCCT.ShapesWithToleranceDto): Geom_Curve[] {
        const intss = new this.occ.GeomAPI_IntSS_2(inputs.shapes[0], inputs.shapes[1], inputs.tolerance);
        if (intss.IsDone()) {
            const intersectionCurves = [];
            for (let i = 1; i <= intss.NbLines(); i++) {
                const crv = intss.Line(i);
                const edge = new this.occ.BRepBuilderAPI_MakeEdge_24(
                    crv
                ).Edge();
                intersectionCurves.push(edge);
            }
            return intersectionCurves;
        } else {
            return [];
        }
    }


}
