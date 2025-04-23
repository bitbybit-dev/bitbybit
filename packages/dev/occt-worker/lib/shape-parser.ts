import { Inputs, Outputs } from "@bitbybit-dev/occt";

export class ShapeParser {
    static parse(obj, partShapes: Outputs.OCCT.ShapeWithId<Inputs.OCCT.TopoDSShapePointer>[]) {
        const stack = [obj];
        const visited = new Set();

        while (stack.length > 0) {
            const current = stack.pop();

            if (typeof current !== "object" || current === null || visited.has(current)) {
                continue; // Skip non-object values
            }
            visited.add(current);
            if (Array.isArray(current)) {
                for (let i = 0; i < current.length; i++) {
                    stack.push(current[i]); // Push array elements onto the stack
                }
            } else {
                const keys = Object.keys(current);

                if (keys.includes("shapes")) {
                    const shapes = current.shapes;

                    if (typeof shapes === "object" && shapes !== null) {
                        for (const key in shapes) {
                            const sh = current.shapes[key];
                            if (sh) {
                                current.shapes[key] = partShapes.find(s => s.id === current.shapes[key])?.shape;
                            }
                        }
                    }
                }

                for (const key in current) {
                    stack.push(current[key]); // Push object properties onto the stack
                }
            }
        }

        return obj;
    }
}