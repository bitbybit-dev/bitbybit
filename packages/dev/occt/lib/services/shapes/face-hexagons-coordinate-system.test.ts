import { describe, it, expect, beforeAll, afterEach } from "vitest";
import type { TopoDS_Face, TopoDS_Wire } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { OCCTFace } from "./face";
import { OCCTWire } from "./wire";
import { Base } from "../../api/inputs";

type Point = Base.Point3;

const PLACES_ROUNDED_TO = 6;

describe("hexagons laid out over a face's parameters", () => {
    let occHelper: OccHelper;
    let face: OCCTFace;
    let wire: OCCTWire;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occHelper = new OccHelper(kernel);
        face = new OCCTFace(kernel, occHelper);
        wire = new OCCTWire(kernel, occHelper);
    }, 120_000);

    afterEach(() => {
        occHelper.base.settings = {};
    });

    const rounded = (point: Point): Point => point.map((value) => Number(value.toFixed(PLACES_ROUNDED_TO)) + 0) as Point;

    const centreOf = (outline: TopoDS_Wire): Point => rounded(occHelper.base.point.averagePoint({
        points: wire.divideWireByEqualDistanceToPoints({ shape: outline, nrOfDivisions: 12, removeStartPoint: true, removeEndPoint: false }),
    }));

    const outlinesOf = (subdivide: "subdivideToHexagonWires" | "subdivideToHexagonHoles", rectangle: TopoDS_Face): TopoDS_Wire[] => {
        const pattern = { shape: rectangle, nrHexagonsU: 3, nrHexagonsV: 4, inclusionPattern: [true, false, false, true, true] };
        if (subdivide === "subdivideToHexagonWires") {
            return face.subdivideToHexagonWires(pattern);
        }
        const holed = face.subdivideToHexagonHoles(pattern);
        const outlines = holed.flatMap((piece) => wire.getWires({ shape: piece }));
        holed.forEach((piece) => piece.delete());
        return outlines;
    };

    const hexagonCentres = (subdivide: "subdivideToHexagonWires" | "subdivideToHexagonHoles"): Point[] => {
        const rectangle = face.createRectangleFace({ width: 10, length: 6, center: [0, 0, 0], direction: [0, 1, 0] });
        const outlines = outlinesOf(subdivide, rectangle);
        const centres = outlines.map(centreOf);
        outlines.forEach((outline) => outline.delete());
        rectangle.delete();
        return centres;
    };

    it.each([
        ["subdivideToHexagonWires" as const, Base.coordinateSystemEnum.rightHanded],
        ["subdivideToHexagonWires" as const, Base.coordinateSystemEnum.leftHanded],
        ["subdivideToHexagonHoles" as const, Base.coordinateSystemEnum.rightHanded],
    ])("should lay %s out the same in a %s system as with no setting, since the pattern is in the face's own parameters", (subdivide, coordinateSystem) => {
        // Arrange
        const withoutSetting = hexagonCentres(subdivide);
        occHelper.base.settings = { coordinateSystem };

        // Act
        const inTheSystem = hexagonCentres(subdivide);

        // Assert
        expect(inTheSystem).toEqual(withoutSetting);
        expect(new Set(withoutSetting.map((centre) => centre.join(","))).size).toBeGreaterThan(1);
    });
});
