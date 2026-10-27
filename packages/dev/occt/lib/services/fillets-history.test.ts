import { describe, it, expect, beforeAll } from "vitest";
import type { TopoDS_Edge, TopoDS_Face, TopoDS_Shape } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OCCTService } from "../occ-service";
import type * as Models from "../api/models";

describe("OCCT fillet and chamfer variants with history", () => {
    let occt: OCCTService;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occt = new OCCTService(kernel);
    }, 120_000);

    const cube = (): TopoDS_Shape => occt.shapes.solid.createCube({ size: 2, center: [0, 0, 0] });
    const edgesOf = (shape: TopoDS_Shape): TopoDS_Edge[] => occt.shapes.edge.getEdges({ shape });
    const facesOf = (shape: TopoDS_Shape): TopoDS_Face[] => occt.shapes.face.getFaces({ shape });
    const volumeOf = (shape: TopoDS_Shape): number => occt.shapes.solid.getSolidVolume({ shape });
    const reached = (history: Models.OCCT.ShapeHistory): number =>
        new Set([
            ...history.faces.flat(), ...history.facesFromFaces.flat(), ...history.facesFromEdges.flat(),
            ...history.facesFromVertices.flat(), ...history.firstFaces, ...history.lastFaces,
        ]).size;

    type Case = {
        name: string;
        edges: number[];
        plain: (shape: TopoDS_Shape, edges: TopoDS_Edge[], faces: TopoDS_Face[]) => TopoDS_Shape;
        twin: (shape: TopoDS_Shape, edges: TopoDS_Edge[], faces: TopoDS_Face[]) => Models.OCCT.ShapeWithHistory<TopoDS_Shape>;
    };
    const cases: Case[] = [
        {
            name: "filletEdgesList", edges: [0, 1],
            plain: (shape, edges) => occt.fillets.filletEdgesList({ shape, edges: [edges[0]!, edges[1]!], radiusList: [0.2, 0.3] }),
            twin: (shape, edges) => occt.fillets.filletEdgesListWithHistory({ shape, edges: [edges[0]!, edges[1]!], radiusList: [0.2, 0.3] }),
        },
        {
            name: "filletEdgesListOneRadius", edges: [0, 1],
            plain: (shape, edges) => occt.fillets.filletEdgesListOneRadius({ shape, edges: [edges[0]!, edges[1]!], radius: 0.2 }),
            twin: (shape, edges) => occt.fillets.filletEdgesListOneRadiusWithHistory({ shape, edges: [edges[0]!, edges[1]!], radius: 0.2 }),
        },
        {
            name: "filletEdgeVariableRadius", edges: [0],
            plain: (shape, edges) => occt.fillets.filletEdgeVariableRadius({ shape, edge: edges[0]!, radiusList: [0.1, 0.3], paramsU: [0, 1] }),
            twin: (shape, edges) => occt.fillets.filletEdgeVariableRadiusWithHistory({ shape, edge: edges[0]!, radiusList: [0.1, 0.3], paramsU: [0, 1] }),
        },
        {
            name: "filletEdgesSameVariableRadius", edges: [0, 2],
            plain: (shape, edges) => occt.fillets.filletEdgesSameVariableRadius({ shape, edges: [edges[0]!, edges[2]!], radiusList: [0.1, 0.3], paramsU: [0, 1] }),
            twin: (shape, edges) => occt.fillets.filletEdgesSameVariableRadiusWithHistory({ shape, edges: [edges[0]!, edges[2]!], radiusList: [0.1, 0.3], paramsU: [0, 1] }),
        },
        {
            name: "filletEdgesVariableRadius", edges: [0, 2],
            plain: (shape, edges) => occt.fillets.filletEdgesVariableRadius({ shape, edges: [edges[0]!, edges[2]!], radiusLists: [[0.1, 0.3], [0.2, 0.2]], paramsULists: [[0, 1], [0, 1]] }),
            twin: (shape, edges) => occt.fillets.filletEdgesVariableRadiusWithHistory({ shape, edges: [edges[0]!, edges[2]!], radiusLists: [[0.1, 0.3], [0.2, 0.2]], paramsULists: [[0, 1], [0, 1]] }),
        },
        {
            name: "chamferEdgesList", edges: [0, 1],
            plain: (shape, edges) => occt.fillets.chamferEdgesList({ shape, edges: [edges[0]!, edges[1]!], distanceList: [0.2, 0.3] }),
            twin: (shape, edges) => occt.fillets.chamferEdgesListWithHistory({ shape, edges: [edges[0]!, edges[1]!], distanceList: [0.2, 0.3] }),
        },
        {
            name: "chamferEdgeTwoDistances", edges: [0],
            plain: (shape, edges, faces) => occt.fillets.chamferEdgeTwoDistances({ shape, edge: edges[0]!, face: faces[0]!, distance1: 0.2, distance2: 0.4 }),
            twin: (shape, edges, faces) => occt.fillets.chamferEdgeTwoDistancesWithHistory({ shape, edge: edges[0]!, face: faces[0]!, distance1: 0.2, distance2: 0.4 }),
        },
        {
            name: "chamferEdgesTwoDistances", edges: [0],
            plain: (shape, edges, faces) => occt.fillets.chamferEdgesTwoDistances({ shape, edges: [edges[0]!], faces: [faces[0]!], distance1: 0.2, distance2: 0.4 }),
            twin: (shape, edges, faces) => occt.fillets.chamferEdgesTwoDistancesWithHistory({ shape, edges: [edges[0]!], faces: [faces[0]!], distance1: 0.2, distance2: 0.4 }),
        },
        {
            name: "chamferEdgesTwoDistancesLists", edges: [0],
            plain: (shape, edges, faces) => occt.fillets.chamferEdgesTwoDistancesLists({ shape, edges: [edges[0]!], faces: [faces[0]!], distances1: [0.2], distances2: [0.4] }),
            twin: (shape, edges, faces) => occt.fillets.chamferEdgesTwoDistancesListsWithHistory({ shape, edges: [edges[0]!], faces: [faces[0]!], distances1: [0.2], distances2: [0.4] }),
        },
        {
            name: "chamferEdgeDistAngle", edges: [0],
            plain: (shape, edges, faces) => occt.fillets.chamferEdgeDistAngle({ shape, edge: edges[0]!, face: faces[0]!, distance: 0.2, angle: 45 }),
            twin: (shape, edges, faces) => occt.fillets.chamferEdgeDistAngleWithHistory({ shape, edge: edges[0]!, face: faces[0]!, distance: 0.2, angle: 45 }),
        },
        {
            name: "chamferEdgesDistAngle", edges: [0],
            plain: (shape, edges, faces) => occt.fillets.chamferEdgesDistAngle({ shape, edges: [edges[0]!], faces: [faces[0]!], distance: 0.2, angle: 60 }),
            twin: (shape, edges, faces) => occt.fillets.chamferEdgesDistAngleWithHistory({ shape, edges: [edges[0]!], faces: [faces[0]!], distance: 0.2, angle: 60 }),
        },
        {
            name: "chamferEdgesDistsAngles", edges: [0],
            plain: (shape, edges, faces) => occt.fillets.chamferEdgesDistsAngles({ shape, edges: [edges[0]!], faces: [faces[0]!], distances: [0.2], angles: [60] }),
            twin: (shape, edges, faces) => occt.fillets.chamferEdgesDistsAnglesWithHistory({ shape, edges: [edges[0]!], faces: [faces[0]!], distances: [0.2], angles: [60] }),
        },
    ];

    it.each(cases)("$name should keep its plain shape and name one face along each edge it changes", ({ edges: changed, plain, twin }) => {
        // Arrange
        const shape = cube();
        const edges = edgesOf(shape);
        const faces = facesOf(shape);

        // Act
        const { shape: made, history } = twin(shape, edges, faces);

        // Assert
        expect(volumeOf(made)).toBeCloseTo(volumeOf(plain(shape, edges, faces)), 9);
        expect(volumeOf(made)).toBeLessThan(8);
        changed.forEach(edge => expect(history.facesFromEdges[edge]).toHaveLength(1));
        expect(new Set(changed.map(edge => history.facesFromEdges[edge]![0])).size).toBe(changed.length);
        history.facesFromEdges.forEach((made, edge) => expect(made.length > 0).toBe(changed.includes(edge)));
        expect(history.faces.every(faces => faces.length === 1)).toBe(true);
        expect(reached(history)).toBe(facesOf(made).length);
    });
});
