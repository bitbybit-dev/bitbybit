import { describe, expect, it } from "vitest";
import * as Inputs from "../../../../inputs";
import { lineTypeOfDashes } from "./svg-dash-patterns";

const noUnit = (): number | undefined => undefined;

describe("lineTypeOfDashes", () => {
    it.each([
        [[0.8, 0.15, 0.15, 0.15], Inputs.IO.lineTypeEnum.center],
        [[0, 3], Inputs.IO.lineTypeEnum.dotted],
        [[80, 15, 15, 15, 80, 15, 15, 15], Inputs.IO.lineTypeEnum.center],
        [[4.002, 1.998], Inputs.IO.lineTypeEnum.dashed],
    ])("should match %j to its line type by ratio, at any scale and repeated", (dashes, lineType) => {
        // Act
        const matched = lineTypeOfDashes(dashes, noUnit);

        // Assert
        expect(matched).toBe(lineType);
    });

    it("should match no line type to a pattern of other ratios", () => {
        // Act
        const matched = [[5, 1], [4, 2, 1, 2], [4, 1.9], [1, 2, 3, 1, 2, 3]].map(dashes => lineTypeOfDashes(dashes, noUnit));

        // Assert
        expect(matched).toEqual([undefined, undefined, undefined, undefined]);
    });

    it("should choose between dashed and hidden, which share their ratio, by the pattern unit nearer the drawing's", () => {
        // Act
        const dashed = lineTypeOfDashes([4, 2], () => 1);
        const hidden = lineTypeOfDashes([4, 2], () => 2);
        const between = lineTypeOfDashes([4, 2], () => 1.4);

        // Assert
        expect([dashed, hidden, between]).toEqual([Inputs.IO.lineTypeEnum.dashed, Inputs.IO.lineTypeEnum.hidden, Inputs.IO.lineTypeEnum.dashed]);
    });

    it("should measure the drawing only when two line types match, and take the first when it cannot", () => {
        // Arrange
        let measured = 0;
        const counted = (): number | undefined => {
            measured++;
            return undefined;
        };

        // Act
        const center = lineTypeOfDashes([8, 1.5, 1.5, 1.5], counted);
        const tied = lineTypeOfDashes([4, 2], counted);

        // Assert
        expect([center, tied, measured]).toEqual([Inputs.IO.lineTypeEnum.center, Inputs.IO.lineTypeEnum.dashed, 1]);
    });
});
