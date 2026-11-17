import { afterEach, describe, expect, it, vi } from "vitest";
import type * as Inputs from "../../../../inputs";
import { InputError } from "../../../../kernel-calls";
import { Dxf } from "../../../io/dxf";
import { Svg } from "../../../io/svg";
import { DxfText } from "../dxf/dxf-text";
import { WorkBudget } from "../work-budget";

vi.mock("./drawing.constants", async importOriginal => ({
    ...await importOriginal<typeof import("./drawing.constants")>(),
    WRITER_WORK_PER_NUMBER: 0,
    WRITER_WORK_FLOOR: 6000,
    WRITER_WORK_CEILING: 6000,
}));

type Segment = Inputs.IO.DrawingPathDto["segments"][number];

const svg = new Svg();
const dxf = new Dxf();

const partOf = (segment: Segment): Inputs.IO.DrawingPartDto => ({ layer: "cut", color: "#ff0000", paths: [{ segments: [segment] }] });

const refusalOf = (act: () => unknown): InputError | undefined => {
    try {
        act();
    } catch (error) {
        if (error instanceof InputError) {
            return error;
        }
        throw error;
    }
    return undefined;
};

const zigzag: Segment = { points: Array.from({ length: 1000 }, (_, at) => [at, at % 2]) };
const straightCubic = (pieces: number): Segment => ({ controlPoints: Array.from({ length: pieces + 3 }, (_, at) => [at, 0]), degree: 3 });
const highDegree: Segment = { controlPoints: Array.from({ length: 100 }, (_, at) => [at, at % 2]), degree: 25 };

describe("writing a drawing against a work budget lowered to 6,000 steps, since the real one takes tens of megabytes to reach", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should refuse an SVG file whose characters pass the budget, naming the parts, and a path's data, naming the path", () => {
        // Act
        const document = refusalOf(() => svg.svgCreate({ parts: [partOf(zigzag)] }));
        const data = refusalOf(() => svg.pathData({ path: { segments: [zigzag] } }));

        // Assert
        expect([document?.property, data?.property]).toEqual(["parts", "path"]);
        expect(document?.message).toBe("`parts` is too large to write as SVG: it takes more than 6000 steps, each character written and each control point blended counted, the most a drawing of its size may take.");
    });

    it("should refuse an SVG file whose curves cost the budget to bound before a character is written", () => {
        // Act
        const refusal = refusalOf(() => svg.svgCreate({ parts: [partOf(highDegree)] }));

        // Assert
        expect(refusal?.property).toBe("parts");
    });

    it("should refuse an SVG file whose spline the budget can bound but not split into pieces to draw", () => {
        // Act
        const refusal = refusalOf(() => svg.svgCreate({ parts: [partOf(straightCubic(300))] }));

        // Assert
        expect(refusal?.property).toBe("parts");
    });

    it("should refuse a DXF file whose curves cost the budget to bound, whose AC1009 samples pass it, or whose entities do, naming the parts", () => {
        // Act
        const refusals = [
            refusalOf(() => dxf.dxfCreate({ dxfPathsParts: [partOf(highDegree)] })),
            refusalOf(() => dxf.dxfCreate({ dxfPathsParts: [partOf(straightCubic(100))], acadVersion: "AC1009" })),
            refusalOf(() => dxf.dxfCreate({ dxfPathsParts: [partOf(zigzag)], acadVersion: "AC1009" })),
        ];

        // Assert
        expect(refusals.map(refusal => refusal?.property)).toEqual(["dxfPathsParts", "dxfPathsParts", "dxfPathsParts"]);
        expect(refusals[0]?.message).toBe("`dxfPathsParts` is too large to write as DXF: it takes more than 6000 steps, each character written and each control point blended counted, the most a drawing of its size may take.");
    });

    it("should write a drawing whose work stays within the budget", () => {
        // Act
        const text = svg.svgCreate({ parts: [partOf({ start: [0, 0], end: [1, 1] })] });

        // Assert
        expect(text).toContain("<path d=\"M0 0 L1 -1\"/>");
    });

    it("should refuse, rather than throw a RangeError, an SVG file or path data too long for one string", () => {
        // Arrange
        const join = Array.prototype.join;
        vi.spyOn(Array.prototype, "join").mockImplementation(function (this: unknown[], separator?: string): string {
            if (this.includes("</svg>") || this[0] === "M12345 0") {
                throw new RangeError("Invalid string length");
            }
            return join.call(this, separator);
        });

        // Act
        const document = refusalOf(() => svg.svgCreate({ parts: [partOf({ start: [0, 0], end: [1, 1] })] }));
        const data = refusalOf(() => svg.pathData({ path: { segments: [{ start: [12345, 0], end: [12346, 0] }] } }));

        // Assert
        expect([document?.property, data?.property]).toEqual(["parts", "path"]);
    });

    it("should refuse a handle filled in once the budget is spent", () => {
        // Arrange
        const text = new DxfText(0x20, { budget: new WorkBudget(10), property: "dxfPathsParts" });
        const slot = text.reserve("5");

        // Act
        const refusal = refusalOf(() => text.fill(slot, "ABCDEFGHIJ"));

        // Assert
        expect(refusal?.property).toBe("dxfPathsParts");
    });
});
