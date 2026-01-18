import {
    Poly_Triangulation,
    BitbybitOcctModule,
    TopoDS_Shape, TopoDS_Wire
} from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs/inputs";
import { EdgesService } from "./edges.service";
import { FacesService } from "./faces.service";
import { ShapeGettersService } from "./shape-getters";
import { TransformsService } from "./transforms.service";
import { WiresService } from "./wires.service";
import { BaseBitByBit } from "../../base";

export class MeshingService {

    constructor(
        public readonly occ: BitbybitOcctModule,
        public readonly shapeGettersService: ShapeGettersService,
        public readonly transformsService: TransformsService,
        public readonly edgesService: EdgesService,
        public facesService: FacesService,
        public readonly wiresService: WiresService,
        public readonly base: BaseBitByBit
    ) { }

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
                let pts = [
                    [vertices[p1 * 3], vertices[p1 * 3 + 1], vertices[p1 * 3 + 2]],
                    [vertices[p2 * 3], vertices[p2 * 3 + 1], vertices[p2 * 3 + 2]],
                    [vertices[p3 * 3], vertices[p3 * 3 + 1], vertices[p3 * 3 + 2]],
                ];
                if (inputs.reversedPoints) {
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
        this.occ.BRepTools.Clean(shapeToUse);

        if (inputs.adjustYtoZ) {
            const shapeToUseRotated = this.transformsService.rotate({ shape: inputs.shape, axis: [1, 0, 0], angle: -90 });
            const shapeMirrored = this.transformsService.mirrorAlongNormal(
                { shape: shapeToUseRotated, origin: [0, 0, 0], normal: [0, 0, 1] }
            );
            shapeToUseRotated.delete();
            shapeToUse.delete();
            shapeToUse = shapeMirrored;
        }

        // Iterate through the faces and triangulate each one
        const triangulations: Poly_Triangulation[] = [];
        const faces = this.shapeGettersService.getFaces({ shape: shapeToUse });

        let incrementalMeshBuilder;
        if (faces && faces.length) {
            incrementalMeshBuilder = new this.occ.BRepMesh_IncrementalMesh(shapeToUse, inputs.precision, false, 0.5, false);
            faces.forEach((myFace, faceIndex) => {

                const aLocation = new this.occ.TopLoc_Location();
                const triangulation = this.occ.GetFaceTriangulation(myFace);
                if (triangulation.IsNull()) { console.error("Encountered Null Face!"); aLocation.delete(); return; }

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

                thisFace.center_point = this.facesService.pointOnUV({ shape: myFace, paramU: 0.5, paramV: 0.5 });
                thisFace.center_normal = this.facesService.normalOnUV({ shape: myFace, paramU: 0.5, paramV: 0.5 });

                const pc = new this.occ.Poly_Connect(triangulation);
                const trsf = aLocation.Transformation();

                // write vertex buffer
                thisFace.vertex_coord = new Array(triangulation.NbNodes() * 3);
                thisFace.vertex_coord_vec = [];
                for (let i = 0; i < triangulation.NbNodes(); i++) {
                    const p = triangulation.Node(i + 1).Transformed(trsf);
                    if (triangulation.HasUVNodes()) {
                        const uv = triangulation.UVNode(i + 1);
                        thisFace.uvs[(i * 2) + 0] = uv.X();
                        thisFace.uvs[(i * 2) + 1] = uv.Y();
                        uv.delete();
                    }
                    thisFace.vertex_coord[(i * 3) + 0] = p.X();
                    thisFace.vertex_coord[(i * 3) + 1] = p.Y();
                    thisFace.vertex_coord[(i * 3) + 2] = p.Z();
                    thisFace.vertex_coord_vec.push([p.X(), p.Y(), p.Z()]);
                    p.delete();
                }

                // write normal buffer
                const myNormal = new this.occ.TColgp_Array1OfDir(1, triangulation.NbNodes());
                this.occ.StdPrs_ToolTriangulatedShape.Normal(myFace, pc, myNormal);
                thisFace.normal_coord = new Array(myNormal.Length() * 3);
                for (let i = 0; i < myNormal.Length(); i++) {
                    const d = myNormal.Value(i + 1);
                    thisFace.normal_coord[(i * 3) + 0] = d.X();
                    thisFace.normal_coord[(i * 3) + 1] = d.Y();
                    thisFace.normal_coord[(i * 3) + 2] = d.Z();
                }

                // write triangle buffer
                const orient = myFace.Orientation();
                thisFace.tri_indexes = new Array(triangulation.NbTriangles() * 3);
                let validFaceTriCount = 0;
                for (let nt = 1; nt <= triangulation.NbTriangles(); nt++) {
                    const t = triangulation.Triangle(nt);
                    let n1 = t.Value(1);
                    let n2 = t.Value(2);
                    const n3 = t.Value(3);
                    if (orient !== this.occ.TopAbs_Orientation.FORWARD) {
                        const tmp = n1;
                        n1 = n2;
                        n2 = tmp;
                    }
                    thisFace.tri_indexes[(validFaceTriCount * 3) + 0] = n1 - 1;
                    thisFace.tri_indexes[(validFaceTriCount * 3) + 1] = n2 - 1;
                    thisFace.tri_indexes[(validFaceTriCount * 3) + 2] = n3 - 1;
                    validFaceTriCount++;
                    t.delete();
                }
                thisFace.number_of_triangles = validFaceTriCount;
                faceList.push(thisFace);

                triangulations.push(triangulation);

                aLocation.delete();
                trsf.delete();
                myNormal.delete();
                pc.delete();

            });
        }

        // Clean up triangulations
        for (let i = 0; i < triangulations.length; i++) {
            triangulations[i].delete();
        }

        // Get the free edges that aren't on any triangulated face/surface
        const edges = this.shapeGettersService.getEdges({ shape: shapeToUse });
        edges.forEach((myEdge, index) => {
            const thisEdge: Inputs.OCCT.DecomposedEdgeDto = {
                vertex_coord: [],
                middle_point: undefined,
                edge_index: -1
            };

            thisEdge.middle_point = this.edgesService.pointOnEdgeAtParam({ shape: myEdge, param: 0.5 });
            const aLocation = new this.occ.TopLoc_Location();
            const adaptorCurve = new this.occ.BRepAdaptor_Curve(myEdge);
            const tangDef = new this.occ.GCPnts_TangentialDeflection(adaptorCurve, inputs.precision, 0.1, 2, 1.0e-9, 1.0e-7);

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
            
            // Check if the edge orientation is reversed
            // GCPnts_TangentialDeflection meshes the curve in its natural direction,
            // so we need to reverse the points if the edge orientation is TopAbs_REVERSED
            const orientation = myEdge.Orientation();
            if (orientation === this.occ.TopAbs_Orientation.REVERSED) {
                thisEdge.vertex_coord.reverse();
            }
            
            thisEdge.edge_index = index;

            edgeList.push(thisEdge);
            tangDefValues.forEach(v => v.delete());
            aLocation.delete();
            adaptorCurve.delete();
            tangDef.delete();
            this.occ.BRepTools.Clean(myEdge);
        });

        const vertices = this.shapeGettersService.getVertices({ shape: shapeToUse });
        if (vertices.length > 0) {
            vertices.forEach(v => {
                const pt = this.occ.BRep_Tool_Pnt(v);
                pointsList.push([pt.X(), pt.Y(), pt.Z()]);
                pt.delete();
            });
        }

        if (incrementalMeshBuilder) {
            incrementalMeshBuilder.delete();
        }
        this.occ.BRepTools.Clean(shapeToUse);
        return { faceList, edgeList, pointsList };
    }

    meshMeshIntersectionWires(inputs: Inputs.OCCT.MeshMeshIntersectionTwoShapesDto<TopoDS_Shape>): TopoDS_Wire[] {
        const shape1 = inputs.shape1;
        const shape2 = inputs.shape2;

        const mesh1 = this.shapeFacesToPolygonPoints({ shape: shape1, precision: inputs.precision1, adjustYtoZ: false, reversedPoints: false }) as Inputs.Base.Mesh3;
        const mesh2 = this.shapeFacesToPolygonPoints({ shape: shape2, precision: inputs.precision2, adjustYtoZ: false, reversedPoints: false }) as Inputs.Base.Mesh3;

        const res = this.base.mesh.meshMeshIntersectionPolylines({
            mesh1, mesh2
        });
        const wires = [];
        res.forEach(r => {
            if (r.points && r.points.length > 0) {
                if (r.isClosed) {
                    wires.push(
                        this.wiresService.createPolygonWire({
                            points: r.points,
                        }));
                } else {
                    wires.push(
                        this.wiresService.createPolylineWire({
                            points: r.points,
                        })
                    );
                }
            }
        });
        return wires;
    }

    meshMeshIntersectionPoints(inputs: Inputs.OCCT.MeshMeshIntersectionTwoShapesDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        const shape1 = inputs.shape1;
        const shape2 = inputs.shape2;

        const mesh1 = this.shapeFacesToPolygonPoints({ shape: shape1, precision: inputs.precision1, adjustYtoZ: false, reversedPoints: false }) as Inputs.Base.Mesh3;
        const mesh2 = this.shapeFacesToPolygonPoints({ shape: shape2, precision: inputs.precision2, adjustYtoZ: false, reversedPoints: false }) as Inputs.Base.Mesh3;

        return this.base.mesh.meshMeshIntersectionPoints({ mesh1, mesh2 });
    }

    meshMeshIntersectionOfShapesWires(inputs: Inputs.OCCT.MeshMeshesIntersectionOfShapesDto<TopoDS_Shape>): TopoDS_Wire[] {
        const wireIntersections: TopoDS_Wire[] = [];

        inputs.shapes.forEach((shape, index) => {
            const shape1 = inputs.shape;
            const shape2 = inputs.shapes[index];
            let precision2 = inputs.precision;
            if (inputs.precisionShapes && inputs.precisionShapes.length > 0) {
                const p = inputs.precisionShapes[index];
                if (p) {
                    precision2 = p;
                }
            }

            const wires = this.meshMeshIntersectionWires({ shape1, shape2, precision1: inputs.precision, precision2 });
            wireIntersections.push(...wires);
        });
        return wireIntersections;
    }

    meshMeshIntersectionOfShapesPoints(inputs: Inputs.OCCT.MeshMeshesIntersectionOfShapesDto<TopoDS_Shape>): Inputs.Base.Point3[][] {
        const pointIntersections: Inputs.Base.Point3[][] = [];

        inputs.shapes.forEach((shape, index) => {
            const shape1 = inputs.shape;
            const shape2 = inputs.shapes[index];
            let precision2 = inputs.precision;
            if (inputs.precisionShapes && inputs.precisionShapes.length > 0) {
                const p = inputs.precisionShapes[index];
                if (p) {
                    precision2 = p;
                }
            }

            const points = this.meshMeshIntersectionPoints({ shape1, shape2, precision1: inputs.precision, precision2 });
            pointIntersections.push(...points);
        });
        return pointIntersections;
    }

}
