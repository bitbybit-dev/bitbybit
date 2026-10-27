import { describe, it, expect, beforeAll } from "vitest";
import { InputError } from "@bitbybit-dev/base";
import type { TopoDS_Edge } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import createBitbybitOcct from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";

describe("EdgesService", () => {
    let helper: OccHelper;

    beforeAll(async () => {
        helper = new OccHelper(await createBitbybitOcct());
    });

    const poleOfABall = (): TopoDS_Edge => {
        const ball = helper.solidsService.createSphere({ radius: 2, center: [0, 0, 0] });
        const ballFace = helper.shapeGettersService.getFaces({ shape: ball })[0]!;
        const edges = helper.shapeGettersService.getEdges({ shape: ballFace });
        [ball, ballFace, ...edges.slice(1)].forEach(each => each.delete());
        return edges[0]!;
    };

    describe("tangentOnEdgeAtLength", () => {
        it("should refuse the pole of a ball, which is a point with no curve to measure a length along", () => {
            // Arrange
            const shape = poleOfABall();

            // Act
            const act = (): unknown => helper.edgesService.tangentOnEdgeAtLength({ shape, length: 0.1 });

            // Assert
            expect(act).toThrow(new InputError("`shape` is a degenerate edge, a point with no curve such as the pole of a ball, so there is no length to measure along it.", "shape"));
            shape.delete();
        });

        it("should keep reading the tangent at a length along a straight edge", () => {
            // Arrange
            const shape = helper.edgesService.lineEdge({ start: [0, 0, 0], end: [4, 0, 0] });

            // Act
            const tangent = helper.edgesService.tangentOnEdgeAtLength({ shape, length: 1 });

            // Assert
            expect(tangent).toEqual([4, 0, 0]);
            shape.delete();
        });
    });
});
