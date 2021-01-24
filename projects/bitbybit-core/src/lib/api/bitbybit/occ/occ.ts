import { Injectable } from '@angular/core';
import { Color3, CubeTexture, Mesh, MeshBuilder, PBRMetallicRoughnessMaterial, StandardMaterial, VertexData } from '@babylonjs/core';
import { Color4, Vector3 } from '@babylonjs/core/Maths/math';
import { Context } from '../../context';
import { GeometryHelper } from '../../geometry-helper';
import * as Inputs from '../../inputs/inputs';
import { OCCHelper } from './occ-helper';
import { OCCService } from './occ-service';

/**
 * Contains various methods for OpenCascade implementation
 * Much of the work is done by Johnathon Selstad and Sebastian Alff to port OCC to JavaScript
 * I'm super grateful for their work!
 */
@Injectable()
export class OCC {


    constructor(
        private readonly context: Context,
        private readonly geometryHelper: GeometryHelper,
        private readonly occHelper: OCCHelper,
        private readonly oc: OCCService,
    ) {
    }

    /**
     * Draws a Brep solid
     * <div>
     *  <img src="../assets/images/blockly-images/occ/drawBrep.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#drawbrep
     * @param inputs Contains a brep to be drawn and options
     * @returns BabylonJS Mesh
     */
    drawBrep(inputs: Inputs.OCC.DrawBrepDto): Mesh {
        const brepMesh = MeshBuilder.CreateBox('brepMesh' + Math.random(), { size: 0.01 }, this.context.scene);
        brepMesh.isVisible = false;

        const ExpFace = new this.context.occ.TopExp_Explorer_1();
        for (ExpFace.Init(inputs.brep,
            this.context.occ.TopAbs_ShapeEnum.TopAbs_FACE,
            this.context.occ.TopAbs_ShapeEnum.TopAbs_SHAPE);
            ExpFace.More();
            ExpFace.Next()) {
            const myShape = ExpFace.Current();
            const myFace = this.context.occ.TopoDS.Face_1(myShape);
            let inc;
            try {
                // in case some of the faces can not been visualized
                inc = new this.context.occ.BRepMesh_IncrementalMesh_2(myFace, 0.1, false, 0.5, false);
            } catch (e) {
                console.error('face visualizi<ng failed');
                continue;
            }

            const aLocation = new this.context.occ.TopLoc_Location_1();
            const myT = this.context.occ.BRep_Tool.Triangulation(myFace, aLocation);
            if (myT.IsNull()) {
                continue;
            }


            const pc = new this.context.occ.Poly_Connect_2(myT);
            const Nodes = myT.get().Nodes();

            const vertices = new Float32Array(Nodes.Length() * 3);

            // write vertex buffer
            for (let i = Nodes.Lower(); i <= Nodes.Upper(); i++) {
                const t1 = aLocation.Transformation();
                const p = Nodes.Value(i);
                const p1 = p.Transformed(t1);
                vertices[3 * (i - 1)] = p.X();
                vertices[3 * (i - 1) + 1] = p.Y();
                vertices[3 * (i - 1) + 2] = p.Z();
                p.delete();
                t1.delete();
                p1.delete();
            }
            // write normal buffer
            const myNormal = new this.context.occ.TColgp_Array1OfDir_2(Nodes.Lower(), Nodes.Upper());
            this.context.occ.StdPrs_ToolTriangulatedShape.Normal(myFace, pc, myNormal);

            const normals = new Float32Array(myNormal.Length() * 3);
            for (let i = myNormal.Lower(); i <= myNormal.Upper(); i++) {
                const t1 = aLocation.Transformation();
                const d1 = myNormal.Value(i);
                const d = d1.Transformed(t1);

                normals[3 * (i - 1)] = d.X();
                normals[3 * (i - 1) + 1] = d.Y();
                normals[3 * (i - 1) + 2] = d.Z();

                t1.delete();
                d1.delete();
                d.delete();
            }

            myNormal.delete();

            // write triangle buffer
            const orient = myFace.Orientation_1();
            const triangles = myT.get().Triangles();

            let indices;
            const triLength = triangles.Length() * 3;
            if (triLength > 65535) {
                indices = new Uint32Array(triLength);
            }
            else {
                indices = new Uint16Array(triLength);
            }

            for (let nt = 1; nt <= myT.get().NbTriangles(); nt++) {
                const t = triangles.Value(nt);
                let n1 = t.Value(1);
                let n2 = t.Value(2);
                const n3 = t.Value(3);
                if (orient !== this.context.occ.TopAbs_Orientation.TopAbs_FORWARD) {
                    const tmp = n1;
                    n1 = n2;
                    n2 = tmp;
                }

                indices[3 * (nt - 1)] = n1 - 1;
                indices[3 * (nt - 1) + 1] = n2 - 1;
                indices[3 * (nt - 1) + 2] = n3 - 1;
                t.delete();
            }

            triangles.delete();

            const mesh = this.geometryHelper.createOrUpdateSurfaceMesh({
                positions: vertices as any,
                normals: normals as any,
                indices,
            }, inputs.brepMesh, inputs.updatable, inputs.opacity, inputs.colour);

            mesh.parent = brepMesh;

            Nodes.delete();
            pc.delete();
            aLocation.delete();
            myT.delete();
            inc.delete();
            myFace.delete();
            myShape.delete();
        }
        ExpFace.delete();
        return brepMesh;
    }

    /**
     * Draws OpenCascade shape by going through faces and edges
     * <div>
     *  <img src="../assets/images/blockly-images/occ/drawShape.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#drawshape
     * @param inputs Contains a shape to be drawn and additional information
     * @returns BabylonJS Mesh
     */
    drawShape(inputs: Inputs.OCC.DrawShapeDto): Mesh {
        const fullShapeEdgeHashes = {};
        const fullShapeFaceHashes = {};
        this.forEachFace(inputs.shape, (index, face) => {
            fullShapeFaceHashes[face.HashCode(100000000)] = index;
        });
        this.forEachEdge(inputs.shape, (index, edge) => {
            fullShapeEdgeHashes[edge.HashCode(100000000)] = index;
        });
        const fe = this.shapeToMesh(inputs.shape, inputs.precision, fullShapeEdgeHashes, fullShapeFaceHashes);

        const shapeMesh = MeshBuilder.CreateBox('brepMesh' + Math.random(), { size: 0.01 }, this.context.scene);
        shapeMesh.isVisible = false;

        if (inputs.drawFaces) {
            fe.faceList.forEach(face => {
                const mesh = this.geometryHelper.createOrUpdateSurfaceMesh({
                    positions: face.vertex_coord,
                    normals: face.normal_coord,
                    indices: face.tri_indexes,
                }, inputs.shapeMesh, inputs.updatable, inputs.opacity, inputs.faceColour);
                const pbr = new PBRMetallicRoughnessMaterial('pbr', this.context.scene);

                pbr.baseColor = Color3.FromHexString(inputs.faceColour);
                pbr.metallic = 1.0;
                pbr.roughness = 0.6;

                mesh.material = pbr;

                mesh.material.backFaceCulling = false;
                mesh.material.zOffset = 2;
            });
        }
        if (inputs.drawEdges) {
            fe.edgeList.forEach(edge => {
                const mesh = this.geometryHelper.drawPolyline(
                    inputs.linesMesh,
                    edge.vertex_coord,
                    inputs.updatable,
                    inputs.edgeWidth,
                    inputs.opacity,
                    inputs.edgeColour
                );
                mesh.parent = shapeMesh;
            });
        }
        return shapeMesh;
    }

    /**
     * Creates OpenCascade Polygon wire
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createPolygonWire.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createpolygonwire
     * @param inputs Polygon points
     * @returns OpenCascade polygon wire shape
     */
    createPolygonWire(inputs: Inputs.OCC.PolygonDto): any {
        const gpPoints = [];
        for (let ind = 0; ind < inputs.points.length; ind++) {
            gpPoints.push(this.occHelper.convertToPnt(inputs.points[ind]));
        }

        const polygonWire = new this.context.occ.BRepBuilderAPI_MakeWire_1();
        for (let ind = 0; ind < inputs.points.length - 1; ind++) {
            const seg = new this.context.occ.GC_MakeSegment_1(gpPoints[ind], gpPoints[ind + 1]).Value();
            const edge = new this.context.occ.BRepBuilderAPI_MakeEdge_24(
                new this.context.occ.Handle_Geom_Curve_2(seg.get())
            ).Edge();
            const innerWire = new this.context.occ.BRepBuilderAPI_MakeWire_2(edge).Wire();
            polygonWire.Add_2(innerWire);
        }
        const seg2 = new this.context.occ.GC_MakeSegment_1(gpPoints[inputs.points.length - 1], gpPoints[0]).Value();
        const edge2 = new this.context.occ.BRepBuilderAPI_MakeEdge_24(
            new this.context.occ.Handle_Geom_Curve_2(seg2.get())
        ).Edge();
        const innerWire2 = new this.context.occ.BRepBuilderAPI_MakeWire_2(edge2).Wire();
        polygonWire.Add_2(innerWire2);
        return polygonWire.Wire();
    }

    /**
     * Creates OpenCascade Polygon face
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createPolygonFace.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createpolygonface
     * @param inputs Polygon points
     * @returns OpenCascade polygon face
     */
    createPolygonFace(inputs: Inputs.OCC.PolygonDto): any {
        return new this.context.occ.BRepBuilderAPI_MakeFace(this.createPolygonWire(inputs)).Face();
    }

    /**
     * Creates OpenCascade Box
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createBox.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createbox
     * @param inputs Box size and center
     * @returns OpenCascade Box
     */
    createBox(inputs: Inputs.OCC.BoxDto): any {
        return this.oc.bRepPrimAPIMakeBox(inputs.width, inputs.length, inputs.height, inputs.center);
    }

    /**
     * Creates OpenCascade Cylinder
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createCylinder.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createcylinder
     * @param inputs Cylinder parameters
     * @returns OpenCascade Cylinder
     */
    createCylinder(inputs: Inputs.OCC.CylinderDto): any {
        return this.oc.bRepPrimAPIMakeCylinder(
            [inputs.center[0], -inputs.height / 2 + inputs.center[1], inputs.center[2]],
            [0., 1., 0.],
            inputs.radius,
            inputs.height
        );
    }

    /**
     * Creates OpenCascade BSPline wire
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createBSpline.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createbspline
     * @param inputs Points through which to make BSpline
     * @returns OpenCascade BSpline wire
     */
    createBSpline(inputs: Inputs.OCC.BSplineDto): any {
        const ptList = new this.context.occ.TColgp_Array1OfPnt_2(1, inputs.points.length + (inputs.closed ? 1 : 0));
        for (let pIndex = 1; pIndex <= inputs.points.length; pIndex++) {
            ptList.SetValue(pIndex, this.occHelper.convertToPnt(inputs.points[pIndex - 1]));
        }
        if (inputs.closed) { ptList.SetValue(inputs.points.length + 1, ptList.Value(1)); }

        const geomCurveHandle = new this.context.occ.GeomAPI_PointsToBSpline_2(ptList, 3, 8,
            this.context.occ.GeomAbs_Shape.GeomAbs_C2, 1.0e-3);
        const edge = new this.context.occ.BRepBuilderAPI_MakeEdge_24(
            new this.context.occ.Handle_Geom_Curve_2(geomCurveHandle.Curve().get())
        ).Edge();
        return new this.context.occ.BRepBuilderAPI_MakeWire_2(edge).Wire();
    }


    /**
     * Creates OpenCascade Bezier wire
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createBezier.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createbezier
     * @param inputs Points through which to make bezier curve
     * @returns OpenCascade Bezier wire
     */
    createBezier(inputs: Inputs.OCC.BezierDto): any {
        const ptList = new this.context.occ.TColgp_Array1OfPnt_2(1, inputs.points.length + (inputs.closed ? 1 : 0));
        for (let pIndex = 1; pIndex <= inputs.points.length; pIndex++) {
            ptList.SetValue(pIndex, this.occHelper.convertToPnt(inputs.points[pIndex - 1]));
        }
        if (inputs.closed) { ptList.SetValue(inputs.points.length + 1, ptList.Value(1)); }

        const geomCurveHandle = new this.context.occ.Geom_BezierCurve_1(ptList);
        const edge = new this.context.occ.BRepBuilderAPI_MakeEdge_24(
            new this.context.occ.Handle_Geom_Curve_2(geomCurveHandle)
        ).Edge();
        return new this.context.occ.BRepBuilderAPI_MakeWire_2(edge).Wire();
    }

    /**
     * Creates OpenCascade circle wire
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createCircleWire.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createcirclewire
     * @param inputs Circle parameters
     * @returns OpenCascade circle wire
     */
    createCircleWire(inputs: Inputs.OCC.CircleDto): any {
        return this.createCircle(inputs.radius, inputs.center, false);
    }

    /**
     * Creates OpenCascade circle face
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createCircleFace.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createcircleface
     * @param inputs Circle parameters
     * @returns OpenCascade circle face
     */
    createCircleFace(inputs: Inputs.OCC.CircleDto): any {
        return this.createCircle(inputs.radius, inputs.center, true);
    }

    /**
     * Lofts wires into a shell
     * <div>
     *  <img src="../assets/images/blockly-images/occ/loft.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#loft
     * @param inputs Circle parameters
     * @returns Resulting loft shell
     */
    loft(inputs: Inputs.OCC.LoftDto): any {
        const pipe = new this.context.occ.BRepOffsetAPI_ThruSections(inputs.solid, false, 1.0e-06);
        inputs.wires.forEach((wire) => { pipe.AddWire(wire); });
        pipe.Build();
        return pipe.Shape();
    }

    /**
     * Offset for various shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/offset.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#offset
     * @param inputs Shape to offset and distance with tolerance
     * @returns Resulting offset shape
     */
    offset(inputs: Inputs.OCC.OffsetDto): any {
        if (!inputs.tolerance) { inputs.tolerance = 0.1; }
        if (inputs.offsetDistance === 0.0) { return inputs.shape; }
        let offset = null;
        if (inputs.shape.ShapeType() === this.context.occ.TopAbs_ShapeEnum.TopAbs_WIRE) {
            offset = new this.context.occ.BRepOffsetAPI_MakeOffset_1();
            offset.AddWire(inputs.shape);
            offset.Perform(inputs.offsetDistance);
        } else {
            offset = new this.context.occ.BRepOffsetAPI_MakeOffsetShape_1();
            offset.PerformByJoin(
                inputs.shape,
                inputs.offsetDistance,
                inputs.tolerance,
                this.context.occ.BRepOffset_Mode.BRepOffset_Skin,
                false,
                false,
                this.context.occ.GeomAbs_JoinType.GeomAbs_Arc,
                false
            );
        }
        let offsetShape = new this.context.occ.TopoDS.Shell_2(offset.Shape());

        // Convert Shell to Solid as is expected
        if (offsetShape.ShapeType() === this.context.occ.TopAbs_ShapeEnum.TopAbs_SHELL) {
            const solidOffset = new this.context.occ.BRepBuilderAPI_MakeSolid_1();
            solidOffset.Add(offsetShape);
            offsetShape = solidOffset.Solid();
        }

        return offsetShape;
    }

    /**
     * Extrudes the face along direction
     * <div>
     *  <img src="../assets/images/blockly-images/occ/extrude.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#extrude
     * @param inputs Face to extrude and direction parameter with tolerance
     * @returns Resulting extruded solid
     */
    extrude(inputs: Inputs.OCC.ExtrudeDto): any {
        return new this.context.occ.BRepPrimAPI_MakePrism_1(
            inputs.face,
            new this.context.occ.gp_Vec_4(inputs.direction[0], inputs.direction[1], inputs.direction[2]),
            false,
            true
        ).Shape();
    }

    /**
     * Creates OpenCascade Sphere
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createSphere.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createsphere
     * @param inputs Sphere radius and center
     * @returns OpenCascade Sphere
     */
    createSphere(inputs: Inputs.OCC.SphereDto): any {
        return this.oc.bRepPrimAPIMakeSphere(inputs.center, [0., 0., 1.], inputs.radius);
    }

    /**
     * Fillets OpenCascade Shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/filletEdges.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#filletedges
     * @param inputs Shape, radius and edge indexes to fillet
     * @returns OpenCascade shape with filleted edges
     */
    filletEdges(inputs: Inputs.OCC.FilletDto): any {
        if (inputs.filletAll) {
            const mkFillet = new this.context.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, this.context.occ.ChFi3d_FilletShape.ChFi3d_Rational
            );
            const anEdgeExplorer = new this.context.occ.TopExp_Explorer_2(
                inputs.shape, this.context.occ.TopAbs_ShapeEnum.TopAbs_EDGE, this.context.occ.TopAbs_ShapeEnum.TopAbs_SHAPE
            );
            while (anEdgeExplorer.More()) {
                const anEdge = new this.context.occ.TopoDS.Edge_1(anEdgeExplorer.Current());
                mkFillet.Add_2(inputs.radius, anEdge);
                anEdgeExplorer.Next();
            }
            inputs.shape = mkFillet.Shape();
            return inputs.shape;
        } else {
            const mkFillet = new this.context.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, this.context.occ.ChFi3d_FilletShape.ChFi3d_Rational
            );
            let foundEdges = 0;
            let curFillet;
            this.forEachEdge(inputs.shape, (index, edge) => {
                if (inputs.edgeList.includes(index)) {
                    mkFillet.Add_2(inputs.radius, edge);
                    foundEdges++;
                }
            });
            if (foundEdges === 0) {
                console.error('Fillet Edges Not Found!  Make sure you are looking at the object _before_ the Fillet is applied!');
                curFillet = inputs.shape.Solid();
            }
            else {
                curFillet = mkFillet.Shape();
            }
            this.occHelper.sceneShapes.push(curFillet);
            return curFillet;
        }
    }

    /**
     * Joins separate objects
     * <div>
     *  <img src="../assets/images/blockly-images/occ/union.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#union
     * @param inputs Objects to join
     * @returns OpenCascade joined shape
     */
    union(inputs: Inputs.OCC.UnionDto): any {
        if (!inputs.fuzzValue) { inputs.fuzzValue = 0.1; }
        let combined = inputs.objectsToJoin[0];
        for (let i = 0; i < inputs.objectsToJoin.length; i++) {
            const combinedFuse = new this.context.occ.BRepAlgoAPI_Fuse_3(combined, inputs.objectsToJoin[i]);
            combinedFuse.Build();
            combined = combinedFuse.Shape();
        }

        if (!inputs.keepEdges) {
            const fusor = new this.context.occ.ShapeUpgrade_UnifySameDomain_2(combined, true, true, false);
            fusor.Build();
            combined = fusor.Shape();
        }

        return combined;
    }

    private forEachEdge(shape, callback): any {
        const edgeHashes = {};
        let edgeIndex = 0;
        const anExplorer = new this.context.occ.TopExp_Explorer_2(shape,
            this.context.occ.TopAbs_ShapeEnum.TopAbs_EDGE, this.context.occ.TopAbs_ShapeEnum.TopAbs_SHAPE
        );
        for (anExplorer.Init(shape, this.context.occ.TopAbs_ShapeEnum.TopAbs_EDGE, this.context.occ.TopAbs_ShapeEnum.TopAbs_SHAPE);
            anExplorer.More();
            anExplorer.Next()
        ) {
            const edge = this.context.occ.TopoDS.Edge_1(anExplorer.Current());
            const edgeHash = edge.HashCode(100000000);
            if (!edgeHashes.hasOwnProperty(edgeHash)) {
                edgeHashes[edgeHash] = edgeIndex;
                callback(edgeIndex++, edge);
            }
        }
        return edgeHashes;
    }

    private forEachFace(shape, callback): any {
        let faceIndex = 0;
        const anExplorer = new this.context.occ.TopExp_Explorer_2(
            shape,
            this.context.occ.TopAbs_ShapeEnum.TopAbs_FACE,
            this.context.occ.TopAbs_ShapeEnum.TopAbs_SHAPE
        );
        for (anExplorer.Init(shape, this.context.occ.TopAbs_ShapeEnum.TopAbs_FACE, this.context.occ.TopAbs_ShapeEnum.TopAbs_SHAPE);
            anExplorer.More();
            anExplorer.Next()) {
            callback(faceIndex++, this.context.occ.TopoDS.Face_1(anExplorer.Current()));
        }
    }

    private createCircle(radius: number, center: number[], wire: boolean): any {
        const circle = this.oc.gcMakeCircle(center, [0, 0, 1], radius);
        const edge = this.oc.bRepBuilderAPIMakeEdge(circle);
        const circleWire = this.oc.bRepBuilderAPIMakeWire(edge);
        if (wire) {
            return circleWire;
        }
        return this.oc.bRepBuilderAPIMakeFace(wire, true);
    }

    private shapeToMesh(shape, maxDeviation, fullShapeEdgeHashes, fullShapeFaceHashes): {
        faceList: {
            face_index: number;
            normal_coord: number[];
            number_of_triangles: number;
            tri_indexes: number[];
            vertex_coord: number[];
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
        }[] = [];
        const edgeList: {
            edge_index: number;
            vertex_coord: number[][];
        }[] = [];

        // Set up the Incremental Mesh builder, with a precision
        const inctementalMeshBuilder = new this.context.occ.BRepMesh_IncrementalMesh_2(shape, maxDeviation, false, maxDeviation * 5, false);

        // Construct the edge hashes to assign proper indices to the edges
        const fullShapeEdgeHashes2 = {};

        // Iterate through the faces and triangulate each one
        const triangulations = [];
        this.forEachFace(shape, (faceIndex, myFace) => {
            const aLocation = new this.context.occ.TopLoc_Location_1();
            const myT = this.context.occ.BRep_Tool.Triangulation(myFace, aLocation);
            if (myT.IsNull()) { console.error('Encountered Null Face!'); return; }

            const thisFace = {
                vertex_coord: [],
                normal_coord: [],
                tri_indexes: [],
                number_of_triangles: 0,
                face_index: fullShapeFaceHashes[myFace.HashCode(100000000)]
            };

            const pc = new this.context.occ.Poly_Connect_2(myT);
            const Nodes = myT.get().Nodes();

            // write vertex buffer
            thisFace.vertex_coord = new Array(Nodes.Length() * 3);
            for (let i = 0; i < Nodes.Length(); i++) {
                const p = Nodes.Value(i + 1).Transformed(aLocation.Transformation());
                thisFace.vertex_coord[(i * 3) + 0] = p.X();
                thisFace.vertex_coord[(i * 3) + 1] = p.Y();
                thisFace.vertex_coord[(i * 3) + 2] = p.Z();
            }

            // write normal buffer
            const myNormal = new this.context.occ.TColgp_Array1OfDir_2(Nodes.Lower(), Nodes.Upper());
            const SST = new this.context.occ.StdPrs_ToolTriangulatedShape();
            this.context.occ.StdPrs_ToolTriangulatedShape.Normal(myFace, pc, myNormal);
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
                if (orient !== this.context.occ.TopAbs_FORWARD) {
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

            this.forEachEdge(myFace, (index, myEdge) => {
                const edgeHash = myEdge.HashCode(100000000);
                if (fullShapeEdgeHashes2.hasOwnProperty(edgeHash)) {
                    const thisEdge = {
                        vertex_coord: [],
                        edge_index: -1
                    };

                    const myP = this.context.occ.BRep_Tool.PolygonOnTriangulation_1(myEdge, myT, aLocation);
                    const edgeNodes = myP.get().Nodes();

                    // write vertex buffer
                    thisEdge.vertex_coord = [];
                    for (let j = 0; j < edgeNodes.Length(); j++) {
                        const vertexIndex = edgeNodes.Value(j + 1);
                        thisEdge.vertex_coord.push([
                            thisFace.vertex_coord[((vertexIndex - 1) * 3) + 0],
                            thisFace.vertex_coord[((vertexIndex - 1) * 3) + 1],
                            thisFace.vertex_coord[((vertexIndex - 1) * 3) + 2]
                        ]);
                        // thisEdge.vertex_coord[(j * 3) + 0] = thisFace.vertex_coord[((vertexIndex - 1) * 3) + 0];
                        // thisEdge.vertex_coord[(j * 3) + 1] = thisFace.vertex_coord[((vertexIndex - 1) * 3) + 1];
                        // thisEdge.vertex_coord[(j * 3) + 2] = thisFace.vertex_coord[((vertexIndex - 1) * 3) + 2];
                    }

                    thisEdge.edge_index = fullShapeEdgeHashes[edgeHash];

                    edgeList.push(thisEdge);
                } else {
                    fullShapeEdgeHashes2[edgeHash] = edgeHash;
                }
            });
            triangulations.push(myT);
        });
        // Nullify Triangulations between runs so they're not stored in the cache
        for (let i = 0; i < triangulations.length; i++) {
            triangulations[i].Nullify();
        }

        // Get the free edges that aren't on any triangulated face/surface
        this.forEachEdge(shape, (index, myEdge) => {
            const edgeHash = myEdge.HashCode(100000000);
            if (!fullShapeEdgeHashes2.hasOwnProperty(edgeHash)) {
                const thisEdge = {
                    vertex_coord: [],
                    edge_index: -1
                };

                const aLocation = new this.context.occ.TopLoc_Location_1();
                const adaptorCurve = new this.context.occ.BRepAdaptor_Curve_2(myEdge);
                const tangDef = new this.context.occ.GCPnts_TangentialDeflection_2(adaptorCurve, maxDeviation, 0.1, 2, 1.0e-9, 1.0e-7);

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

                thisEdge.edge_index = fullShapeEdgeHashes[edgeHash];
                fullShapeEdgeHashes2[edgeHash] = edgeHash;

                edgeList.push(thisEdge);
            }
        });



        return { faceList, edgeList };
    }
}
