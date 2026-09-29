import { BRepFilletAPI_MakeChamfer, BRepFilletAPI_MakeFillet, BRepFilletAPI_MakeFillet2d, BitbybitOcctModule, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Vertex, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../../api/inputs";
import { VectorHelperService } from "../../api/vector-helper.service";
import { IteratorService } from "./iterator.service";
import { ConverterService } from "./converter.service";
import { EntitiesService } from "./entities.service";
import { ShapeGettersService } from "./shape-getters";
import * as Resolved from "../../api/resolved-inputs";
import { InputError, KernelOperationError } from "@bitbybit-dev/base";
import { occtFailure } from "../../kernel-failures";

export class FilletsService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly vecHelper: VectorHelperService,
        private readonly iteratorService: IteratorService,
        private readonly converterService: ConverterService,
        private readonly entitiesService: EntitiesService,
        private readonly shapeGettersService: ShapeGettersService
    ) { }

    /**
     * `read`, when given, sees the fillet maker and its result before the maker is released, which
     * is where a history is read.
     */
    filletEdges(inputs: Resolved.OCCT.FilletDto<TopoDS_Shape>, read?: (maker: BRepFilletAPI_MakeFillet, result: TopoDS_Shape) => void): TopoDS_Shape {

        if (!inputs.indexes || inputs.indexes.length === 0) {
            const mkFillet = new this.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, this.occ.ChFi3d_FilletShape.Rational
            );
            const anEdgeExplorer = new this.occ.TopExp_Explorer(
                inputs.shape, this.occ.TopAbs_ShapeEnum.EDGE,
                this.occ.TopAbs_ShapeEnum.SHAPE
            );
            const edges: TopoDS_Edge[] = [];
            while (anEdgeExplorer.More()) {
                const current = anEdgeExplorer.Current();
                const anEdge = this.occ.CastToEdge(current);
                current.delete();
                edges.push(anEdge);
                mkFillet.Add(inputs.radius, anEdge);
                anEdgeExplorer.Next();
            }
            anEdgeExplorer.delete();
            edges.forEach(e => e.delete());
            return this.builtFillet(mkFillet, inputs.shape, read);
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
                        radius = inputs.radiusList[radiusIndex]!;
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
                mkFillet.delete();
                throw (new Error("Fillet Edges Not Found!  Make sure you are looking at the object _before_ the Fillet is applied!"));
            }
            else {
                curFillet = this.builtFillet(mkFillet, inputs.shape, read);
            }
            const result = this.converterService.getActualTypeOfShape(curFillet);
            curFillet.delete();
            return result;
        }
    }

    filletEdgesListOneRadius(inputs: Resolved.OCCT.FilletEdgesListOneRadiusDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        if (inputs.edges && inputs.edges.length > 0) {
            const mkFillet = new this.occ.BRepFilletAPI_MakeFillet(
                inputs.shape, (this.occ.ChFi3d_FilletShape.Rational)
            );
            inputs.edges.forEach((edge) => {
                mkFillet.Add(inputs.radius, edge);
            });
            const curFillet = this.builtFillet(mkFillet, inputs.shape);
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
            const curFillet = this.builtFillet(mkFillet, inputs.shape);
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
            const curFillet = this.builtFillet(mkFillet, inputs.shape);
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
            const curFillet = this.builtFillet(mkFillet, inputs.shape);
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
            const curFillet = this.builtFillet(mkFillet, inputs.shape);
            const result = this.converterService.getActualTypeOfShape(curFillet);
            curFillet.delete();
            return result;
        }
        throw new Error("Edges, radius lists and params U lists must be provided with the same length");
    }

    private builtFillet(maker: BRepFilletAPI_MakeFillet, shape: TopoDS_Shape, read?: (maker: BRepFilletAPI_MakeFillet, result: TopoDS_Shape) => void): TopoDS_Shape {
        maker.Build();
        if (!maker.IsDone()) {
            const faulty = maker.FaultyEdges(shape);
            const edges = Array.from({ length: faulty.size() }, (_, i) => faulty.get(i)!);
            faulty.delete();
            maker.delete();
            throw edges.length > 0 ? occtFailure("occt.fillet.failedOnEdges", { edges }) : occtFailure("occt.fillet.failed");
        }
        const result = maker.Shape();
        try {
            read?.(maker, result);
        } catch (error) {
            result.delete();
            throw error;
        } finally {
            maker.delete();
        }
        return result;
    }

    private builtChamfer(maker: BRepFilletAPI_MakeChamfer, read?: (maker: BRepFilletAPI_MakeChamfer, result: TopoDS_Shape) => void): TopoDS_Shape {
        maker.Build();
        if (!maker.IsDone()) {
            maker.delete();
            throw occtFailure("occt.chamfer.failed");
        }
        const result = maker.Shape();
        try {
            read?.(maker, result);
        } catch (error) {
            result.delete();
            throw error;
        } finally {
            maker.delete();
        }
        return result;
    }

    private assignVariableFilletToEdge(inputs: Inputs.OCCT.FilletEdgeVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>, mkFillet: BRepFilletAPI_MakeFillet) {
        const array = new this.occ.TColgp_Array1OfPnt2d(1, inputs.paramsU.length);
        inputs.paramsU.forEach((param, index) => {
            const point = this.entitiesService.gpPnt2d([param, inputs.radiusList[index]!]);
            array.SetValue(index + 1, point);
            point.delete();
        });
        mkFillet.AddWithLaw(array, inputs.edge);
        array.delete();
    }

    /**
     * `read`, when given, sees the chamfer maker and its result before the maker is released.
     */
    chamferEdges(inputs: Resolved.OCCT.ChamferDto<TopoDS_Shape>, read?: (maker: BRepFilletAPI_MakeChamfer, result: TopoDS_Shape) => void): TopoDS_Shape {
        if (!inputs.indexes || inputs.indexes.length === 0) {
            const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
                inputs.shape
            );
            const anEdgeExplorer = new this.occ.TopExp_Explorer(
                inputs.shape, this.occ.TopAbs_ShapeEnum.EDGE,
                this.occ.TopAbs_ShapeEnum.SHAPE
            );
            const edges: TopoDS_Edge[] = [];
            while (anEdgeExplorer.More()) {
                const current = anEdgeExplorer.Current();
                const anEdge = this.occ.CastToEdge(current);
                current.delete();
                edges.push(anEdge);
                mkChamfer.Add(inputs.distance, anEdge);
                anEdgeExplorer.Next();
            }
            anEdgeExplorer.delete();
            edges.forEach(e => e.delete());
            return this.builtChamfer(mkChamfer, read);
        } else {
            const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
                inputs.shape
            );
            let foundEdges = 0;
            let distanceIndex = 0;
            const inputIndexes = inputs.indexes;
            this.iteratorService.forEachEdge(inputs.shape, (index, edge) => {
                if (inputIndexes.includes(index)) {
                    let distance = inputs.distance;
                    if (inputs.distanceList) {
                        distance = inputs.distanceList[distanceIndex]!;
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
                mkChamfer.delete();
                return this.converterService.getActualTypeOfShape(inputs.shape);
            }
            const curChamfer = this.builtChamfer(mkChamfer, read);
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
            const curChamfer = this.builtChamfer(mkChamfer);
            const result = this.converterService.getActualTypeOfShape(curChamfer);
            curChamfer.delete();
            return result;
        }
        throw new Error("Edges and distance list must be provided with the same length");
    }

    chamferEdgeTwoDistances(inputs: Resolved.OCCT.ChamferEdgeTwoDistancesDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
        const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
            inputs.shape
        );
        mkChamfer.AddTwoDistances(inputs.distance1, inputs.distance2, inputs.edge, inputs.face);
        const curChamfer = this.builtChamfer(mkChamfer);
        const result = this.converterService.getActualTypeOfShape(curChamfer);
        curChamfer.delete();
        return result;
    }

    chamferEdgesTwoDistances(inputs: Resolved.OCCT.ChamferEdgesTwoDistancesDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
        if (inputs.edges && inputs.edges.length > 0 &&
            inputs.edges.length === inputs.faces.length) {
            const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
                inputs.shape
            );
            inputs.edges.forEach((edge, index) => {
                mkChamfer.AddTwoDistances(inputs.distance1, inputs.distance2, edge, inputs.faces[index]!);
            });
            const curChamfer = this.builtChamfer(mkChamfer);
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
            const curChamfer = this.builtChamfer(mkChamfer);
            const result = this.converterService.getActualTypeOfShape(curChamfer);
            curChamfer.delete();
            return result;
        } else {
            throw new Error("Edges, faces and distance lists must be provided with the same length");
        }
    }

    chamferEdgeDistAngle(inputs: Resolved.OCCT.ChamferEdgeDistAngleDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
        const mkChamfer = new this.occ.BRepFilletAPI_MakeChamfer(
            inputs.shape
        );
        const radians = this.vecHelper.degToRad(inputs.angle);
        mkChamfer.AddDA(inputs.distance, radians, inputs.edge, inputs.face);
        const curChamfer = this.builtChamfer(mkChamfer);
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
            const curChamfer = this.builtChamfer(mkChamfer);
            const result = this.converterService.getActualTypeOfShape(curChamfer);
            curChamfer.delete();
            return result;
        } else {
            throw new Error("Edges, faces, distances and angles must be provided with the same length");
        }
    }

    chamferEdgesDistAngle(inputs: Resolved.OCCT.ChamferEdgesDistAngleDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
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
            const curChamfer = this.builtChamfer(mkChamfer);
            const result = this.converterService.getActualTypeOfShape(curChamfer);
            curChamfer.delete();
            return result;
        } else {
            throw new Error("Edges and faces must be provided with the same length");
        }
    }

    fillet2d(inputs: Resolved.OCCT.FilletDto<TopoDS_Wire | TopoDS_Face>): TopoDS_Face | TopoDS_Wire {
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
            const current = anVertexExplorer.Current();
            const vertex: TopoDS_Vertex = this.occ.CastToVertex(current);
            current.delete();
            if (i % 2 === 0) {
                cornerVertices.push(vertex);
            } else {
                vertex.delete();
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
        const failedCorners: number[] = [];
        cornerVertices.forEach((cvx, index) => {
            let added = false;
            if (!inputs.indexes) {
                added = this.applyRadiusToVertex(inputs, filletMaker, cvx, index);
            } else if (inputs.indexes.includes(index + 1)) {
                added = this.applyRadiusToVertex(inputs, filletMaker, cvx, radiusAddedCounter);
                radiusAddedCounter++;
            }
            if (added && !filletMaker.CornerDone()) {
                failedCorners.push(index + 1);
            }
        });
        filletMaker.Build();
        const cornersFailed = (): KernelOperationError => failedCorners.length > 0
            ? occtFailure("occt.fillet.failedAtCorners", { corners: failedCorners })
            : occtFailure("occt.fillet.failed");
        let result: TopoDS_Shape | undefined;
        let failure: KernelOperationError | undefined;
        const release = (): void => {
            anVertexExplorer.delete();
            filletMaker.delete();
            cornerVertices.forEach(cvx => cvx.delete());
        };
        if (isShapeFace) {
            result = filletMaker.IsDone() && failedCorners.length === 0 ? filletMaker.Shape() : undefined;
        } else {
            const isDone = filletMaker.IsDone();
            if (isDone && failedCorners.length > 0) {
                failure = cornersFailed();
            } else if (isDone) {
                const shape = filletMaker.Shape();
                const filletedWires = this.shapeGettersService.getWires({ shape });
                if (filletedWires.length === 1) {
                    result = filletedWires[0];
                }
            }
            else if (!this.everyGivenRadiusRounds(inputs.radius, inputs.radiusList)) {
                failure = cornersFailed();
            } else {
                try {
                    result = this.filletWireCorners(inputs.shape, this.radiiOf2dCorners(inputs, this.occ.WireCornerCount(inputs.shape)));
                } catch (thrown) {
                    if (!(thrown instanceof KernelOperationError)) {
                        release();
                        throw thrown;
                    }
                    failure = thrown;
                }
            }
        }
        release();
        if (failure !== undefined) {
            throw failure;
        }
        if (!result) {
            throw cornersFailed();
        }
        return result;
    }

    fillet3DWire(inputs: Resolved.OCCT.Fillet3DWireDto<TopoDS_Wire>): TopoDS_Wire {
        const perIndex = inputs.radiusList !== undefined && inputs.radiusList.length > 0 && inputs.indexes !== undefined && inputs.indexes.length > 0;
        if (!this.everyGivenRadiusRounds(inputs.radius, perIndex ? inputs.radiusList : undefined)) {
            throw perIndex
                ? new InputError("Every radius in `radiusList` must be above 0; a radius of 0 or less rounds nothing.", "radiusList")
                : new InputError(`\`radius\` must be above 0, and is ${inputs.radius}; a radius of 0 or less rounds nothing.`, "radius");
        }
        const corners = this.occ.WireCornerCount(inputs.shape);
        return this.filletWireCorners(inputs.shape, this.radiiOfCorners(corners, inputs.radius, inputs.radiusList, inputs.indexes));
    }

    /**
     * One radius per corner of a wire: `radius` at every corner, or at the corners `indexes` lists,
     * counted from 0, or the entry of `radiusList` beside each listed corner. A corner given no
     * radius gets 0, which leaves it sharp.
     */
    private radiiOfCorners(corners: number, radius: number, radiusList: number[] | undefined, indexes: number[] | undefined): number[] {
        if (!indexes || indexes.length === 0) {
            return Array.from({ length: corners }, () => radius);
        }
        const perIndex = radiusList !== undefined && radiusList.length > 0;
        if (perIndex && radiusList.length !== indexes.length) {
            throw new InputError(`\`radiusList\` must hold one radius per entry of \`indexes\`: it holds ${radiusList.length} for ${indexes.length}.`, "radiusList");
        }
        const radii = Array.from({ length: corners }, () => 0);
        indexes.forEach((corner, position) => {
            if (!Number.isInteger(corner) || corner < 0 || corner >= corners) {
                throw new InputError(`\`indexes\` counts the wire's ${corners} corners from 0 to ${corners - 1}, and holds ${corner}.`, "indexes");
            }
            radii[corner] = perIndex ? radiusList[position]! : radius;
        });
        return radii;
    }

    /**
     * True when every radius the caller gave is above 0: the list when there is one, otherwise the
     * single radius. The corner rounding reads 0 as a corner to leave sharp, so a radius of 0 the
     * caller asked for would otherwise come back as a wire rounded nowhere.
     */
    private everyGivenRadiusRounds(radius: number | undefined, radiusList: number[] | undefined): boolean {
        const given = radiusList !== undefined && radiusList.length > 0 ? radiusList : [radius];
        return given.every(value => value !== undefined && value > 0);
    }

    /**
     * One radius per corner of a wire for the fallback of `fillet2d`, read as its main path reads
     * its inputs: corners counted from 1, a `radiusList` without `indexes` giving each corner in
     * turn its radius, listed corners taking the entries of `radiusList` in their order along the
     * outline, and listed corners the wire does not have passed over.
     */
    private radiiOf2dCorners(inputs: Resolved.OCCT.FilletDto<TopoDS_Shape>, corners: number): number[] {
        const radiusAt = (position: number): number => (inputs.radiusList ? inputs.radiusList[position] : inputs.radius) ?? 0;
        if (!inputs.indexes) {
            return Array.from({ length: corners }, (_, corner) => radiusAt(corner));
        }
        const radii = Array.from({ length: corners }, () => 0);
        const listed = Array.from(new Set(inputs.indexes)).filter(corner => corner >= 1 && corner <= corners).sort((a, b) => a - b);
        listed.forEach((corner, position) => {
            radii[corner - 1] = radiusAt(position);
        });
        return radii;
    }

    /**
     * Rounds every corner of a wire in one kernel call, each in the plane of the two edges that meet
     * there, and names the corners that could not be rounded, counted from 1.
     */
    private filletWireCorners(wire: TopoDS_Wire, radii: number[]): TopoDS_Wire {
        const { wire: rounded, failedCorners } = this.occ.FilletWireCorners(wire, radii);
        if (rounded === null) {
            throw failedCorners.length > 0
                ? occtFailure("occt.fillet.failedAtCorners", { corners: Array.from(failedCorners, corner => corner + 1) })
                : occtFailure("occt.fillet.failed");
        }
        return rounded;
    }

    private applyRadiusToVertex(inputs: Resolved.OCCT.FilletDto<TopoDS_Shape>, filletMaker: BRepFilletAPI_MakeFillet2d, cvx: TopoDS_Vertex, index: number): boolean {
        if (inputs.radiusList) {
            const radiusList = inputs.radiusList;
            filletMaker.AddFillet(cvx, radiusList[index]!);
            return true;
        } else if (inputs.radius) {
            filletMaker.AddFillet(cvx, inputs.radius);
            return true;
        }
        return false;
    }

    chamfer2dVertices(inputs: Resolved.OCCT.Chamfer2dVertexDto<TopoDS_Wire | TopoDS_Face>): TopoDS_Face | TopoDS_Wire {
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
        if (!filletMaker.IsDone()) {
            filletMaker.delete();
            face.delete();
            cornerVertices.forEach(cvx => cvx.delete());
            faceEdges.forEach(e => e.delete());
            throw occtFailure("occt.chamfer.failed");
        }

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
            const current = explorer.Current();
            const vertex = this.occ.CastToVertex(current);
            current.delete();
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
                const current = explorer.Current();
                const v = this.occ.CastToVertex(current);
                current.delete();
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