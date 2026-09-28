import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { readKernelException } from "./kernel-exception";
import { InputError } from "@bitbybit-dev/base";
import { OccHelper } from "./occ-helper";
import { OCCTService } from "./occ-service";
import { VectorHelperService } from "./api/vector-helper.service";
import { ShapesHelperService } from "./api/shapes-helper.service";

describe("kernel functions given a null shape", () => {
    let occt: BitbybitOcctModule;

    beforeAll(async () => {
        occt = await createBitbybitOcct();
    });

    function messageOf(run: (kernel: BitbybitOcctModule) => unknown): string {
        try {
            run(occt);
        } catch (thrown) {
            const read = readKernelException(occt, thrown);
            return read instanceof Error ? read.message : String(read);
        }
        return "no exception";
    }

    function planarFace(kernel: BitbybitOcctModule): ReturnType<BitbybitOcctModule["CastToFace"]> {
        const box = new kernel.BRepPrimAPI_MakeBox(1, 1, 1).Shape();
        return kernel.CastToFace(kernel.FacesOf(box, true)[0]!);
    }

    it.each([
        ["TopoDS_Shape.ShapeType", (k: BitbybitOcctModule): unknown => new k.TopoDS_Shape().ShapeType(), "TopoDS_Shape.ShapeType: the shape is null"],
        ["TopoDS_Shape.Closed", (k: BitbybitOcctModule): unknown => new k.TopoDS_Shape().Closed(), "TopoDS_Shape.Closed: the shape is null"],
        ["BRep_Tool_Surface", (k: BitbybitOcctModule): unknown => k.BRep_Tool_Surface(new k.TopoDS_Face()), "BRep_Tool_Surface: the face is null"],
        ["BRep_Tool_Pnt", (k: BitbybitOcctModule): unknown => k.BRep_Tool_Pnt(new k.TopoDS_Vertex()), "BRep_Tool_Pnt: the vertex is null"],
        ["BRep_Tool_Tolerance_Edge", (k: BitbybitOcctModule): unknown => k.BRep_Tool_Tolerance_Edge(new k.TopoDS_Edge()), "BRep_Tool_Tolerance_Edge: the edge is null"],
        ["BRep_Tool_IsClosed", (k: BitbybitOcctModule): unknown => k.BRep_Tool_IsClosed(new k.TopoDS_Shape()), "BRep_Tool_IsClosed: the shape is null"],
        ["RebuildEdgeDegree", (k: BitbybitOcctModule): unknown => k.RebuildEdgeDegree(new k.TopoDS_Edge(), 3, 1e-5), "RebuildEdgeDegree: the edge is null"],
        ["FaceWithHoles", (k: BitbybitOcctModule): unknown => k.FaceWithHoles(planarFace(k), [new k.TopoDS_Wire()]), "FaceWithHoles: a hole wire is null"],
        ["GetFaceTriangulation", (k: BitbybitOcctModule): unknown => k.GetFaceTriangulation(new k.TopoDS_Face()), "GetFaceTriangulation: the face is null"],
        ["GetFaceSurfaceType", (k: BitbybitOcctModule): unknown => k.GetFaceSurfaceType(new k.TopoDS_Face()), "GetFaceSurfaceType: the face is null"],
        ["ShapeFix_Shape_Perform", (k: BitbybitOcctModule): unknown => k.ShapeFix_Shape_Perform(new k.TopoDS_Shape()), "ShapeFix_Shape_Perform: the shape is null"],
        ["ClassifyPointOnFace2d", (k: BitbybitOcctModule): unknown => k.ClassifyPointOnFace2d(new k.TopoDS_Face(), new k.gp_Pnt2d(0, 0), 1e-7), "ClassifyPointOnFace2d: the face is null"],
        ["CreateFillet2d", (k: BitbybitOcctModule): unknown => k.CreateFillet2d(new k.TopoDS_Edge(), new k.TopoDS_Edge(), 1), "CreateFillet2d: the first edge is null"],
        ["ProjectWireOnShape", (k: BitbybitOcctModule): unknown => k.ProjectWireOnShape(new k.TopoDS_Wire(), planarFace(k), new k.gp_Dir(0, 0, 1)), "ProjectWireOnShape: the wire is null"],
        ["BRep_Builder.Add", (k: BitbybitOcctModule): unknown => new k.BRep_Builder().Add(new k.TopoDS_Shape(), planarFace(k)), "BRep_Builder.Add: the shape is null"],
        ["BRepBuilderAPI_MakeWire from an edge", (k: BitbybitOcctModule): unknown => new k.BRepBuilderAPI_MakeWire(new k.TopoDS_Edge()), "BRepBuilderAPI_MakeWire: the edge is null"],
        ["BRepBuilderAPI_MakeWire.AddEdge", (k: BitbybitOcctModule): unknown => new k.BRepBuilderAPI_MakeWire().AddEdge(new k.TopoDS_Edge()), "BRepBuilderAPI_MakeWire.AddEdge: the edge is null"],
        ["BRepBuilderAPI_MakeFace from a face and a wire", (k: BitbybitOcctModule): unknown => new k.BRepBuilderAPI_MakeFace(new k.TopoDS_Face(), new k.TopoDS_Wire()), "BRepBuilderAPI_MakeFace: the face is null"],
        ["BRepBuilderAPI_MakeSolid from a shell", (k: BitbybitOcctModule): unknown => new k.BRepBuilderAPI_MakeSolid(new k.TopoDS_Shell()), "BRepBuilderAPI_MakeSolid: the shell is null"],
        ["BRepAdaptor_Curve from an edge", (k: BitbybitOcctModule): unknown => new k.BRepAdaptor_Curve(new k.TopoDS_Edge()), "BRepAdaptor_Curve: the edge is null"],
        ["BRepProj_Projection", (k: BitbybitOcctModule): unknown => new k.BRepProj_Projection(new k.TopoDS_Wire(), planarFace(k), new k.gp_Dir(0, 0, 1)), "BRepProj_Projection: the wire is null"],
        ["BRepAdaptor_CompCurve from a wire", (k: BitbybitOcctModule): unknown => new k.BRepAdaptor_CompCurve(new k.TopoDS_Wire(), false), "BRepAdaptor_CompCurve: the wire is null"],
        ["ShapeFix_Shape from a shape", (k: BitbybitOcctModule): unknown => new k.ShapeFix_Shape(new k.TopoDS_Shape()), "ShapeFix_Shape: the shape is null"],
        ["ShapeFix_Shape.Init", (k: BitbybitOcctModule): unknown => new k.ShapeFix_Shape().Init(new k.TopoDS_Shape()), "ShapeFix_Shape.Init: the shape is null"],
        ["BRepOffsetAPI_MakeOffset from a face", (k: BitbybitOcctModule): unknown => new k.BRepOffsetAPI_MakeOffset(new k.TopoDS_Face()), "BRepOffsetAPI_MakeOffset: the face is null"],
        ["BRepOffsetAPI_ThruSections.AddWire", (k: BitbybitOcctModule): unknown => new k.BRepOffsetAPI_ThruSections(false).AddWire(new k.TopoDS_Wire()), "BRepOffsetAPI_ThruSections.AddWire: the wire is null"],
        ["BRepFill_Filling_AddEdge", (k: BitbybitOcctModule): unknown => k.BRepFill_Filling_AddEdge(new k.BRepFill_Filling(), new k.TopoDS_Edge(), 0, true), "BRepFill_Filling_AddEdge: the edge is null"],
        ["SelectFacesOfType", (k: BitbybitOcctModule): unknown => k.SelectFacesOfType(new k.TopoDS_Shape(), [], [0]), "SelectFacesOfType: the shape is null"],
        ["SelectFacesAdjacentTo", (k: BitbybitOcctModule): unknown => k.SelectFacesAdjacentTo(new k.TopoDS_Shape(), [0]), "SelectFacesAdjacentTo: the shape is null"],
        ["SelectEdgesConvex", (k: BitbybitOcctModule): unknown => k.SelectEdgesConvex(new k.TopoDS_Shape(), [], 0), "SelectEdgesConvex: the shape is null"],
        ["SelectEdgesGroupedAlong", (k: BitbybitOcctModule): unknown => k.SelectEdgesGroupedAlong(new k.TopoDS_Shape(), [], [0, 0, 1], 0.1), "SelectEdgesGroupedAlong: the shape is null"],
        ["FramesOnFace", (k: BitbybitOcctModule): unknown => k.FramesOnFace(new k.TopoDS_Face(), [0.5, 0.5]), "FramesOnFace: the face is null"],
        ["FramesOnFaceNearest", (k: BitbybitOcctModule): unknown => k.FramesOnFaceNearest(new k.TopoDS_Face(), [0, 0, 0]), "FramesOnFaceNearest: the face is null"],
        ["FramesOnCurve", (k: BitbybitOcctModule): unknown => k.FramesOnCurve(new k.TopoDS_Shape(), [0.5], false, k.BitbybitFrame_CurveFrame.Frenet, [0, 0, 1]), "FramesOnCurve: the shape is null"],
        ["PrincipalFrame", (k: BitbybitOcctModule): unknown => k.PrincipalFrame(new k.TopoDS_Shape()), "PrincipalFrame: the shape is null"],
        ["OrientedBoundingBox", (k: BitbybitOcctModule): unknown => k.OrientedBoundingBox(new k.TopoDS_Shape()), "OrientedBoundingBox: the shape is null"],
        ["OrientShape", (k: BitbybitOcctModule): unknown => k.OrientShape(new k.TopoDS_Shape(), [0, 0, 0, 0, 0, 1, 1, 0, 0], [0, 0, 0, 0, 0, 1, 1, 0, 0]), "OrientShape: the shape is null"],
        ["PlaceOnFrames", (k: BitbybitOcctModule): unknown => k.PlaceOnFrames(new k.TopoDS_Shape(), [0, 0, 0, 0, 0, 1, 1, 0, 0], []), "PlaceOnFrames: the shape is null"],
        ["PlaceByMatrices", (k: BitbybitOcctModule): unknown => k.PlaceByMatrices(new k.TopoDS_Shape(), []), "PlaceByMatrices: the shape is null"],
    ])("%s names the null shape instead of crashing", (_name, run, message) => {
        // Act
        const read = messageOf(run);

        // Assert
        expect(read).toBe(`Standard_NullObject: ${message}`);
    });

    it("keeps working after refusing a null shape", () => {
        // Arrange
        messageOf(k => k.BRep_Tool_Surface(new k.TopoDS_Face()));

        // Act
        const face = planarFace(occt);

        // Assert
        expect(occt.GetFaceSurfaceType(face)).toBe("plane");
    });

    it("measures an empty wire as having no length, and gives no point or derivatives on it", () => {
        // Arrange
        const empty = new occt.BRep_Builder().MakeWire();

        // Act
        const length = occt.GetWireLength(empty);
        const point = occt.EvaluateWireAtParam(empty, 0.5);
        const derivatives = occt.GetDerivativesOnWireAtParam(empty, 0.5);

        // Assert
        expect(length).toBe(0);
        expect(point.IsValid).toBe(false);
        expect(derivatives.isValid).toBe(false);
        point.delete();
        empty.delete();
    });

    it("refuses to walk a wire with no edges", () => {
        // Arrange
        const empty = new occt.BRep_Builder().MakeWire();

        // Act
        const read = messageOf(k => new k.BRepAdaptor_CompCurve(empty, false));

        // Assert
        expect(read).toBe("Standard_ConstructionError: BRepAdaptor_CompCurve: the wire has no edge with a curve");
        empty.delete();
    });

    it("gives no derivatives on a null edge", () => {
        // Act
        const derivatives = occt.GetDerivativesOnEdgeAtParam(new occt.TopoDS_Edge(), 0.5);

        // Assert
        expect(derivatives.isValid).toBe(false);
    });

    it("gives a null shape a boolean skips an empty history, and the others theirs", () => {
        // Arrange
        const box = new occt.BRepPrimAPI_MakeBox(10, 10, 10).Shape();
        const drill = new occt.BRepPrimAPI_MakeCylinder(2, 12).Shape();

        // Act
        const result = occt.BooleanCutWithHistory([box], [new occt.TopoDS_Shape(), drill], true, 0, occt.BitbybitBool_Strategy.OneAfterAnother);

        // Assert
        expect(result.shape).not.toBeNull();
        expect(result.histories).toHaveLength(3);
        expect(result.histories[1]!.faces).toHaveLength(0);
        expect(result.histories[2]!.faces.length).toBeGreaterThan(0);
    });

    it("names the history maker that was given a null input", () => {
        // Arrange
        const box = new occt.BRepPrimAPI_MakeBox(10, 10, 10).Shape();
        const fillet = new occt.BRepFilletAPI_MakeFillet(box, occt.ChFi3d_FilletShape.Rational);

        // Act
        const read = messageOf(k => k.HistoryOfFillet(fillet, new k.TopoDS_Shape(), box));

        // Assert
        expect(read).toBe("Standard_NullObject: HistoryOfFillet: the input is null");
    });
});

describe("operations given a list that holds an empty shape", () => {
    let kernel: BitbybitOcctModule;
    let service: OCCTService;

    beforeAll(async () => {
        kernel = await createBitbybitOcct();
        service = new OCCTService(kernel, new OccHelper(new VectorHelperService(), new ShapesHelperService(), kernel));
    });

    const valid = (kind: string): unknown => {
        switch (kind) {
            case "edge": return service.shapes.edge.line({ start: [0, 0, 0], end: [1, 0, 0] });
            case "wire": return service.shapes.wire.createCircleWire({ radius: 1, center: [0, 0, 0], direction: [0, 0, 1] });
            case "face": return service.shapes.face.createSquareFace({ size: 1, center: [0, 0, 0], direction: [0, 0, 1] });
            case "vertex": return service.shapes.vertex.vertexFromXYZ({ x: 0, y: 0, z: 0 });
            default: return service.shapes.solid.createBox({ width: 1, length: 1, height: 1, center: [0, 0, 0], originOnCenter: true });
        }
    };

    const call = (path: string, inputs: object): unknown => {
        const segments = path.split(".");
        const owner = segments.slice(0, -1).reduce<unknown>((target, segment) => (target as Record<string, unknown>)[segment], service);
        return ((owner as Record<string, unknown>)[segments.at(-1)!] as (input: object) => unknown).call(owner, inputs);
    };

    it.each([
            ["shapes.wire.combineEdgesAndWiresIntoAWire", "edge"],
            ["shapes.compound.makeCompound", "solid"],
            ["shapes.face.getFacesAreas", "face"],
            ["shapes.face.getFacesCentersOfMass", "face"],
            ["shapes.face.createFaceFromWires", "wire"],
            ["shapes.face.createFacesFromWires", "wire"],
            ["shapes.face.filterFacesPoints", "face"],
            ["shapes.solid.getSolidsVolumes", "solid"],
            ["shapes.solid.getSolidsCentersOfMass", "solid"],
            ["shapes.edge.getEdgesLengths", "edge"],
            ["shapes.edge.getEdgesCentersOfMass", "edge"],
            ["shapes.edge.pointsOnEdgesAtParam", "edge"],
            ["shapes.edge.tangentsOnEdgesAtParam", "edge"],
            ["shapes.edge.pointsOnEdgesAtLength", "edge"],
            ["shapes.edge.tangentsOnEdgesAtLength", "edge"],
            ["shapes.edge.startPointsOnEdges", "edge"],
            ["shapes.edge.endPointsOnEdges", "edge"],
            ["shapes.edge.divideEdgesByParamsToPoints", "edge"],
            ["shapes.edge.divideEdgesByEqualDistanceToPoints", "edge"],
            ["shapes.wire.getWiresLengths", "wire"],
            ["shapes.wire.getWiresCentersOfMass", "wire"],
            ["shapes.wire.divideWiresByParamsToPoints", "wire"],
            ["shapes.wire.divideWiresByEqualDistanceToPoints", "wire"],
            ["shapes.wire.createWiresBetweenStartEndPointsOfWiresAndEdges", "edge"],
            ["shapes.wire.createWiresBetweenSubdividedPointsOfWiresAndEdges", "edge"],
            ["shapes.wire.addEdgesAndWiresToWire", "edge"],
            ["shapes.shell.sewFaces", "face"],
            ["shapes.vertex.verticesToPoints", "vertex"],
            ["booleans.meshMeshIntersectionOfShapesWires", "solid"],
            ["booleans.meshMeshIntersectionOfShapesPoints", "solid"],
            ["booleans.union", "solid"],
            ["booleans.difference", "solid"],
            ["booleans.intersection", "solid"],
            ["operations.loft", "wire"],
            ["operations.loftAdvanced", "wire"],
            ["operations.closestPointsOnShapesFromPoints", "solid"],
            ["operations.extrudeShapes", "face"],
            ["operations.splitShapeWithShapes", "face"],
            ["operations.pipe", "wire"],
            ["operations.pipeWiresCylindrical", "wire"],
            ["operations.makeThickSolidByJoin", "face"],
            ["fillets.fillet3DWires", "wire"],
            ["fillets.fillet2dShapes", "wire"],
            ["transforms.transformShapes", "solid"],
            ["transforms.transformShapesByMatrix", "solid"],
            ["transforms.rotateShapes", "solid"],
            ["transforms.rotateAroundCenterShapes", "solid"],
            ["transforms.alignShapes", "solid"],
            ["transforms.alignAndTranslateShapes", "solid"],
            ["transforms.translateShapes", "solid"],
            ["transforms.scaleShapes", "solid"],
            ["transforms.scale3dShapes", "solid"],
            ["transforms.mirrorShapes", "solid"],
            ["transforms.mirrorAlongNormalShapes", "solid"],
    ])("%s refuses it as an input error naming its position", (path, kind) => {
        // Arrange
        const shapes = [valid(kind), new kernel.TopoDS_Shape()];

        // Act
        let thrown: unknown;
        try {
            call(path, { shape: valid(kind), shapes });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toBeInstanceOf(InputError);
        expect(thrown).toMatchObject({ property: "shapes", message: "`shapes` holds a missing or empty shape at position 1, as an operation that failed can leave it." });
    });

    it("refuses shapes that are not a list", () => {
        // Act
        let thrown: unknown;
        try {
            service.shapes.compound.makeCompound({ shapes: valid("solid") as [] });
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toMatchObject({ name: "InputError", property: "shapes", message: "`shapes` is not a list of shapes." });
    });

    it.each([
        ["getEdges", (): unknown => service.shapes.edge.getEdges({ shape: new kernel.TopoDS_Shape() })],
        ["getEdge", (): unknown => service.shapes.edge.getEdge({ shape: new kernel.TopoDS_Shape(), index: 0 })],
        ["getWire", (): unknown => service.shapes.wire.getWire({ shape: new kernel.TopoDS_Shape(), index: 0 })],
        ["getFace", (): unknown => service.shapes.face.getFace({ shape: new kernel.TopoDS_Shape(), index: 0 })],
        ["getVertices", (): unknown => service.shapes.vertex.getVertices({ shape: new kernel.TopoDS_Shape() })],
        ["getEdgesAlongWire", (): unknown => service.shapes.edge.getEdgesAlongWire({ shape: new kernel.TopoDS_Shape() })],
    ])("%s refuses an empty shape as an input error", (_name, run) => {
        // Act
        let thrown: unknown;
        try {
            run();
        } catch (error) {
            thrown = error;
        }

        // Assert
        expect(thrown).toMatchObject({ name: "InputError", property: "shape", message: "`shape` is missing or empty, as an operation that failed can leave it." });
    });

    it("takes the edge itself from an edge, as getEdges does", () => {
        // Arrange
        const edge = service.shapes.edge.line({ start: [0, 0, 0], end: [1, 0, 0] });

        // Act
        const taken = service.shapes.edge.getEdge({ shape: edge, index: 0 });

        // Assert
        expect(taken.IsSame(edge)).toBe(true);
        expect(service.shapes.edge.getEdges({ shape: edge })).toHaveLength(1);
    });
});
