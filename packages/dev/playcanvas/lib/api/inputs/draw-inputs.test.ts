import { Draw } from "./draw-inputs";

describe("Draw inputs unit tests", () => {

    describe("DrawAny constructor", () => {

        it("should create DrawAny with default values when no arguments provided", () => {
            const drawAny = new Draw.DrawAny();
            expect(drawAny.entity).toBeUndefined();
            expect(drawAny.options).toBeUndefined();
            expect(drawAny.group).toBeUndefined();
        });

        it("should create DrawAny with entity when entity is provided", () => {
            const point: [number, number, number] = [1, 2, 3];
            const drawAny = new Draw.DrawAny(point);
            expect(drawAny.entity).toEqual([1, 2, 3]);
            expect(drawAny.options).toBeUndefined();
        });

        it("should create DrawAny with entity and options when both are provided", () => {
            const point: [number, number, number] = [1, 2, 3];
            const options = new Draw.DrawBasicGeometryOptions();
            const drawAny = new Draw.DrawAny(point, options);
            expect(drawAny.entity).toEqual([1, 2, 3]);
            expect(drawAny.options).toBe(options);
        });

        it("should create DrawAny with line entity", () => {
            const line = { start: [0, 0, 0] as [number, number, number], end: [1, 1, 1] as [number, number, number] };
            const drawAny = new Draw.DrawAny(line);
            expect(drawAny.entity).toEqual(line);
        });

        it("should create DrawAny with polyline entity", () => {
            const polyline = { points: [[0, 0, 0], [1, 0, 0], [1, 1, 0]] as [number, number, number][] };
            const drawAny = new Draw.DrawAny(polyline);
            expect(drawAny.entity).toEqual(polyline);
        });

        it("should create DrawAny with array of points", () => {
            const points: [number, number, number][] = [[0, 0, 0], [1, 1, 1], [2, 2, 2]];
            const drawAny = new Draw.DrawAny(points);
            expect(drawAny.entity).toEqual(points);
        });

        it("should create DrawAny with OCCT options", () => {
            const point: [number, number, number] = [1, 2, 3];
            const options = new Draw.DrawOcctShapeOptions();
            const drawAny = new Draw.DrawAny(point, options);
            expect(drawAny.options).toBeInstanceOf(Draw.DrawOcctShapeOptions);
        });

        it("should create DrawAny with Manifold options", () => {
            const point: [number, number, number] = [1, 2, 3];
            const options = new Draw.DrawManifoldOrCrossSectionOptions();
            const drawAny = new Draw.DrawAny(point, options);
            expect(drawAny.options).toBeInstanceOf(Draw.DrawManifoldOrCrossSectionOptions);
        });
    });

    describe("DrawBasicGeometryOptions constructor", () => {

        it("should create options with all default values when no arguments provided", () => {
            const options = new Draw.DrawBasicGeometryOptions();
            expect(options.colours).toBe("#ff0000");
            expect(options.size).toBe(0.1);
            expect(options.opacity).toBe(1);
            expect(options.updatable).toBe(false);
            expect(options.hidden).toBe(false);
        });

        it("should create options with custom colours when provided", () => {
            const options = new Draw.DrawBasicGeometryOptions("#00ff00");
            expect(options.colours).toBe("#00ff00");
            expect(options.size).toBe(0.1);
            expect(options.opacity).toBe(1);
            expect(options.updatable).toBe(false);
            expect(options.hidden).toBe(false);
        });

        it("should create options with array of colours when provided", () => {
            const colours = ["#ff0000", "#00ff00", "#0000ff"];
            const options = new Draw.DrawBasicGeometryOptions(colours);
            expect(options.colours).toEqual(colours);
        });

        it("should create options with custom size when provided", () => {
            const options = new Draw.DrawBasicGeometryOptions(undefined, 0.5);
            expect(options.colours).toBe("#ff0000");
            expect(options.size).toBe(0.5);
        });

        it("should create options with custom opacity when provided", () => {
            const options = new Draw.DrawBasicGeometryOptions(undefined, undefined, 0.5);
            expect(options.colours).toBe("#ff0000");
            expect(options.size).toBe(0.1);
            expect(options.opacity).toBe(0.5);
        });

        it("should create options with updatable true when provided", () => {
            const options = new Draw.DrawBasicGeometryOptions(undefined, undefined, undefined, true);
            expect(options.updatable).toBe(true);
        });

        it("should create options with hidden true when provided", () => {
            const options = new Draw.DrawBasicGeometryOptions(undefined, undefined, undefined, undefined, true);
            expect(options.hidden).toBe(true);
        });

        it("should create options with all custom values", () => {
            const options = new Draw.DrawBasicGeometryOptions("#00ff00", 0.5, 0.8, true, true);
            expect(options.colours).toBe("#00ff00");
            expect(options.size).toBe(0.5);
            expect(options.opacity).toBe(0.8);
            expect(options.updatable).toBe(true);
            expect(options.hidden).toBe(true);
        });

        it("should create options with zero opacity", () => {
            const options = new Draw.DrawBasicGeometryOptions(undefined, undefined, 0);
            expect(options.opacity).toBe(0);
        });

        it("should create options with zero size", () => {
            const options = new Draw.DrawBasicGeometryOptions(undefined, 0);
            expect(options.size).toBe(0);
        });
    });

    describe("DrawOcctShapeOptions constructor", () => {

        it("should create options with all default values when no arguments provided", () => {
            const options = new Draw.DrawOcctShapeOptions();
            expect(options.faceOpacity).toBe(1);
            expect(options.edgeOpacity).toBe(1);
            expect(options.edgeColour).toBe("#ffffff");
            expect(options.faceColour).toBe("#ff0000");
            expect(options.vertexColour).toBe("#ffaaff");
            expect(options.faceMaterial).toBeUndefined();
            expect(options.edgeWidth).toBe(2);
            expect(options.vertexSize).toBe(0.03);
            expect(options.drawEdges).toBe(true);
            expect(options.drawFaces).toBe(true);
            expect(options.drawVertices).toBe(false);
            expect(options.precision).toBe(0.01);
            expect(options.drawEdgeIndexes).toBe(false);
            expect(options.edgeIndexHeight).toBe(0.06);
            expect(options.edgeIndexColour).toBe("#ff00ff");
            expect(options.drawFaceIndexes).toBe(false);
            expect(options.faceIndexHeight).toBe(0.06);
            expect(options.faceIndexColour).toBe("#0000ff");
        });

        it("should create options with custom faceOpacity when provided", () => {
            const options = new Draw.DrawOcctShapeOptions(0.5);
            expect(options.faceOpacity).toBe(0.5);
            expect(options.edgeOpacity).toBe(1);
        });

        it("should create options with custom edgeOpacity when provided", () => {
            const options = new Draw.DrawOcctShapeOptions(undefined, 0.7);
            expect(options.faceOpacity).toBe(1);
            expect(options.edgeOpacity).toBe(0.7);
        });

        it("should create options with custom edgeColour when provided", () => {
            const options = new Draw.DrawOcctShapeOptions(undefined, undefined, "#00ff00");
            expect(options.edgeColour).toBe("#00ff00");
        });

        it("should create options with custom faceMaterial when provided", () => {
            const material = { type: "custom" } as any;
            const options = new Draw.DrawOcctShapeOptions(undefined, undefined, undefined, material);
            expect(options.faceMaterial).toBe(material);
        });

        it("should create options with custom faceColour when provided", () => {
            const options = new Draw.DrawOcctShapeOptions(undefined, undefined, undefined, undefined, "#0000ff");
            expect(options.faceColour).toBe("#0000ff");
        });

        it("should create options with custom edgeWidth when provided", () => {
            const options = new Draw.DrawOcctShapeOptions(undefined, undefined, undefined, undefined, undefined, 5);
            expect(options.edgeWidth).toBe(5);
        });

        it("should create options with drawEdges false when provided", () => {
            const options = new Draw.DrawOcctShapeOptions(undefined, undefined, undefined, undefined, undefined, undefined, false);
            expect(options.drawEdges).toBe(false);
        });

        it("should create options with drawFaces false when provided", () => {
            const options = new Draw.DrawOcctShapeOptions(undefined, undefined, undefined, undefined, undefined, undefined, undefined, false);
            expect(options.drawFaces).toBe(false);
        });

        it("should create options with drawVertices true when provided", () => {
            const options = new Draw.DrawOcctShapeOptions(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true);
            expect(options.drawVertices).toBe(true);
        });

        it("should create options with custom vertexColour when provided", () => {
            const options = new Draw.DrawOcctShapeOptions(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, "#123456");
            expect(options.vertexColour).toBe("#123456");
        });

        it("should create options with custom vertexSize when provided", () => {
            const options = new Draw.DrawOcctShapeOptions(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 0.1);
            expect(options.vertexSize).toBe(0.1);
        });

        it("should create options with custom precision when provided", () => {
            const options = new Draw.DrawOcctShapeOptions(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 0.001);
            expect(options.precision).toBe(0.001);
        });

        it("should create options with drawEdgeIndexes true when provided", () => {
            const options = new Draw.DrawOcctShapeOptions(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true);
            expect(options.drawEdgeIndexes).toBe(true);
        });

        it("should create options with custom edgeIndexHeight when provided", () => {
            const options = new Draw.DrawOcctShapeOptions(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 0.1);
            expect(options.edgeIndexHeight).toBe(0.1);
        });

        it("should create options with custom edgeIndexColour when provided", () => {
            const options = new Draw.DrawOcctShapeOptions(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, "#abcdef");
            expect(options.edgeIndexColour).toBe("#abcdef");
        });

        it("should create options with drawFaceIndexes true when provided", () => {
            const options = new Draw.DrawOcctShapeOptions(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true);
            expect(options.drawFaceIndexes).toBe(true);
        });

        it("should create options with custom faceIndexHeight when provided", () => {
            const options = new Draw.DrawOcctShapeOptions(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 0.12);
            expect(options.faceIndexHeight).toBe(0.12);
        });

        it("should create options with custom faceIndexColour when provided", () => {
            const options = new Draw.DrawOcctShapeOptions(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, "#fedcba");
            expect(options.faceIndexColour).toBe("#fedcba");
        });

        it("should create options with multiple custom values", () => {
            const options = new Draw.DrawOcctShapeOptions(0.8, 0.9, "#111111", undefined, "#222222", 3, false, true, true, "#333333", 0.05, 0.02);
            expect(options.faceOpacity).toBe(0.8);
            expect(options.edgeOpacity).toBe(0.9);
            expect(options.edgeColour).toBe("#111111");
            expect(options.faceColour).toBe("#222222");
            expect(options.edgeWidth).toBe(3);
            expect(options.drawEdges).toBe(false);
            expect(options.drawFaces).toBe(true);
            expect(options.drawVertices).toBe(true);
            expect(options.vertexColour).toBe("#333333");
            expect(options.vertexSize).toBe(0.05);
            expect(options.precision).toBe(0.02);
        });

        it("should create options with zero faceOpacity", () => {
            const options = new Draw.DrawOcctShapeOptions(0);
            expect(options.faceOpacity).toBe(0);
        });

        it("should create options with zero edgeWidth", () => {
            const options = new Draw.DrawOcctShapeOptions(undefined, undefined, undefined, undefined, undefined, 0);
            expect(options.edgeWidth).toBe(0);
        });
    });

    describe("DrawManifoldOrCrossSectionOptions constructor", () => {

        it("should create options with all default values when no arguments provided", () => {
            const options = new Draw.DrawManifoldOrCrossSectionOptions();
            expect(options.faceOpacity).toBe(1);
            expect(options.faceColour).toBe("#ff0000");
            expect(options.faceMaterial).toBeUndefined();
            expect(options.crossSectionColour).toBe("#ff00ff");
            expect(options.crossSectionWidth).toBe(2);
            expect(options.crossSectionOpacity).toBeUndefined();
            expect(options.computeNormals).toBe(false);
        });

        it("should create options with custom faceOpacity when provided", () => {
            const options = new Draw.DrawManifoldOrCrossSectionOptions(0.5);
            expect(options.faceOpacity).toBe(0.5);
        });

        it("should create options with custom faceMaterial when provided", () => {
            const material = { type: "custom" } as any;
            const options = new Draw.DrawManifoldOrCrossSectionOptions(undefined, material);
            expect(options.faceMaterial).toBe(material);
        });

        it("should create options with custom faceColour when provided", () => {
            const options = new Draw.DrawManifoldOrCrossSectionOptions(undefined, undefined, "#00ff00");
            expect(options.faceColour).toBe("#00ff00");
        });

        it("should create options with custom crossSectionColour when provided", () => {
            const options = new Draw.DrawManifoldOrCrossSectionOptions(undefined, undefined, undefined, "#0000ff");
            expect(options.crossSectionColour).toBe("#0000ff");
        });

        it("should create options with custom crossSectionWidth when provided", () => {
            const options = new Draw.DrawManifoldOrCrossSectionOptions(undefined, undefined, undefined, undefined, 5);
            expect(options.crossSectionWidth).toBe(5);
        });

        it("should create options with custom crossSectionOpacity when provided", () => {
            const options = new Draw.DrawManifoldOrCrossSectionOptions(undefined, undefined, undefined, undefined, undefined, 0.7);
            expect(options.crossSectionOpacity).toBe(0.7);
        });

        it("should create options with computeNormals true when provided", () => {
            const options = new Draw.DrawManifoldOrCrossSectionOptions(undefined, undefined, undefined, undefined, undefined, undefined, true);
            expect(options.computeNormals).toBe(true);
        });

        it("should create options with multiple custom values", () => {
            const material = { type: "custom" } as any;
            const options = new Draw.DrawManifoldOrCrossSectionOptions(0.8, material, "#111111", "#222222", 4, 0.6, true);
            expect(options.faceOpacity).toBe(0.8);
            expect(options.faceMaterial).toBe(material);
            expect(options.faceColour).toBe("#111111");
            expect(options.crossSectionColour).toBe("#222222");
            expect(options.crossSectionWidth).toBe(4);
            expect(options.crossSectionOpacity).toBe(0.6);
            expect(options.computeNormals).toBe(true);
        });

        it("should create options with zero faceOpacity", () => {
            const options = new Draw.DrawManifoldOrCrossSectionOptions(0);
            expect(options.faceOpacity).toBe(0);
        });

        it("should create options with zero crossSectionWidth", () => {
            const options = new Draw.DrawManifoldOrCrossSectionOptions(undefined, undefined, undefined, undefined, 0);
            expect(options.crossSectionWidth).toBe(0);
        });

        it("should create options with zero crossSectionOpacity", () => {
            const options = new Draw.DrawManifoldOrCrossSectionOptions(undefined, undefined, undefined, undefined, undefined, 0);
            expect(options.crossSectionOpacity).toBe(0);
        });
    });

    describe("drawingTypes enum", () => {

        it("should have point type", () => {
            expect(Draw.drawingTypes.point).toBe(0);
        });

        it("should have points type", () => {
            expect(Draw.drawingTypes.points).toBe(1);
        });

        it("should have line type", () => {
            expect(Draw.drawingTypes.line).toBe(2);
        });

        it("should have lines type", () => {
            expect(Draw.drawingTypes.lines).toBe(3);
        });

        it("should have node type", () => {
            expect(Draw.drawingTypes.node).toBe(4);
        });

        it("should have nodes type", () => {
            expect(Draw.drawingTypes.nodes).toBe(5);
        });

        it("should have polyline type", () => {
            expect(Draw.drawingTypes.polyline).toBe(6);
        });

        it("should have polylines type", () => {
            expect(Draw.drawingTypes.polylines).toBe(7);
        });

        it("should have verbCurve type", () => {
            expect(Draw.drawingTypes.verbCurve).toBe(8);
        });

        it("should have verbCurves type", () => {
            expect(Draw.drawingTypes.verbCurves).toBe(9);
        });

        it("should have verbSurface type", () => {
            expect(Draw.drawingTypes.verbSurface).toBe(10);
        });

        it("should have verbSurfaces type", () => {
            expect(Draw.drawingTypes.verbSurfaces).toBe(11);
        });

        it("should have jscadMesh type", () => {
            expect(Draw.drawingTypes.jscadMesh).toBe(12);
        });

        it("should have jscadMeshes type", () => {
            expect(Draw.drawingTypes.jscadMeshes).toBe(13);
        });

        it("should have occt type", () => {
            expect(Draw.drawingTypes.occt).toBe(14);
        });

        it("should have occtShapes type", () => {
            expect(Draw.drawingTypes.occtShapes).toBe(15);
        });

        it("should have tag type", () => {
            expect(Draw.drawingTypes.tag).toBe(16);
        });

        it("should have tags type", () => {
            expect(Draw.drawingTypes.tags).toBe(17);
        });

        it("should allow reverse lookup by value", () => {
            expect(Draw.drawingTypes[0]).toBe("point");
            expect(Draw.drawingTypes[1]).toBe("points");
            expect(Draw.drawingTypes[14]).toBe("occt");
            expect(Draw.drawingTypes[17]).toBe("tags");
        });
    });
});
