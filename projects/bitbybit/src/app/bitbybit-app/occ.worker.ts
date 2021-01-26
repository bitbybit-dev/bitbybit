/// <reference lib="webworker" />
import { initOpenCascade } from 'opencascade.js';
import * as Inputs from '../../../../bitbybit-core/src/lib/api/inputs/occ-inputs';

let openCascade: Occ;
let cacheHelper: CacheHelper;

initOpenCascade().then(occ => {
    cacheHelper = new CacheHelper();
    openCascade = new Occ(occ, new OccHelper(occ));
    postMessage('occ initialised;');
});

type DataInput = {
    /**
     * Action data is used for cashing as a hashed number.
     */
    action: {
        functionName: string;
        inputs: any;
    }
    // Uid is used to know to which promise to resolve when answering
    uid: string;
};

addEventListener('message', ({ data }) => {

    const d = data as DataInput;
    let result;

    try {
        // Ok, so this is baked in memoization as all OCC computations are potentially very expensive
        // we can always return already computed entity hashes. On UI side we only deal with hashes as long
        // as we don't need to render things and when we do need, we call tessellation methods with these hashes
        // and receive real objects. This cache is useful in modeling operations throughout 'run' sessions.
        if (d.action.functionName !== 'shapeToMesh' && d.action.functionName !== 'startedTheRun') {
            // if inputs have shape or shapes properties, these are hashes on which the operations need to be performed.
            // We thus replace these hashes to real objects from the cache before functions are called,
            // this probably looks like smth generic but isn't, so will need to check if it works
            if (d.action.inputs.shape) {
                d.action.inputs.shape = cacheHelper.checkCache(d.action.inputs.shape);
            }
            if (d.action.inputs.shapes && d.action.inputs.shapes.length > 0) {
                d.action.inputs.shapes = d.action.inputs.shapes.map(hash => cacheHelper.checkCache(hash));
            }

            result = cacheHelper.cacheOp(d.action, () => openCascade[d.action.functionName](d.action.inputs)).hash;
        }
        if (d.action.functionName === 'shapeToMesh') {
            d.action.inputs.shape = cacheHelper.checkCache(d.action.inputs.shape);
            result = openCascade[d.action.functionName](d.action.inputs.shape, d.action.inputs.precision);
        }
        // Only the cache that was created in previous run has to be kept, the rest needs to go
        if (d.action.functionName === 'startedTheRun') {
            if (Object.keys(cacheHelper.hashesFromPreviousRun).length > 0) {
                cacheHelper.cleanUpCache();
            }
            result = {
                argCache: Object.keys(cacheHelper.argCache),
                hashesFromPreviousRun: Object.keys(cacheHelper.hashesFromPreviousRun),
                usedHashes: Object.keys(cacheHelper.usedHashes),
            };
        }
        // Returns only the hash as main process can't receive pointers
        // But with hash reference we can always initiate further computations
        postMessage({
            uid: data.uid,
            result
        });
    } catch (e) {
        let props;
        if (d && d.action && d.action.inputs) {
            props = `Input values were: {${Object.keys(d.action.inputs).map(key => `${key}: ${d.action.inputs[key]}`).join(',')}}. `;
        }
        let fun;
        if (d && d.action && d.action.functionName) {
            fun = `- ${d.action.functionName}`;
        }
        const message =
            postMessage({
                uid: data.uid,
                result: undefined,
                error: `OCC computation failed when executing function ${fun}. ${props}Original message: ${e}`
            });
    }

});

class OccHelper {

    constructor(private readonly occ) {
    }

    gpAx2(point: number[], direction: number[]): any {
        return new this.occ.gp_Ax2_3(
            this.gpPnt(point),
            this.gpDir(direction)
        );
    }

    gpPnt(point: number[]): any {
        return new this.occ.gp_Pnt_3(point[0], point[1], point[2]);
    }

    gpDir(direction: number[]): any {
        return new this.occ.gp_Dir_4(direction[0], direction[1], direction[2]);
    }

    gcMakeCircle(center: number[], direction: number[], radius: number): any {
        return new this.occ.GC_MakeCircle_2(this.gpAx2(center, direction), radius).Value();
    }

    bRepBuilderAPIMakeEdge(curve: any): any {
        return new this.occ.BRepBuilderAPI_MakeEdge_24(this.castHandleGeomCurve(curve)).Edge();
    }

    bRepBuilderAPIMakeWire(edge: any): any {
        return new this.occ.BRepBuilderAPI_MakeWire_2(edge).Wire();
    }

    bRepBuilderAPIMakeFace(wire: any, planar: boolean): any {
        return new this.occ.BRepBuilderAPI_MakeFace_14(wire, planar).Face();
    }

    bRepPrimAPIMakeSphere(center: number[], direction: number[], radius: number): any {
        const ax = this.gpAx2(center, direction);
        return new this.occ.BRepPrimAPI_MakeSphere_9(ax, radius).Shape();
    }

    bRepPrimAPIMakeCylinder(center: number[], direction: number[], radius, height): any {
        const ax = this.gpAx2(center, direction);
        return new this.occ.BRepPrimAPI_MakeCylinder_3(ax, radius, height).Shape();
    }

    bRepPrimAPIMakeBox(width: number, length: number, height: number, center: number[]): any {
        const pt = this.gpPnt([
            -width / 2 + center[0],
            -height / 2 + center[1],
            -length / 2 + center[2]
        ]);
        return new this.occ.BRepPrimAPI_MakeBox_2(pt, width, height, length).Shape();
    }

    castHandleGeomCurve(curve: any): any {
        return new this.occ.Handle_Geom_Curve_2(curve.get());
    }
}

export class Occ {


    constructor(
        private readonly occ,
        private readonly och: OccHelper) {
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
            gpPoints.push(this.och.gpPnt(inputs.points[ind]));
        }

        const polygonWire = new this.occ.BRepBuilderAPI_MakeWire_1();
        for (let ind = 0; ind < inputs.points.length - 1; ind++) {
            const seg = new this.occ.GC_MakeSegment_1(gpPoints[ind], gpPoints[ind + 1]).Value();
            const edge = new this.occ.BRepBuilderAPI_MakeEdge_24(
                new this.occ.Handle_Geom_Curve_2(seg.get())
            ).Edge();
            const innerWire = new this.occ.BRepBuilderAPI_MakeWire_2(edge).Wire();
            polygonWire.Add_2(innerWire);
        }
        const seg2 = new this.occ.GC_MakeSegment_1(gpPoints[inputs.points.length - 1], gpPoints[0]).Value();
        const edge2 = new this.occ.BRepBuilderAPI_MakeEdge_24(
            new this.occ.Handle_Geom_Curve_2(seg2.get())
        ).Edge();
        const innerWire2 = new this.occ.BRepBuilderAPI_MakeWire_2(edge2).Wire();
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
        return this.och.bRepBuilderAPIMakeFace(this.createPolygonWire(inputs), false);
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
        return this.och.bRepPrimAPIMakeBox(inputs.width, inputs.length, inputs.height, inputs.center);
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
        return this.och.bRepPrimAPIMakeCylinder(
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
        const ptList = new this.occ.TColgp_Array1OfPnt_2(1, inputs.points.length + (inputs.closed ? 1 : 0));
        for (let pIndex = 1; pIndex <= inputs.points.length; pIndex++) {
            ptList.SetValue(pIndex, this.och.gpPnt(inputs.points[pIndex - 1]));
        }
        if (inputs.closed) { ptList.SetValue(inputs.points.length + 1, ptList.Value(1)); }

        const geomCurveHandle = new this.occ.GeomAPI_PointsToBSpline_2(ptList, 3, 8,
            this.occ.GeomAbs_Shape.GeomAbs_C2, 1.0e-3);
        const edge = new this.occ.BRepBuilderAPI_MakeEdge_24(
            new this.occ.Handle_Geom_Curve_2(geomCurveHandle.Curve().get())
        ).Edge();
        return new this.occ.BRepBuilderAPI_MakeWire_2(edge).Wire();
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
        const ptList = new this.occ.TColgp_Array1OfPnt_2(1, inputs.points.length + (inputs.closed ? 1 : 0));
        for (let pIndex = 1; pIndex <= inputs.points.length; pIndex++) {
            ptList.SetValue(pIndex, this.och.gpPnt(inputs.points[pIndex - 1]));
        }
        if (inputs.closed) { ptList.SetValue(inputs.points.length + 1, ptList.Value(1)); }

        const geomCurveHandle = new this.occ.Geom_BezierCurve_1(ptList);
        const edge = new this.occ.BRepBuilderAPI_MakeEdge_24(
            new this.occ.Handle_Geom_Curve_2(geomCurveHandle)
        ).Edge();
        return new this.occ.BRepBuilderAPI_MakeWire_2(edge).Wire();
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
        const pipe = new this.occ.BRepOffsetAPI_ThruSections(inputs.shape, false, 1.0e-06);
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
        if (inputs.shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_WIRE) {
            offset = new this.occ.BRepOffsetAPI_MakeOffset_1();
            offset.AddWire(inputs.shape);
            offset.Perform(inputs.offsetDistance);
        } else {
            offset = new this.occ.BRepOffsetAPI_MakeOffsetShape_1();
            offset.PerformByJoin(
                inputs.shape,
                inputs.offsetDistance,
                inputs.tolerance,
                this.occ.BRepOffset_Mode.BRepOffset_Skin,
                false,
                false,
                this.occ.GeomAbs_JoinType.GeomAbs_Arc,
                false
            );
        }
        let offsetShape = new this.occ.TopoDS.Shell_2(offset.Shape());

        // Convert Shell to Solid as is expected
        if (offsetShape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_SHELL) {
            const solidOffset = new this.occ.BRepBuilderAPI_MakeSolid_1();
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
        return new this.occ.BRepPrimAPI_MakePrism_1(
            inputs.shape,
            new this.occ.gp_Vec_4(inputs.direction[0], inputs.direction[1], inputs.direction[2]),
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
        return this.och.bRepPrimAPIMakeSphere(inputs.center, [0., 0., 1.], inputs.radius);
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
            const mkFillet = new this.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, this.occ.ChFi3d_FilletShape.ChFi3d_Rational
            );
            const anEdgeExplorer = new this.occ.TopExp_Explorer_2(
                inputs.shape, this.occ.TopAbs_ShapeEnum.TopAbs_EDGE, this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE
            );
            while (anEdgeExplorer.More()) {
                const anEdge = new this.occ.TopoDS.Edge_1(anEdgeExplorer.Current());
                mkFillet.Add_2(inputs.radius, anEdge);
                anEdgeExplorer.Next();
            }
            inputs.shape = mkFillet.Shape();
            return inputs.shape;
        } else {
            const mkFillet = new this.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, this.occ.ChFi3d_FilletShape.ChFi3d_Rational
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
        let combined = inputs.shapes[0];
        for (let i = 0; i < inputs.shapes.length; i++) {
            const combinedFuse = new this.occ.BRepAlgoAPI_Fuse_3(combined, inputs.shapes[i]);
            combinedFuse.Build();
            combined = combinedFuse.Shape();
        }

        if (!inputs.keepEdges) {
            const fusor = new this.occ.ShapeUpgrade_UnifySameDomain_2(combined, true, true, false);
            fusor.Build();
            combined = fusor.Shape();
        }

        return combined;
    }

    difference(inputs: Inputs.OCC.DifferenceDto): any {
        let difference = inputs.shape;
        const objectsToSubtract = inputs.shapes;
        for (let i = 0; i < objectsToSubtract.length; i++) {
            if (!objectsToSubtract[i] || objectsToSubtract[i].IsNull()) { console.error('Tool in Difference is null!'); }
            const differenceCut = new this.occ.BRepAlgoAPI_Cut_3(difference, objectsToSubtract[i]);
            differenceCut.Build();
            difference = differenceCut.Shape();
        }

        if (!inputs.keepEdges) {
            const fusor = new this.occ.ShapeUpgrade_UnifySameDomain_2(difference, true, true, false);
            fusor.Build();
            difference = fusor.Shape();
        }

        if (this.getNumSolidsInCompound(difference) === 1) {
            difference = this.getSolidFromCompound(difference, 0);
        }

        return difference;
    }

    shapeToMesh(shape, maxDeviation): {
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

        const fullShapeEdgeHashes = {};
        const fullShapeFaceHashes = {};
        this.forEachFace(shape, (index, face) => {
            fullShapeFaceHashes[face.HashCode(100000000)] = index;
        });
        this.forEachEdge(shape, (index, edge) => {
            fullShapeEdgeHashes[edge.HashCode(100000000)] = index;
        });

        // Set up the Incremental Mesh builder, with a precision
        const inctementalMeshBuilder = new this.occ.BRepMesh_IncrementalMesh_2(shape, maxDeviation, false, maxDeviation * 5, false);

        // Construct the edge hashes to assign proper indices to the edges
        const fullShapeEdgeHashes2 = {};

        // Iterate through the faces and triangulate each one
        const triangulations = [];
        this.forEachFace(shape, (faceIndex, myFace) => {
            const aLocation = new this.occ.TopLoc_Location_1();
            const myT = this.occ.BRep_Tool.Triangulation(myFace, aLocation);
            if (myT.IsNull()) { console.error('Encountered Null Face!'); return; }

            const thisFace = {
                vertex_coord: [],
                normal_coord: [],
                tri_indexes: [],
                number_of_triangles: 0,
                face_index: fullShapeFaceHashes[myFace.HashCode(100000000)]
            };

            const pc = new this.occ.Poly_Connect_2(myT);
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
                if (orient !== this.occ.TopAbs_FORWARD) {
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

                    const myP = this.occ.BRep_Tool.PolygonOnTriangulation_1(myEdge, myT, aLocation);
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

                thisEdge.edge_index = fullShapeEdgeHashes[edgeHash];
                fullShapeEdgeHashes2[edgeHash] = edgeHash;

                edgeList.push(thisEdge);
            }
        });

        return { faceList, edgeList };
    }

    private getNumSolidsInCompound(shape): any {
        if (!shape ||
            shape.ShapeType() > this.occ.TopAbs_ShapeEnum.TopAbs_COMPSOLID ||
            shape.IsNull()
        ) {
            console.error('Not a compound shape!');
            return shape;
        }
        let solidsFound = 0;
        this.forEachSolid(shape, (i, s) => { solidsFound++; });
        return solidsFound;
    }

    private getSolidFromCompound(shape, index): any {
        if (!shape ||
            shape.ShapeType() > this.occ.TopAbs_ShapeEnum.TopAbs_COMPSOLID ||
            shape.IsNull()
        ) {
            console.error('Not a compound shape!');
            return shape;
        }
        if (!index) {
            index = 0;
        }

        let innerSolid: { hash?: string } = {};
        let solidsFound = 0;
        this.forEachSolid(shape, (i, s) => {
            if (i === index) { innerSolid = new this.occ.TopoDS.Solid_1(s); } solidsFound++;
        });
        if (solidsFound === 0) { console.error('NO SOLIDS FOUND IN SHAPE!'); innerSolid = shape; }
        innerSolid.hash = shape.hash + 1;
        return innerSolid;
    }

    private forEachSolid(shape, callback): void {
        let solidIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer_2(shape,
            this.occ.TopAbs_ShapeEnum.TopAbs_SOLID,
            this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE);
        for (anExplorer.Init(shape,
            this.occ.TopAbs_ShapeEnum.TopAbs_SOLID,
            this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE); anExplorer.More(); anExplorer.Next()) {
            callback(solidIndex++, this.occ.TopoDS.Solid_2(anExplorer.Current()));
        }
    }

    private forEachEdge(shape, callback): any {
        const edgeHashes = {};
        let edgeIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer_2(shape,
            this.occ.TopAbs_ShapeEnum.TopAbs_EDGE, this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE
        );
        for (anExplorer.Init(shape, this.occ.TopAbs_ShapeEnum.TopAbs_EDGE, this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE);
            anExplorer.More();
            anExplorer.Next()
        ) {
            const edge = this.occ.TopoDS.Edge_1(anExplorer.Current());
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
        const anExplorer = new this.occ.TopExp_Explorer_2(
            shape,
            this.occ.TopAbs_ShapeEnum.TopAbs_FACE,
            this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE
        );
        for (anExplorer.Init(shape, this.occ.TopAbs_ShapeEnum.TopAbs_FACE, this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE);
            anExplorer.More();
            anExplorer.Next()) {
            callback(faceIndex++, this.occ.TopoDS.Face_1(anExplorer.Current()));
        }
    }

    private createCircle(radius: number, center: number[], wire: boolean): any {
        const circle = this.och.gcMakeCircle(center, [0, 0, 1], radius);
        const edge = this.och.bRepBuilderAPIMakeEdge(circle);
        const circleWire = this.och.bRepBuilderAPIMakeWire(edge);
        if (wire) {
            return circleWire;
        }
        return this.och.bRepBuilderAPIMakeFace(wire, true);
    }


}


class CacheHelper {

    hashesFromPreviousRun = {};
    usedHashes = {};
    argCache = {};

    cleanUpCache(): void {
        const usedHashKeys = Object.keys(this.usedHashes);
        const hashesFromPreviousRunKeys = Object.keys(this.hashesFromPreviousRun);

        usedHashKeys.forEach(hash => {
            if (!hashesFromPreviousRunKeys.find(h => h === hash)) {
                if (this.argCache[hash]) {
                    this.argCache[hash].delete();
                    delete this.argCache[hash];
                }
                delete this.usedHashes[hash];
            }
        });

        this.hashesFromPreviousRun = {};
    }

    /** Hashes input arguments and checks the cache for that hash.
     * It returns a copy of the cached object if it exists, but will
     * call the `cacheMiss()` callback otherwise. The result will be
     * added to the cache if `GUIState["Cache?"]` is true.
     */
    cacheOp(args, cacheMiss): any {
        let toReturn = null;
        const curHash = this.computeHash(args);
        this.usedHashes[curHash] = curHash;
        this.hashesFromPreviousRun[curHash] = curHash;
        const check = this.checkCache(curHash);
        if (check) {
            // TODO I need to check if and why cloning is required.
            // toReturn = new this.occ.TopoDS_Shape(check);
            toReturn = check;
            toReturn.hash = check.hash;
        } else {
            toReturn = cacheMiss();
            toReturn.hash = curHash;
            this.addToCache(curHash, toReturn);
        }
        return toReturn;
    }
    /** Returns the cached object if it exists, or null otherwise. */
    checkCache(hash): any { return this.argCache[hash] || null; }
    /** Adds this `shape` to the cache, indexable by `hash`. */
    addToCache(hash, shape): any {
        // TODO I need to check if and why cloning is required. Having real objects in the cache can be used to free up memory?
        // const cacheShape = new this.occ.TopoDS_Shape(shape);
        const cacheShape = shape;
        cacheShape.hash = hash; // This is the cached version of the object
        this.argCache[hash] = cacheShape;
        return hash;
    }

    /** This function computes a 32-bit integer hash given a set of `arguments`.
     * If `raw` is true, the raw set of sanitized arguments will be returned instead. 
     */
    computeHash(args, raw?: any): any {
        let argsString = JSON.stringify(args);
        argsString = argsString.replace(/(\"ptr\"\:(-?[0-9]*?)\,)/g, '');
        argsString = argsString.replace(/(\"ptr\"\:(-?[0-9]*))/g, '');
        if (argsString.includes('ptr')) { console.error('YOU DONE MESSED UP YOUR REGEX.'); }
        const hashString = Math.random.toString() + argsString;
        if (raw) { return hashString; }
        return this.stringToHash(hashString);
    }

    /** This function converts a string to a 32bit integer. */
    stringToHash(str: string): any {
        let hash = 0;
        if (str.length === 0) { return hash; }
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            // tslint:disable-next-line: no-bitwise
            hash = ((hash << 5) - hash) + char;
            // tslint:disable-next-line: no-bitwise
            hash = hash & hash;
        }
        return hash;
    }

    /** This function returns a version of the `inputArray` without the `objectToRemove`. */
    remove(inputArray, objectToRemove): any {
        return inputArray.filter((el) => {
            return el.hash !== objectToRemove.hash ||
                el.ptr !== objectToRemove.ptr;
        });
    }
}