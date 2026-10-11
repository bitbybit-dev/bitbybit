import type { CircleRegion, PolygonRegion, ProfileRegion } from "./geometry-types";
import type { RecipeBuilder } from "./recipe-builder";

function flat(points: readonly (readonly number[])[]): number[] {
    return points.flatMap(([x, y]) => [x!, y!]);
}

export function profileNode(builder: RecipeBuilder, region: PolygonRegion | CircleRegion, radius = region.kind === "circle" ? region.radius : 0): number {
    if (region.kind === "circle") {
        return builder.node({ op: "circle", center: region.center, radius });
    }
    return builder.node({ op: "polygon", points: builder.numbers(flat(region.outer)), holes: region.holes.map((hole) => builder.numbers(flat(hole))) });
}

export function regionSolid(builder: RecipeBuilder, region: ProfileRegion, make: (profile: number, part: PolygonRegion | CircleRegion) => number): number {
    switch (region.kind) {
        case "composite": {
            const parts = region.parts.map((part) => regionSolid(builder, part, make));
            return parts.length === 1 ? parts[0]! : builder.node({ op: "compound", of: parts });
        }
        case "circle": {
            const solid = make(profileNode(builder, region), region);
            if (!(region.innerRadius > 0)) {
                return solid;
            }
            return builder.node({ op: "difference", of: solid, tools: [make(profileNode(builder, region, region.innerRadius), region)] });
        }
        default:
            return make(profileNode(builder, region), region);
    }
}
