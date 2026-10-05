import { describe, it } from "node:test";
import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import rule from "./no-loose-comments.mjs";

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({ languageOptions: { parser: tseslint.parser } });
const STEPS = [{ allowArrangeActAssert: true }];
const NO_JSDOC = [{ jsDoc: "none" }];
const ASSEMBLED = [{ documentsAssembledDeclaration: true }];

tester.run("no-loose-comments", rule, {
    valid: [
        { name: "an exported class, its public members and its public constructor parameter", code: "/** A box. */\nexport class Box {\n    /** The width. */\n    width = 1;\n    /** Makes one. */\n    constructor(/** The name. */ public readonly name: string) {}\n    /** Grows it. */\n    grow(): void {}\n    /** Its area. */\n    get area(): number { return 1; }\n    /** Makes one. */\n    static make(): Box { return new Box(\"a\"); }\n}" },
        { name: "the protected members of an exported class, which its subclasses in other packages read", code: "export class DrawHelperCore {\n    /** Shared with subclasses. */\n    protected computeNormals(): number[] { return []; }\n    /** Its colour. */\n    protected readonly color = 1;\n    constructor(/** The vector service. */ protected readonly vector: number) {}\n}" },
        { name: "an exported interface and the members of an exported type", code: "/** A point. */\nexport interface Point {\n    /** Along X. */\n    x: number;\n    /** Moves it. */\n    move(): void;\n}\n/** A size. */\nexport type Size = {\n    /** How wide. */\n    width: number;\n};" },
        { name: "an exported enum and its members", code: "/** How it is drawn. */\nexport enum drawEnum {\n    /** As lines. */\n    lines = \"lines\",\n}" },
        { name: "the properties of an exported constant object", code: "/** The defaults. */\nexport const DEFAULTS = {\n    /** How fine. */\n    precision: 0.01,\n    nested: {\n        /** Deeper. */\n        depth: 1,\n    },\n} as const;" },
        { name: "a declaration exported by name further down", code: "/** Hidden until exported. */\nclass Later {\n    /** Its method. */\n    run(): void {}\n}\nexport { Later };" },
        { name: "an exported class inside an exported namespace", code: "export namespace Inputs {\n    /** A DTO. */\n    export class BoxDto {\n        /** The width. */\n        width = 1;\n    }\n}" },
        { name: "a DTO in an exported namespace: the class, its constructor and every public property with its tags", code: "export namespace OCCT {\n    /**\n     * A box and where it stands.\n     */\n    export class BoxDto {\n        /**\n         * Makes one.\n         */\n        constructor(width?: number) {\n            if (width !== undefined) { this.width = width; }\n        }\n        /**\n         * How wide.\n         * @default 1\n         * @minimum 0\n         * @step 0.1\n         */\n        width?: number | undefined = 1;\n        /**\n         * Where it stands.\n         * @default undefined\n         * @optional true\n         */\n        center?: number[] | undefined;\n    }\n}" },
        { name: "a DTO fragment exported at the top level", code: "/**\n * A shape to mesh.\n */\nexport class ShapeToMeshDto<T> {\n    /**\n     * The shape.\n     * @default undefined\n     */\n    shape!: T;\n}" },
        { name: "an exported function and its overloads", code: "/** One way. */\nexport function f(a: string): void;\n/** The other. */\nexport function f(a: number): void;\nexport function f(_a: string | number): void {}" },
        { name: "a type literal member of a public method's parameter", code: "export class Api {\n    run(inputs: {\n        /** The shape. */\n        shape: string;\n    }): void {}\n}" },
        { name: "the JSDoc of a declaration an assembler writes around a file that declares nothing", code: "/**\n * Every parameter object the kernel accepts.\n */\n", options: ASSEMBLED },
        { name: "tool directives and notices", code: "// eslint-disable-next-line no-console\nconsole.log(1);\n/* istanbul ignore next */\nconst a = 1;\n// @ts-expect-error a test of the rule\nconst b: string = a;\n/* Copyright 2026 the authors */\nexport { b };" },
        { name: "a hashbang", code: "#!/usr/bin/env node\nexport const a = 1;" },
        { name: "the three step markers of a test", code: "it(\"works\", () => {\n    // Arrange\n    const a = 1;\n    // Act\n    const b = a + 1;\n    // Assert\n    expect(b).toBe(2);\n});", options: STEPS },
        { name: "a line the configuration names as a tool marker", code: "export class Api {\n    // after design.build\n    run(): void {}\n}", options: [{ allowLines: ["^ (replaces|after) [\\w.]+$"] }] },
    ],
    invalid: [
        { name: "a free-form line comment", code: "const a = 1; // the width\nexport { a };", errors: [{ messageId: "loose" }] },
        { name: "a block comment beside the logic", code: "/* wide */ export const a = 1;", errors: [{ messageId: "loose" }] },
        { name: "a note inside an empty block", code: "try { run(); } catch {\n    // nothing to do\n}", errors: [{ messageId: "loose" }] },
        { name: "JSDoc on a function nothing exports", code: "/** Helps. */\nfunction helper(): void {}\nhelper();", errors: [{ messageId: "notPublic" }] },
        { name: "JSDoc on the private and hash-private members of an exported class", code: "export class Box {\n    /** Hidden. */\n    private a = 1;\n    /** Truly private. */\n    #c = 3;\n}", errors: [{ messageId: "notPublic" }, { messageId: "notPublic" }] },
        { name: "JSDoc on a private constructor parameter", code: "export class Box {\n    constructor(/** Kept inside. */ private readonly size: number) {}\n}", errors: [{ messageId: "notPublic" }] },
        { name: "JSDoc on a member of a class nothing exports", code: "class Inner {\n    /** Runs. */\n    run(): void {}\n}\nnew Inner().run();", errors: [{ messageId: "notPublic" }] },
        { name: "JSDoc inside a function body", code: "export function f(): number {\n    /** The answer. */\n    const answer = 42;\n    return answer;\n}", errors: [{ messageId: "notPublic" }] },
        { name: "JSDoc inside a namespace nothing exports", code: "namespace Hidden {\n    /** A class. */\n    export class A {}\n}\nexport const a = Hidden.A;", errors: [{ messageId: "notPublic" }] },
        { name: "an earlier JSDoc block stacked above the one that documents", code: "/** Stale. */\n/** Current. */\nexport function f(): void {}", errors: [{ messageId: "stacked" }] },
        { name: "JSDoc anywhere when the configuration allows none", code: "/** Exported, but this code is no package API. */\nexport function f(): void {}", options: NO_JSDOC, errors: [{ messageId: "notPublic" }] },
        { name: "a note in a test beyond the step markers", code: "it(\"works\", () => {\n    // Arrange - a box\n    const a = 1;\n    expect(a).toBe(1);\n});", options: STEPS, errors: [{ messageId: "looseInTest" }] },
        { name: "JSDoc in a file that declares nothing, without the option", code: "/**\n * Every parameter object the kernel accepts.\n */\n", errors: [{ messageId: "notPublic" }] },
        { name: "JSDoc on a non-public function in a file the option covers, once it declares something", code: "/** Helps. */\nfunction helper(): void {}\nhelper();", options: ASSEMBLED, errors: [{ messageId: "notPublic" }] },
        { name: "a free-form comment in a file the option covers", code: "// the namespace\n", options: ASSEMBLED, errors: [{ messageId: "loose" }] },
        { name: "a marker line the configuration does not name", code: "export class Api {\n    // after design.build\n    run(): void {}\n}", errors: [{ messageId: "loose" }] },
    ],
});
