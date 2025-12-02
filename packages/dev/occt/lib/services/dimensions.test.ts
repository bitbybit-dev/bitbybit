import initOpenCascade, { OpenCascadeInstance } from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../api/inputs/inputs";
import { ShapesHelperService } from "../api/shapes-helper.service";
import { VectorHelperService } from "../api/vector-helper.service";
import { OccHelper } from "../occ-helper";
import { OCCTCompound, OCCTVertex } from "./shapes";

/**
 * Comprehensive unit tests for the dimensions service.
 * 
 * These tests verify:
 * - Creation of linear, angular, and pin dimensions
 * - Arrow rendering (normal and flipped)
 * - Label transformations (rotation, flipping, offset)
 * - Label expression evaluation (mathematical and template strings)
 * - Edge cases (very small/large dimensions, extreme arrow angles)
 * 
 * Tests use vertex coordinate validation to ensure geometric accuracy.
 */
describe("OCCT dimensions unit tests", () => {
    let occt: OpenCascadeInstance;
    let occHelper: OccHelper;
    let compound: OCCTCompound;
    let vertex: OCCTVertex;

    beforeAll(async () => {
        occt = await initOpenCascade();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        occHelper = new OccHelper(vec, s, occt);
        compound = new OCCTCompound(occt, occHelper);
        vertex = new OCCTVertex(occt, occHelper);
    });

    describe("simpleLinearLengthDimension", () => {
        it("should create a basic linear dimension between two points", () => {
            const inputs = new Inputs.OCCT.SimpleLinearLengthDimensionDto();
            inputs.start = [0, 0, 0];
            inputs.end = [10, 0, 0];
            inputs.direction = [0, 2, 0];
            inputs.labelSuffix = "mm";

            const result = occHelper.dimensionsService.simpleLinearLengthDimension(inputs);

            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);

            // Verify the compound contains shapes
            const shapes = compound.getShapesOfCompound({ shape: result });
            expect(shapes.length).toBeGreaterThan(0);

            // Extract and verify vertices
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });
            expect(vertices.length).toBeGreaterThan(0);

            const vertexPoints = vertices.map(v => vertex.vertexToPoint({ shape: v }));

            // Check dimension line endpoints and extension lines
            // Should include original start/end and their extensions with crossing size
            const originalStart = [0, 0, 0];
            const originalEnd = [10, 0, 0];

            const hasOriginalStart = vertexPoints.some(p =>
                Math.abs(p[0] - originalStart[0]) < 0.01 &&
                Math.abs(p[1] - originalStart[1]) < 0.01 &&
                Math.abs(p[2] - originalStart[2]) < 0.01
            );
            const hasOriginalEnd = vertexPoints.some(p =>
                Math.abs(p[0] - originalEnd[0]) < 0.01 &&
                Math.abs(p[1] - originalEnd[1]) < 0.01 &&
                Math.abs(p[2] - originalEnd[2]) < 0.01
            );

            expect(hasOriginalStart).toBe(true);
            expect(hasOriginalEnd).toBe(true);
        });

        it("should create dimension with custom label overwrite (mathematical expression)", () => {
            const inputs = new Inputs.OCCT.SimpleLinearLengthDimensionDto();
            inputs.start = [0, 0, 0];
            inputs.end = [5, 0, 0];
            inputs.direction = [0, 1, 0];
            inputs.labelOverwrite = "val*10";
            inputs.decimalPlaces = 2;
            inputs.labelSuffix = "mm";

            const result = occHelper.dimensionsService.simpleLinearLengthDimension(inputs);
            const vertexPoints = occHelper.shapeGettersService.getVertices({ shape: result });

            // These tests are not great, but they fixate on verifying the dimension was created and has expected complexity
            // it will break if something changes unexpectedly.
            expect(vertexPoints.length).toEqual(194);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create dimension with custom label overwrite (template string)", () => {
            const inputs = new Inputs.OCCT.SimpleLinearLengthDimensionDto();
            inputs.start = [0, 0, 0];
            inputs.end = [8, 0, 0];
            inputs.direction = [0, 1.5, 0];
            inputs.labelOverwrite = "Length: val";
            inputs.decimalPlaces = 1;
            inputs.labelSuffix = "cm";

            const result = occHelper.dimensionsService.simpleLinearLengthDimension(inputs);
            const vertexPoints = occHelper.shapeGettersService.getVertices({ shape: result });
            expect(vertexPoints.length).toEqual(282);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create dimension with arrows", () => {
            const inputs = new Inputs.OCCT.SimpleLinearLengthDimensionDto();
            inputs.start = [0, 0, 0];
            inputs.end = [10, 0, 0];
            inputs.direction = [0, 2, 0];
            inputs.endType = Inputs.OCCT.dimensionEndTypeEnum.arrow;
            inputs.arrowSize = 0.5;
            inputs.arrowAngle = 45;
            inputs.arrowsFlipped = false;

            const result = occHelper.dimensionsService.simpleLinearLengthDimension(inputs);

            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);

            // Verify more shapes are present due to arrows
            const shapes = compound.getShapesOfCompound({ shape: result });
            expect(shapes.length).toBeGreaterThan(4); // Should include arrow shapes

            // Extract and verify vertices - arrows should be at translated endpoints
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });
            const vertexPoints = vertices.map(v => vertex.vertexToPoint({ shape: v }));
            expect(vertices.length).toEqual(212); // More vertices due to arrows

            // Arrow tips should be at translated start and end points
            const arrowTipStart = [0, 2, 0];
            const arrowTipEnd = [10, 2, 0];

            const hasArrowStart = vertexPoints.some(p =>
                Math.abs(p[0] - arrowTipStart[0]) < 0.01 &&
                Math.abs(p[1] - arrowTipStart[1]) < 0.01 &&
                Math.abs(p[2] - arrowTipStart[2]) < 0.01
            );
            const hasArrowEnd = vertexPoints.some(p =>
                Math.abs(p[0] - arrowTipEnd[0]) < 0.01 &&
                Math.abs(p[1] - arrowTipEnd[1]) < 0.01 &&
                Math.abs(p[2] - arrowTipEnd[2]) < 0.01
            );

            expect(hasArrowStart).toBe(true);
            expect(hasArrowEnd).toBe(true);
        });

        it("should create dimension with flipped arrows", () => {
            const inputs = new Inputs.OCCT.SimpleLinearLengthDimensionDto();
            inputs.start = [0, 0, 0];
            inputs.end = [15, 0, 0];
            inputs.direction = [0, 3, 0];
            inputs.endType = Inputs.OCCT.dimensionEndTypeEnum.arrow;
            inputs.arrowSize = 0.4;
            inputs.arrowAngle = 30;
            inputs.arrowsFlipped = true;

            const result = occHelper.dimensionsService.simpleLinearLengthDimension(inputs);

            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create dimension with custom crossing size", () => {
            const inputs = new Inputs.OCCT.SimpleLinearLengthDimensionDto();
            inputs.start = [0, 0, 0];
            inputs.end = [7, 0, 0];
            inputs.direction = [0, 1, 0];
            inputs.crossingSize = 0.5;
            inputs.offsetFromPoints = 0.2;

            const result = occHelper.dimensionsService.simpleLinearLengthDimension(inputs);

            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create dimension with rotated label", () => {
            const inputs = new Inputs.OCCT.SimpleLinearLengthDimensionDto();
            inputs.start = [0, 0, 0];
            inputs.end = [10, 0, 0];
            inputs.direction = [0, 2, 0];
            inputs.labelRotation = 45;
            inputs.labelSize = 0.2;

            const result = occHelper.dimensionsService.simpleLinearLengthDimension(inputs);
            const vertexPoints2 = occHelper.shapeGettersService.getVertices({ shape: result });
            expect(vertexPoints2.length).toBe(204);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create dimension with horizontally flipped label", () => {
            const inputs = new Inputs.OCCT.SimpleLinearLengthDimensionDto();
            inputs.start = [0, 0, 0];
            inputs.end = [10, 0, 0];
            inputs.direction = [0, 2, 0];
            inputs.labelFlipHorizontal = true;

            const result = occHelper.dimensionsService.simpleLinearLengthDimension(inputs);
            const vertexPoints2 = occHelper.shapeGettersService.getVertices({ shape: result }).map(v => vertex.vertexToPoint({ shape: v }));
            expect(vertexPoints2.length).toBe(204);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create dimension with vertically flipped label", () => {
            const inputs = new Inputs.OCCT.SimpleLinearLengthDimensionDto();
            inputs.start = [0, 0, 0];
            inputs.end = [10, 0, 0];
            inputs.direction = [0, 2, 0];
            inputs.labelFlipVertical = true;

            const result = occHelper.dimensionsService.simpleLinearLengthDimension(inputs);
            const vertexPoints2 = occHelper.shapeGettersService.getVertices({ shape: result });
            expect(vertexPoints2.length).toBe(204);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create dimension with both horizontal and vertical flip", () => {
            const inputs = new Inputs.OCCT.SimpleLinearLengthDimensionDto();
            inputs.start = [0, 0, 0];
            inputs.end = [10, 0, 0];
            inputs.direction = [0, 2, 0];
            inputs.labelFlipHorizontal = true;
            inputs.labelFlipVertical = true;

            const result = occHelper.dimensionsService.simpleLinearLengthDimension(inputs);
            const vertexPoints2 = occHelper.shapeGettersService.getVertices({ shape: result });
            expect(vertexPoints2.length).toBe(204);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create dimension with custom label offset", () => {
            const inputs = new Inputs.OCCT.SimpleLinearLengthDimensionDto();
            inputs.start = [0, 0, 0];
            inputs.end = [12, 0, 0];
            inputs.direction = [0, 3, 0];
            inputs.labelOffset = 1.0;

            const result = occHelper.dimensionsService.simpleLinearLengthDimension(inputs);
            const vertexPoints2 = occHelper.shapeGettersService.getVertices({ shape: result });
            expect(vertexPoints2.length).toBe(198);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create dimension with different decimal places", () => {
            const inputs = new Inputs.OCCT.SimpleLinearLengthDimensionDto();
            inputs.start = [0, 0, 0];
            inputs.end = [3.14159, 0, 0];
            inputs.direction = [0, 1, 0];
            inputs.decimalPlaces = 4;

            const result = occHelper.dimensionsService.simpleLinearLengthDimension(inputs);
            const vertexPoints2 = occHelper.shapeGettersService.getVertices({ shape: result }).map(v => vertex.vertexToPoint({ shape: v }));
            expect(vertexPoints2.length).toBe(192);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create dimension in 3D space", () => {
            const inputs = new Inputs.OCCT.SimpleLinearLengthDimensionDto();
            inputs.start = [1, 2, 3];
            inputs.end = [4, 5, 6];
            inputs.direction = [0, 0, 2];
            inputs.labelSuffix = "units";

            const result = occHelper.dimensionsService.simpleLinearLengthDimension(inputs);
            const vertexPoints2 = occHelper.shapeGettersService.getVertices({ shape: result });
            expect(vertexPoints2.length).toBe(184);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);

            // Verify vertices in 3D space
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });
            const vertexPoints = vertices.map(v => vertex.vertexToPoint({ shape: v }));

            // Check original start and end points are in the dimension
            const originalStart = [1, 2, 3];
            const originalEnd = [4, 5, 6];

            const hasStart = vertexPoints.some(p =>
                Math.abs(p[0] - originalStart[0]) < 0.01 &&
                Math.abs(p[1] - originalStart[1]) < 0.01 &&
                Math.abs(p[2] - originalStart[2]) < 0.01
            );
            const hasEnd = vertexPoints.some(p =>
                Math.abs(p[0] - originalEnd[0]) < 0.01 &&
                Math.abs(p[1] - originalEnd[1]) < 0.01 &&
                Math.abs(p[2] - originalEnd[2]) < 0.01
            );
            expect(vertexPoints.length).toBe(184);
            expect(hasStart).toBe(true);
            expect(hasEnd).toBe(true);
        });
    });

    describe("simpleAngularDimension", () => {
        it("should create a basic angular dimension", () => {
            const inputs = new Inputs.OCCT.SimpleAngularDimensionDto();
            inputs.center = [0, 0, 0];
            inputs.direction1 = [1, 0, 0];
            inputs.direction2 = [0, 0, 1];
            inputs.radius = 3;
            inputs.labelSuffix = "°";

            const result = occHelper.dimensionsService.simpleAngularDimension(inputs);

            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);

            const shapes = compound.getShapesOfCompound({ shape: result });
            expect(shapes.length).toBe(4);

            // Extract and verify vertices
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });
            expect(vertices.length).toBe(174);

            const vertexPoints = vertices.map(v => vertex.vertexToPoint({ shape: v }));

            // Verify dimension has arc vertices (arc will have multiple vertices on the curve)
            // Just check that we have enough vertices for a proper angular dimension
            expect(vertexPoints.length).toBeGreaterThan(4);

            // Check that at least some vertices are at approximately radius 3 from center
            const verticesAtRadius = vertexPoints.filter(p => {
                const dist = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]);
                return Math.abs(dist - 3) < 0.1;
            });

            expect(verticesAtRadius.length).toBeGreaterThan(0);
        });

        it("should create angular dimension with radians", () => {
            const inputs = new Inputs.OCCT.SimpleAngularDimensionDto();
            inputs.center = [0, 0, 0];
            inputs.direction1 = [1, 0, 0];
            inputs.direction2 = [0, 1, 0];
            inputs.radius = 4;
            inputs.radians = true;
            inputs.labelSuffix = "rad";

            const result = occHelper.dimensionsService.simpleAngularDimension(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });

            expect(vertices.length).toBe(122);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create angular dimension with arrows", () => {
            const inputs = new Inputs.OCCT.SimpleAngularDimensionDto();
            inputs.center = [0, 0, 0];
            inputs.direction1 = [1, 0, 0];
            inputs.direction2 = [1, 0, 1];
            inputs.radius = 5;
            inputs.endType = Inputs.OCCT.dimensionEndTypeEnum.arrow;
            inputs.arrowSize = 0.4;
            inputs.arrowAngle = 35;

            const result = occHelper.dimensionsService.simpleAngularDimension(inputs);

            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);

            // Verify arrows are included
            const shapes = compound.getShapesOfCompound({ shape: result });
            expect(shapes.length).toBeGreaterThan(4);

            // Verify vertices include arc endpoints where arrows should be placed
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });
            expect(vertices.length).toBeGreaterThan(8); // More vertices due to arrows

            const vertexPoints = vertices.map(v => vertex.vertexToPoint({ shape: v }));
            expect(vertices.length).toBe(258);
            // Normalized direction1 * radius = [1, 0, 0] * 5 = [5, 0, 0]
            const dir1End = [5, 0, 0];
            const hasDir1End = vertexPoints.some(p =>
                Math.abs(p[0] - dir1End[0]) < 0.01 &&
                Math.abs(p[1] - dir1End[1]) < 0.01 &&
                Math.abs(p[2] - dir1End[2]) < 0.01
            );

            expect(hasDir1End).toBe(true);
        });

        it("should create angular dimension with flipped arrows", () => {
            const inputs = new Inputs.OCCT.SimpleAngularDimensionDto();
            inputs.center = [0, 0, 0];
            inputs.direction1 = [1, 0, 0];
            inputs.direction2 = [0, 0, 1];
            inputs.radius = 3;
            inputs.endType = Inputs.OCCT.dimensionEndTypeEnum.arrow;
            inputs.arrowsFlipped = true;

            const result = occHelper.dimensionsService.simpleAngularDimension(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });
            expect(vertices.length).toBe(296);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create angular dimension with custom offset from center", () => {
            const inputs = new Inputs.OCCT.SimpleAngularDimensionDto();
            inputs.center = [0, 0, 0];
            inputs.direction1 = [1, 0, 0];
            inputs.direction2 = [0, 1, 0];
            inputs.radius = 6;
            inputs.offsetFromCenter = 1.0;

            const result = occHelper.dimensionsService.simpleAngularDimension(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });
            expect(vertices.length).toBe(288);

            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create angular dimension with custom extra size", () => {
            const inputs = new Inputs.OCCT.SimpleAngularDimensionDto();
            inputs.center = [0, 0, 0];
            inputs.direction1 = [1, 0, 0];
            inputs.direction2 = [0, 0, 1];
            inputs.radius = 4;
            inputs.extraSize = 0.8;

            const result = occHelper.dimensionsService.simpleAngularDimension(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });
            expect(vertices.length).toBe(288);

            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create angular dimension with rotated label", () => {
            const inputs = new Inputs.OCCT.SimpleAngularDimensionDto();
            inputs.center = [0, 0, 0];
            inputs.direction1 = [1, 0, 0];
            inputs.direction2 = [1, 1, 0];
            inputs.radius = 3;
            inputs.labelRotation = 30;

            const result = occHelper.dimensionsService.simpleAngularDimension(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });
            expect(vertices.length).toBe(250);

            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create angular dimension with flipped label", () => {
            const inputs = new Inputs.OCCT.SimpleAngularDimensionDto();
            inputs.center = [0, 0, 0];
            inputs.direction1 = [1, 0, 0];
            inputs.direction2 = [0, 0, 1];
            inputs.radius = 4;
            inputs.labelFlipHorizontal = true;
            inputs.labelFlipVertical = true;

            const result = occHelper.dimensionsService.simpleAngularDimension(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });
            expect(vertices.length).toBe(288);

            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create angular dimension with custom label overwrite", () => {
            const inputs = new Inputs.OCCT.SimpleAngularDimensionDto();
            inputs.center = [0, 0, 0];
            inputs.direction1 = [1, 0, 0];
            inputs.direction2 = [0, 1, 0];
            inputs.radius = 5;
            inputs.labelOverwrite = "Angle: val";
            inputs.decimalPlaces = 1;

            const result = occHelper.dimensionsService.simpleAngularDimension(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });
            expect(vertices.length).toBe(364);

            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create angular dimension with custom label offset", () => {
            const inputs = new Inputs.OCCT.SimpleAngularDimensionDto();
            inputs.center = [0, 0, 0];
            inputs.direction1 = [1, 0, 0];
            inputs.direction2 = [0, 0, 1];
            inputs.radius = 4;
            inputs.labelOffset = 0.8;

            const result = occHelper.dimensionsService.simpleAngularDimension(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });
            expect(vertices.length).toBe(288);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create angular dimension in different plane", () => {
            const inputs = new Inputs.OCCT.SimpleAngularDimensionDto();
            inputs.center = [5, 5, 5];
            inputs.direction1 = [0, 1, 0];
            inputs.direction2 = [0, 0, 1];
            inputs.radius = 3;

            const result = occHelper.dimensionsService.simpleAngularDimension(inputs);

            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);

            // Verify vertices with offset center
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });
            expect(vertices.length).toBeGreaterThan(0);
            expect(vertices.length).toBe(288);
            const vertexPoints = vertices.map(v => vertex.vertexToPoint({ shape: v }));

            // Check that vertices are at approximately radius 3 from center [5, 5, 5]
            const center = [5, 5, 5];
            const verticesAtRadius = vertexPoints.filter(p => {
                const dx = p[0] - center[0];
                const dy = p[1] - center[1];
                const dz = p[2] - center[2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                return Math.abs(dist - 3) < 0.1;
            });

            expect(verticesAtRadius.length).toBeGreaterThan(0);

            // Verify the dimension is in the correct plane (Y-Z plane around center)
            // At least some vertices should have X coordinate close to center's X
            const verticesNearCenterX = vertexPoints.filter(p =>
                Math.abs(p[0] - center[0]) < 0.1
            );

            expect(verticesNearCenterX.length).toBeGreaterThan(0);
        });

        it("should handle small angles correctly", () => {
            const inputs = new Inputs.OCCT.SimpleAngularDimensionDto();
            inputs.center = [0, 0, 0];
            inputs.direction1 = [1, 0, 0];
            inputs.direction2 = [0.99, 0, 0.1];
            inputs.radius = 3;
            inputs.decimalPlaces = 1;

            const result = occHelper.dimensionsService.simpleAngularDimension(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });
            expect(vertices.length).toBe(236);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });
    });

    describe("pinWithLabel", () => {
        it("should create a basic pin with label", () => {
            const inputs = new Inputs.OCCT.PinWithLabelDto();
            inputs.startPoint = [0, 0, 0];
            inputs.endPoint = [0, 5, 0];
            inputs.direction = [2, 0, 0];
            inputs.label = "Point A";

            const result = occHelper.dimensionsService.pinWithLabel(inputs);


            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);

            const shapes = compound.getShapesOfCompound({ shape: result });
            expect(shapes.length).toBeGreaterThan(0);

            // Verify vertices include start and end points
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });
            const vertexPoints = vertices.map(v => vertex.vertexToPoint({ shape: v }));
            expect(vertices.length).toBe(96);

            const hasStart = vertexPoints.some(p =>
                Math.abs(p[0] - 0) < 0.01 &&
                Math.abs(p[1] - 0) < 0.01 &&
                Math.abs(p[2] - 0) < 0.01
            );
            const hasEnd = vertexPoints.some(p =>
                Math.abs(p[0] - 0) < 0.01 &&
                Math.abs(p[1] - 5) < 0.01 &&
                Math.abs(p[2] - 0) < 0.01
            );

            // Label line end at endPoint + direction = [0, 5, 0] + [2, 0, 0] = [2, 5, 0]
            const labelLineEnd = [2, 5, 0];
            const hasLabelLineEnd = vertexPoints.some(p =>
                Math.abs(p[0] - labelLineEnd[0]) < 0.01 &&
                Math.abs(p[1] - labelLineEnd[1]) < 0.01 &&
                Math.abs(p[2] - labelLineEnd[2]) < 0.01
            );

            expect(hasStart).toBe(true);
            expect(hasEnd).toBe(true);
            expect(hasLabelLineEnd).toBe(true);
        });

        it("should create pin with arrow", () => {
            const inputs = new Inputs.OCCT.PinWithLabelDto();
            inputs.startPoint = [0, 0, 0];
            inputs.endPoint = [0, 3, 0];
            inputs.direction = [1, 0, 0];
            inputs.label = "Origin";
            inputs.endType = Inputs.OCCT.dimensionEndTypeEnum.arrow;
            inputs.arrowSize = 0.3;
            inputs.arrowAngle = 40;

            const result = occHelper.dimensionsService.pinWithLabel(inputs);

            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);

            // Should include arrow shape
            const shapes = compound.getShapesOfCompound({ shape: result });
            expect(shapes.length).toBeGreaterThan(3);

            // Verify arrow is placed at start point
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });
            expect(vertices.length).toBeGreaterThan(6); // More vertices due to arrow
            expect(vertices.length).toBe(130);
            const vertexPoints = vertices.map(v => vertex.vertexToPoint({ shape: v }));

            // Arrow tip should be at start point [0, 0, 0]
            const hasArrowTip = vertexPoints.some(p =>
                Math.abs(p[0] - 0) < 0.01 &&
                Math.abs(p[1] - 0) < 0.01 &&
                Math.abs(p[2] - 0) < 0.01
            );

            expect(hasArrowTip).toBe(true);
        });

        it("should create pin with flipped arrow", () => {
            const inputs = new Inputs.OCCT.PinWithLabelDto();
            inputs.startPoint = [0, 0, 0];
            inputs.endPoint = [0, 4, 0];
            inputs.direction = [1.5, 0, 0];
            inputs.label = "Point";
            inputs.endType = Inputs.OCCT.dimensionEndTypeEnum.arrow;
            inputs.arrowsFlipped = true;

            const result = occHelper.dimensionsService.pinWithLabel(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });

            expect(vertices.length).toBe(94);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create pin with custom label offset", () => {
            const inputs = new Inputs.OCCT.PinWithLabelDto();
            inputs.startPoint = [1, 1, 1];
            inputs.endPoint = [1, 6, 1];
            inputs.direction = [2, 0, 0];
            inputs.label = "Custom";
            inputs.labelOffset = 0.6;

            const result = occHelper.dimensionsService.pinWithLabel(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });

            expect(vertices.length).toBe(152);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create pin with custom label size", () => {
            const inputs = new Inputs.OCCT.PinWithLabelDto();
            inputs.startPoint = [0, 0, 0];
            inputs.endPoint = [0, 4, 0];
            inputs.direction = [1, 0, 0];
            inputs.label = "Large Text";
            inputs.labelSize = 0.3;

            const result = occHelper.dimensionsService.pinWithLabel(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });

            expect(vertices.length).toBe(166);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create pin with offset from start", () => {
            const inputs = new Inputs.OCCT.PinWithLabelDto();
            inputs.startPoint = [0, 0, 0];
            inputs.endPoint = [0, 5, 0];
            inputs.direction = [2, 0, 0];
            inputs.label = "Offset";
            inputs.offsetFromStart = 0.5;

            const result = occHelper.dimensionsService.pinWithLabel(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });

            expect(vertices.length).toBe(138);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create pin with rotated label", () => {
            const inputs = new Inputs.OCCT.PinWithLabelDto();
            inputs.startPoint = [0, 0, 0];
            inputs.endPoint = [0, 4, 0];
            inputs.direction = [1, 0, 0];
            inputs.label = "Rotated";
            inputs.labelRotation = 45;

            const result = occHelper.dimensionsService.pinWithLabel(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });

            expect(vertices.length).toBe(166);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create pin with horizontally flipped label", () => {
            const inputs = new Inputs.OCCT.PinWithLabelDto();
            inputs.startPoint = [0, 0, 0];
            inputs.endPoint = [0, 5, 0];
            inputs.direction = [2, 0, 0];
            inputs.label = "Flipped H";
            inputs.labelFlipHorizontal = true;

            const result = occHelper.dimensionsService.pinWithLabel(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });

            expect(vertices.length).toBe(144);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create pin with vertically flipped label", () => {
            const inputs = new Inputs.OCCT.PinWithLabelDto();
            inputs.startPoint = [0, 0, 0];
            inputs.endPoint = [0, 5, 0];
            inputs.direction = [2, 0, 0];
            inputs.label = "Flipped V";
            inputs.labelFlipVertical = true;

            const result = occHelper.dimensionsService.pinWithLabel(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });

            expect(vertices.length).toBe(142);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create pin with both flips", () => {
            const inputs = new Inputs.OCCT.PinWithLabelDto();
            inputs.startPoint = [0, 0, 0];
            inputs.endPoint = [0, 5, 0];
            inputs.direction = [2, 0, 0];
            inputs.label = "Both Flips";
            inputs.labelFlipHorizontal = true;
            inputs.labelFlipVertical = true;

            const result = occHelper.dimensionsService.pinWithLabel(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });

            expect(vertices.length).toBe(174);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should create pin in 3D space", () => {
            const inputs = new Inputs.OCCT.PinWithLabelDto();
            inputs.startPoint = [2, 3, 4];
            inputs.endPoint = [2, 8, 4];
            inputs.direction = [0, 0, 2];
            inputs.label = "3D Pin";

            const result = occHelper.dimensionsService.pinWithLabel(inputs);

            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);

            // Verify 3D coordinates
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });
            const vertexPoints = vertices.map(v => vertex.vertexToPoint({ shape: v }));

            expect(vertices.length).toBe(100);
            const hasStart = vertexPoints.some(p =>
                Math.abs(p[0] - 2) < 0.01 &&
                Math.abs(p[1] - 3) < 0.01 &&
                Math.abs(p[2] - 4) < 0.01
            );
            const hasEnd = vertexPoints.some(p =>
                Math.abs(p[0] - 2) < 0.01 &&
                Math.abs(p[1] - 8) < 0.01 &&
                Math.abs(p[2] - 4) < 0.01
            );

            // Label line end: [2, 8, 4] + [0, 0, 2] = [2, 8, 6]
            const labelEnd = [2, 8, 6];
            const hasLabelEnd = vertexPoints.some(p =>
                Math.abs(p[0] - labelEnd[0]) < 0.01 &&
                Math.abs(p[1] - labelEnd[1]) < 0.01 &&
                Math.abs(p[2] - labelEnd[2]) < 0.01
            );

            expect(hasStart).toBe(true);
            expect(hasEnd).toBe(true);
            expect(hasLabelEnd).toBe(true);
        });

        it("should create pin with all custom parameters", () => {
            const inputs = new Inputs.OCCT.PinWithLabelDto();
            inputs.startPoint = [1, 2, 3];
            inputs.endPoint = [1, 7, 3];
            inputs.direction = [2, 0, 1];
            inputs.label = "Complex";
            inputs.offsetFromStart = 0.3;
            inputs.labelOffset = 0.5;
            inputs.labelSize = 0.15;
            inputs.endType = Inputs.OCCT.dimensionEndTypeEnum.arrow;
            inputs.arrowSize = 0.4;
            inputs.arrowAngle = 35;
            inputs.labelRotation = 20;

            const result = occHelper.dimensionsService.pinWithLabel(inputs);

            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });
    });

    describe("label expression evaluation", () => {
        it("should handle mathematical expressions in linear dimension", () => {
            const inputs = new Inputs.OCCT.SimpleLinearLengthDimensionDto();
            inputs.start = [0, 0, 0];
            inputs.end = [10, 0, 0];
            inputs.direction = [0, 1, 0];
            inputs.labelOverwrite = "val/10";
            inputs.decimalPlaces = 3;
            inputs.labelSuffix = "m";

            const result = occHelper.dimensionsService.simpleLinearLengthDimension(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });
            expect(vertices.length).toBe(142);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should handle complex mathematical expressions", () => {
            const inputs = new Inputs.OCCT.SimpleLinearLengthDimensionDto();
            inputs.start = [0, 0, 0];
            inputs.end = [5, 0, 0];
            inputs.direction = [0, 1, 0];
            inputs.labelOverwrite = "(val*2)+10";
            inputs.decimalPlaces = 1;
            inputs.labelSuffix = "units";

            const result = occHelper.dimensionsService.simpleLinearLengthDimension(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });

            expect(vertices.length).toBe(184);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should handle invalid expressions gracefully", () => {
            const inputs = new Inputs.OCCT.SimpleLinearLengthDimensionDto();
            inputs.start = [0, 0, 0];
            inputs.end = [7, 0, 0];
            inputs.direction = [0, 1, 0];
            inputs.labelOverwrite = "invalid expression $#@";
            inputs.decimalPlaces = 2;
            inputs.labelSuffix = "mm";

            const result = occHelper.dimensionsService.simpleLinearLengthDimension(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });

            expect(vertices.length).toBe(568);
            // Should still create the dimension, falling back to template or value
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });
    });

    describe("edge cases and robustness", () => {
        it("should handle very small dimensions", () => {
            const inputs = new Inputs.OCCT.SimpleLinearLengthDimensionDto();
            inputs.start = [0, 0, 0];
            inputs.end = [0.001, 0, 0];
            inputs.direction = [0, 0.1, 0];
            inputs.decimalPlaces = 5;

            const result = occHelper.dimensionsService.simpleLinearLengthDimension(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });

            expect(vertices.length).toBe(268);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should handle very large dimensions", () => {
            const inputs = new Inputs.OCCT.SimpleLinearLengthDimensionDto();
            inputs.start = [0, 0, 0];
            inputs.end = [10000, 0, 0];
            inputs.direction = [0, 100, 0];

            const result = occHelper.dimensionsService.simpleLinearLengthDimension(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });

            expect(vertices.length).toBe(300);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should handle very small arrow angle", () => {
            const inputs = new Inputs.OCCT.SimpleLinearLengthDimensionDto();
            inputs.start = [0, 0, 0];
            inputs.end = [10, 0, 0];
            inputs.direction = [0, 2, 0];
            inputs.endType = Inputs.OCCT.dimensionEndTypeEnum.arrow;
            inputs.arrowAngle = 5;

            const result = occHelper.dimensionsService.simpleLinearLengthDimension(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });

            expect(vertices.length).toBe(212);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });

        it("should handle maximum arrow angle", () => {
            const inputs = new Inputs.OCCT.SimpleLinearLengthDimensionDto();
            inputs.start = [0, 0, 0];
            inputs.end = [10, 0, 0];
            inputs.direction = [0, 2, 0];
            inputs.endType = Inputs.OCCT.dimensionEndTypeEnum.arrow;
            inputs.arrowAngle = 90;

            const result = occHelper.dimensionsService.simpleLinearLengthDimension(inputs);
            const vertices = occHelper.shapeGettersService.getVertices({ shape: result });

            expect(vertices.length).toBe(212);
            expect(result).toBeDefined();
            expect(result.IsNull()).toBe(false);
        });
    });
});
