import { describe, it } from "node:test";
import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import rule from "./no-double-assertion.mjs";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({ languageOptions: { parser: tseslint.parser } });

tester.run("no-double-assertion", rule, {
    valid: [
        { name: "a single assertion", code: "const a = value as Shape;" },
        { name: "an assertion through a type that is not a widening one", code: "const a = value as Base as Shape;" },
        { name: "a predicate instead of an assertion", code: "function isShape(x: unknown): x is Shape { return typeof x === \"object\"; }" },
    ],
    invalid: [
        { name: "through unknown", code: "const a = value as unknown as Shape;", errors: [{ messageId: "doubleAssertion", data: { via: "unknown", target: "Shape" } }] },
        { name: "through any", code: "const a = value as any as Shape;", errors: [{ messageId: "doubleAssertion", data: { via: "any", target: "Shape" } }] },
        { name: "the angle-bracket form", code: "const a = <Shape><unknown>value;", errors: [{ messageId: "doubleAssertion", data: { via: "unknown", target: "Shape" } }] },
        { name: "an angle bracket inside an as", code: "const a = (<unknown>value) as Shape;", errors: [{ messageId: "doubleAssertion", data: { via: "unknown", target: "Shape" } }] },
    ],
});
