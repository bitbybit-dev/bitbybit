import type * as Manifold3D from "manifold-3d";
import type { Base } from "@bitbybit-dev/base";
import type { Built } from "./recipe-types";

const UNIT_HEIGHT = 1;
const POSITION_PROPERTIES = 3;
const FILL_RULE: Manifold3D.FillRule = "NonZero";

function isHalfSpace(value: Built | undefined): value is Base.RecipeHalfSpaceNode {
    return typeof value === "object" && value !== null && "op" in value;
}

function release(value: Built | undefined): void {
    if (value && !isHalfSpace(value)) {
        try {
            value.delete();
        } catch {
        }
    }
}

function asError(thrown: unknown, subject: string): Error {
    return thrown instanceof Error ? thrown : new Error(`${subject} could not be built: the kernel stopped on an error it did not describe`, { cause: thrown });
}

function rootSubject(root: Base.RecipeRoot, index: number): string {
    return `Recipe node ${root.node}, placed by root ${index},`;
}

function expectNoError(status: Manifold3D.ErrorStatus, root: Base.RecipeRoot, index: number): void {
    if (status !== "NoError") {
        throw new Error(`${rootSubject(root, index)} could not be built: the kernel reports '${status}'`);
    }
}

function inputsOf(node: Base.RecipeNode): readonly number[] {
    switch (node.op) {
        case "extrude":
            return [node.profile];
        case "difference":
            return [node.of, ...node.tools];
        case "transform":
            return [node.of];
        case "voids":
            return [node.host, ...node.openings];
        case "compound":
            return node.of;
        default:
            return [];
    }
}

function negatedWithoutNegativeZero(value: number): number {
    return 0 - value;
}

function turnedZtoY(matrix: Base.TransformMatrix): Manifold3D.Mat4 {
    const [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p] = matrix;
    return [
        a, c, negatedWithoutNegativeZero(b), d,
        e, g, negatedWithoutNegativeZero(f), h,
        i, k, negatedWithoutNegativeZero(j), l,
        m, o, negatedWithoutNegativeZero(n), p,
    ];
}

function isClockwise(ring: readonly Manifold3D.Vec2[]): boolean {
    let twiceArea = 0;
    for (let at = 0, previous = ring.length - 1; at < ring.length; previous = at++) {
        twiceArea += ring[previous]![0] * ring[at]![1] - ring[at]![0] * ring[previous]![1];
    }
    return twiceArea < 0;
}

class RecipeExecutor {
    private readonly built: (Built | undefined)[] = [];
    private readonly failed = new Set<number>();

    constructor(
        private readonly wasm: Manifold3D.ManifoldToplevel,
        private readonly recipe: Base.Recipe,
        private readonly circularSegments: number,
        private readonly adjustZtoY: boolean,
        private readonly emptyWhenFailed: boolean,
    ) {
    }

    run(): Manifold3D.Manifold[] {
        const results: Manifold3D.Manifold[] = [];
        try {
            this.recipe.nodes.forEach((node, index) => {
                if (this.failed.size && inputsOf(node).some((input) => this.failed.has(input))) {
                    this.skip(index);
                    return;
                }
                try {
                    this.built.push(this.build(node, index));
                } catch (thrown) {
                    if (!this.emptyWhenFailed) {
                        throw asError(thrown, `Recipe node ${index}`);
                    }
                    this.skip(index);
                }
            });
            this.recipe.roots.forEach((root, index) => {
                results.push(this.failed.has(root.node) ? this.wasm.Manifold.compose([]) : this.placed(root, index));
            });
            return results;
        } catch (error) {
            results.forEach(release);
            throw error;
        } finally {
            this.built.forEach(release);
        }
    }

    private skip(index: number): void {
        this.built.push(undefined);
        this.failed.add(index);
    }

    private placed(root: Base.RecipeRoot, index: number): Manifold3D.Manifold {
        let placed: Manifold3D.Manifold | undefined;
        try {
            placed = this.solid(root.node).transform(this.adjustZtoY ? turnedZtoY(root.matrix) : root.matrix);
            expectNoError(placed.status(), root, index);
            return placed;
        } catch (thrown) {
            release(placed);
            if (!this.emptyWhenFailed) {
                throw asError(thrown, rootSubject(root, index));
            }
            return this.wasm.Manifold.compose([]);
        }
    }

    private solid(index: number): Manifold3D.Manifold {
        return this.built[index] as Manifold3D.Manifold;
    }

    private ring(range: Base.RecipeRange): Manifold3D.Vec2[] {
        const values = this.recipe.buffers.f64.subarray(range[0], range[0] + range[1]);
        const points: Manifold3D.Vec2[] = [];
        for (let at = 0; at + 1 < values.length; at += 2) {
            points.push([values[at]!, values[at + 1]!]);
        }
        return points;
    }

    private counterClockwiseRing(range: Base.RecipeRange): Manifold3D.Vec2[] {
        const points = this.ring(range);
        return isClockwise(points) ? points.reverse() : points;
    }

    private build(node: Base.RecipeNode, index: number): Built {
        switch (node.op) {
            case "polygon":
                return this.polygon(node);
            case "circle": {
                const circle = this.wasm.CrossSection.circle(node.radius, this.circularSegments);
                try {
                    return circle.translate(node.center);
                } finally {
                    circle.delete();
                }
            }
            case "extrude":
                return this.extrude(node);
            case "halfSpace":
                return node;
            case "difference":
                return this.difference(node);
            case "transform":
                return this.solid(node.of).transform(node.matrix);
            case "voids":
                return this.voids(node);
            case "triangles":
                return this.triangles(node, index);
            case "compound":
                return this.wasm.Manifold.union(node.of.map((child) => this.solid(child)));
        }
    }

    private polygon(node: Base.RecipePolygonNode): Manifold3D.CrossSection {
        const { CrossSection } = this.wasm;
        const outline = new CrossSection([this.ring(node.points)], FILL_RULE);
        if (node.holes.length === 0) {
            return outline;
        }
        try {
            const holes = new CrossSection(node.holes.map((hole) => this.counterClockwiseRing(hole)), FILL_RULE);
            try {
                return outline.subtract(holes);
            } finally {
                holes.delete();
            }
        } finally {
            outline.delete();
        }
    }

    private extrude(node: Base.RecipeExtrudeNode): Manifold3D.Manifold {
        const swept = (this.built[node.profile] as Manifold3D.CrossSection).extrude(UNIT_HEIGHT);
        const [dx, dy, dz] = node.direction;
        const scale = node.depth / Math.hypot(dx, dy, dz);
        try {
            return swept.transform([1, 0, 0, 0, 0, 1, 0, 0, dx * scale, dy * scale, dz * scale, 0, 0, 0, 0, 1]);
        } finally {
            swept.delete();
        }
    }

    private cut(solid: Manifold3D.Manifold, tool: Built | undefined): Manifold3D.Manifold {
        if (isHalfSpace(tool)) {
            const [nx, ny, nz] = tool.normal;
            const length = Math.hypot(nx, ny, nz);
            const offset = (nx * tool.origin[0] + ny * tool.origin[1] + nz * tool.origin[2]) / length;
            return solid.trimByPlane([-nx / length, -ny / length, -nz / length], -offset);
        }
        return solid.subtract(tool as Manifold3D.Manifold);
    }

    private difference(node: Base.RecipeDifferenceNode): Manifold3D.Manifold {
        let current = this.cut(this.solid(node.of), this.built[node.tools[0]!]);
        for (let at = 1; at < node.tools.length; at++) {
            const previous = current;
            try {
                current = this.cut(previous, this.built[node.tools[at]!]);
            } finally {
                previous.delete();
            }
        }
        return current;
    }

    private voids(node: Base.RecipeVoidsNode): Manifold3D.Manifold {
        const host = this.solid(node.host);
        if (node.openings.length === 0) {
            return host.translate([0, 0, 0]);
        }
        const openings = this.wasm.Manifold.union(node.openings.map((opening) => this.solid(opening)));
        try {
            return host.subtract(openings);
        } finally {
            openings.delete();
        }
    }

    private triangles(node: Base.RecipeTrianglesNode, index: number): Manifold3D.Manifold {
        const positions = this.recipe.buffers.f64.subarray(node.positions[0], node.positions[0] + node.positions[1]);
        const indices = this.recipe.buffers.i32.subarray(node.indices[0], node.indices[0] + node.indices[1]);
        const mesh = new this.wasm.Mesh({ numProp: POSITION_PROPERTIES, vertProperties: Float32Array.from(positions), triVerts: Uint32Array.from(indices) });
        mesh.merge();
        try {
            return this.wasm.Manifold.ofMesh(mesh);
        } catch (error) {
            throw new Error(`Recipe node ${index} is a triangle mesh that is not closed, so it cannot be built as a solid`, { cause: error });
        }
    }
}

export function executeRecipe(wasm: Manifold3D.ManifoldToplevel, recipe: Base.Recipe, circularSegments: number, adjustZtoY: boolean, emptyWhenFailed: boolean): Manifold3D.Manifold[] {
    return new RecipeExecutor(wasm, recipe, circularSegments, adjustZtoY, emptyWhenFailed).run();
}
