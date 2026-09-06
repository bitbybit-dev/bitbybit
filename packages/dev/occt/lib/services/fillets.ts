import { OccHelper } from "../occ-helper";
import { BitbybitOcctModule, TopoDS_Edge, TopoDS_Face, TopoDS_Shape, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../api/inputs";

export class OCCTFillets {

    constructor(
        private readonly occ: BitbybitOcctModule,
        private readonly och: OccHelper
    ) {
    }

    /**
     * Fillets OpenCascade Shapes
     * @param inputs Shape, radius and edge indexes to fillet
     * @returns OpenCascade shape with filleted edges
     * @group 3d fillets
     * @shortname fillet edges
     * @drawable true
     */
    filletEdges(inputs: Inputs.OCCT.FilletDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.filletsService.filletEdges(inputs);
    }

    /**
     * Fillets edges list with different radius on each edge.
     * @param inputs Shape, edges and radius list
     * @returns OpenCascade shape with filleted edges
     * @group 3d fillets
     * @shortname fillet edges list
     * @drawable true
     */
    filletEdgesList(inputs: Inputs.OCCT.FilletEdgesListDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        return this.och.filletsService.filletEdgesList(inputs);
    }

    /**
     * Fillets edges list with the single radius on all edges.
     * @param inputs Shape, edges and radius
     * @returns OpenCascade shape with filleted edges
     * @group 3d fillets
     * @shortname fillet edges list one r
     * @drawable true
     */
    filletEdgesListOneRadius(inputs: Inputs.OCCT.FilletEdgesListOneRadiusDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        return this.och.filletsService.filletEdgesListOneRadius(inputs);
    }

    /**
     * Fillets a single edge with variable radius list on given u params. You need to provide a list of params to identify on which U param to apply the radius on.
     * @param inputs Shape, edge, radius list and param list
     * @returns OpenCascade shape with filleted edges
     * @group 3d fillets
     * @shortname fillet edge variable r
     * @drawable true
     */
    filletEdgeVariableRadius(inputs: Inputs.OCCT.FilletEdgeVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        return this.och.filletsService.filletEdgeVariableRadius(inputs);
    }

    /**
     * Fillets multiple provided edges with variable radius lists on given params lists. You need to provide a list of params to identify on which U param to apply the radius on.
     * @param inputs Shape, edge, radius list and param list
     * @returns OpenCascade shape with filleted edges
     * @group 3d fillets
     * @shortname fillet edges variable r
     * @drawable true
     */
    filletEdgesVariableRadius(inputs: Inputs.OCCT.FilletEdgesVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        return this.och.filletsService.filletEdgesVariableRadius(inputs);
    }

    /**
     * Fillets multiple provided edges with the same variable radiuses on u params for each edge.
     * @param inputs Shape, edge, radius list and param list
     * @returns OpenCascade shape with filleted edges
     * @group 3d fillets
     * @shortname fillet edges same variable r
     * @drawable true
     */
    filletEdgesSameVariableRadius(inputs: Inputs.OCCT.FilletEdgesSameVariableRadiusDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        return this.och.filletsService.filletEdgesSameVariableRadius(inputs);
    }

    /**
     * Chamfer OpenCascade Shape edges
     * @param inputs Shape, distance and edge indexes to chamfer
     * @returns OpenCascade shape with chamfered edges
     * @group 3d chamfers
     * @shortname chamfer edges
     * @drawable true
     */
    chamferEdges(inputs: Inputs.OCCT.ChamferDto<TopoDS_Shape>): TopoDS_Shape {
        return this.och.filletsService.chamferEdges(inputs);
    }

    /**
     * Chamfers edges list with different distance on each edge.
     * @param inputs Shape, edges and distance list
     * @returns OpenCascade shape with chamfered edges
     * @group 3d chamfers
     * @shortname chamfer edges list
     * @drawable true
     */
    chamferEdgesList(inputs: Inputs.OCCT.ChamferEdgesListDto<TopoDS_Shape, TopoDS_Edge>): TopoDS_Shape {
        return this.och.filletsService.chamferEdgesList(inputs);
    }

    /**
     * Chamfers edge by a given distance and angle from the face
     * @param inputs Shape, edge, face, distance and angle
     * @returns OpenCascade shape with chamfered edges
     * @group 3d chamfers
     * @shortname chamfer edge angle
     * @drawable true
     */
    chamferEdgeDistAngle(inputs: Inputs.OCCT.ChamferEdgeDistAngleDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
        return this.och.filletsService.chamferEdgeDistAngle(inputs);
    }

    /**
     * Chamfers multiple edges by a given distance and angle from the faces
     * @param inputs Shape, edge, face, distance and angle
     * @returns OpenCascade shape with chamfered edges
     * @group 3d chamfers
     * @shortname chamfer edges angle
     * @drawable true
     */
    chamferEdgesDistAngle(inputs: Inputs.OCCT.ChamferEdgesDistAngleDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
        return this.och.filletsService.chamferEdgesDistAngle(inputs);
    }

    /**
     * Chamfers edges by a given distances and angles from the faces
     * @param inputs Shape, edges, faces, distances and angles
     * @returns OpenCascade shape with chamfered edges
     * @group 3d chamfers
     * @shortname chamfer edges angles
     * @drawable true
     */
    chamferEdgesDistsAngles(inputs: Inputs.OCCT.ChamferEdgesDistsAnglesDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
        return this.och.filletsService.chamferEdgesDistsAngles(inputs);
    }

    /**
     * Chamfers edge by a by two distances. Face indicates the first distance to be applied
     * @param inputs Shape, edge, face, distance1 and distance2
     * @returns OpenCascade shape with chamfered edges
     * @group 3d chamfers
     * @shortname chamfer edge 2 dist
     * @drawable true
     */
    chamferEdgeTwoDistances(inputs: Inputs.OCCT.ChamferEdgeTwoDistancesDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
        return this.och.filletsService.chamferEdgeTwoDistances(inputs);
    }

    /**
     * Chamfers edges by a by two distances. Face indicates the first distance to be applied
     * @param inputs Shape, edges, faces, distance1 and distance2
     * @returns OpenCascade shape with chamfered edges
     * @group 3d chamfers
     * @shortname chamfer edges 2 dist
     * @drawable true
     */
    chamferEdgesTwoDistances(inputs: Inputs.OCCT.ChamferEdgesTwoDistancesDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
        return this.och.filletsService.chamferEdgesTwoDistances(inputs);
    }

    /**
     * Chamfers edges by two distances. Face indicates the first distance to be applied
     * @param inputs Shape, edges, faces, distance1 list and distance2 list
     * @returns OpenCascade shape with chamfered edges
     * @group 3d chamfers
     * @shortname chamfer edges 2 dist lists
     * @drawable true
     */
    chamferEdgesTwoDistancesLists(inputs: Inputs.OCCT.ChamferEdgesTwoDistancesListsDto<TopoDS_Shape, TopoDS_Edge, TopoDS_Face>): TopoDS_Shape {
        return this.och.filletsService.chamferEdgesTwoDistancesLists(inputs);
    }

    /**
     * Fillets two planar edges into a wire by providing a radius, plane, edges and possible solution index if more than one result exists
     * @param inputs Definition for fillets
     * @returns OpenCascade wire shape if solution is found
     * @group 2d fillets
     * @shortname fillet 2 edges
     * @drawable true
     */
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

    /**
     * Fillets OpenCascade 3d wires, this algorithm takes one guiding direction for fillets to be formed. 
     * It does not respect tangent directions on each filleted corner. This algorithm is based on extruding wires along the given direction
     * to form a shell, then filleting the shell and finally extracting the filleted wire from the shell itself.
     * Make sure you provide a direction that is not parallel to the wire and that forms high enough extrusion for the fillet to succeed.
     * @param inputs Shapes, radius and edge indexes to fillet
     * @returns OpenCascade shape with filleted edges
     * @group 3d fillets
     * @shortname fillet 3d wires
     * @drawable true
     */
    fillet3DWires(inputs: Inputs.OCCT.Fillet3DWiresDto<TopoDS_Wire>): TopoDS_Shape[] {
        return inputs.shapes.map(shape => this.och.filletsService.fillet3DWire({
            shape,
            radius: inputs.radius,
            radiusList: inputs.radiusList,
            indexes: inputs.indexes,
            direction: inputs.direction
        }));
    }

    /**
     * Fillets OpenCascade 3d wire, this algorithm takes one guiding direction for fillets to be formed. 
     * It does not respect tangent directions on each filleted corner. This algorithm is based on extruding wire along the given direction
     * to form a shell, then filleting the shell and finally extracting the filleted wire from the shell itself.
     * Make sure you provide a direction that is not parallel to the wire and that forms high enough extrusion for the fillet to succeed.
     * @param inputs Shape, radius and edge indexes to fillet
     * @returns OpenCascade shape with filleted edges
     * @group 3d fillets
     * @shortname fillet 3d wire
     * @drawable true
     */
    fillet3DWire(inputs: Inputs.OCCT.Fillet3DWireDto<TopoDS_Wire>): TopoDS_Shape {
        return this.och.filletsService.fillet3DWire(inputs);
    }

    /**
     * Fillets 2d wire or face
     * @param inputs Shape
     * @returns OpenCascade filleted shape result
     * @group 2d fillets
     * @shortname fillet 2d wire or face
     * @drawable true
     */
    fillet2d(inputs: Inputs.OCCT.FilletDto<TopoDS_Wire | TopoDS_Face>): TopoDS_Face | TopoDS_Wire {
        return this.och.filletsService.fillet2d(inputs);
    }

    /**
     * Fillets 2d wires or faces
     * @param inputs Shapes
     * @returns OpenCascade filleted shapes result
     * @group 2d fillets
     * @shortname fillet 2d wires or faces
     * @drawable true
     */
    fillet2dShapes(inputs: Inputs.OCCT.FilletShapesDto<TopoDS_Wire | TopoDS_Face>): TopoDS_Face[] | TopoDS_Wire[] {
        return inputs.shapes.map(shape => this.och.filletsService.fillet2d({
            shape,
            radius: inputs.radius,
            radiusList: inputs.radiusList,
            indexes: inputs.indexes
        }));
    }

    /**
     * Chamfers the corners of a 2d wire or planar face by a setback distance and angle
     * @param inputs 2d shape, distance, angle and optional corner indexes
     * @returns OpenCascade face or wire with chamfered corners
     * @group 2d fillets
     * @shortname chamfer 2d corners
     * @drawable true
     */
    chamfer2dVertices(inputs: Inputs.OCCT.Chamfer2dVertexDto<TopoDS_Wire | TopoDS_Face>): TopoDS_Face | TopoDS_Wire {
        return this.och.filletsService.chamfer2dVertices(inputs);
    }

}
