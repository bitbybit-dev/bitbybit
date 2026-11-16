import { describe, it, expect, beforeAll, afterEach } from "vitest";
import createBitbybitOcct from "../../bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "../api/inputs";
import { OccHelper } from "../occ-helper";
import { OCCTService } from "../occ-service";

const { leftHanded, rightHanded } = Inputs.Base.coordinateSystemEnum;

type Point = Inputs.Base.Point3;

const LINE_HEIGHT = 2;
const LABEL_CLEARANCE = 1;

describe("OCCT dimension labels: which way they read", () => {
    let occt: OCCTService;
    let occHelper: OccHelper;

    beforeAll(async () => {
        const kernel = await createBitbybitOcct();
        occHelper = new OccHelper(kernel);
        occt = new OCCTService(kernel, occHelper);
    }, 120_000);

    afterEach(() => {
        occHelper.base.settings = {};
    });

    const rounded = (points: Point[]): Point[] => points.map(point => point.map(value => Math.round(value * 1e6) / 1e6 + 0) as Point);
    const lengthAlongXOffsetAlongY = (options: Partial<Inputs.OCCT.SimpleLinearLengthDimensionDto> = {}): Point[] => rounded(occt.shapes.vertex.getVerticesAsPoints({
        shape: occt.dimensions.simpleLinearLengthDimension({
            start: [0, 0, 0],
            end: [10, 0, 0],
            direction: [0, LINE_HEIGHT, 0],
            labelOverwrite: "F",
            labelSuffix: "",
            labelSize: 2,
            labelOffset: 3,
            crossingSize: 0.2,
            ...options,
        }),
    }));
    const labelOf = (points: Point[]): Point[] => points.filter(([, y]) => y > LINE_HEIGHT + LABEL_CLEARANCE);
    const spanOf = (values: number[]): number => Math.max(...values) - Math.min(...values);
    const readingOf = (label: Point[]): { stemOnTheLeft: boolean, armAtTheTop: boolean, footIsBare: boolean } => {
        const across = label.map(([x]) => x);
        const up = label.map(([, y]) => y);
        const width = spanOf(across);
        const height = spanOf(up);
        const leftEdge = label.filter(([x]) => x < Math.min(...across) + width * 0.1);
        const topEdge = label.filter(([, y]) => y > Math.max(...up) - height * 0.1);
        const bottomEdge = label.filter(([, y]) => y < Math.min(...up) + height * 0.1);
        return {
            stemOnTheLeft: spanOf(leftEdge.map(([, y]) => y)) > height * 0.9,
            armAtTheTop: spanOf(topEdge.map(([x]) => x)) > width * 0.5,
            footIsBare: spanOf(bottomEdge.map(([x]) => x)) < width * 0.3,
        };
    };

    it("should write a label that reads the right way round with the measured line to the right and the offset up", () => {
        // Act
        const label = labelOf(lengthAlongXOffsetAlongY());

        // Assert
        expect(label.every(([, , z]) => z === 0)).toBe(true);
        expect(readingOf(label)).toEqual({ stemOnTheLeft: true, armAtTheTop: true, footIsBare: true });
    });

    it.each([
        ["left-handed", leftHanded],
        ["right-handed", rightHanded],
    ])("should build the same dimension, label included, in a %s system", (_name, system) => {
        // Arrange
        const before = lengthAlongXOffsetAlongY();
        occHelper.base.settings = { coordinateSystem: system };

        // Act
        const dimension = lengthAlongXOffsetAlongY();

        // Assert
        expect(dimension).toEqual(before);
    });

    it.each([
        ["left-handed", leftHanded],
        ["right-handed", rightHanded],
    ])("should keep the label's flips doing what they did in a %s system", (_name, system) => {
        // Arrange
        const before = lengthAlongXOffsetAlongY({ labelFlipHorizontal: true, labelRotation: 30 });
        occHelper.base.settings = { coordinateSystem: system };

        // Act
        const dimension = lengthAlongXOffsetAlongY({ labelFlipHorizontal: true, labelRotation: 30 });

        // Assert
        expect(dimension).toEqual(before);
    });

    it.each([
        ["an angle", leftHanded, "angle"],
        ["an angle", rightHanded, "angle"],
        ["a pin", leftHanded, "pin"],
        ["a pin", rightHanded, "pin"],
    ] as const)("should build %s with its label as before in a %s system", (_name, system, kind) => {
        // Arrange
        const built = (): Point[] => rounded(occt.shapes.vertex.getVerticesAsPoints({
            shape: kind === "angle"
                ? occt.dimensions.simpleAngularDimension({ center: [0, 0, 0], direction1: [1, 0, 0], direction2: [0, 0, 1], radius: 4, offsetFromCenter: 0.5, extraSize: 0, decimalPlaces: 1, labelSuffix: " deg", labelSize: 0.3, labelOffset: 0.3, radians: false })
                : occt.dimensions.pinWithLabel({ startPoint: [0, 0, 0], endPoint: [0, 5, 2], direction: [0, 0, 1], label: "F", labelSize: 0.3, labelOffset: 0.3 }),
        }));
        const before = built();
        occHelper.base.settings = { coordinateSystem: system };

        // Act
        const dimension = built();

        // Assert
        expect(dimension).toEqual(before);
    });

    it("should tell a label the wrong way up apart, which labelFlipHorizontal makes it", () => {
        // Act
        const label = labelOf(lengthAlongXOffsetAlongY({ labelFlipHorizontal: true }));

        // Assert
        expect(readingOf(label)).toEqual({ stemOnTheLeft: true, armAtTheTop: false, footIsBare: false });
    });
});
