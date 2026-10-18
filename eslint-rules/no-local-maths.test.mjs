import { describe, it } from "node:test";
import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import rule from "./no-local-maths.mjs";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({ languageOptions: { parser: tseslint.parser } });
const finding = { messageId: "localMaths" };

tester.run("no-local-maths", rule, {
    valid: [
        { name: "a call of base's degree conversion", code: "const radians = math.degToRad({ number: angle });" },
        { name: "pi on its own", code: "const halfTurn = Math.PI; const turn = 2 * Math.PI;" },
        { name: "a sum of two unrelated products", code: "const area = width * height + depth * 2;" },
        { name: "products of different components", code: "const twisted = a[0] * b[1] + a[1] * b[0];" },
        { name: "a plain copy of a tuple", code: "const copy = [point[0], point[1], point[2]];" },
        { name: "a fallback per component, which is no arithmetic", code: "const filled = [values[0] ?? 0, values[1] ?? 0, values[2] ?? 0];" },
        { name: "components set apart", code: "const lifted = [point[0], point[1], height + 1];" },
        { name: "a square root of something other than squares", code: "const root = Math.sqrt(area / Math.PI);" },
        { name: "a domain function whose name says what it is", code: "function pitchRadius(module: number, teeth: number): number { return module * teeth / 2; }" },
        { name: "an arc cosine of a value nothing holds between -1 and 1", code: "const angle = Math.acos(ratio);" },
        { name: "a value held between 0 and 1, which is no cosine", code: "const angle = Math.acos(Math.min(1, Math.max(0, ratio)));" },
        { name: "a method named like maths, which is how a public service exposes it", code: "class Vector { dot(a: number[], b: number[]): number { return dot3(a, b); } }" },
        { name: "a 3x3 trace, which adds the diagonal of a matrix without multiplying it by anything", code: "const trace = m[0] + m[4] + m[8];" },
        { name: "a sum of one column of a column-major matrix with an offset", code: "const total = m[0] + m[4] + m[8] + m[12];" },
        { name: "a sum of squares of unrelated quantities, with no root taken", code: "const energy = mass * speed * speed + stiffness * stretch * stretch;" },
        { name: "the same component of two different points, which is no dot product", code: "const width = points[1][0] - points[0][0];" },
        { name: "a square root of a single square", code: "const size = Math.sqrt(side * side);" },
        { name: "hypot of values that are not a vector's components", code: "const diagonal = Math.hypot(width, height);" },
        { name: "a quarter turn, pi without degrees", code: "const quarter = Math.PI / 2;" },
        { name: "a share of 180 that is no angle", code: "const share = count / 180;" },
        { name: "different arithmetic on each component", code: "const moved = [p[0] + 1, p[1] * 2];" },
        { name: "a sign test on one product", code: "const sameSide = a[0] * b[0] > 0;" },
    ],
    invalid: [
        { name: "degrees to radians", code: "const radians = degrees * Math.PI / 180;", errors: [finding] },
        { name: "an angle from a cosine held between -1 and 1", code: "const angle = Math.acos(Math.max(-1, Math.min(1, cosine)));", errors: [finding] },
        { name: "the same clamp the other way round, with the bound last", code: "const angle = Math.acos(Math.min(Math.max(dot / length, -1.0), 1.0));", errors: [finding] },
        { name: "a constant for it", code: "const RADIANS_PER_DEGREE = Math.PI / 180;", errors: [finding] },
        { name: "degrees to radians through a named half turn", code: "const radians = angle / 2 * Math.PI / HALF_TURN;", errors: [finding] },
        { name: "radians to degrees", code: "const degrees = radians * 180 / Math.PI;", errors: [finding] },
        { name: "a dot product", code: "const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];", errors: [finding] },
        { name: "a dot product of 2D vectors with assertions", code: "const d = a[0]! * b[0]! + a[1]! * b[1]!;", errors: [finding] },
        { name: "a cross product", code: "const n = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];", errors: [finding] },
        { name: "a length", code: "const l = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);", errors: [finding] },
        { name: "a distance through hypot", code: "const l = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);", errors: [finding] },
        { name: "a vector sum", code: "const s = [a[0] + b[0], a[1] + b[1], a[2] + b[2]];", errors: [finding] },
        { name: "a scaled vector", code: "const s = [v[0] * k, v[1] * k];", errors: [finding] },
        { name: "an interpolation", code: "const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];", errors: [finding] },
        { name: "a point through a column-major matrix", code: "const x = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12];", errors: [finding] },
        { name: "a point through a column-major matrix by named coordinates", code: "const x = m[0] * px + m[4] * py + m[8] * pz + m[12];", errors: [finding] },
        { name: "a plane distance, a dot product less an offset", code: "const distance = n[0] * p[0] + n[1] * p[1] + n[2] * p[2] - d;", errors: [finding] },
        { name: "an offset plus a dot product of 2D vectors", code: "const reach = offset + a[0] * b[0] + a[1] * b[1];", errors: [finding] },
        { name: "a function named dot", code: "function dot(a: number[], b: number[]): number { return a.reduce((s, v, i) => s + v * b[i]!, 0); }", errors: [finding] },
        { name: "a vector sum named plus", code: "const plus = (a: number[], b: number[]): number[] => a.map((v, i) => v + b[i]!);", errors: [finding] },
        { name: "an arrow named polar", code: "const polar = (r: number, a: number): number[] => [r * Math.cos(a), r * Math.sin(a)];", errors: [finding] },
        { name: "degrees to radians with the factor in brackets", code: "const radians = angle * (Math.PI / 180);", errors: [finding] },
        { name: "a length of named components", code: "const length = Math.sqrt(dx * dx + dy * dy + dz * dz);", errors: [finding] },
        { name: "a plan length of components squared with **", code: "const length = Math.sqrt(x ** 2 + y ** 2);", errors: [finding] },
        { name: "a plan length through hypot of a vector's components", code: "const length = Math.hypot(v[0], v[1]);", errors: [finding] },
        { name: "a squared length, a vector dotted with itself", code: "const squared = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];", errors: [finding] },
        { name: "a midpoint", code: "const middle = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];", errors: [finding] },
        { name: "a point through a column-major matrix with assertions", code: "const x = m[0]! * px + m[4]! * py + m[8]! * pz + m[12]!;", errors: [finding] },
        { name: "a cross product with assertions", code: "const n = [a[1]! * b[2]! - a[2]! * b[1]!, a[2]! * b[0]! - a[0]! * b[2]!, a[0]! * b[1]! - a[1]! * b[0]!];", errors: [finding] },
        { name: "an arrow named lerp", code: "const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;", errors: [finding] },
    ],
});
