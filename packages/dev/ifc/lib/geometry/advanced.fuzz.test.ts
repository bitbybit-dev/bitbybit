import fc from "fast-check";
import { describe, expect, it } from "vitest";
import type { Base } from "@bitbybit-dev/base";
import { modelOf } from "../api/services/service-support";
import { withContext } from "../__test__/geometry-fixtures";
import { formatReal } from "../step/numbers";
import { ItemConverter } from "./items";
import { RecipeBuilder } from "./recipe-builder";

const SEED = 1492;
const RUNS = 40;
const REACH = 1e7;
const IDENTITY: Base.TransformMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const PROJECT_ROWS = ["#90=IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.);", "#91=IFCUNITASSIGNMENT((#90));", "#92=IFCPROJECT('0YvctVUKr0kugbFTf53O9L',$,'Project',$,$,$,$,(#3),#91);"];
const STEPS_FROM_EQUATOR_TO_POLE = 8;
const QUARTER_TURN_CUT_HEIGHTS = [0, 0.19509, 0.382683, 0.55557, 0.707107, 0.83147, 0.92388, 0.980785];
const MILLIONTHS = 1e6;
const MERIDIAN_ROUNDING = 64e-12;
const AWAY_FROM_POLE = 1e-6;

class Rows {
    readonly rows: string[] = [...PROJECT_ROWS];
    private next = 100;

    add(text: string): number {
        const id = this.next++;
        this.rows.push(`#${id}=${text};`);
        return id;
    }

    point(point: readonly number[]): number {
        return this.add(`IFCCARTESIANPOINT((${point.map(formatReal).join(",")}))`);
    }

    placement(origin: Base.Point3): number {
        return this.add(`IFCAXIS2PLACEMENT3D(#${this.point(origin)},$,$)`);
    }
}

function upperHalfSphere(centre: Base.Point3, radius: number): { rows: string[]; item: number } {
    const rows = new Rows();
    const start = rows.add(`IFCVERTEXPOINT(#${rows.point([centre[0] + radius, centre[1], centre[2]])})`);
    const equator = rows.add(`IFCEDGECURVE(#${start},#${start},#${rows.add(`IFCCIRCLE(#${rows.placement(centre)},${formatReal(radius)})`)},.T.)`);
    const loop = rows.add(`IFCEDGELOOP((#${rows.add(`IFCORIENTEDEDGE(*,*,#${equator},.T.)`)}))`);
    const sphere = rows.add(`IFCSPHERICALSURFACE(#${rows.placement(centre)},${formatReal(radius)})`);
    const face = rows.add(`IFCADVANCEDFACE((#${rows.add(`IFCFACEOUTERBOUND(#${loop},.T.)`)}),#${sphere},.T.)`);
    const item = rows.add(`IFCSHELLBASEDSURFACEMODEL((#${rows.add(`IFCOPENSHELL((#${face}))`)}))`);
    return { rows: rows.rows, item };
}

function meshPositions(rows: readonly string[], item: number): number[] {
    const builder = new RecipeBuilder();
    const converter = new ItemConverter(modelOf(withContext(rows)), builder, REACH);
    builder.root({ node: converter.item(item), matrix: IDENTITY, tag: {} });
    const recipe = builder.build(1, 0.001);
    const node = recipe.nodes.at(-1);
    if (node?.op !== "triangles") {
        throw new Error("not a triangle mesh");
    }
    return [...recipe.buffers.f64.slice(node.positions[0], node.positions[0] + node.positions[1])];
}

function heightsOnStartMeridian(centre: Base.Point3, radius: number): number[] {
    const { rows, item } = upperHalfSphere(centre, radius);
    const positions = meshPositions(rows, item);
    const rounding = MERIDIAN_ROUNDING * Math.max(1, radius, ...centre.map(Math.abs));
    const heights = new Set<number>();
    for (let at = 0; at + 2 < positions.length; at += 3) {
        if (Math.abs(positions[at + 1]! - centre[1]) <= rounding && positions[at]! - centre[0] > AWAY_FROM_POLE * radius) {
            heights.add(Math.round(((positions[at + 2]! - centre[2]) / radius) * MILLIONTHS) / MILLIONTHS);
        }
    }
    return [...heights].sort((a, b) => a - b);
}

describe("the cut from a half sphere's equator to its pole", () => {
    it.each([
        [[0, 0, 0], 3],
        [[0, 0, 0], 0.7],
        [[0, 0, 0], 10000],
        [[1, 0, 0], 0.25],
        [[1, 0, 0], 50],
        [[0, 0, 1], 0.5],
        [[10, 0, 0], 2],
        [[1000, 0, 0], 0.01],
        [[1000, 0, 0], 1000],
    ])("should take 8 steps, one per 1/32 of a turn, for a sphere at %j of radius %d, whose normals' rounding once tipped the count to 9", (centre, radius) => {
        // Arrange
        const at: Base.Point3 = [centre[0]!, centre[1]!, centre[2]!];

        // Act
        const heights = heightsOnStartMeridian(at, radius);

        // Assert
        expect(heights).toEqual(QUARTER_TURN_CUT_HEIGHTS);
    });

    it("should take 8 steps for a half sphere of any radius placed anywhere within a million units of the origin", () => {
        // Arrange
        const coordinate = fc.double({ min: -1e6, max: 1e6, noNaN: true });
        const property = fc.property(fc.tuple(coordinate, coordinate, coordinate), fc.double({ min: 1e-3, max: 1e5, noNaN: true }), (centre, radius) => heightsOnStartMeridian(centre, radius).length === STEPS_FROM_EQUATOR_TO_POLE);

        // Act & Assert
        fc.assert(property, { seed: SEED, numRuns: RUNS });
    });
});
