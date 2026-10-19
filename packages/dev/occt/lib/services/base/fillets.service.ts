import type { BRepFilletAPI_MakeChamfer, BRepFilletAPI_MakeFillet, BRepFilletAPI_MakeFillet2d, BitbybitOcctModule, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Vertex, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import type * as Inputs from "../../api/inputs";
import type { BaseBitByBit } from "@bitbybit-dev/base";
import type { IteratorService } from "./iterator.service";
import type { ConverterService } from "./converter.service";
import type { EntitiesService } from "./entities.service";
import type { ShapeGettersService } from "./shape-getters";
import type * as Resolved from "../../api/resolved-inputs";
import { InputError } from "@bitbybit-dev/base";
import type { KernelOperationError } from "@bitbybit-dev/base";
import { occtFailure } from "../../kernel-failures";
import { kernelObjects, release, releasedOnError } from "./release";
import { withKernelFailure } from "./kernel-refusals";
import { checkedShape } from "./input-checks";
import { holdsSolid, unbrokenResult } from "./solid-results";
import { isStraightCorner, straightCorners, withoutStraightCorners } from "./straight-corners";

export class FilletsService {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly base: BaseBitByBit,
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
            return this.filleted(inputs.shape, maker => this.iteratorService.forEachEdge(inputs.shape, (_index, edge) => {
                try {
                    maker.Add(inputs.radius, edge);
                } finally {
                    edge.delete();
                }
            }), read);
        }
        const inputIndexes = inputs.indexes;
        const curFillet = this.filleted(inputs.shape, maker => {
            let foundEdges = 0;
            let radiusIndex = 0;
            this.iteratorService.forEachEdge(inputs.shape, (index, edge) => {
                try {
                    if (inputIndexes.includes(index)) {
                        let radius = inputs.radius;
                        if (inputs.radiusList) {
                            radius = inputs.radiusList[radiusIndex]!;
                            radiusIndex++;
                        }
                        if (radius === undefined) {
                            throw new InputError("Radius not defined, or radiusList not correct length", inputs.radiusList ? "radiusList" : "radius");
                        }
                        maker.Add(radius, edge);
                        foundEdges++;
                    }
                } finally {
                    edge.delete();
                }
            });
            if (foundEdges === 0) {
                throw (new Error("Fillet Edges Not Found!  Make sure you are looking at the object _before_ the Fillet is applied!"));
            }
        }, read);
        return this.converterService.castAndRelease(curFillet);
    }

    filletEdgesListOneRadius(inputs: Resolved.OCCT.FilletEdgesListOneRadiusDto<TopoDS_Shape, TopoDS_Edge>, read?: (maker: BRepFilletAPI_MakeFillet, result: TopoDS_Shape) => void): TopoDS_Shape {
        if (inputs.edges && inputs.edges.length > 0) {
            return this.converterService.castAndRelease(this.filleted(inputs.shape, maker => inputs.edges.forEach(edge => maker.Add(inputs.radius, edge)), read));
        }
        throw new Error("Edges must be provided");
    }

    filletEdgesList(inputs: Inputs.OCCT.FilletEdgesListDto<TopoDS_Shape, TopoDS_Edge>, read?: (maker: BRepFilletAPI_MakeFillet, result: TopoDS_Shape) => void): TopoDS_Shape {
        if (inputs.edges && inputs.edges.length > 0 && inputs.radiusList && inputs.radiusList.length > 0 && inputs.edges.length === inputs.radiusList.length) {
            return this.converterService.castAndRelease(this.filleted(inputs.shape, maker => inputs.edges.forEach((edge, index) => maker.Add(inputs.radiusList[index]!, edge)), read));
        }
        throw new Error("Edges and radius list must be provided with the same length");
    }

    filletEdgeVariableRadius(inputs: Inputs.OCCT.FilletEdgeVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>, read?: (maker: BRepFilletAPI_MakeFillet, result: TopoDS_Shape) => void): TopoDS_Shape {
        if (inputs.paramsU && inputs.paramsU.length > 0 && inputs.radiusList && inputs.radiusList.length > 0 && inputs.paramsU.length === inputs.radiusList.length) {
            return this.converterService.castAndRelease(this.filleted(inputs.shape, maker => this.assignVariableFilletToEdge(inputs, maker), read));
        }
        throw new Error("Params U and radius list must be provided with the same length");
    }

    filletEdgesSameVariableRadius(inputs: Inputs.OCCT.FilletEdgesSameVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>, read?: (maker: BRepFilletAPI_MakeFillet, result: TopoDS_Shape) => void): TopoDS_Shape {
        if (inputs.edges && inputs.edges.length > 0 &&
            inputs.radiusList && inputs.radiusList.length > 0 &&
            inputs.paramsU.length === inputs.radiusList.length) {
            return this.converterService.castAndRelease(this.filleted(inputs.shape, maker => inputs.edges.forEach(edge => this.assignVariableFilletToEdge({
                edge, paramsU: inputs.paramsU, radiusList: inputs.radiusList, shape: inputs.shape,
            }, maker)), read));
        }
        throw new Error("Edges, params U and radius list must be provided with the same length");
    }

    filletEdgesVariableRadius(inputs: Inputs.OCCT.FilletEdgesVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>, read?: (maker: BRepFilletAPI_MakeFillet, result: TopoDS_Shape) => void): TopoDS_Shape {
        if (inputs.edges && inputs.edges.length > 0 &&
            inputs.radiusLists && inputs.radiusLists.length > 0 &&
            inputs.paramsULists.length === inputs.radiusLists.length &&
            inputs.paramsULists.length === inputs.edges.length &&
            inputs.radiusLists.length === inputs.edges.length) {
            return this.converterService.castAndRelease(this.filleted(inputs.shape, maker => inputs.edges.forEach((edge, index) => this.assignVariableFilletToEdge({
                edge, paramsU: inputs.paramsULists[index]!, radiusList: inputs.radiusLists[index]!, shape: inputs.shape,
            }, maker)), read));
        }
        throw new Error("Edges, radius lists and params U lists must be provided with the same length");
    }

    private filleted(shape: TopoDS_Shape, add: (maker: BRepFilletAPI_MakeFillet) => void, read?: (maker: BRepFilletAPI_MakeFillet, result: TopoDS_Shape) => void): TopoDS_Shape {
        const maker = new this.occ.BRepFilletAPI_MakeFillet(shape, this.occ.ChFi3d_FilletShape.Rational);
        try {
            add(maker);
            withKernelFailure(this.occ, () => maker.Build(), () => occtFailure("occt.fillet.failed"));
            if (!maker.IsDone()) {
                const faulty = maker.FaultyEdges(shape);
                const edges = Array.from({ length: faulty.size() }, (_, i) => faulty.get(i)!);
                faulty.delete();
                throw edges.length > 0 ? occtFailure("occt.fillet.failedOnEdges", { edges }) : occtFailure("occt.fillet.failed");
            }
            const result = unbrokenResult(this.occ, maker.Shape(), holdsSolid(this.occ, shape), () => occtFailure("occt.fillet.failed"));
            releasedOnError([result], () => read?.(maker, result));
            return result;
        } finally {
            maker.delete();
        }
    }

    private chamfered(shape: TopoDS_Shape, add: (maker: BRepFilletAPI_MakeChamfer) => void, read?: (maker: BRepFilletAPI_MakeChamfer, result: TopoDS_Shape) => void): TopoDS_Shape {
        const maker = new this.occ.BRepFilletAPI_MakeChamfer(shape);
        try {
            add(maker);
            withKernelFailure(this.occ, () => maker.Build(), () => occtFailure("occt.chamfer.failed"));
            if (!maker.IsDone()) {
                throw occtFailure("occt.chamfer.failed");
            }
            const result = unbrokenResult(this.occ, maker.Shape(), holdsSolid(this.occ, shape), () => occtFailure("occt.chamfer.failed"));
            releasedOnError([result], () => read?.(maker, result));
            return result;
        } finally {
            maker.delete();
        }
    }

    private assignVariableFilletToEdge(inputs: Inputs.OCCT.FilletEdgeVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>, mkFillet: BRepFilletAPI_MakeFillet): void {
        const array = new this.occ.TColgp_Array1OfPnt2d(1, inputs.paramsU.length);
        try {
            inputs.paramsU.forEach((param, index) => {
                const point = this.entitiesService.gpPnt2d([param, inputs.radiusList[index]!]);
                array.SetValue(index + 1, point);
                point.delete();
            });
            mkFillet.AddWithLaw(array, inputs.edge);
        } finally {
            array.delete();
        }
    }

    /**
     * `read`, when given, sees the chamfer maker and its result before the maker is released.
     */
    chamferEdges(inputs: Resolved.OCCT.ChamferDto<TopoDS_Shape>, read?: (maker: BRepFilletAPI_MakeChamfer, result: TopoDS_Shape) => void): TopoDS_Shape {
        if (!inputs.indexes || inputs.indexes.length === 0) {
            return this.chamfered(inputs.shape, maker => this.iteratorService.forEachEdge(inputs.shape, (_index, edge) => {
                try {
                    maker.Add(inputs.distance, edge);
                } finally {
                    edge.delete();
                }
            }), read);
        }
        const inputIndexes = inputs.indexes;
        const curChamfer = this.chamfered(inputs.shape, maker => {
            let foundEdges = 0;
            let distanceIndex = 0;
            this.iteratorService.forEachEdge(inputs.shape, (index, edge) => {
                try {
                    if (inputIndexes.includes(index)) {
                        let distance = inputs.distance;
                        if (inputs.distanceList) {
                            distance = inputs.distanceList[distanceIndex]!;
                            distanceIndex++;
                        }
                        if (distance === undefined) {
                            throw new InputError("Distance not defined and/or distance list incorrect length", inputs.distanceList ? "distanceList" : "distance");
                        }
                        maker.Add(distance, edge);
                        foundEdges++;
                    }
                } finally {
                    edge.delete();
                }
            });
            if (foundEdges === 0) {
                throw (new Error("Chamfer Edges Not Found!  Make sure you are looking at the object _before_ the Chamfer is applied!"));
            }
        }, read);
        return this.converterService.castAndRelease(curChamfer);
    }

    chamferEdgesList(inputs: Inputs.OCCT.ChamferEdgesListDto<TopoDS_Shape, TopoDS_Edge>, read?: (maker: BRepFilletAPI_MakeChamfer, result: TopoDS_Shape) => void): TopoDS_Shape {
        if (inputs.edges && inputs.edges.length > 0 && inputs.distanceList && inputs.distanceList.length > 0 && inputs.edges.length === inputs.distanceList.length) {
            return this.converterService.castAndRelease(this.chamfered(inputs.shape, maker => inputs.edges.forEach((edge, index) => {
                const distance = inputs.distanceList[index];
                if (distance === undefined) {
                    throw (Error("Distance is not defined"));
                }
                maker.Add(distance, edge);
            }), read));
        }
        throw new Error("Edges and distance list must be provided with the same length");
    }

    chamferEdgeTwoDistances(inputs: Resolved.OCCT.ChamferEdgeTwoDistancesDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>, read?: (maker: BRepFilletAPI_MakeChamfer, result: TopoDS_Shape) => void): TopoDS_Shape {
        return this.converterService.castAndRelease(this.chamfered(inputs.shape, maker => maker.AddTwoDistances(inputs.distance1, inputs.distance2, inputs.edge, inputs.face), read));
    }

    chamferEdgesTwoDistances(inputs: Resolved.OCCT.ChamferEdgesTwoDistancesDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>, read?: (maker: BRepFilletAPI_MakeChamfer, result: TopoDS_Shape) => void): TopoDS_Shape {
        if (inputs.edges && inputs.edges.length > 0 &&
            inputs.edges.length === inputs.faces.length) {
            return this.converterService.castAndRelease(this.chamfered(inputs.shape, maker => inputs.edges.forEach((edge, index) => maker.AddTwoDistances(inputs.distance1, inputs.distance2, edge, inputs.faces[index]!)), read));
        } else {
            throw new Error("Edges and faces must be provided with the same length");
        }
    }

    chamferEdgesTwoDistancesLists(inputs: Inputs.OCCT.ChamferEdgesTwoDistancesListsDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>, read?: (maker: BRepFilletAPI_MakeChamfer, result: TopoDS_Shape) => void): TopoDS_Shape {
        if (inputs.edges && inputs.edges.length > 0 &&
            inputs.faces && inputs.faces.length > 0 &&
            inputs.distances1 && inputs.distances1.length > 0 &&
            inputs.distances2 && inputs.distances2.length > 0 &&
            inputs.edges.length === inputs.faces.length &&
            inputs.edges.length === inputs.distances1.length &&
            inputs.edges.length === inputs.distances2.length) {
            return this.converterService.castAndRelease(this.chamfered(inputs.shape, maker => inputs.edges.forEach((edge, index) => maker.AddTwoDistances(inputs.distances1[index]!, inputs.distances2[index]!, edge, inputs.faces[index]!)), read));
        } else {
            throw new Error("Edges, faces and distance lists must be provided with the same length");
        }
    }

    chamferEdgeDistAngle(inputs: Resolved.OCCT.ChamferEdgeDistAngleDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>, read?: (maker: BRepFilletAPI_MakeChamfer, result: TopoDS_Shape) => void): TopoDS_Shape {
        checkedShape(inputs.edge, "edge");
        checkedShape(inputs.face, "face");
        const radians = this.base.math.degToRad({ number: inputs.angle });
        return this.converterService.castAndRelease(this.chamfered(inputs.shape, maker => maker.AddDA(inputs.distance, radians, inputs.edge, inputs.face), read));
    }

    chamferEdgesDistsAngles(inputs: Inputs.OCCT.ChamferEdgesDistsAnglesDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>, read?: (maker: BRepFilletAPI_MakeChamfer, result: TopoDS_Shape) => void): TopoDS_Shape {
        if (inputs.edges && inputs.edges.length > 0 &&
            inputs.faces && inputs.faces.length > 0 &&
            inputs.distances && inputs.distances.length > 0 &&
            inputs.angles && inputs.angles.length > 0 &&
            inputs.edges.length === inputs.distances.length &&
            inputs.edges.length === inputs.faces.length &&
            inputs.edges.length === inputs.angles.length) {
            return this.converterService.castAndRelease(this.chamfered(inputs.shape, maker => inputs.edges.forEach((edge, index) => {
                const radians = this.base.math.degToRad({ number: inputs.angles[index]! });
                maker.AddDA(inputs.distances[index]!, radians, edge, inputs.faces[index]!);
            }), read));
        } else {
            throw new Error("Edges, faces, distances and angles must be provided with the same length");
        }
    }

    chamferEdgesDistAngle(inputs: Resolved.OCCT.ChamferEdgesDistAngleDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>, read?: (maker: BRepFilletAPI_MakeChamfer, result: TopoDS_Shape) => void): TopoDS_Shape {
        if (inputs.edges && inputs.edges.length > 0 &&
            inputs.faces && inputs.faces.length > 0 &&
            inputs.edges.length === inputs.faces.length
        ) {
            const radians = this.base.math.degToRad({ number: inputs.angle });
            return this.converterService.castAndRelease(this.chamfered(inputs.shape, maker => inputs.edges.forEach((edge, index) => maker.AddDA(inputs.distance, radians, edge, inputs.faces[index]!)), read));
        } else {
            throw new Error("Edges and faces must be provided with the same length");
        }
    }

    fillet2d(inputs: Resolved.OCCT.FilletDto<TopoDS_Wire | TopoDS_Face>): TopoDS_Face | TopoDS_Wire {
        if (inputs.indexes && inputs.radiusList && inputs.radiusList.length !== inputs.indexes.length) {
            throw new Error("When using radius list, length of the list must match index list of corners that you want to fillet.");
        }
        const isShapeFace = this.isFlatFace(inputs.shape, "You can only fillet a 2d wire or a 2d face.");
        const { own, releaseAll } = kernelObjects();
        try {
            const face = own(this.faceToRound(inputs.shape, isShapeFace));
            const filletMaker = own(new this.occ.BRepFilletAPI_MakeFillet2d(face));
            const cornerVertices = this.collectCornerVertices(inputs.shape, isShapeFace).map(own);
            const straight = (isShapeFace ? this.shapeGettersService.getWires({ shape: face }).map(own) : [inputs.shape])
                .flatMap(wire => straightCorners(this.occ, wire));
            let radiusAddedCounter = 0;
            const failedCorners: number[] = [];
            cornerVertices.forEach((cvx, index) => {
                const skip = isStraightCorner(straight, this.converterService.vertexToPoint({ shape: cvx }));
                let added = false;
                if (!inputs.indexes) {
                    added = !skip && this.applyRadiusToVertex(inputs, filletMaker, cvx, index);
                } else if (inputs.indexes.includes(index + 1)) {
                    added = !skip && this.applyRadiusToVertex(inputs, filletMaker, cvx, radiusAddedCounter);
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
            const isDone = filletMaker.IsDone();
            if (isShapeFace) {
                if (!isDone || failedCorners.length > 0) {
                    throw cornersFailed();
                }
                return this.converterService.castAndRelease(filletMaker.Shape());
            }
            if (isDone && failedCorners.length > 0) {
                throw cornersFailed();
            }
            if (isDone) {
                return this.onlyWireOf(own(filletMaker.Shape()), cornersFailed);
            }
            if (!this.everyGivenRadiusRounds(inputs.radius, inputs.radiusList)) {
                throw cornersFailed();
            }
            return this.filletWireCorners(inputs.shape, this.radiiOf2dCorners(inputs, this.occ.WireCornerCount(inputs.shape)));
        } finally {
            releaseAll();
        }
    }

    private isFlatFace(shape: TopoDS_Shape, refusal: string): boolean {
        if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.FACE) {
            return true;
        }
        if (shape.ShapeType() === this.occ.TopAbs_ShapeEnum.WIRE) {
            return false;
        }
        throw new Error(refusal);
    }

    private faceToRound(shape: TopoDS_Shape, isShapeFace: boolean): TopoDS_Face {
        return isShapeFace
            ? this.converterService.getActualTypeOfShape(shape)
            : this.converterService.castAndRelease(this.occ.MakeFaceFromWireOnlyPlane(shape, true));
    }

    private onlyWireOf(shape: TopoDS_Shape, refusal: () => Error): TopoDS_Wire {
        const wires = this.shapeGettersService.getWires({ shape });
        if (wires.length !== 1) {
            wires.forEach(release);
            throw refusal();
        }
        return wires[0]!;
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

    private everyGivenRadiusRounds(radius: number | undefined, radiusList: number[] | undefined): boolean {
        const given = radiusList !== undefined && radiusList.length > 0 ? radiusList : [radius];
        return given.every(value => value !== undefined && value > 0);
    }

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

    private filletWireCorners(wire: TopoDS_Wire, radii: number[]): TopoDS_Wire {
        const { wire: rounded, failedCorners } = this.occ.FilletWireCorners(wire, withoutStraightCorners(radii, straightCorners(this.occ, wire)));
        if (rounded === null) {
            throw failedCorners.length > 0
                ? occtFailure("occt.fillet.failedAtCorners", { corners: Array.from(failedCorners, corner => corner + 1) })
                : occtFailure("occt.fillet.failed");
        }
        return rounded;
    }

    private applyRadiusToVertex(inputs: Resolved.OCCT.FilletDto<TopoDS_Shape>, filletMaker: BRepFilletAPI_MakeFillet2d, cvx: TopoDS_Vertex, index: number): boolean {
        if (inputs.radiusList) {
            filletMaker.AddFillet(cvx, inputs.radiusList[index]!).delete();
            return true;
        } else if (inputs.radius) {
            filletMaker.AddFillet(cvx, inputs.radius).delete();
            return true;
        }
        return false;
    }

    chamfer2dVertices(inputs: Resolved.OCCT.Chamfer2dVertexDto<TopoDS_Wire | TopoDS_Face>): TopoDS_Face | TopoDS_Wire {
        const isShapeFace = this.isFlatFace(inputs.shape, "You can only chamfer a 2d wire or a 2d face.");
        const { own, releaseAll } = kernelObjects();
        try {
            const face = own(this.faceToRound(inputs.shape, isShapeFace));
            const filletMaker = own(new this.occ.BRepFilletAPI_MakeFillet2d(face));
            const angle = this.base.math.degToRad({ number: inputs.angle });
            const cornerVertices = this.collectCornerVertices(inputs.shape, isShapeFace).map(own);
            const faceEdges = this.shapeGettersService.getEdges({ shape: face }).map(own);
            cornerVertices.forEach((cvx, index) => {
                if (inputs.indexes && !inputs.indexes.includes(index + 1)) {
                    return;
                }
                const edge = this.findEdgeContainingVertex(faceEdges, cvx);
                if (edge) {
                    own(filletMaker.AddChamferVertex(edge, cvx, inputs.distance, angle));
                }
            });
            filletMaker.Build();
            if (!filletMaker.IsDone()) {
                throw occtFailure("occt.chamfer.failed");
            }
            const made = own(filletMaker.Shape());
            if (isShapeFace) {
                return this.converterService.getActualTypeOfShape(made);
            }
            const wires = this.shapeGettersService.getWires({ shape: made });
            wires.slice(1).forEach(release);
            return wires[0]!;
        } finally {
            releaseAll();
        }
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