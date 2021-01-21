import { Injectable } from '@angular/core';
import { Color3, Mesh, MeshBuilder, StandardMaterial, VertexData } from '@babylonjs/core';
import { Context } from '../../context';
import { GeometryHelper } from '../../geometry-helper';
import * as Inputs from '../../inputs/inputs';
import { OCCHelper } from './occ-helper';

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
        private readonly occHelper: OCCHelper
    ) { }

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
     * Creates OpenCascade Polygon
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createPolygon.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createpolygon
     * @param inputs Polygon points
     * @returns OpenCascade polygon shape
     */
    createPolygon(inputs: Inputs.OCC.PolygonDto): any {
        const builder = new this.context.occ.BRep_Builder();
        const aComp = new this.context.occ.TopoDS_Compound();
        builder.MakeCompound(aComp);
        const path = inputs.polygon.map(([x, y, z]) => new this.context.occ.gp_Pnt_3(x, y, z));
        const makePolygon = new this.context.occ.BRepBuilderAPI_MakePolygon_3(path[0], path[1], path[2], true);
        const wire = makePolygon.Wire();
        const f = new this.context.occ.BRepBuilderAPI_MakeFace_15(wire, false);
        builder.Add(aComp, f.Shape());
        return aComp;
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
        const pt = new this.context.occ.gp_Pnt_3(
            -inputs.width / 2 + inputs.center[0],
            -inputs.height / 2 + inputs.center[1],
            -inputs.length / 2 + inputs.center[2]
        );
        return new this.context.occ.BRepPrimAPI_MakeBox_2(pt, inputs.width, inputs.height, inputs.length).Shape();
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
        const pt = new this.context.occ.gp_Pnt_3(inputs.center[0], inputs.center[1], inputs.center[2]);
        const spherePlane = new this.context.occ.gp_Ax2_3(pt, new this.context.occ.gp_Dir_4(0., 0., 1.));
        return new this.context.occ.BRepPrimAPI_MakeSphere_9(spherePlane, inputs.radius).Shape();
    }

    /**
     * Fillets OpenCascade Shapes
     * <div>
     *  <img src="../assets/images/blockly-images/occ/createSphere.svg" alt="Blockly Image"/>
     * </div>
     * @link https://docs.bitbybit.dev/classes/bitbybit_occ.occ.html#createsphere
     * @param inputs Sphere size
     * @returns OpenCascade Sphere
     */
    filletEdges(shape, radius, edgeList, filletAll): any {
        if (filletAll) {
            const mkFillet = new this.context.occ.BRepFilletAPI_MakeFillet(
                shape, this.context.occ.ChFi3d_FilletShape.ChFi3d_Rational
            );
            const anEdgeExplorer = new this.context.occ.TopExp_Explorer_2(
                shape, this.context.occ.TopAbs_ShapeEnum.TopAbs_EDGE, this.context.occ.TopAbs_ShapeEnum.TopAbs_SHAPE
            );
            while (anEdgeExplorer.More()) {
                const anEdge = new this.context.occ.TopoDS.Edge_1(anEdgeExplorer.Current());
                // Add edge to fillet algorithm
                mkFillet.Add_2(0.5, anEdge);
                anEdgeExplorer.Next();
            }
            shape = mkFillet.Shape();
            return shape;
        } else {
            const mkFillet = new this.context.occ.BRepFilletAPI_MakeFillet(shape, this.context.occ.ChFi3d_FilletShape.ChFi3d_Rational);
            let foundEdges = 0;
            let curFillet;
            this.forEachEdge(shape, (index, edge) => {
                if (edgeList.includes(index)) {
                    mkFillet.Add_2(radius, edge);
                    foundEdges++;
                }
            });
            if (foundEdges === 0) {
                console.error('Fillet Edges Not Found!  Make sure you are looking at the object _before_ the Fillet is applied!');
                curFillet = shape.Solid();
            }
            else {
                curFillet = mkFillet.Shape();
            }
            this.occHelper.sceneShapes.push(curFillet);
            return curFillet;
        }
    }

    forEachEdge(shape, callback): any {
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
}
