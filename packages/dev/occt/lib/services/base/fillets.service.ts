import { BRepFilletAPI_MakeFillet, BRepFilletAPI_MakeFillet2d, BitbybitOcctModule, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Vertex, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import { Base } from "../../api/inputs";
import { VectorHelperService } from "../../api/vector-helper.service";
import { IteratorService } from "./iterator.service";
import { ConverterService } from "./converter.service";
import { EntitiesService } from "./entities.service";
import { EdgesService } from "./edges.service";
import { ShapeGettersService } from "./shape-getters";
import { TransformsService } from "./transforms.service";
import { OperationsService } from "./operations.service";
import { FacesService } from "./faces.service";

export class FilletsService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly vecHelper: VectorHelperService,
        private readonly iteratorService: IteratorService,
        private readonly converterService: ConverterService,
        private readonly entitiesService: EntitiesService,
        private readonly transformsService: TransformsService,
        private readonly shapeGettersService: ShapeGettersService,
        private readonly edgesService: EdgesService,
        private readonly operationsService: OperationsService,
        private readonly facesService: FacesService
    ) { }

    filletEdges(inputs: Inputs.OCCT.FilletDto<TopoDS_Shape>): TopoDS_Shape {

        if (!inputs.indexes || inputs.indexes.length === 0) {
            if (inputs.radius === undefined) {
                throw (Error("Radius not defined"));
            }
            const mkFillet = new this.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, this.occ.ChFi3d_FilletShape.Rational
            );
            const anEdgeExplorer = new this.occ.TopExp_Explorer(
                inputs.shape, this.occ.TopAbs_ShapeEnum.EDGE,
                this.occ.TopAbs_ShapeEnum.SHAPE
            );
            const edges: TopoDS_Edge[] = [];
            while (anEdgeExplorer.More()) {
                const anEdge = this.occ.CastToEdge(anEdgeExplorer.Current());
                edges.push(anEdge);
                mkFillet.Add(inputs.radius, anEdge);
                anEdgeExplorer.Next();
            }
            const result = mkFillet.Shape();
            mkFillet.delete();
            anEdgeExplorer.delete();
            edges.forEach(e => e.delete());
            return result;
        } else {
            const mkFillet = new this.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, (this.occ.ChFi3d_FilletShape.Rational)
            );
            let foundEdges = 0;
            let curFillet: TopoDS_Shape;
            let radiusIndex = 0;
            const inputIndexes = inputs.indexes;
            this.iteratorService.forEachEdge(inputs.shape, (index, edge) => {
                if (inputIndexes.includes(index)) {
                    let radius = inputs.radius;
                    if (inputs.radiusList) {
                        radius = inputs.radiusList[radiusIndex];
                        radiusIndex++;
                    }
                    if (radius === undefined) {
                        throw (Error("Radius not defined, or radiusList not correct length"));
                    }
                    mkFillet.Add(radius, edge);
                    foundEdges++;
                }
            });
            if (foundEdges === 0) {
                throw (new Error("Fillet Edges Not Found!  Make sure you are looking at the object _before_ the Fillet is applied!"));
            }
            else {
                curFillet = mkFillet.Shape();
            }
            mkFillet.delete();
            const result = this.converterService.getActualTypeOfShape(curFillet);
            curFillet.delete();
            return result;
        }
    }

    filletEdgesListOneRadius(inputs: Inputs.OCCT.FilletEdgesListOneRadiusDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        if (inputs.edges && inputs.edges.length > 0) {
            const mkFillet = new this.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, (this.occ.ChFi3d_FilletShape.Rational)
            );
            inputs.edges.forEach((edge) => {
                mkFillet.Add(inputs.radius, edge);
            });
            const curFillet = mkFillet.Shape();
            mkFillet.delete();
            const result = this.converterService.getActualTypeOfShape(curFillet);
            curFillet.delete();
            return result;
        }
        throw new Error("Edges must be provided");
    }

    filletEdgesList(inputs: Inputs.OCCT.FilletEdgesListDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        if (inputs.edges && inputs.edges.length > 0 && inputs.radiusList && inputs.radiusList.length > 0 && inputs.edges.length === inputs.radiusList.length) {
            const mkFillet = new this.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, (this.occ.ChFi3d_FilletShape.Rational)
            );
            inputs.edges.forEach((edge, index) => {
                mkFillet.Add(inputs.radiusList[index]!, edge);
            });
            const curFillet = mkFillet.Shape();
            mkFillet.delete();
            const result = this.converterService.getActualTypeOfShape(curFillet);
            curFillet.delete();
            return result;
        }
        throw new Error("Edges and radius list must be provided with the same length");
    }

    filletEdgeVariableRadius(inputs: Inputs.OCCT.FilletEdgeVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        if (inputs.paramsU && inputs.paramsU.length > 0 && inputs.radiusList && inputs.radiusList.length > 0 && inputs.paramsU.length === inputs.radiusList.length) {
            const mkFillet = new this.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, (this.occ.ChFi3d_FilletShape.Rational)
            );
            this.assignVariableFilletToEdge(inputs, mkFillet);
            const curFillet = mkFillet.Shape();
            mkFillet.delete();
            const result = this.converterService.getActualTypeOfShape(curFillet);
            curFillet.delete();
            return result;
        }
        throw new Error("Params U and radius list must be provided with the same length");
    }

    filletEdgesSameVariableRadius(inputs: Inputs.OCCT.FilletEdgesSameVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        if (inputs.edges && inputs.edges.length > 0 &&
            inputs.radiusList && inputs.radiusList.length > 0 &&
            inputs.paramsU.length === inputs.radiusList.length) {
            const mkFillet = new this.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, (this.occ.ChFi3d_FilletShape.Rational)
            );
            inputs.edges.forEach((edge) => {
                this.assignVariableFilletToEdge({
                    edge, paramsU: inputs.paramsU, radiusList: inputs.radiusList, shape: inputs.shape,
                }, mkFillet);
            });
            const curFillet = mkFillet.Shape();
            mkFillet.delete();
            const result = this.converterService.getActualTypeOfShape(curFillet);
            curFillet.delete();
            return result;
        }
        throw new Error("Edges, params U and radius list must be provided with the same length");
    }

    filletEdgesVariableRadius(inputs: Inputs.OCCT.FilletEdgesVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        if (inputs.edges && inputs.edges.length > 0 &&
            inputs.radiusLists && inputs.radiusLists.length > 0 &&
            inputs.paramsULists.length === inputs.radiusLists.length &&
            inputs.paramsULists.length === inputs.edges.length &&
            inputs.radiusLists.length === inputs.edges.length) {
            const mkFillet = new this.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, (this.occ.ChFi3d_FilletShape.Rational)
            );
            inputs.edges.forEach((edge, index) => {
                this.assignVariableFilletToEdge({
                    edge, paramsU: inputs.paramsULists[index]!, radiusList: inputs.radiusLists[index]!, shape: inputs.shape,
                }, mkFillet);
            });
            const curFillet = mkFillet.Shape();
            mkFillet.delete();
            const result = this.converterService.getActualTypeOfShape(curFillet);
            curFillet.delete();
            return result;
        }
        throw new Error("Edges, radius lists and params U lists must be provided with the same length");
    }

    private assignVariableFilletToEdge(inputs: Inputs.OCCT.FilletEdgeVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>, mkFillet: BRepFilletAPI_MakeFillet) {
        const array = new this.occ.TColgp_Array1OfPnt2d(1, inputs.paramsU.length);
        inputs.paramsU.forEach((param, index) => {
            array.SetValue(index + 1, this.entitiesService.gpPnt2d([param, inputs.radiusList[index]!]));
        });
        mkFillet.AddWithLaw(array, inputs.edge);
    }

    chamferEdges(inputs: Inputs.OCCT.ChamferDto<TopoDS_Shape>): TopoDS_Shape {
        if (!inputs.indexes || inputs.indexes.length === 0) {
            if (inputs.distance === undefined) {
                throw (Error("Distance is undefined"));
            }
            const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
                inputs.shape
            );
            const anEdgeExplorer = new this.occ.TopExp_Explorer(
                inputs.shape, this.occ.TopAbs_ShapeEnum.EDGE,
                this.occ.TopAbs_ShapeEnum.SHAPE
            );
            const edges: TopoDS_Edge[] = [];
            while (anEdgeExplorer.More()) {
                const anEdge = this.occ.CastToEdge(anEdgeExplorer.Current());
                edges.push(anEdge);
                mkChamfer.Add(inputs.distance, anEdge);
                anEdgeExplorer.Next();
            }
            const result = mkChamfer.Shape();
            mkChamfer.delete();
            anEdgeExplorer.delete();
            edges.forEach(e => e.delete());
            return result;
        } else {
            const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
                inputs.shape
            );
            let foundEdges = 0;
            let curChamfer: TopoDS_Shape;
            let distanceIndex = 0;
            const inputIndexes = inputs.indexes;
            this.iteratorService.forEachEdge(inputs.shape, (index, edge) => {
                if (inputIndexes.includes(index)) {
                    let distance = inputs.distance;
                    if (inputs.distanceList) {
                        distance = inputs.distanceList[distanceIndex];
                        distanceIndex++;
                    }
                    if (distance === undefined) {
                        throw (Error("Distance not defined and/or distance list incorrect length"));
                    }
                    mkChamfer.Add(distance, edge);
                    foundEdges++;
                }
            });
            if (foundEdges === 0) {
                console.error("Chamfer Edges Not Found!  Make sure you are looking at the object _before_ the Fillet is applied!");
                curChamfer = inputs.shape;
            }
            else {
                curChamfer = mkChamfer.Shape();
            }
            mkChamfer.delete();
            const result = this.converterService.getActualTypeOfShape(curChamfer);
            curChamfer.delete();
            return result;
        }
    }

    chamferEdgesList(inputs: Inputs.OCCT.ChamferEdgesListDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        if (inputs.edges && inputs.edges.length > 0 && inputs.distanceList && inputs.distanceList.length > 0 && inputs.edges.length === inputs.distanceList.length) {
            const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
                inputs.shape
            );
            inputs.edges.forEach((edge, index) => {
                const distance = inputs.distanceList[index];
                if (distance === undefined) {
                    throw (Error("Distance is not defined"));
                }
                mkChamfer.Add(distance, edge);
            });
            const curChamfer = mkChamfer.Shape();
            mkChamfer.delete();
            const result = this.converterService.getActualTypeOfShape(curChamfer);
            curChamfer.delete();
            return result;
        }
        throw new Error("Edges and distance list must be provided with the same length");
    }

    chamferEdgeTwoDistances(inputs: Inputs.OCCT.ChamferEdgeTwoDistancesDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
        const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
            inputs.shape
        );
        mkChamfer.AddTwoDistances(inputs.distance1, inputs.distance2, inputs.edge, inputs.face);
        const curChamfer = mkChamfer.Shape();
        mkChamfer.delete();
        const result = this.converterService.getActualTypeOfShape(curChamfer);
        curChamfer.delete();
        return result;
    }

    chamferEdgesTwoDistances(inputs: Inputs.OCCT.ChamferEdgesTwoDistancesDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
        if (inputs.edges && inputs.edges.length > 0 &&
            inputs.edges.length === inputs.faces.length) {
            const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
                inputs.shape
            );
            inputs.edges.forEach((edge, index) => {
                mkChamfer.AddTwoDistances(inputs.distance1, inputs.distance2, edge, inputs.faces[index]!);
            });
            const curChamfer = mkChamfer.Shape();
            mkChamfer.delete();
            const result = this.converterService.getActualTypeOfShape(curChamfer);
            curChamfer.delete();
            return result;
        } else {
            throw new Error("Edges and faces must be provided with the same length");
        }
    }

    chamferEdgesTwoDistancesLists(inputs: Inputs.OCCT.ChamferEdgesTwoDistancesListsDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
        if (inputs.edges && inputs.edges.length > 0 &&
            inputs.faces && inputs.faces.length > 0 &&
            inputs.distances1 && inputs.distances1.length > 0 &&
            inputs.distances2 && inputs.distances2.length > 0 &&
            inputs.edges.length === inputs.faces.length &&
            inputs.edges.length === inputs.distances1.length &&
            inputs.edges.length === inputs.distances2.length) {
            const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
                inputs.shape
            );
            inputs.edges.forEach((edge, index) => {
                mkChamfer.AddTwoDistances(inputs.distances1[index]!, inputs.distances2[index]!, edge, inputs.faces[index]!);
            });
            const curChamfer = mkChamfer.Shape();
            mkChamfer.delete();
            const result = this.converterService.getActualTypeOfShape(curChamfer);
            curChamfer.delete();
            return result;
        } else {
            throw new Error("Edges, faces and distance lists must be provided with the same length");
        }
    }

    chamferEdgeDistAngle(inputs: Inputs.OCCT.ChamferEdgeDistAngleDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
        const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
            inputs.shape
        );
        const radians = this.vecHelper.degToRad(inputs.angle);
        mkChamfer.AddDA(inputs.distance, radians, inputs.edge, inputs.face);
        const curChamfer = mkChamfer.Shape();
        mkChamfer.delete();
        const result = this.converterService.getActualTypeOfShape(curChamfer);
        curChamfer.delete();
        return result;
    }

    chamferEdgesDistsAngles(inputs: Inputs.OCCT.ChamferEdgesDistsAnglesDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
        if (inputs.edges && inputs.edges.length > 0 &&
            inputs.faces && inputs.faces.length > 0 &&
            inputs.distances && inputs.distances.length > 0 &&
            inputs.angles && inputs.angles.length > 0 &&
            inputs.edges.length === inputs.distances.length &&
            inputs.edges.length === inputs.faces.length &&
            inputs.edges.length === inputs.angles.length) {
            const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
                inputs.shape
            );
            inputs.edges.forEach((edge, index) => {
                const radians = this.vecHelper.degToRad(inputs.angles[index]!);
                mkChamfer.AddDA(inputs.distances[index]!, radians, edge, inputs.faces[index]!);
            });
            const curChamfer = mkChamfer.Shape();
            mkChamfer.delete();
            const result = this.converterService.getActualTypeOfShape(curChamfer);
            curChamfer.delete();
            return result;
        } else {
            throw new Error("Edges, faces, distances and angles must be provided with the same length");
        }
    }

    chamferEdgesDistAngle(inputs: Inputs.OCCT.ChamferEdgesDistAngleDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
        if (inputs.edges && inputs.edges.length > 0 &&
            inputs.faces && inputs.faces.length > 0 &&
            inputs.edges.length === inputs.faces.length
        ) {
            const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
                inputs.shape
            );
            const radians = this.vecHelper.degToRad(inputs.angle);
            inputs.edges.forEach((edge, index) => {
                mkChamfer.AddDA(inputs.distance, radians, edge, inputs.faces[index]!);
            });
            const curChamfer = mkChamfer.Shape();
            mkChamfer.delete();
            const result = this.converterService.getActualTypeOfShape(curChamfer);
            curChamfer.delete();
            return result;
        } else {
            throw new Error("Edges and faces must be provided with the same length");
        }
    }

    fillet2d(inputs: Inputs.OCCT.FilletDto<TopoDS_Wire | TopoDS_Face>): TopoDS_Face | TopoDS_Wire {
        if (inputs.indexes && inputs.radiusList && inputs.radiusList.length !== inputs.indexes.length) {
            throw new Error("When using radius list, length of the list must match index list of corners that you want to fillet.");
        }
        let face;
        let isShapeFace = false;
        if (inputs.shape.ShapeType() === this.occ.TopAbs_ShapeEnum.FACE) {
            face = this.converterService.getActualTypeOfShape(inputs.shape);
            isShapeFace = true;
        } else if (inputs.shape.ShapeType() === this.occ.TopAbs_ShapeEnum.WIRE) {
            const faceShape = this.occ.MakeFaceFromWireOnlyPlane(inputs.shape, true);
            face = this.converterService.getActualTypeOfShape(faceShape);
            faceShape.delete();
        } else {
            throw new Error("You can only fillet a 2d wire or a 2d face.");
        }

        const filletMaker = new this.occ.BRepFilletAPI_MakeFillet2d(face);

        const anVertexExplorer = new this.occ.TopExp_Explorer(
            inputs.shape, this.occ.TopAbs_ShapeEnum.VERTEX,
            this.occ.TopAbs_ShapeEnum.SHAPE
        );
        let i = 1;
        const cornerVertices: TopoDS_Vertex[] = [];
        for (anVertexExplorer; anVertexExplorer.More(); anVertexExplorer.Next()) {
            const vertex: TopoDS_Vertex = this.occ.CastToVertex(anVertexExplorer.Current());
            if (i % 2 === 0) {
                cornerVertices.push(vertex);
            }
            i++;
        }
        if (!isShapeFace) {
            const wire = inputs.shape;
            if (!wire.Closed()) {
                cornerVertices.pop();
            }
        }
        let radiusAddedCounter = 0;
        cornerVertices.forEach((cvx, index) => {
            if (!inputs.indexes) {
                this.applyRadiusToVertex(inputs, filletMaker, cvx, index);
            } else if (inputs.indexes.includes(index + 1)) {
                this.applyRadiusToVertex(inputs, filletMaker, cvx, radiusAddedCounter);
                radiusAddedCounter++;
            }
        });
        filletMaker.Build();
        let result: TopoDS_Shape | undefined;
        if (isShapeFace) {
            result = filletMaker.Shape();
        } else {
            const isDone = filletMaker.IsDone();
            if (isDone) {
                const shape = filletMaker.Shape();
                const filletedWires = this.shapeGettersService.getWires({ shape });
                if (filletedWires.length === 1) {
                    result = filletedWires[0];
                }
            }
            else {
                const normal = this.facesService.faceNormalOnUV({ shape: face, paramU: 0.5, paramV: 0.5 });
                result = this.fillet3DWire({ shape: inputs.shape, radius: inputs.radius, radiusList: inputs.radiusList, indexes: inputs.indexes, direction: normal });
            }
        }
        anVertexExplorer.delete();
        filletMaker.delete();
        cornerVertices.forEach(cvx => cvx.delete());
        if (!result) {
            throw new Error("2D fillet failed");
        }
        return result;
    }

    /**
     * Fillets the corners of a wire that does not lie in a plane.
     *
     * OCCT has no 3D wire fillet, so the wire is extruded into a shell, the shell's edges are filleted,
     * and the wanted edge of each resulting face is collected back into a wire. That makes the whole
     * operation depend on how OCCT numbers the edges of an extrusion, which is observed behaviour
     * rather than anything documented, and cannot be worked out from first principles:
     *
     * - a 0-based corner `i >= 2` becomes extruded edge `4 + 3 * (i - 2)`
     * - a closed wire has its edge list rotated by one before that mapping applies
     * - on an open wire, corner 0 becomes edge 1
     * - after filleting, the edge wanted from each resulting face is always at index 3
     *
     * The assembled wire is finally translated back along the negated extrusion direction, undoing the
     * lift. The 2D fillet also falls back to this path whenever a wire is not made purely of straight
     * and circular edges, because the planar routine only handles those.
     * @param inputs wire, radius or radius list, corner indexes and the extrusion direction
     * @returns the filleted wire
     */
    fillet3DWire(inputs: Inputs.OCCT.Fillet3DWireDto<TopoDS_Wire>): TopoDS_Shape {
        let useRadiusList = false;
        if (inputs.radiusList && inputs.radiusList.length > 0 && inputs.indexes && inputs.indexes.length > 0) {
            if (inputs.radiusList.length !== inputs.indexes.length) {
                throw new Error("Radius list and indexes are not the same length");
            } else {
                useRadiusList = true;
            }
        }

        let wireTouse: TopoDS_Wire;
        if (useRadiusList && inputs.shape.Closed()) {
            const edgesOfWire = this.edgesService.getEdgesAlongWire({ shape: inputs.shape });
            const firstEdge = edgesOfWire.shift();
            if (!firstEdge) {
                throw new Error("Wire has no edges");
            }
            const adjustEdges = [...edgesOfWire, firstEdge];
            wireTouse = this.converterService.combineEdgesAndWiresIntoAWire({ shapes: adjustEdges });
        } else {
            wireTouse = this.converterService.getActualTypeOfShape(inputs.shape.Reversed());
        }
        const extrusion = this.operationsService.extrude({ shape: wireTouse, direction: inputs.direction });

        let adjustedIndexes = inputs.indexes;
        if (useRadiusList) {
            const filteredEnd = (inputs.indexes ?? []).filter(i => i > 1);
            const maxNr = Math.max(...filteredEnd);

            const adjacentList = [4];
            let lastNr = 4;
            for (let i = 0; i < maxNr; i++) {
                lastNr += 3;
                adjacentList.push(lastNr);
            }

            adjustedIndexes = (inputs.indexes ?? []).map((index) => {
                if (inputs.shape.Closed()) {
                    if (index <= 1) {
                        return index;
                    } else {
                        return adjacentList[index - 2]!;
                    }
                } else {
                    if (index === 0) {
                        return 1;
                    } else {
                        return adjacentList[index - 1]!;
                    }
                }
            });
        }

        const filletShape = this.filletEdges({ shape: extrusion, radius: inputs.radius, indexes: adjustedIndexes, radiusList: inputs.radiusList });

        const faceEdges: TopoDS_Edge[] = [];
        const faces = this.shapeGettersService.getFaces({ shape: filletShape });
        faces.forEach((f, _i) => {
            const edgeToAdd = this.shapeGettersService.getEdges({ shape: f })[3]!;
            faceEdges.push(edgeToAdd);
        });

        const res = this.converterService.combineEdgesAndWiresIntoAWire({ shapes: faceEdges });
        const result = this.transformsService.translate({ shape: res, translation: inputs.direction.map(s => -s) as Base.Vector3 });
        extrusion.delete();
        filletShape.delete();
        faces.forEach(f => f.delete());
        faceEdges.forEach(e => e.delete());
        return result;
    }
    
    private applyRadiusToVertex(inputs: Inputs.OCCT.FilletDto<TopoDS_Shape>, filletMaker: BRepFilletAPI_MakeFillet2d, cvx: TopoDS_Vertex, index: number) {
        if (inputs.radiusList) {
            const radiusList = inputs.radiusList;
            filletMaker.AddFillet(cvx, radiusList[index]!);
        } else if (inputs.radius) {
            filletMaker.AddFillet(cvx, inputs.radius);
        }
    }

    chamfer2dVertices(inputs: Inputs.OCCT.Chamfer2dVertexDto<TopoDS_Wire | TopoDS_Face>): TopoDS_Face | TopoDS_Wire {
        let face: TopoDS_Face;
        let isShapeFace = false;
        if (inputs.shape.ShapeType() === this.occ.TopAbs_ShapeEnum.FACE) {
            face = this.converterService.getActualTypeOfShape(inputs.shape);
            isShapeFace = true;
        } else if (inputs.shape.ShapeType() === this.occ.TopAbs_ShapeEnum.WIRE) {
            const faceShape = this.occ.MakeFaceFromWireOnlyPlane(inputs.shape, true);
            face = this.converterService.getActualTypeOfShape(faceShape);
            faceShape.delete();
        } else {
            throw new Error("You can only chamfer a 2d wire or a 2d face.");
        }

        const filletMaker = new this.occ.BRepFilletAPI_MakeFillet2d(face);
        const angle = this.vecHelper.degToRad(inputs.angle);
        const cornerVertices = this.collectCornerVertices(inputs.shape, isShapeFace);
        const faceEdges = this.shapeGettersService.getEdges({ shape: face });

        cornerVertices.forEach((cvx, index) => {
            if (inputs.indexes && !inputs.indexes.includes(index + 1)) {
                return;
            }
            const edge = this.findEdgeContainingVertex(faceEdges, cvx);
            if (edge) {
                filletMaker.AddChamferVertex(edge, cvx, inputs.distance, angle);
            }
        });
        filletMaker.Build();

        let result: TopoDS_Face | TopoDS_Wire;
        if (isShapeFace) {
            result = this.converterService.getActualTypeOfShape(filletMaker.Shape());
        } else {
            const wires = this.shapeGettersService.getWires({ shape: filletMaker.Shape() });
            result = wires[0]!;
        }
        filletMaker.delete();
        face.delete();
        cornerVertices.forEach(cvx => cvx.delete());
        faceEdges.forEach(e => e.delete());
        return result;
    }

    private collectCornerVertices(shape: TopoDS_Shape, isShapeFace: boolean): TopoDS_Vertex[] {
        const explorer = new this.occ.TopExp_Explorer(shape, this.occ.TopAbs_ShapeEnum.VERTEX, this.occ.TopAbs_ShapeEnum.SHAPE);
        const cornerVertices: TopoDS_Vertex[] = [];
        let i = 1;
        for (explorer; explorer.More(); explorer.Next()) {
            const vertex = this.occ.CastToVertex(explorer.Current());
            if (i % 2 === 0) {
                cornerVertices.push(vertex);
            } else {
                vertex.delete();
            }
            i++;
        }
        explorer.delete();
        if (!isShapeFace && !(shape).Closed()) {
            const popped = cornerVertices.pop();
            popped?.delete();
        }
        return cornerVertices;
    }

    private findEdgeContainingVertex(edges: TopoDS_Edge[], vertex: TopoDS_Vertex): TopoDS_Edge | undefined {
        for (const edge of edges) {
            const explorer = new this.occ.TopExp_Explorer(edge, this.occ.TopAbs_ShapeEnum.VERTEX, this.occ.TopAbs_ShapeEnum.SHAPE);
            let found = false;
            for (explorer; explorer.More(); explorer.Next()) {
                const v = this.occ.CastToVertex(explorer.Current());
                const same = v.IsSame(vertex);
                v.delete();
                if (same) { found = true; break; }
            }
            explorer.delete();
            if (found) { return edge; }
        }
        return undefined;
    }
}