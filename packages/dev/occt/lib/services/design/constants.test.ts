import { describe, it, expect } from "vitest";
import { DESIGN_SKETCH_PLANES } from "./constants";

describe("the base planes a sketch is drawn on", () => {
    it("should face along each world axis once, with the x axis lying in the plane", () => {
        // Arrange
        const planes = Object.values(DESIGN_SKETCH_PLANES);

        // Act
        const normals = planes.map(plane => plane.normal.join(",")).sort();
        const dots = planes.map(plane => plane.normal[0] * plane.direction[0] + plane.normal[1] * plane.direction[1] + plane.normal[2] * plane.direction[2]);

        // Assert
        expect(normals).toEqual(["0,0,1", "0,1,0", "1,0,0"]);
        expect(dots).toEqual([0, 0, 0]);
    });
});
