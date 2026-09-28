import { describe, it, expect, beforeAll } from "vitest";
import createBitbybitOcct, { BitbybitOcctModule } from "../bitbybit-dev-occt/bitbybit-dev-occt";
import { readKernelException } from "./kernel-exception";

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
});
