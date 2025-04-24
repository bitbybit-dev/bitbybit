import initOpenCascade, { OpenCascadeInstance, TopoDS_Wire } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../occ-helper";
import { VectorHelperService } from "../api/vector-helper.service";
import { ShapesHelperService } from "../api/shapes-helper.service";
import * as Inputs from "../api/inputs/inputs";
import { OCCTFillets } from "./fillets";
import { OCCTEdge, OCCTSolid, OCCTWire } from "./shapes";

describe("OCCT fillets unit tests", () => {
    let occt: OpenCascadeInstance;
    let wire: OCCTWire;
    let edge: OCCTEdge;
    let fillets: OCCTFillets;
    let solid: OCCTSolid;
    let occHelper: OccHelper;

    beforeAll(async () => {
        occt = await initOpenCascade();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();

        occHelper = new OccHelper(vec, s, occt);
        solid = new OCCTSolid(occt, occHelper);
        wire = new OCCTWire(occt, occHelper);
        edge = new OCCTEdge(occt, occHelper);
        fillets = new OCCTFillets(occt, occHelper);
    });

    it("should fillet closed 3D wire on various corners", () => {
        const starOpt = new Inputs.OCCT.StarDto(10, 6, 7, [0, 0, 0], [0, 1, 0], 3);
        const star = wire.createStarWire(starOpt);
        const filletOptions = new Inputs.OCCT.Fillet3DWireDto<TopoDS_Wire>(
            star,
            undefined,
            [0, 1, 0],
            [0.4, 0.2, 0.5, 0.3, 0.6],
            [1, 2, 3, 4, 5],
        );
        const result = fillets.fillet3DWire(filletOptions);
        const edges = occHelper.edgesService.getEdgesAlongWire({ shape: result });
        const edgeLengths = edges.map(e => occHelper.edgesService.getEdgeLength({ shape: e }));
        expect(edgeLengths).toEqual([
            5.348146466383239,
            0.4475593096045423,
            5.268367175439688,
            0.6392454970881696,
            5.065399912120434,
            0.6713389644068104,
            4.985620621176885,
            0.7670945965058044,
            5.594522411134649,
            6.073198156795948,
            6.073198156795948,
            6.073198156795948,
            6.073198156795948,
            6.073198156795948,
            6.073198156795948,
            6.073198156795949,
            6.073198156795949,
            5.7540809930217485,
            0.511396397670537,
        ]);
        expect(edgeLengths[1]).toBeLessThan(1);
        expect(edgeLengths[3]).toBeLessThan(1);
        expect(edgeLengths[5]).toBeLessThan(1);
        expect(edgeLengths[7]).toBeLessThan(1);
        expect(edgeLengths[18]).toBeLessThan(1);

        result.delete();
        edges.forEach(e => e.delete());
        star.delete();
    });

    it("should fillet closed 3D wire", () => {
        const starOpt = new Inputs.OCCT.StarDto(10, 6, 7, [0, 0, 0], [0, 1, 0], 3);
        const star = wire.createStarWire(starOpt);
        const filletOptions = new Inputs.OCCT.Fillet3DWireDto<TopoDS_Wire>(
            star,
            undefined,
            [0, 1, 0],
            [0.3, 0.2, 0.3, 0.3, 0.3],
            [4, 7, 8, 9, 12],
        );
        const result = fillets.fillet3DWire(filletOptions);
        const edges = occHelper.edgesService.getEdgesAlongWire({ shape: result });
        const edgeLengths = edges.map(e => occHelper.edgesService.getEdgeLength({ shape: e }));
        expect(edgeLengths).toEqual([
            5.464296366838182,
            0.6713389644068104,
            5.464296366838182,
            6.0731981567959465,
            5.913639574908849,
            0.25569819883526734,
            5.304737784951084,
            0.671338964406812,
            5.224958494007533,
            0.38354729825290185,
            5.8338602839653,
            6.073198156795948,
            5.46429636683818,
            0.6713389644068126,
            5.46429636683818,
            6.073198156795949,
            6.073198156795948,
            6.073198156795948,
            6.073198156795948,
        ]);

        expect(edgeLengths[1]).toBeLessThan(1);
        expect(edgeLengths[5]).toBeLessThan(1);
        expect(edgeLengths[7]).toBeLessThan(1);
        expect(edgeLengths[9]).toBeLessThan(1);
        expect(edgeLengths[13]).toBeLessThan(1);

        star.delete();
        edges.forEach(e => e.delete());
        result.delete();
    });

    it("should fillet open 3D wire", () => {
        const starOpt = new Inputs.OCCT.StarDto(10, 6, 7, [0, 0, 0], [0, 1, 0], 3);
        const star = wire.createStarWire(starOpt);

        const edgesStar = occHelper.shapeGettersService.getEdges({ shape: star });
        edgesStar.pop();
        const wireStarOpen = occHelper.converterService.combineEdgesAndWiresIntoAWire({ shapes: edgesStar });

        const filletOptions = new Inputs.OCCT.Fillet3DWireDto<TopoDS_Wire>(
            wireStarOpen,
            undefined,
            [0, 1, 0],
            [0.4, 0.2, 0.5, 0.3, 0.6],
            [1, 2, 3, 4, 5],
        );
        const result = fillets.fillet3DWire(filletOptions);
        const edges = occHelper.shapeGettersService.getEdges({ shape: result });
        const edgeLengths = edges.map(e => occHelper.edgesService.getEdgeLength({ shape: e }));

        expect(edgeLengths).toEqual([
            5.7540809930217485, 0.5113963976705358,
            5.348146466383239, 0.4475593096045423,
            5.268367175439688, 0.6392454970881696,
            5.065399912120434, 0.6713389644068104,
            4.985620621176885, 0.7670945965058044,
            5.594522411134649, 6.073198156795948,
            6.073198156795948, 6.073198156795948,
            6.073198156795948, 6.073198156795948,
            6.073198156795948, 6.073198156795949
        ]);
        expect(edgeLengths[1]).toBeLessThan(1);
        expect(edgeLengths[3]).toBeLessThan(1);
        expect(edgeLengths[5]).toBeLessThan(1);
        expect(edgeLengths[7]).toBeLessThan(1);
        expect(edgeLengths[9]).toBeLessThan(1);

        star.delete();
        edges.forEach(e => e.delete());
        result.delete();
    });

    it("should fillet closed 2D wire on various corners", () => {
        const starOpt = new Inputs.OCCT.StarDto(10, 6, 7, [0, 0, 0], [0, 1, 0], 0);
        const star = wire.createStarWire(starOpt);
        const filletOptions = new Inputs.OCCT.FilletDto<TopoDS_Wire>(
            star,
            undefined,
            [0.4, 0.2, 0.5, 0.3, 0.6],
            [4, 6, 7, 8, 13],
        );
        const result = fillets.fillet2d(filletOptions);
        const edges = occHelper.edgesService.getEdgesAlongWire({ shape: result });
        const edgeLengths = edges.map(e => occHelper.edgesService.getEdgeLength({ shape: e }));
        expect(edgeLengths).toEqual([
            5.280505264812232, 5.280505264812232,
            5.280505264812232, 4.574603909466177,
            0.8442070927826264, 4.5746039094661795,
            4.927554587139205, 0.42210354639131353,
            4.580723350141782, 0.6064599154654551,
            4.404248011305268, 0.6331553195869694,
            4.75107924830269, 5.280505264812232,
            5.280505264812233, 5.280505264812232,
            4.864307780415325, 0.7277518985585463,
            4.8643077804153245
        ]);
        expect(edgeLengths[4]).toBeLessThan(1);
        expect(edgeLengths[7]).toBeLessThan(1);
        expect(edgeLengths[9]).toBeLessThan(1);
        expect(edgeLengths[11]).toBeLessThan(1);
        expect(edgeLengths[17]).toBeLessThan(1);

        result.delete();
        edges.forEach(e => e.delete());
        star.delete();
    });

    it("should fillet open 2D wire", () => {
        const starOpt = new Inputs.OCCT.StarDto(10, 6, 7, [0, 0, 0], [0, 1, 0], 0);
        const star = wire.createStarWire(starOpt);

        const edgesStar = occHelper.shapeGettersService.getEdges({ shape: star });
        edgesStar.pop();
        const wireStarOpen = occHelper.converterService.combineEdgesAndWiresIntoAWire({ shapes: edgesStar });

        const filletOptions = new Inputs.OCCT.FilletDto<TopoDS_Wire>(
            wireStarOpen,
            undefined,
            [0.4, 0.2, 0.5, 0.3, 0.6],
            [1, 2, 3, 4, 5],
        );
        const result = fillets.fillet2d(filletOptions);
        const edges = occHelper.shapeGettersService.getEdges({ shape: result });
        const edgeLengths = edges.map(e => occHelper.edgesService.getEdgeLength({ shape: e }));
        expect(edgeLengths).toEqual([
            5.003040275214293, 0.4851679323723642,
            4.650089597541266, 0.4221035463913131,
            4.58072335014178, 0.6064599154654553,
            4.4042480113052696, 0.6331553195869704,
            4.334881763905785, 0.7277518985585463,
            4.864307780415325, 5.280505264812233,
            5.280505264812232, 5.280505264812232,
            5.280505264812232, 5.280505264812233,
            5.280505264812232, 5.280505264812232
        ]);
        expect(edgeLengths[1]).toBeLessThan(1);
        expect(edgeLengths[3]).toBeLessThan(1);
        expect(edgeLengths[5]).toBeLessThan(1);
        expect(edgeLengths[7]).toBeLessThan(1);
        expect(edgeLengths[9]).toBeLessThan(1);

        star.delete();
        edges.forEach(e => e.delete());
        result.delete();
    });

    it("should fillet a single edge on the solid", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const filRes = fillets.filletEdges({ shape: cube, indexes: [1], radius: 0.5 });
        const faces = occHelper.shapeGettersService.getFaces({ shape: filRes });
        const volume = solid.getSolidVolume({ shape: filRes });
        expect(volume).toBeCloseTo(7.892699081698724);
        expect(faces.length).toBe(7);
        cube.delete();
        filRes.delete();
        faces.forEach(f => f.delete());
    });

    it("should fillet specific edges on the solid by index", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const filRes = fillets.filletEdges({ shape: cube, indexes: [1, 4, 6], radiusList: [0.3, 0.2, 0.1] });
        const faces = occHelper.shapeGettersService.getFaces({ shape: filRes });
        const volume = solid.getSolidVolume({ shape: filRes });
        expect(volume).toBeCloseTo(7.9412869655174045);
        expect(faces.length).toBe(9);
        cube.delete();
        filRes.delete();
        faces.forEach(f => f.delete());
    });

    it("should not fillet specific edges on the solid by index if radius list does not have the same nr of elements as indexes", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        expect(() => fillets.filletEdges({ shape: cube, indexes: [1, 4, 6], radiusList: [0.3, 0.2] })).toThrowError("Radius not defined, or radiusList not correct length");
        cube.delete();
    });

    it("should fillet all edges on the solid", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const filRes = fillets.filletEdges({ shape: cube, radius: 0.5 });
        const faces = occHelper.shapeGettersService.getFaces({ shape: filRes });
        const volume = solid.getSolidVolume({ shape: filRes });
        expect(volume).toBeCloseTo(6.879793265790643);
        expect(faces.length).toBe(26);
        cube.delete();
        filRes.delete();
        faces.forEach(f => f.delete());
    });

    it("should fillet edge with variable radius", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const edge = occHelper.shapeGettersService.getEdges({ shape: cube })[0];
        const filRes = fillets.filletEdgeVariableRadius({ shape: cube, edge, radiusList: [0.1, 0.3, 0.3, 1], paramsU: [0, 0.2, 0.8, 1] });
        const faces = occHelper.shapeGettersService.getFaces({ shape: filRes });
        const volume = solid.getSolidVolume({ shape: filRes });
        expect(volume).toBeCloseTo(7.945527218508813);
        expect(faces.length).toBe(7);
        cube.delete();
        filRes.delete();
        faces.forEach(f => f.delete());
        edge.delete();
    });

    it("should not fillet edge with variable radius if params u does not have the same nr of eleemnts as radius list", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const edge = occHelper.shapeGettersService.getEdges({ shape: cube })[0];
        const filRes = fillets.filletEdgeVariableRadius({ shape: cube, edge, radiusList: [0.1, 0.3, 0.3, 1], paramsU: [0, 0.2, 0.8] });
        expect(filRes).toBeUndefined();
    });

    it("should fillet edges with variable radius", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const allEdges = occHelper.shapeGettersService.getEdges({ shape: cube });
        const edges = [allEdges[0], allEdges[1], allEdges[2]];
        const filRes = fillets.filletEdgesVariableRadius({
            shape: cube,
            edges,
            radiusLists: [
                [0.1, 0.3, 0.3, 0.1],
                [0.2, 0.1, 0.1, 0.2],
                [0.1, 0.1]
            ],
            paramsULists: [
                [0, 0.2, 0.8, 1],
                [0, 0.3, 0.4, 1],
                [0.3, 0.4]
            ]
        });
        const faces = occHelper.shapeGettersService.getFaces({ shape: filRes });
        const volume = solid.getSolidVolume({ shape: filRes });
        expect(volume).toBeCloseTo(7.9378791553310855);
        expect(faces.length).toBe(9);
        cube.delete();
        filRes.delete();
        faces.forEach(f => f.delete());
        allEdges.forEach(e => e.delete());
    });

    it("should not fillet edges with variable radius if radius list contains different nr of elements than params u list", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const allEdges = occHelper.shapeGettersService.getEdges({ shape: cube });
        const edges = [allEdges[0], allEdges[1], allEdges[2]];
        const filRes = fillets.filletEdgesVariableRadius({
            shape: cube,
            edges,
            radiusLists: [
                [0.1, 0.3, 0.3, 0.1],
                [0.2, 0.1, 0.1, 0.2],
            ],
            paramsULists: [
                [0, 0.2, 0.8, 1],
                [0, 0.3, 0.4, 1],
                [0.3, 0.4]
            ]
        });
        expect(filRes).toBeUndefined();
        cube.delete();
        allEdges.forEach(e => e.delete());
    });

    it("should fillet edges list", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const allEdges = occHelper.shapeGettersService.getEdges({ shape: cube });
        const edges = [allEdges[0], allEdges[1], allEdges[2]];
        const filRes = fillets.filletEdgesList({
            shape: cube,
            edges,
            radiusList: [0.1, 0.3, 0.4],
        });
        const faces = occHelper.shapeGettersService.getFaces({ shape: filRes });
        const volume = solid.getSolidVolume({ shape: filRes });
        expect(volume).toBeCloseTo(7.892769171674582);
        expect(faces.length).toBe(9);
        cube.delete();
        filRes.delete();
        faces.forEach(f => f.delete());
        allEdges.forEach(e => e.delete());
    });

    it("should fillet edges with single radius", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const allEdges = occHelper.shapeGettersService.getEdges({ shape: cube });
        const edges = [allEdges[0], allEdges[1], allEdges[2]];
        const filRes = fillets.filletEdgesListOneRadius({
            shape: cube,
            edges,
            radius: 0.4,
        });
        const faces = occHelper.shapeGettersService.getFaces({ shape: filRes });
        const volume = solid.getSolidVolume({ shape: filRes });
        expect(volume).toBeCloseTo(7.8062536532871505);
        expect(faces.length).toBe(9);
        cube.delete();
        filRes.delete();
        faces.forEach(f => f.delete());
        allEdges.forEach(e => e.delete());
    });

    it("should fillet edges with same variable radius", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const allEdges = occHelper.shapeGettersService.getEdges({ shape: cube });
        const edges = [allEdges[0], allEdges[1], allEdges[2]];
        const filRes = fillets.filletEdgesSameVariableRadius({
            shape: cube,
            edges,
            radiusList: [0.1, 0.3, 0.3, 0.1],
            paramsU: [0, 0.2, 0.8, 1],
        });
        const faces = occHelper.shapeGettersService.getFaces({ shape: filRes });
        const volume = solid.getSolidVolume({ shape: filRes });
        expect(volume).toBeCloseTo(7.853043576889979);
        expect(faces.length).toBe(9);

        cube.delete();
        filRes.delete();
        faces.forEach(f => f.delete());
        allEdges.forEach(e => e.delete());
    });

    it("should chamfer all edges with one distance", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const filRes = fillets.chamferEdges({ shape: cube, distance: 0.1 });
        const faces = occHelper.shapeGettersService.getFaces({ shape: filRes });
        const volume = solid.getSolidVolume({ shape: filRes });
        expect(volume).toBeCloseTo(7.88533333333333);
        expect(faces.length).toBe(26);

        cube.delete();
        filRes.delete();
        faces.forEach(f => f.delete());
    });

    it("should chamfer all edges with one distance by providing edge list", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const edges = occHelper.shapeGettersService.getEdges({ shape: cube });
        const distanceList = edges.map(_ => 0.1);
        const filRes = fillets.chamferEdgesList({ shape: cube, edges, distanceList });
        const faces = occHelper.shapeGettersService.getFaces({ shape: filRes });
        const volume = solid.getSolidVolume({ shape: filRes });
        expect(volume).toBeCloseTo(7.88533333333333);
        expect(faces.length).toBe(26);

        cube.delete();
        filRes.delete();
        faces.forEach(f => f.delete());
    });

    it("should chamfer specific edges selected by indexes with one distance", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const chamferRes = fillets.chamferEdges({ shape: cube, distance: 0.1, indexes: [1, 2, 6] });
        const faces = occHelper.shapeGettersService.getFaces({ shape: chamferRes });
        const volume = solid.getSolidVolume({ shape: chamferRes });
        expect(volume).toBeCloseTo(7.9703333333333335);
        expect(faces.length).toBe(9);

        cube.delete();
        chamferRes.delete();
        faces.forEach(f => f.delete());
    });

    it("should chamfer specific edges selected by indexes with specific distances", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const chamferRes = fillets.chamferEdges({ shape: cube, indexes: [1, 2, 6], distanceList: [0.2, 0.3, 0.4] });
        const faces = occHelper.shapeGettersService.getFaces({ shape: chamferRes });
        const volume = solid.getSolidVolume({ shape: chamferRes });
        expect(volume).toBeCloseTo(7.714666666666666);
        expect(faces.length).toBe(9);

        cube.delete();
        chamferRes.delete();
        faces.forEach(f => f.delete());
    });

    it("should chamfer a single edge on the solid with angle", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const allEdges = occHelper.shapeGettersService.getEdges({ shape: cube });
        const allFaces = occHelper.shapeGettersService.getFaces({ shape: cube });
        const edge = allEdges[0];
        const face = allFaces[0];
        const chamferRes = fillets.chamferEdgeDistAngle({ shape: cube, edge, face, distance: 0.2, angle: 45 });
        const faces = occHelper.shapeGettersService.getFaces({ shape: chamferRes });
        const volume = solid.getSolidVolume({ shape: chamferRes });
        expect(volume).toBeCloseTo(7.959999999999999);
        expect(faces.length).toBe(7);
        cube.delete();
        chamferRes.delete();
        allFaces.forEach(f => f.delete());
        allEdges.forEach(e => e.delete());
        faces.forEach(f => f.delete());
    });

    it("should chamfer a single edge on the solid with 60 degree angle", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const allEdges = occHelper.shapeGettersService.getEdges({ shape: cube });
        const allFaces = occHelper.shapeGettersService.getFaces({ shape: cube });
        const edge = allEdges[0];
        const face = allFaces[0];
        const chamferRes = fillets.chamferEdgeDistAngle({ shape: cube, edge, face, distance: 0.2, angle: 60 });
        const faces = occHelper.shapeGettersService.getFaces({ shape: chamferRes });
        const volume = solid.getSolidVolume({ shape: chamferRes });
        expect(volume).toBeCloseTo(7.930717967697245);
        expect(faces.length).toBe(7);
        cube.delete();
        chamferRes.delete();
        allFaces.forEach(f => f.delete());
        allEdges.forEach(e => e.delete());
        faces.forEach(f => f.delete());
    });

    it("should chamfer a single edge on the solid with two distances", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const allEdges = occHelper.shapeGettersService.getEdges({ shape: cube });
        const allFaces = occHelper.shapeGettersService.getFaces({ shape: cube });
        const edge = allEdges[0];
        const face = allFaces[0];
        const chamferRes = fillets.chamferEdgeTwoDistances({ shape: cube, edge, face, distance1: 0.2, distance2: 0.6 });
        const faces = occHelper.shapeGettersService.getFaces({ shape: chamferRes });
        const volume = solid.getSolidVolume({ shape: chamferRes });
        expect(volume).toBeCloseTo(7.879999999999999);
        expect(faces.length).toBe(7);
        cube.delete();
        chamferRes.delete();
        allFaces.forEach(f => f.delete());
        allEdges.forEach(e => e.delete());
        faces.forEach(f => f.delete());
    });

    it("should chamfer a single edge on the solid with two distances that are the same", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const allEdges = occHelper.shapeGettersService.getEdges({ shape: cube });
        const allFaces = occHelper.shapeGettersService.getFaces({ shape: cube });
        const edge = allEdges[0];
        const face = allFaces[0];
        const chamferRes = fillets.chamferEdgeTwoDistances({ shape: cube, edge, face, distance1: 0.2, distance2: 0.2 });
        const faces = occHelper.shapeGettersService.getFaces({ shape: chamferRes });
        const volume = solid.getSolidVolume({ shape: chamferRes });
        expect(volume).toBeCloseTo(7.959999999999999);
        expect(faces.length).toBe(7);
        cube.delete();
        chamferRes.delete();
        allFaces.forEach(f => f.delete());
        allEdges.forEach(e => e.delete());
        faces.forEach(f => f.delete());
    });

    it("should chamfer specific edges with a single distance and 45 deg angle", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const allEdges = occHelper.shapeGettersService.getEdges({ shape: cube });
        const allFaces = occHelper.shapeGettersService.getFaces({ shape: cube });
        const edges = [allEdges[0], allEdges[1], allEdges[2]];
        const faces = [allFaces[0], allFaces[0], allFaces[0]];
        const chamferRes = fillets.chamferEdgesDistAngle({ shape: cube, edges, faces, distance: 0.2, angle: 45 });
        const facesRes = occHelper.shapeGettersService.getFaces({ shape: chamferRes });
        const volume = solid.getSolidVolume({ shape: chamferRes });
        expect(volume).toBeCloseTo(7.885333333333332);
        expect(facesRes.length).toBe(9);
        cube.delete();
        chamferRes.delete();
        allFaces.forEach(f => f.delete());
        allEdges.forEach(e => e.delete());
        facesRes.forEach(f => f.delete());
    });

    it("should chamfer specific edges with a single distance and 70 deg angle", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const allEdges = occHelper.shapeGettersService.getEdges({ shape: cube });
        const allFaces = occHelper.shapeGettersService.getFaces({ shape: cube });
        const edges = [allEdges[0], allEdges[1], allEdges[2]];
        const faces = [allFaces[0], allFaces[0], allFaces[0]];
        const chamferRes = fillets.chamferEdgesDistAngle({ shape: cube, edges, faces, distance: 0.2, angle: 70 });
        const facesRes = occHelper.shapeGettersService.getFaces({ shape: chamferRes });
        const volume = solid.getSolidVolume({ shape: chamferRes });
        expect(volume).toBeCloseTo(7.684955922569202);
        expect(facesRes.length).toBe(9);
        cube.delete();
        chamferRes.delete();
        allFaces.forEach(f => f.delete());
        allEdges.forEach(e => e.delete());
        facesRes.forEach(f => f.delete());
    });

    it("should chamfer specific edges with specific distances and angles", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const allEdges = occHelper.shapeGettersService.getEdges({ shape: cube });
        const allFaces = occHelper.shapeGettersService.getFaces({ shape: cube });
        const edges = [allEdges[0], allEdges[1], allEdges[2]];
        const faces = [allFaces[0], allFaces[0], allFaces[0]];
        const chamferRes = fillets.chamferEdgesDistsAngles({ shape: cube, edges, faces, distances: [0.2, 0.1, 0.5], angles: [70, 45, 30] });
        const facesRes = occHelper.shapeGettersService.getFaces({ shape: chamferRes });
        const volume = solid.getSolidVolume({ shape: chamferRes });
        expect(volume).toBeCloseTo(7.738913999084103);
        expect(facesRes.length).toBe(9);
        cube.delete();
        chamferRes.delete();
        allFaces.forEach(f => f.delete());
        allEdges.forEach(e => e.delete());
        facesRes.forEach(f => f.delete());
    });

    it("should chamfer specific edges with two distances", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const allEdges = occHelper.shapeGettersService.getEdges({ shape: cube });
        const allFaces = occHelper.shapeGettersService.getFaces({ shape: cube });
        const edges = [allEdges[0], allEdges[1], allEdges[2]];
        const faces = [allFaces[0], allFaces[0], allFaces[0]];
        const chamferRes = fillets.chamferEdgesTwoDistances({ shape: cube, edges, faces, distance1: 0.2, distance2: 0.5 });
        const facesRes = occHelper.shapeGettersService.getFaces({ shape: chamferRes });
        const volume = solid.getSolidVolume({ shape: chamferRes });
        expect(volume).toBeCloseTo(7.713333333333332);
        expect(facesRes.length).toBe(9);
        cube.delete();
        chamferRes.delete();
        allFaces.forEach(f => f.delete());
        allEdges.forEach(e => e.delete());
        facesRes.forEach(f => f.delete());
    });

    it("should chamfer specific edges with specific two distances", () => {
        const cube = solid.createCube({ size: 2, center: [0, 0, 0] });
        const allEdges = occHelper.shapeGettersService.getEdges({ shape: cube });
        const allFaces = occHelper.shapeGettersService.getFaces({ shape: cube });
        const edges = [allEdges[0], allEdges[1], allEdges[2]];
        const faces = [allFaces[0], allFaces[0], allFaces[0]];
        const chamferRes = fillets.chamferEdgesTwoDistancesLists({ shape: cube, edges, faces, distances1: [0.2, 0.3, 0.4], distances2: [0.5, 0.3, 0.6] });
        const facesRes = occHelper.shapeGettersService.getFaces({ shape: chamferRes });
        const volume = solid.getSolidVolume({ shape: chamferRes });
        expect(volume).toBeCloseTo(7.5922);
        expect(facesRes.length).toBe(9);
        cube.delete();
        chamferRes.delete();
        allFaces.forEach(f => f.delete());
        allEdges.forEach(e => e.delete());
        facesRes.forEach(f => f.delete());
    });

    it("should fillet two edges into a wire", () => {
        const edge1 = edge.line({ start: [0, 0, 0], end: [1, 0, 0] });
        const edge2 = edge.line({ start: [1, 0, 0], end: [1, 1, 0] });
        const filletRes = fillets.filletTwoEdgesInPlaneIntoAWire({ edge1, edge2, radius: 0.2, planeDirection: [0, 0, 1], planeOrigin: [0, 0, 0] });
        const wireLength = occHelper.wiresService.getWireLength({ shape: filletRes });
        expect(wireLength).toBeCloseTo(1.3424777993634651);
    });
});
