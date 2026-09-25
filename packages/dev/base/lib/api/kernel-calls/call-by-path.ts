const UNREACHABLE_SEGMENTS = new Set(["", "__proto__", "prototype", "constructor"]);

/**
 * Calls the method a dotted path names under `root`, with `inputs` as its one argument:
 * `"shapes.solid.createBox"` calls `root.shapes.solid.createBox(inputs)`, with the owning object as
 * `this`. Any depth is walked.
 * @param root - The object the path starts from
 * @param path - The dotted path of the method
 * @param inputs - The single argument the method receives
 * @returns What the method returns
 * @throws Error when a segment is empty or reaches an object's prototype machinery, when a segment
 * on the way is not an object, or when the last one is not a method
 */
export function callByPath(root: object, path: string, inputs: unknown): unknown {
    const segments = path.split(".");
    const unreachable = segments.find((segment) => UNREACHABLE_SEGMENTS.has(segment));
    if (unreachable !== undefined) {
        throw new Error(`Cannot resolve "${path}": "${unreachable}" is not a segment an operation path may contain`);
    }
    let owner: unknown = root;
    let reached = "";
    for (const segment of segments.slice(0, -1)) {
        if (owner === null || typeof owner !== "object") {
            throw new Error(`Cannot resolve "${path}": "${reached}" is not an object`);
        }
        owner = (owner as Record<string, unknown>)[segment];
        reached = reached ? `${reached}.${segment}` : segment;
    }
    if (owner === null || typeof owner !== "object") {
        throw new Error(`Cannot resolve "${path}": "${reached}" is not an object`);
    }
    const method = (owner as Record<string, unknown>)[segments[segments.length - 1]!];
    if (typeof method !== "function") {
        throw new Error(`"${path}" is not a function`);
    }
    return method.call(owner, inputs);
}
