import { GeometryHelper } from "./geometry-helper";
import { MathBitByBit } from "./math";
import { Point } from "./point";
import { TextBitByBit } from "./text";
import { Transforms } from "./transforms";
import { Vector } from "./vector";
import * as Inputs from "../inputs";
import { Lists } from "./lists";


describe("Text unit tests", () => {
    let text: TextBitByBit;

    // Mock Font Data Structure (simplified)
    // Uses character code as key.
    // First element is width, then pairs of [x, y] relative coords. `undefined` signifies path break.
    const mockFont = {
        // Height of the font design coordinate space
        height: 100, // Example height
        // Glyph for 'A' (char code 65) - simple triangle
        65: [
            50, // width
            0, 0, // path 1 start
            25, 80,
            50, 0,
            0, 0, // close path 1
        ],
        // Glyph for 'B' (char code 66) - two paths (e.g., two vertical lines)
        66: [
            40, // width
            0, 0,  // path 1
            0, 80,
            undefined, // path break
            30, 0, // path 2
            30, 80,
        ],
        // Glyph for ' ' (space) (char code 32) - just width
        32: [
            20, // width (no geometry needed, but width matters)
        ],
        // Glyph for '?' (fallback, char code 63) - simple square
        63: [
            45, // width
            0, 0,
            45, 0,
            45, 70,
            0, 70,
            0, 0,
        ]
    };

    const expectPointCloseTo = (
        received: Inputs.Base.Point3 | Inputs.Base.Vector3 | undefined,
        expected: Inputs.Base.Point3 | Inputs.Base.Vector3
    ) => {
        expect(received).toBeDefined();
        if (!received) return; // Guard for TS
        expect(received.length).toEqual(expected.length);
        expect(received[0]).toBeCloseTo(expected[0], TOLERANCE);
        expect(received[1]).toBeCloseTo(expected[1], TOLERANCE);
        if (expected.length > 2 && received.length > 2) {
            expect(received[2]).toBeCloseTo(expected[2], TOLERANCE);
        }
    };

    const expectPointsCloseTo = (
        received: Inputs.Base.Point3[] | Inputs.Base.Vector3[],
        expected: Inputs.Base.Point3[] | Inputs.Base.Vector3[]
    ) => {
        expect(received.length).toEqual(expected.length);
        received.forEach((p, i) => expectPointCloseTo(p, expected[i]));
    };

    const TOLERANCE = 1e-7;


    beforeAll(async () => {
        const geometryHelper = new GeometryHelper();
        const math = new MathBitByBit();
        const vector = new Vector(math, geometryHelper);
        const transforms = new Transforms(vector, math);
        const lists = new Lists();
        const points = new Point(geometryHelper, transforms, vector, lists);
        text = new TextBitByBit(points);
    });

    it("should create a text", async () => {
        const result = text.create({ text: "Hello World, Matas" });
        expect(result).toEqual("Hello World, Matas");
    });

    it("should split text", async () => {
        const result = text.split({ text: "Hello World, Matas, Ubarevicius", separator: "," });
        expect(result).toEqual(["Hello World", " Matas", " Ubarevicius"]);
    });

    it("should replace all in text", async () => {
        const result = text.replaceAll({ text: "Hello World, Matas, Ubarevicius", search: ",", replaceWith: "-" });
        expect(result).toEqual("Hello World- Matas- Ubarevicius");
    });

    it("should join all items", async () => {
        const result = text.join({ list: ["Hello World", " Matas", " Ubarevicius"], separator: "," });
        expect(result).toEqual("Hello World, Matas, Ubarevicius");
    });

    it("should convert to string item", async () => {
        const result = text.toString({ item: [0, 0, 0] });
        expect(result).toEqual("0,0,0");
    });

    it("should convert to string items", async () => {
        const result = text.toStringEach({ list: [0, 1, 2] });
        expect(result).toEqual(["0", "1", "2"]);
    });

    it("should format string", () => {
        const result = text.format({ text: "Hello {0}, {1}", values: ["World", "Matas"] });
        expect(result).toEqual("Hello World, Matas");
    });

    it("should not format string if there are no values", () => {
        const result = text.format({ text: "Hello {0}, {1}", values: [] });
        expect(result).toEqual("Hello {0}, {1}");
    });

    it("should not format string if there are no placeholders", () => {
        const result = text.format({ text: "Hello World, Matas", values: ["dada"] });
        expect(result).toEqual("Hello World, Matas");
    });


    describe("vectorChar", () => {

        it("should create vector data for a basic character (A)", () => {
            const char = "A";
            const code = char.charCodeAt(0);
            const targetHeight = 20;
            const glyphWidth = mockFont[code][0];
            const fontDesignHeight = mockFont.height;
            const ratio = targetHeight / fontDesignHeight;
            const expectedWidth = glyphWidth * ratio;

            const result = text.vectorChar({
                char: char,
                height: targetHeight,
                font: mockFont
            } as jest.Mocked<Inputs.Text.VectorCharDto>);

            expect(result.width).toBeCloseTo(expectedWidth, TOLERANCE);
            expect(result.height).toBeCloseTo(targetHeight, TOLERANCE);
            expect(result.paths).toHaveLength(1);

            const expectedPath: Inputs.Base.Point3[] = [
                [0 * ratio + 0, 0, 0 * ratio + 0],
                [25 * ratio + 0, 0, 80 * ratio + 0],
                [50 * ratio + 0, 0, 0 * ratio + 0],
                [0 * ratio + 0, 0, 0 * ratio + 0],
            ];
            expectPointsCloseTo(result.paths[0], expectedPath);
        });

        it("should apply xOffset and yOffset", () => {
            const char = "A";
            const targetHeight = 10;
            const xOff = 5;
            const yOff = -2;
            const ratio = 0.1;

            const result = text.vectorChar({
                char: char, height: targetHeight, font: mockFont, xOffset: xOff, yOffset: yOff
            } as jest.Mocked<Inputs.Text.VectorCharDto>);

            const expectedFirstPoint: Inputs.Base.Point3 = [
                0 * ratio + xOff, 0, 0 * ratio + yOff
            ];
            expectPointCloseTo(result.paths[0][0], expectedFirstPoint);
        });

        it("should handle extrudeOffset", () => {
            const char = "A";
            const targetHeight = 20;
            const extrudeOff = 4;
            const fontDesignHeight = mockFont.height;
            const ratio = (targetHeight - extrudeOff) / fontDesignHeight;
            const extrudeYOff = extrudeOff / 2;
            const glyphWidth = mockFont[char.charCodeAt(0)][0];
            const expectedWidth = glyphWidth * ratio;

            const result = text.vectorChar({
                char: char, height: targetHeight, font: mockFont, extrudeOffset: extrudeOff
            } as jest.Mocked<Inputs.Text.VectorCharDto>);

            expect(result.width).toBeCloseTo(expectedWidth, TOLERANCE);
            expect(result.height).toBeCloseTo(targetHeight, TOLERANCE);

            const expectedFirstPointY = 0 * ratio + 0 + extrudeYOff;
            const expectedSecondPointY = 80 * ratio + 0 + extrudeYOff;

            expect(result.paths[0][0][2]).toBeCloseTo(expectedFirstPointY, TOLERANCE);
            expect(result.paths[0][1][2]).toBeCloseTo(expectedSecondPointY, TOLERANCE);
        });

        it("should create multiple paths for characters with breaks (B)", () => {
            const char = "B";
            const targetHeight = 10;
            const result = text.vectorChar({ char: char, height: targetHeight, font: mockFont } as jest.Mocked<Inputs.Text.VectorCharDto>);

            expect(result.paths).toHaveLength(2);
            const expectedPath1: Inputs.Base.Point3[] = [[0, 0, 0], [0, 0, 8]];
            const expectedPath2: Inputs.Base.Point3[] = [[3, 0, 0], [3, 0, 8]];

            expectPointsCloseTo(result.paths[0], expectedPath1);
            expectPointsCloseTo(result.paths[1], expectedPath2);
        });

        it("should use fallback character (?) for unknown characters", () => {
            const char = "Z";
            const fallbackCode = 63; // '?'
            const targetHeight = 10;
            const fallbackGlyphWidth = mockFont[fallbackCode][0]; // 45
            const expectedWidth = fallbackGlyphWidth * (targetHeight / mockFont.height); // 45 * 0.1 = 4.5

            const result = text.vectorChar({ char: char, height: targetHeight, font: mockFont } as jest.Mocked<Inputs.Text.VectorCharDto>);

            expect(result.width).toBeCloseTo(expectedWidth, TOLERANCE);
            expect(result.paths).toHaveLength(1);

            const expectedPathFallback: Inputs.Base.Point3[] = [
                [0 * 0.1, 0, 0 * 0.1],
                [45 * 0.1, 0, 0 * 0.1],
                [45 * 0.1, 0, 70 * 0.1],
                [0 * 0.1, 0, 70 * 0.1],
                [0 * 0.1, 0, 0 * 0.1],
            ];
            expectPointsCloseTo(result.paths[0], expectedPathFallback);
        });

        it("should handle space character (width only)", () => {
            const char = " ";
            const targetHeight = 10;
            const spaceGlyphWidth = mockFont[char.charCodeAt(0)][0]; // 20
            const expectedWidth = spaceGlyphWidth * (targetHeight / mockFont.height); // 20 * 0.1 = 2

            const result = text.vectorChar({ char: char, height: targetHeight, font: mockFont } as jest.Mocked<Inputs.Text.VectorCharDto>);

            expect(result.width).toBeCloseTo(expectedWidth, TOLERANCE);
            expect(result.height).toBeCloseTo(targetHeight, TOLERANCE);
            expect(result.paths).toEqual([]);
        });

        it("should use fallback for empty string input", () => {
            const char = "";
            const fallbackCode = 63;
            const targetHeight = 10;
            const fallbackGlyphWidth = mockFont[fallbackCode][0];
            const expectedWidth = fallbackGlyphWidth * (targetHeight / mockFont.height);

            const result = text.vectorChar({ char: char, height: targetHeight, font: mockFont } as jest.Mocked<Inputs.Text.VectorCharDto>);
            expect(result.width).toBeCloseTo(expectedWidth, TOLERANCE);
        });

    });

    describe("vectorText", () => {

        it("should create data for a single character text", () => {
            const result = text.vectorText({ text: "A", font: mockFont, height: 10 } as jest.Mocked<Inputs.Text.VectorTextDto>);
            expect(result).toHaveLength(1);
            expect(result[0].chars).toHaveLength(1);
            expect(result[0].chars[0].paths).toHaveLength(3);
        });

        it("should create data for a simple text string (\"AB\")", () => {
            const height = 10;
            const result = text.vectorText({ text: "AB", font: mockFont, height: height } as jest.Mocked<Inputs.Text.VectorTextDto>);
            expect(result[0].chars[0].paths).toEqual([[[4.285714285714286, 0, 10], [0.47619047619047616, 0, 0]], [[4.285714285714286, 0, 10], [8.095238095238095, 0, 0]], [[1.9047619047619047, 0, 3.333333333333333], [6.666666666666666, 0, 3.333333333333333]]]);
        });

        it("should handle spaces correctly (\"A B\")", () => {
            const height = 10;

            const result = text.vectorText({ text: "A B", font: mockFont, height: height } as jest.Mocked<Inputs.Text.VectorTextDto>);
            expect(result[0].chars[0].paths).toEqual([[[4.285714285714286, 0, 10], [0.47619047619047616, 0, 0]], [[4.285714285714286, 0, 10], [8.095238095238095, 0, 0]], [[1.9047619047619047, 0, 3.333333333333333], [6.666666666666666, 0, 3.333333333333333]]]);
        });

        it("should handle newline characters (\"A\\nB\")", () => {
            const height = 10;
            const lineSpacing = 1.5;

            const result = text.vectorText({ text: "A\nB", font: mockFont, height: height, lineSpacing: lineSpacing } as jest.Mocked<Inputs.Text.VectorTextDto>);
            expect(result).toHaveLength(2);

            expect(result[0].chars[0].paths).toEqual([[[4.285714285714286, 0, 10], [0.47619047619047616, 0, 0]], [[4.285714285714286, 0, 10], [8.095238095238095, 0, 0]], [[1.9047619047619047, 0, 3.333333333333333], [6.666666666666666, 0, 3.333333333333333]]]);
        });

        it("should apply letterSpacing", () => {
            const height = 10;
            const letterSpacing = 0.5;

            const result = text.vectorText({ text: "AB", font: mockFont, height: height, letterSpacing: letterSpacing } as jest.Mocked<Inputs.Text.VectorTextDto>);
            expect(result[0].chars[0].paths).toEqual([
                [[4.285714285714286, 0, 10], [0.47619047619047616, 0, 0]],
                [[4.285714285714286, 0, 10], [8.095238095238095, 0, 0]],
                [
                    [1.9047619047619047, 0, 3.333333333333333],
                    [6.666666666666666, 0, 3.333333333333333]
                ]
            ]);
        });

        it("should align text center", () => {
            const txt = "A\nAB";
            const height = 10;

            const result = text.vectorText({ text: txt, font: mockFont, height: height, align: Inputs.Base.horizontalAlignEnum.center } as jest.Mocked<Inputs.Text.VectorTextDto>);
            expect(result).toHaveLength(2);

            expect(result[0].chars[0].paths).toEqual([[[14.285714285714285, 0, 10], [10.476190476190476, 0, 0]], [[14.285714285714285, 0, 10], [18.095238095238095, 0, 0]], [[11.904761904761905, 0, 3.333333333333333], [16.666666666666664, 0, 3.333333333333333]]]);
        });

        it("should align text right", () => {
            const txt = "A\nAB";
            const height = 10;

            const result = text.vectorText({ text: txt, font: mockFont, height: height, align: Inputs.Base.horizontalAlignEnum.right } as jest.Mocked<Inputs.Text.VectorTextDto>);
            expect(result).toHaveLength(2);
            expect(result[0].chars[0].paths).toEqual([
                [[24.285714285714285, 0, 10], [20.476190476190474, 0, 0]],
                [[24.285714285714285, 0, 10], [28.095238095238095, 0, 0]],
                [
                    [21.904761904761905, 0, 3.333333333333333],
                    [26.666666666666664, 0, 3.333333333333333]
                ]
            ]);
        });

        it("should center the entire text block if centerOnOrigin is true", () => {
            const txt = "A";
            const height = 10;

            const result = text.vectorText({ text: txt, font: mockFont, height: height, centerOnOrigin: true } as jest.Mocked<Inputs.Text.VectorTextDto>);
            expect(result).toHaveLength(1);
            expect(result[0].chars).toHaveLength(1);
            expect(result[0].chars[0].paths).toEqual([
                [[0, 0, 5], [-3.8095238095238093, 0, -5]],
                [[0, 0, 5], [3.8095238095238093, 0, -5]],
                [
                    [-2.380952380952381, 0, -1.666666666666667],
                    [2.3809523809523805, 0, -1.666666666666667]
                ]
            ]);

        });

        it("should return empty array for empty text", () => {
            const result = text.vectorText({ text: "", font: mockFont } as jest.Mocked<Inputs.Text.VectorTextDto>);
            expect(result).toEqual([]);
        });

        it("should throw error for non-string input", () => {
            expect(() => {
                text.vectorText({ text: 123 as any, font: mockFont } as jest.Mocked<Inputs.Text.VectorTextDto>);
            }).toThrow("text must be a string");
        });

    });
});

