import { describe, expect, it } from "vitest";
import { dinParallelKeySizes } from "./din-keys";

describe("din keys", () => {
    describe("parallel keys", () => {
        it("should give a millimetre shaft rounded in inches the key of the millimetres it is, at the ends of a key's range too", () => {
            // Act
            const widths = [0.866142, 0.314961, 0.157480315 * 2].map(diameter => dinParallelKeySizes(diameter, "in").width);

            // Assert
            expect(widths).toEqual([6 / 25.4, 2 / 25.4, 2 / 25.4].map(width => expect.closeTo(width, 9)));
        });

        it("should key a 25 shaft with an 8 by 7 key, 4 deep in the shaft and 3.3 in the hub, and refuse shafts outside the table", () => {
            // Act & Assert
            expect(dinParallelKeySizes(25, "mm")).toEqual({ width: 8, height: 7, shaftDepth: 4, hubDepth: 3.3 });
            expect(dinParallelKeySizes(22, "mm").width).toBe(6);
            expect(() => dinParallelKeySizes(6, "mm")).toThrow("`shaftDiameter`");
            expect(() => dinParallelKeySizes(70, "mm")).toThrow("`shaftDiameter`");
        });

        it("should key a one inch shaft as a 25.4 mm one, give the key in inches and name the table's ends in inches", () => {
            // Act
            const key = dinParallelKeySizes(1, "in");

            // Assert
            expect(key).toEqual({ width: 0.31496063, height: 0.275590551, shaftDepth: 0.157480315, hubDepth: 0.129921260 });
            expect(() => dinParallelKeySizes(3, "in")).toThrow("`shaftDiameter` is not more than 0.236220472 and at most 2.559055118.");
        });
    });
});
