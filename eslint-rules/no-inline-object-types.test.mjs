import { describe, it } from "node:test";
import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import rule from "./no-inline-object-types.mjs";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({ languageOptions: { parser: tseslint.parser } });

tester.run("no-inline-object-types", rule, {
    valid: [
        { name: "an interface", code: "interface Placement { matrix: number[]; at?: string; }" },
        { name: "a type alias of an object", code: "type Placement = { matrix: number[] };" },
        { name: "the members of a named union", code: "type Token = { kind: \"number\"; value: number } | { kind: \"name\"; name: string };" },
        { name: "the members of a named intersection, a union inside it included", code: "type Outcome = ({ kind: \"body\" } | { kind: \"sketch\" }) & { rebinds?: string[] };" },
        { name: "a named type in a signature", code: "interface Found { index: number; }\nfunction find(): Found { return { index: 0 }; }" },
        { name: "an object value, which is no type", code: "const found = { index: 0 };" },
    ],
    invalid: [
        { name: "a return type", code: "function find(): { index: number } { return { index: 0 }; }", errors: [{ messageId: "inline" }] },
        { name: "a parameter type", code: "function place(at: { x: number }): void {}", errors: [{ messageId: "inline" }] },
        { name: "a generic argument", code: "const trees = new Map<string, { tree: string }>();", errors: [{ messageId: "inline" }] },
        { name: "a member's type inside an interface", code: "interface Run { choice: { configuration?: string } }", errors: [{ messageId: "inline" }] },
        { name: "an object nested in a named alias", code: "type Run = { choice: { configuration?: string } };", errors: [{ messageId: "inline" }] },
        { name: "a type predicate", code: "function isBody(value: unknown): value is { body: string } { return true; }", errors: [{ messageId: "inline" }] },
        { name: "an alias of a generic over an object", code: "type Planes = Record<string, { normal: number[] }>;", errors: [{ messageId: "inline" }] },
        { name: "a union in a signature", code: "function pieces(): ({ text: string } | { expression: string })[] { return []; }", errors: [{ messageId: "inline" }, { messageId: "inline" }] },
    ],
});
