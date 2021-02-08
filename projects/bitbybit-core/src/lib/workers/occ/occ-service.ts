import * as Inputs from '../../api/inputs/occ-inputs';
import { OccHelper } from './occ-helper';


// Worker make an instance of this class itself
export class Occ {

    constructor(
        private readonly occ,
        private readonly och: OccHelper) {
    }

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

    createPolygonFace(inputs: Inputs.OCC.PolygonDto): any {
        return this.och.bRepBuilderAPIMakeFace(this.createPolygonWire(inputs), false);
    }

    createBox(inputs: Inputs.OCC.BoxDto): any {
        return this.och.bRepPrimAPIMakeBox(inputs.width, inputs.length, inputs.height, inputs.center);
    }

    createCylinder(inputs: Inputs.OCC.CylinderDto): any {
        return this.och.bRepPrimAPIMakeCylinder(
            [inputs.center[0], -inputs.height / 2 + inputs.center[1], inputs.center[2]],
            [0., 1., 0.],
            inputs.radius,
            inputs.height
        );
    }

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

    createCircleWire(inputs: Inputs.OCC.CircleDto): any {
        return this.createCircle(inputs.radius, inputs.center, true);
    }

    createCircleFace(inputs: Inputs.OCC.CircleDto): any {
        return this.createCircle(inputs.radius, inputs.center, false);
    }

    loft(inputs: Inputs.OCC.LoftDto): any {
        const pipe = new this.occ.BRepOffsetAPI_ThruSections(inputs.makeSolid, false, 1.0e-06);
        inputs.shapes.forEach((wire) => { pipe.AddWire(wire); });
        pipe.Build();
        return pipe.Shape();
    }

    offset(inputs: Inputs.OCC.OffsetDto): any {
        if (!inputs.tolerance) { inputs.tolerance = 0.1; }
        if (inputs.distance === 0.0) { return inputs.shape; }
        let offset = null;
        if (inputs.shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_WIRE ||
            inputs.shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_EDGE) {
            let wire;
            if (inputs.shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_EDGE) {
                wire = this.och.bRepBuilderAPIMakeWire(inputs.shape);
            } else {
                wire = inputs.shape;
            }
            offset = new this.occ.BRepOffsetAPI_MakeOffset_1();
            offset.Init_2(this.occ.GeomAbs_JoinType.GeomAbs_Arc, false);
            offset.AddWire(wire);
            offset.Perform(inputs.distance, 0.0);
        } else {
            let shell = inputs.shape;
            if (inputs.shape.ShapeType() === this.occ.TopAbs_ShapeEnum.TopAbs_FACE) {
                shell = this.och.bRepBuilderAPIMakeShell(inputs.shape);
            }
            offset = new this.occ.BRepOffsetAPI_MakeOffsetShape_1();
            offset.PerformByJoin(
                shell,
                inputs.distance,
                inputs.tolerance,
                this.occ.BRepOffset_Mode.BRepOffset_Skin,
                false,
                false,
                this.occ.GeomAbs_JoinType.GeomAbs_Arc,
                false
            );
        }
        let offsetShape = offset.Shape();
        return offsetShape;
    }

    extrude(inputs: Inputs.OCC.ExtrudeDto): any {
        return new this.occ.BRepPrimAPI_MakePrism_1(
            inputs.shape,
            new this.occ.gp_Vec_4(inputs.direction[0], inputs.direction[1], inputs.direction[2]),
            false,
            true
        ).Shape();
    }

    createFaceFromWire(inputs: Inputs.OCC.FaceFromWireDto): any {
        const wire = new this.occ.TopoDS.Wire_1(inputs.shape);
        return this.och.bRepBuilderAPIMakeFace(wire, inputs.planar);
    }

    revolve(inputs: Inputs.OCC.RevolveDto): any {
        if (!inputs.angle) { inputs.angle = 360.0; }
        if (!inputs.direction) { inputs.direction = [0, 0, 1]; }
        let result;
        if (inputs.angle >= 360.0) {
            result = new this.occ.BRepPrimAPI_MakeRevol_2(inputs.shape,
                new this.occ.gp_Ax1_2(new this.occ.gp_Pnt_3(0, 0, 0),
                    new this.occ.gp_Dir_4(inputs.direction[0], inputs.direction[1], inputs.direction[2])),
                inputs.copy).Shape();
        } else {
            result = new this.occ.BRepPrimAPI_MakeRevol_1(inputs.shape,
                new this.occ.gp_Ax1_2(new this.occ.gp_Pnt_3(0, 0, 0),
                    new this.occ.gp_Dir_4(inputs.direction[0], inputs.direction[1], inputs.direction[2])),
                inputs.angle * 0.0174533, inputs.copy).Shape();
        }
        return result;
    }

    pipe(inputs: Inputs.OCC.PipeDto): any {
        const pipe = new this.occ.BRepOffsetAPI_MakePipeShell(inputs.shape);
        inputs.shapes.forEach(sh => {
            pipe.Add_1(sh, false, false);
        });
        pipe.Build();
        pipe.MakeSolid();
        return pipe.Shape();
    }

    createSphere(inputs: Inputs.OCC.SphereDto): any {
        return this.och.bRepPrimAPIMakeSphere(inputs.center, [0., 0., 1.], inputs.radius);
    }

    createCone(inputs: Inputs.OCC.ConeDto): any {
        return new this.occ.BRepPrimAPI_MakeCone_1(inputs.radius1, inputs.radius2, inputs.height).Shape();
    }


    filletEdges(inputs: Inputs.OCC.FilletDto): any {
        if (!inputs.edgeList || (inputs.edgeList.length && inputs.edgeList.length === 0)) {
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
        } else if(inputs.edgeList && inputs.edgeList.length > 0) {
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
                throw (new Error('Fillet Edges Not Found!  Make sure you are looking at the object _before_ the Fillet is applied!'));
            }
            else {
                curFillet = mkFillet.Shape();
            }
            return curFillet;
        }
    }

    chamferEdges(inputs: Inputs.OCC.ChamferDto): any {
        if (!inputs.edgeList || (inputs.edgeList.length && inputs.edgeList.length === 0)) {
            const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
                inputs.shape
            );
            const anEdgeExplorer = new this.occ.TopExp_Explorer_2(
                inputs.shape, this.occ.TopAbs_ShapeEnum.TopAbs_EDGE, this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE
            );
            while (anEdgeExplorer.More()) {
                const anEdge = new this.occ.TopoDS.Edge_1(anEdgeExplorer.Current());
                mkChamfer.Add_2(inputs.distance, anEdge);
                anEdgeExplorer.Next();
            }
            inputs.shape = mkChamfer.Shape();
            return inputs.shape;
        } else if (inputs.edgeList && inputs.edgeList.length > 0){
            const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
                inputs.shape
            );
            let foundEdges = 0;
            let curFillet;
            this.forEachEdge(inputs.shape, (index, edge) => {
                if (inputs.edgeList.includes(index)) {
                    mkChamfer.Add_2(inputs.distance, edge);
                    foundEdges++;
                }
            });
            if (foundEdges === 0) {
                console.error('Fillet Edges Not Found!  Make sure you are looking at the object _before_ the Fillet is applied!');
                curFillet = inputs.shape.Solid();
            }
            else {
                curFillet = mkChamfer.Shape();
            }
            return curFillet;
        }
    }


    /**
     * Joins separate objects
     * <div>
     *  <img src="../assets/images/blockly-images/occt/union.svg" alt="Blockly Image"/>
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

    intersection(inputs: Inputs.OCC.IntersectionDto): any {
        if (inputs.shapes.length < 2) {
            throw (new Error('Less than 2 shapes provided for intersection'));
        }

        let intersected = inputs.shapes[0];
        for (let i = 1; i < inputs.shapes.length; i++) {
            const intersectedCommon = new this.occ.BRepAlgoAPI_Common_3(intersected, inputs.shapes[i]);
            intersectedCommon.Build();
            intersected = intersectedCommon.Shape();
        }

        if (!inputs.keepEdges) {
            const fusor = new this.occ.ShapeUpgrade_UnifySameDomain_2(intersected, true, true, false);
            fusor.Build();
            intersected = fusor.Shape();
        }

        return intersected;
    }

    removeInternalEdges(inputs: Inputs.OCC.ShapeDto): any {
        const fusor = new this.occ.ShapeUpgrade_UnifySameDomain_2(inputs.shape, true, true, false);
        fusor.Build();
        return fusor.Shape();
    }

    getEdge(inputs: Inputs.OCC.ShapeIndexDto): any {
        if (!inputs.shape || inputs.shape.ShapeType() > this.occ.TopAbs_ShapeEnum.TopAbs_WIRE || inputs.shape.IsNull()) {
            throw (new Error('Shape is not provided or is of incorrect type'));
        }
        if (!inputs.index) { inputs.index = 0; }
        let innerEdge = {}; let edgesFound = 0;
        this.forEachEdge(inputs.shape, (i, s) => {
            if (i === inputs.index) { innerEdge = s; } edgesFound++;
        });
        return innerEdge;
    }

    getWire(inputs: Inputs.OCC.ShapeIndexDto): any {
        if (!inputs.shape || inputs.shape.ShapeType() > this.occ.TopAbs_ShapeEnum.TopAbs_FACE || inputs.shape.IsNull()) {
            throw (new Error('Shape is not provided or is of incorrect type'));
        }
        if (!inputs.index) { inputs.index = 0; }
        let innerWire = {}; let wiresFound = 0;
        this.forEachWire(inputs.shape, (i, s) => {
            if (i === inputs.index) { innerWire = new this.occ.TopoDS.Wire_1(s); } wiresFound++;
        });
        return innerWire;
    }

    getFace(inputs: Inputs.OCC.ShapeIndexDto): any {
        if (!inputs.shape || inputs.shape.ShapeType() > this.occ.TopAbs_ShapeEnum.TopAbs_SHELL || inputs.shape.IsNull()) {
            throw (new Error('Shape is not provided or is of incorrect type'));
        }
        if (!inputs.index) { inputs.index = 0; }
        let innerFace = {}; let facesFound = 0;
        this.forEachFace(inputs.shape, (i, s) => {
            if (i === inputs.index) { innerFace = new this.occ.TopoDS.Face_1(s); } facesFound++;
        });
        return innerFace;
    }

    rotatedExtrude(inputs: Inputs.OCC.RotationExtrudeDto): any {
        const upperPolygon = this.rotate(
            {
                axis: [0, 1, 0],
                angle: inputs.angle,
                shape: this.translate({
                    translation: [0, inputs.height, 0],
                    shape: inputs.shape,
                })
            });

        // Define the straight spine going up the middle of the sweep
        const spineWire = this.createBSpline({
            points: [
                [0, 0, 0],
                [0, inputs.height, 0]
            ],
            closed: false,
        });

        // Define the guiding helical auxiliary spine (which controls the rotation)
        const steps = 30;
        const aspinePoints = [];
        for (let i = 0; i <= steps; i++) {
            const alpha = i / steps;
            aspinePoints.push([
                20 * Math.sin(alpha * inputs.angle * 0.0174533),
                inputs.height * alpha,
                20 * Math.cos(alpha * inputs.angle * 0.0174533),
            ]);
        }

        const aspineWire = this.createBSpline({ points: aspinePoints, closed: false });

        // Sweep the face wires along the spine to create the extrusion
        const pipe = new this.occ.BRepOffsetAPI_MakePipeShell(spineWire);
        pipe.SetMode_5(aspineWire, true, this.occ.BRepFill_TypeOfContact.BRepFill_NoContact);
        pipe.Add_1(inputs.shape, false, false);
        pipe.Add_1(upperPolygon, false, false);
        pipe.Build();
        pipe.MakeSolid();
        return pipe.Shape();
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
        this.forEachFace(shape, (faceIndex, myFace) => {
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

                    thisEdge.edge_index = index;

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

                thisEdge.edge_index = index;
                fullShapeEdgeHashes2[edgeHash] = edgeHash;

                edgeList.push(thisEdge);
            }
        });
        return { faceList, edgeList };
    }

    transform(inputs: Inputs.OCC.TransformDto): any {
        return this.translate(
            {
                translation: inputs.translation,
                shape: this.rotate({
                    axis: inputs.rotationAxis,
                    angle: inputs.rotationAngle,
                    shape: this.scale({
                        factor: inputs.scaleFactor,
                        shape: inputs.shape,
                    })
                })
            }
        );
    }

    translate(inputs: Inputs.OCC.TranslateDto): any {
        const transformation = new this.occ.gp_Trsf_1();
        transformation.SetTranslation_1(new this.occ.gp_Vec_4(inputs.translation[0], inputs.translation[1], inputs.translation[2]));
        const translation = new this.occ.TopLoc_Location_2(transformation);
        return inputs.shape.Moved(translation);
    }

    rotate(inputs: Inputs.OCC.RotateDto): any {
        let rotated;
        if (inputs.angle === 0) {
            rotated = inputs.shape;
        } else {
            const transformation = new this.occ.gp_Trsf_1();
            transformation.SetRotation_1(
                new this.occ.gp_Ax1_2(
                    new this.occ.gp_Pnt_3(0, 0, 0),
                    new this.occ.gp_Dir_2(
                        new this.occ.gp_Vec_4(inputs.axis[0], inputs.axis[1], inputs.axis[2])
                    )
                ),
                inputs.angle * 0.0174533);
            const rotation = new this.occ.TopLoc_Location_2(transformation);
            rotated = inputs.shape.Moved(rotation);
        }
        return rotated;
    }

    scale(inputs: Inputs.OCC.ScaleDto): any {
        const transformation = new this.occ.gp_Trsf_1();
        const gpPnt = this.och.gpPnt([0, 0, 0]);
        transformation.SetScale(gpPnt, inputs.factor);
        const scaling = new this.occ.TopLoc_Location_2(transformation);
        return inputs.shape.Moved(scaling);
    }

    saveShapeSTEP(inputs: Inputs.OCC.SaveStepDto): string {
        inputs.filename = 'x';
        const writer = new this.occ.STEPControl_Writer_1();
        // Convert to a .STEP File
        const transferResult = writer.Transfer(inputs.shape, this.occ.STEPControl_StepModelType.STEPControl_AsIs, true);
        if (transferResult.value === 1) {
            // Write the STEP File to the virtual Emscripten Filesystem Temporarily
            const writeResult = writer.Write(inputs.filename);
            if (writeResult.value === 1) {
                // Read the STEP File from the filesystem and clean up
                const stepFileText = this.occ.FS.readFile('/' + inputs.filename, { encoding: 'utf8' });
                this.occ.FS.unlink('/' + inputs.filename);

                // Return the contents of the STEP File
                return stepFileText;
            } else {
                throw (new Error('Failed when writing step file.'));
            }
        } else {
            throw (new Error('Failed when transfering to step writer.'));
        }
    }

    makeCompound(inputs: Inputs.OCC.CompoundShapesDto): any {
        const resCompound = new this.occ.TopoDS_Compound();
        const builder = new this.occ.BRep_Builder();
        builder.MakeCompound(resCompound);
        inputs.shapes.forEach(shape => {
            builder.Add(resCompound, shape);
        });
        return resCompound;
    }

    makeThickSolidSimple(inputs: Inputs.OCC.ThisckSolidSimpleDto): any {
        const maker = new this.occ.BRepOffsetAPI_MakeThickSolid_1();
        maker.MakeThickSolidBySimple(inputs.shape, inputs.offset);

        maker.Build();
        return maker.Shape();
    }

    /** This function parses the ASCII contents of a `.STEP` or `.IGES`
     * File as a Shape into the `externalShapes` dictionary.
     */
    importSTEPorIGES(inputs: Inputs.OCC.ImportStepOrIgesDto): any {
        const fileName = inputs.filename;
        const fileText = inputs.filetext;

        // Writes the uploaded file to Emscripten's Virtual Filesystem
        this.occ.FS.createDataFile('/', fileName, fileText, true, true);

        // Choose the correct OpenCascade file parsers to read the CAD file
        let reader = null; const tempFilename = fileName.toLowerCase();
        if (tempFilename.endsWith('.step') || tempFilename.endsWith('.stp')) {
            reader = new this.occ.STEPControl_Reader_1();
        } else if (tempFilename.endsWith('.iges') || tempFilename.endsWith('.igs')) {
            reader = new this.occ.IGESControl_Reader_1();
        } else { console.error('opencascade.js can\'t parse this extension! (yet)'); }

        const readResult = reader.ReadFile(fileName);            // Read the file
        if (readResult.value === 1) {
            reader.TransferRoots();                              // Translate all transferable roots to OpenCascade
            const stepShape = reader.OneShape();         // Obtain the results of translation in one OCCT shape

            this.occ.FS.unlink('/' + fileName);

            return stepShape;
        } else {
            throw (new Error('Error occured while trying to read the file.'));
        }
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

    private forEachWire(shape, callback): void {
        let wireIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer_2(shape,
            this.occ.TopAbs_ShapeEnum.TopAbs_WIRE,
            this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE);
        for (anExplorer.Init(shape,
            this.occ.TopAbs_ShapeEnum.TopAbs_WIRE,
            this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE); anExplorer.More(); anExplorer.Next()) {
            callback(wireIndex++, this.occ.TopoDS.Wire_2(anExplorer.Current()));
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

    private forEachShell(shape, callback): any {
        let faceIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer_2(
            shape,
            this.occ.TopAbs_ShapeEnum.TopAbs_SHELL,
            this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE
        );
        for (anExplorer.Init(shape, this.occ.TopAbs_ShapeEnum.TopAbs_SHELL, this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE);
            anExplorer.More();
            anExplorer.Next()) {
            callback(faceIndex++, this.occ.TopoDS.Shell_1(anExplorer.Current()));
        }
    }

    private forEachVertex(shape, callback): any {
        let faceIndex = 0;
        const anExplorer = new this.occ.TopExp_Explorer_2(
            shape,
            this.occ.TopAbs_ShapeEnum.TopAbs_VERTEX,
            this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE
        );
        for (anExplorer.Init(shape, this.occ.TopAbs_ShapeEnum.TopAbs_VERTEX, this.occ.TopAbs_ShapeEnum.TopAbs_SHAPE);
            anExplorer.More();
            anExplorer.Next()) {
            callback(faceIndex++, this.occ.TopoDS.Vertex_1(anExplorer.Current()));
        }
    }
    private createCircle(radius: number, center: number[], wire: boolean): any {
        const circle = this.och.gcMakeCircle(center, [0, 0, 1], radius);
        const edge = this.och.bRepBuilderAPIMakeEdge(circle);
        const circleWire = this.och.bRepBuilderAPIMakeWire(edge);
        if (wire) {
            return circleWire;
        }
        return this.och.bRepBuilderAPIMakeFace(circleWire, true);
    }

    private isArrayLike(item): any {
        return (
            Array.isArray(item) ||
            (!!item &&
                typeof item === 'object' &&
                item.hasOwnProperty('length') &&
                typeof item.length === 'number' &&
                item.length > 0 &&
                (item.length - 1) in item
            )
        );
    }

}
