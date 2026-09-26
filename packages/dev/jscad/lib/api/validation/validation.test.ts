import { describe, it, expect } from "vitest";
import { resolveInputs, validateInputs } from "@bitbybit-dev/base";
import { jscadDtoRegistry } from "../dto-registry";
import { jscadDtoRules } from "./index";

const issuesOf = (path: string, inputs: object) => validateInputs(jscadDtoRegistry, path, resolveInputs(jscadDtoRegistry, path, inputs), jscadDtoRules);

const rows: [string, object, object, string][] = [
    ["shapes.roundedCuboid", { width: 2, length: 3, height: 4, roundRadius: 0.9 }, { width: 2, length: 3, height: 4, roundRadius: 1 }, "must be less than half of the smallest side"],
    ["shapes.roundedCuboidsOnCenterPoints", { centers: [[0, 0, 0]], roundRadius: 0.4 }, { centers: [[0, 0, 0]], roundRadius: 0.5 }, "must be less than half of the smallest side"],
    ["shapes.roundedCylinder", { height: 2, radius: 1, roundRadius: 0.5 }, { height: 1, radius: 1, roundRadius: 0.5 }, "must be less than half of the height"],
    ["shapes.roundedCylinder", { height: 4, radius: 1, roundRadius: 0.9 }, { height: 4, radius: 1, roundRadius: 1 }, "must be less than radius"],
    ["shapes.roundedCylindersOnCenterPoints", { centers: [[0, 0, 0]], roundRadius: 0.4 }, { centers: [[0, 0, 0]], roundRadius: 0.5 }, "must be less than half of the height"],
];

describe("the JSCAD input rules", () => {
    it.each(rows)("%s should pass a rounding that fits", (path, fine) => {
        // Act
        const issues = issuesOf(path, fine);

        // Assert
        expect(issues).toEqual([]);
    });

    it.each(rows)("%s should report a rounding that does not fit", (path, _fine, wrong, message) => {
        // Act
        const issues = issuesOf(path, wrong);

        // Assert
        expect(issues).toContainEqual(expect.objectContaining({ property: "roundRadius", code: "less-than", message }));
    });
});
