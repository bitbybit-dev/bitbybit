import { Inputs, Models } from "@bitbybit-dev/occt";

export class ShapeParser {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static parse(obj: unknown, partShapes: Models.OCCT.ShapeWithId<Inputs.OCCT.TopoDSShapePointer>[]): any {
        const stack: unknown[] = [obj];
        const visited = new Set<unknown>();

        while (stack.length > 0) {
            const current = stack.pop();

            if (typeof current !== "object" || current === null || visited.has(current)) {
                continue;
            }
            visited.add(current);
            if (Array.isArray(current)) {
                for (let i = 0; i < current.length; i++) {
                    stack.push(current[i]);
                }
            } else {
                const keys = Object.keys(current);

                if (keys.includes("shapes")) {
                    const shapes = (current as { shapes?: unknown }).shapes;

                    if (typeof shapes === "object" && shapes !== null) {
                        for (const key in shapes) {
                            const sh = (current as { shapes: Record<string, unknown> }).shapes[key];
                            if (sh) {
                                (current as { shapes: Record<string, unknown> }).shapes[key] = partShapes.find(s => s.id === (current as { shapes: Record<string, unknown> }).shapes[key])?.shape;
                            }
                        }
                    }
                }

                for (const key in current) {
                    stack.push((current as Record<string, unknown>)[key]);
                }
            }
        }

        return obj;
    }
}