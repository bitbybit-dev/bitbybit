import { affinePoint2 } from "../../geometry/affine2";
import { describe, it, expect } from "vitest";
import { documentFrame, parseViewBox, viewBoxTransform } from "./svg-document";

import { parseXml } from "./svg-xml";

describe("svg view boxes", () => {
    it("should read a view box written with packed numbers and refuse one of zero size", () => {
        // Act
        const packed = parseViewBox("-5-5 10,10");
        const empty = parseViewBox("0 0 0 10");

        // Assert
        expect(packed).toEqual([-5, -5, 10, 10]);
        expect(empty).toBeUndefined();
    });

    it("should fit a view box into a wider viewport centered by default", () => {
        // Act
        const m = viewBoxTransform([0, 0, 100, 100], 200, 100, undefined);

        // Assert
        expect(affinePoint2(m, [0, 0])).toEqual([50, 0]);
        expect(affinePoint2(m, [100, 100])).toEqual([150, 100]);
    });

    it("should align a view box to the minimum corner with xMinYMin and fill the viewport with slice", () => {
        // Act
        const meet = viewBoxTransform([0, 0, 100, 100], 200, 100, "xMinYMin meet");
        const slice = viewBoxTransform([0, 0, 100, 100], 200, 100, "xMaxYMax slice");

        // Assert
        expect(affinePoint2(meet, [100, 100])).toEqual([100, 100]);
        expect(affinePoint2(slice, [0, 0])).toEqual([0, -100]);
        expect(affinePoint2(slice, [100, 100])).toEqual([200, 100]);
    });

    it("should stretch a view box with none", () => {
        // Act
        const m = viewBoxTransform([10, 20, 100, 100], 200, 50, "none");

        // Assert
        expect(affinePoint2(m, [10, 20])).toEqual([0, 0]);
        expect(affinePoint2(m, [110, 120])).toEqual([200, 50]);
    });

    it("should fit a view box centered when the aspect ratio says defer and nothing else", () => {
        // Act
        const m = viewBoxTransform([0, 0, 100, 100], 200, 100, "defer");

        // Assert
        expect(affinePoint2(m, [0, 0])).toEqual([50, 0]);
        expect(affinePoint2(m, [100, 100])).toEqual([150, 100]);
    });
});

describe("svg document frame", () => {
    it("should read the page size in pixels and the millimetres a user unit stands for", () => {
        // Act
        const frame = documentFrame(parseXml("<svg width=\"210mm\" height=\"297mm\" viewBox=\"0 0 21000 29700\"/>")!);

        // Assert
        expect(frame.width! * 25.4 / 96).toBeCloseTo(210, 10);
        expect(frame.height! * 25.4 / 96).toBeCloseTo(297, 10);
        expect(frame.millimetresPerUserUnit).toBeCloseTo(0.01, 12);
    });

    it("should take the page size from the view box when the document states none", () => {
        // Act
        const frame = documentFrame(parseXml("<svg viewBox=\"0 0 300 150\"/>")!);

        // Assert
        expect([frame.width, frame.height]).toEqual([300, 150]);
        expect(frame.millimetresPerUserUnit).toBeCloseTo(25.4 / 96, 12);
    });

    it("should derive a missing height from the width and the view box's proportions", () => {
        // Act
        const frame = documentFrame(parseXml("<svg width=\"100mm\" viewBox=\"0 0 200 100\"/>")!);

        // Assert
        expect(frame.height! * 25.4 / 96).toBeCloseTo(50, 10);
    });

    it("should derive a missing width from the height and the view box's proportions", () => {
        // Act
        const frame = documentFrame(parseXml("<svg height=\"50mm\" viewBox=\"0 0 200 100\"/>")!);

        // Assert
        expect(frame.width! * 25.4 / 96).toBeCloseTo(100, 10);
    });

    it("should take the page size from the view box when the width and height given are not positive lengths", () => {
        // Act
        const frame = documentFrame(parseXml("<svg width=\"0\" height=\"tall\" viewBox=\"0 0 30 20\"/>")!);

        // Assert
        expect([frame.width, frame.height]).toEqual([30, 20]);
    });

    it("should size the content by the width and height when the document has no view box", () => {
        // Act
        const frame = documentFrame(parseXml("<svg width=\"100\" height=\"50\"/>")!);

        // Assert
        expect(frame.contentViewport).toEqual({ width: 100, height: 50 });
        expect([frame.width, frame.height, frame.viewBox]).toEqual([100, 50, undefined]);
    });

    it("should report no page size for a document that states its width alone", () => {
        // Act
        const frame = documentFrame(parseXml("<svg width=\"100mm\"/>")!);

        // Assert
        expect([frame.width, frame.height]).toEqual([undefined, undefined]);
    });

    it("should report no page size for a document that states neither size nor view box", () => {
        // Act
        const frame = documentFrame(parseXml("<svg width=\"100%\"/>")!);

        // Assert
        expect(frame.width).toBeUndefined();
        expect(frame.millimetresPerUserUnit).toBeCloseTo(25.4 / 96, 12);
    });
});
