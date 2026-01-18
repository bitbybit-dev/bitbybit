import { OccHelper } from "../occ-helper";
import { BRepFilletAPI_MakeFillet2d, BitbybitOcctModule, TopAbs_ShapeEnum, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Vertex, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../api/inputs/inputs";

export class OCCTFillets {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    filletEdges(inputs: Inputs.OCCT.FilletDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.filletsService.filletEdges(inputs);
    }

    filletEdgesList(inputs: Inputs.OCCT.FilletEdgesListDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        return this.och.filletsService.filletEdgesList(inputs);
    }

    filletEdgesListOneRadius(inputs: Inputs.OCCT.FilletEdgesListOneRadiusDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        return this.och.filletsService.filletEdgesListOneRadius(inputs);
    }

    filletEdgeVariableRadius(inputs: Inputs.OCCT.FilletEdgeVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        return this.och.filletsService.filletEdgeVariableRadius(inputs);
    }

    filletEdgesVariableRadius(inputs: Inputs.OCCT.FilletEdgesVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        return this.och.filletsService.filletEdgesVariableRadius(inputs);
    }

    filletEdgesSameVariableRadius(inputs: Inputs.OCCT.FilletEdgesSameVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        return this.och.filletsService.filletEdgesSameVariableRadius(inputs);
    }

    chamferEdges(inputs: Inputs.OCCT.ChamferDto<TopoDS_Shape>) {
        return this.och.filletsService.chamferEdges(inputs);
    }

    chamferEdgesList(inputs: Inputs.OCCT.ChamferEdgesListDto<TopoDS_Shape, TopoDS_Edge>) {
        return this.och.filletsService.chamferEdgesList(inputs);
    }

    chamferEdgeDistAngle(inputs: Inputs.OCCT.ChamferEdgeDistAngleDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>) {
        return this.och.filletsService.chamferEdgeDistAngle(inputs);
    }

    chamferEdgesDistAngle(inputs: Inputs.OCCT.ChamferEdgesDistAngleDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>) {
        return this.och.filletsService.chamferEdgesDistAngle(inputs);
    }

    chamferEdgesDistsAngles(inputs: Inputs.OCCT.ChamferEdgesDistsAnglesDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>) {
        return this.och.filletsService.chamferEdgesDistsAngles(inputs);
    }

    chamferEdgeTwoDistances(inputs: Inputs.OCCT.ChamferEdgeTwoDistancesDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>) {
        return this.och.filletsService.chamferEdgeTwoDistances(inputs);
    }

    chamferEdgesTwoDistances(inputs: Inputs.OCCT.ChamferEdgesTwoDistancesDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>) {
        return this.och.filletsService.chamferEdgesTwoDistances(inputs);
    }

    chamferEdgesTwoDistancesLists(inputs: Inputs.OCCT.ChamferEdgesTwoDistancesListsDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>) {
        return this.och.filletsService.chamferEdgesTwoDistancesLists(inputs);
    }

    filletTwoEdgesInPlaneIntoAWire(inputs: Inputs.OCCT.FilletTwoEdgesInPlaneDto<TopoDS_Edge>): TopoDS_Wire {
        const pln = this.och.entitiesService.gpPln(inputs.planeOrigin, inputs.planeDirection);
        const fil = new this.occ.ChFi2d_FilletAlgo(inputs.edge1, inputs.edge2, pln);
        fil.Perform(inputs.radius);
        const pt = this.och.entitiesService.gpPnt(inputs.planeOrigin);
        const edge1 = new this.occ.TopoDS_Edge();
        const edge2 = new this.occ.TopoDS_Edge();

        let solution = -1;
        if (inputs.solution !== undefined) {
            solution = inputs.solution;
        }
        const filletedEdge = fil.Result(pt, edge1, edge2, solution);

        const result = this.och.converterService.combineEdgesAndWiresIntoAWire({ shapes: [edge1, filletedEdge, edge2] });
        fil.delete();
        pt.delete();
        pln.delete();
        edge1.delete();
        edge2.delete();
        filletedEdge.delete();
        return result;
    }

    fillet3DWires(inputs: Inputs.OCCT.Fillet3DWiresDto<TopoDS_Wire>) {
        return inputs.shapes.map(shape => this.och.filletsService.fillet3DWire({
            shape,
            radius: inputs.radius,
            radiusList: inputs.radiusList,
            indexes: inputs.indexes,
            direction: inputs.direction
        }));
    }

    fillet3DWire(inputs: Inputs.OCCT.Fillet3DWireDto<TopoDS_Wire>) {
        return this.och.filletsService.fillet3DWire(inputs);
    }

    fillet2d(inputs: Inputs.OCCT.FilletDto<TopoDS_Wire | TopoDS_Face>): TopoDS_Face | TopoDS_Wire {
        return this.och.filletsService.fillet2d(inputs);
    }

    fillet2dShapes(inputs: Inputs.OCCT.FilletShapesDto<TopoDS_Wire | TopoDS_Face>): TopoDS_Face[] | TopoDS_Wire[] {
        return inputs.shapes.map(shape => this.och.filletsService.fillet2d({
            shape,
            radius: inputs.radius,
            radiusList: inputs.radiusList,
            indexes: inputs.indexes
        }));
    }

}
