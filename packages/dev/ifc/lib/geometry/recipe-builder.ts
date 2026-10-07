import type { Base } from "@bitbybit-dev/base";

const INITIAL_NUMBERS = 1024;

function grown<T extends Float64Array | Int32Array>(buffer: T, needed: number, make: (size: number) => T): T {
    if (needed <= buffer.length) {
        return buffer;
    }
    let size = buffer.length;
    while (size < needed) {
        size *= 2;
    }
    const next = make(size);
    next.set(buffer);
    return next;
}

export class RecipeBuilder {
    private readonly nodes: Base.RecipeNode[] = [];
    private readonly roots: Base.RecipeRoot[] = [];
    private f64 = new Float64Array(INITIAL_NUMBERS);
    private i32 = new Int32Array(INITIAL_NUMBERS);
    private f64Length = 0;
    private i32Length = 0;

    numbers(values: readonly number[]): Base.RecipeRange {
        this.f64 = grown(this.f64, this.f64Length + values.length, (size) => new Float64Array(size));
        this.f64.set(values, this.f64Length);
        const range: Base.RecipeRange = [this.f64Length, values.length];
        this.f64Length += values.length;
        return range;
    }

    indices(values: readonly number[]): Base.RecipeRange {
        this.i32 = grown(this.i32, this.i32Length + values.length, (size) => new Int32Array(size));
        this.i32.set(values, this.i32Length);
        const range: Base.RecipeRange = [this.i32Length, values.length];
        this.i32Length += values.length;
        return range;
    }

    node(node: Base.RecipeNode): number {
        this.nodes.push(node);
        return this.nodes.length - 1;
    }

    root(root: Base.RecipeRoot): void {
        this.roots.push(root);
    }

    build(millimetresPerUnit: number, tolerance: number): Base.Recipe {
        return {
            format: "bitbybit.recipe",
            version: 1,
            millimetresPerUnit,
            tolerance,
            buffers: { f64: this.f64.slice(0, this.f64Length), i32: this.i32.slice(0, this.i32Length) },
            nodes: this.nodes,
            roots: this.roots,
        };
    }
}
