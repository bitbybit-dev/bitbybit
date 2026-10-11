import { describe, it } from "node:test";
import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import rule from "./no-input-writes.mjs";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({ languageOptions: { parser: tseslint.parser } });

tester.run("no-input-writes", rule, {
    valid: [
        { name: "a default read into a local", code: "function f(inputs: { corners?: number }) { const corners = inputs.corners ?? 1; return corners; }" },
        { name: "a spread copy with a default", code: "function f(inputs: { tolerance?: number }) { return { ...inputs, tolerance: inputs.tolerance ?? 1e-4 }; }" },
        { name: "a write deeper into an engine object the caller handed over", code: "function f(inputs: { mesh: { position: number } }) { inputs.mesh.position = 1; }" },
        { name: "a write onto an object of another name", code: "function f(options: { a?: number }) { options.a = 1; }" },
    ],
    invalid: [
        { name: "an assignment", code: "function f(inputs: { a?: number }) { inputs.a = 1; }", errors: [{ messageId: "inputWrite", data: { property: "a" } }] },
        { name: "a logical assignment", code: "function f(inputs: { a?: number }) { inputs.a ??= 1; }", errors: [{ messageId: "inputWrite", data: { property: "a" } }] },
        { name: "an update", code: "function f(inputs: { a: number }) { inputs.a++; }", errors: [{ messageId: "inputWrite", data: { property: "a" } }] },
        { name: "a delete", code: "function f(inputs: { a?: number }) { delete inputs.a; }", errors: [{ messageId: "inputWrite", data: { property: "a" } }] },
        { name: "a computed property", code: "function f(inputs: Record<string, number>, key: string) { inputs[key] = 1; }", errors: [{ messageId: "inputWrite", data: { property: "key" } }] },
    ],
});
