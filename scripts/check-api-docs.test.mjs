import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import ts from "typescript";
import { ROOT } from "./lib/surface.mjs";

const INPUTS_FILE = path.join(ROOT, "packages/dev/fixture/lib/api/inputs/fixture-inputs.ts");
const OTHER_INPUTS_FILE = path.join(ROOT, "packages/dev/fixture/lib/api/inputs/other-inputs.ts");
const LIB_FILE = path.join(ROOT, "packages/dev/fixture/lib/api/services/fixture.ts");

let instances = 0;
const freshAudit = () => import(`./check-api-docs.mjs?instance=${++instances}`);

const sourceOf = (file, text) => ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);

const auditOf = async (inputs, lib = "") => {
    const audit = await freshAudit();
    audit.collectInputs([sourceOf(INPUTS_FILE, inputs)], [sourceOf(LIB_FILE, lib)]);
    audit.checkDtos();
    return audit;
};

const auditOfFiles = async (inputsByFile, lib = "") => {
    const audit = await freshAudit();
    audit.collectInputs(inputsByFile.map(([file, text]) => sourceOf(file, text)), [sourceOf(LIB_FILE, lib)]);
    audit.checkDtos();
    return audit;
};

const reported = (audit, rule) => audit.findings.filter((f) => f.rule === rule).map((f) => `${f.path}: ${f.message}`);

const boxWith = (property) => `export class BoxDto {\n${property}\n}\n`;

const takingBox = "export function makeBox(inputs: BoxDto): number { return 0; }\n";

describe("default-needs-initializer", () => {
    it("should report a default value only the JSDoc holds", async () => {
        // Arrange
        const tagOnly = boxWith("    /**\n     * Width in model units.\n     * @default 1\n     */\n    width?: number | undefined;");

        // Act
        const audit = await auditOf(tagOnly);

        // Assert
        assert.deepEqual(reported(audit, "default-needs-initializer"), ["BoxDto.width: @default 1 but no initializer, so `new BoxDto()` leaves it unset"]);
    });

    it("should stay silent on an initialized default and on @default undefined", async () => {
        // Arrange
        const spelledRight = boxWith("    /**\n     * @default 1\n     */\n    width?: number | undefined = 1;\n    /**\n     * @default undefined\n     * @optional true\n     */\n    depth?: number | undefined;");

        // Act
        const audit = await auditOf(spelledRight);

        // Assert
        assert.deepEqual(reported(audit, "default-needs-initializer"), []);
    });
});

describe("default-tag-missing", () => {
    it("should report an initializer no @default repeats", async () => {
        // Act
        const audit = await auditOf(boxWith("    /**\n     * Width in model units.\n     */\n    width?: number | undefined = 1;"));

        // Assert
        assert.deepEqual(reported(audit, "default-tag-missing"), ["BoxDto.width: initialized to 1 but no @default says so"]);
    });

    it("should stay silent when @default repeats the initializer, and on a property with neither", async () => {
        // Act
        const audit = await auditOf(boxWith("    /**\n     * @default 1\n     */\n    width?: number | undefined = 1;\n    /**\n     * The shape to box.\n     */\n    shape!: number;"));

        // Assert
        assert.deepEqual(reported(audit, "default-tag-missing"), []);
    });
});

describe("required-spelling", () => {
    it("should report a property that is neither initialized, optional nor definitely assigned", async () => {
        // Act
        const audit = await auditOf(boxWith("    /**\n     * The shape to box.\n     */\n    shape: number;"));

        // Assert
        assert.deepEqual(reported(audit, "required-spelling"), ["BoxDto.shape: neither initialized nor optional, so it is required: spell it `name!: T;`"]);
    });

    it("should stay silent on the definite assignment spelling", async () => {
        // Act
        const audit = await auditOf(boxWith("    /**\n     * The shape to box.\n     */\n    shape!: number;"));

        // Assert
        assert.deepEqual(reported(audit, "required-spelling"), []);
    });
});

describe("optional-spelling", () => {
    it("should report an optional property whose type leaves out undefined", async () => {
        // Act
        const audit = await auditOf(boxWith("    /**\n     * @default undefined\n     * @optional true\n     */\n    indexes?: number[];"));

        // Assert
        assert.deepEqual(reported(audit, "optional-spelling"), ["BoxDto.indexes: spelled with `?` but its type does not say `| undefined`"]);
    });

    it("should stay silent when the type says undefined, and on a required property", async () => {
        // Act
        const audit = await auditOf(boxWith("    /**\n     * @default undefined\n     * @optional true\n     */\n    indexes?: number[] | undefined;\n    /**\n     * The shape to box.\n     */\n    shape!: number;"));

        // Assert
        assert.deepEqual(reported(audit, "optional-spelling"), []);
    });
});

describe("optional-with-default", () => {
    it("should report @optional true beside a default", async () => {
        // Act
        const audit = await auditOf(boxWith("    /**\n     * @default 1\n     * @optional true\n     */\n    width?: number | undefined = 1;"));

        // Assert
        assert.deepEqual(reported(audit, "optional-with-default"), ["BoxDto.width: @optional true on a property with a default; a default already makes it optional"]);
    });

    it("should stay silent on a default without @optional, and on @optional without a default", async () => {
        // Act
        const audit = await auditOf(boxWith("    /**\n     * @default 1\n     */\n    width?: number | undefined = 1;\n    /**\n     * @default undefined\n     * @optional true\n     */\n    indexes?: number[] | undefined;"));

        // Assert
        assert.deepEqual(reported(audit, "optional-with-default"), []);
    });
});

describe("optional-mismatch", () => {
    it("should report an optional property with neither @optional true nor a default value", async () => {
        // Act
        const audit = await auditOf(boxWith("    /**\n     * @default undefined\n     */\n    indexes?: number[] | undefined;"));

        // Assert
        assert.deepEqual(reported(audit, "optional-mismatch"), ["BoxDto.indexes: spelled with `?` but has neither @optional true nor a @default value, so a node gates on it while a script may omit it"]);
    });
});

describe("exclusive-without-bound", () => {
    it("should report exclusiveMinimum with no minimum", async () => {
        // Act
        const audit = await auditOf(boxWith("    /**\n     * @default 1\n     * @exclusiveMinimum true\n     */\n    width?: number | undefined = 1;"));

        // Assert
        assert.deepEqual(reported(audit, "exclusive-without-bound"), ["BoxDto.width: @exclusiveMinimum needs a finite @minimum beside it to make exclusive"]);
    });

    it("should report an exclusive bound that is infinite", async () => {
        // Arrange
        const infinite = boxWith("    /**\n     * @default 1\n     * @minimum -Infinity\n     * @maximum Infinity\n     * @exclusiveMinimum true\n     * @exclusiveMaximum true\n     */\n    width?: number | undefined = 1;");

        // Act
        const audit = await auditOf(infinite);

        // Assert
        assert.deepEqual(reported(audit, "exclusive-without-bound"), [
            "BoxDto.width: @exclusiveMinimum needs a finite @minimum beside it to make exclusive",
            "BoxDto.width: @exclusiveMaximum needs a finite @maximum beside it to make exclusive",
        ]);
    });

    it("should stay silent when each exclusive flag has a finite bound", async () => {
        // Arrange
        const bounded = boxWith("    /**\n     * @default 0.5\n     * @minimum 0\n     * @maximum 1\n     * @exclusiveMinimum true\n     * @exclusiveMaximum true\n     */\n    width?: number | undefined = 0.5;");

        // Act
        const audit = await auditOf(bounded);

        // Assert
        assert.deepEqual(reported(audit, "exclusive-without-bound"), []);
    });
});

describe("defaulted-spelling", () => {
    it("should report a default without ? on a class a method takes", async () => {
        // Act
        const audit = await auditOf(boxWith("    /**\n     * @default 1\n     */\n    width = 1;"), takingBox);

        // Assert
        assert.deepEqual(reported(audit, "defaulted-spelling"), ["BoxDto.width: has a default but is not spelled with `?`, so an object literal must still pass it"]);
    });

    it("should stay silent on a class no method takes", async () => {
        // Act
        const audit = await auditOf(boxWith("    /**\n     * @default 1\n     */\n    width = 1;"));

        // Assert
        assert.deepEqual(reported(audit, "defaulted-spelling"), []);
    });

    it("should stay silent on the ? spelling and on a constant tag", async () => {
        // Arrange
        const spelledRight = boxWith("    /**\n     * @default 1\n     */\n    width?: number | undefined = 1;\n    /**\n     * @default box\n     */\n    type = \"box\" as const;");

        // Act
        const audit = await auditOf(spelledRight, takingBox);

        // Assert
        assert.deepEqual(reported(audit, "defaulted-spelling"), []);
    });

    it("should hold a class held by a property of a taken class", async () => {
        // Arrange
        const holderAndInner = "export class HolderDto {\n    /**\n     * @default undefined\n     */\n    inner!: InnerDto;\n}\nexport class InnerDto {\n    /**\n     * @default 1\n     */\n    size = 1;\n}\n";

        // Act
        const audit = await auditOf(holderAndInner, "export function hold(inputs: HolderDto): void { return; }\n");

        // Assert
        assert.deepEqual(reported(audit, "defaulted-spelling"), ["InnerDto.size: has a default but is not spelled with `?`, so an object literal must still pass it"]);
    });

    it("should hold the parent of a taken class", async () => {
        // Arrange
        const sharedParent = "export abstract class BoxSharedDto {\n    /**\n     * @default 1\n     */\n    width = 1;\n}\nexport class BoxDto extends BoxSharedDto {\n    /**\n     * @default 1\n     */\n    depth?: number | undefined = 1;\n}\n";

        // Act
        const audit = await auditOf(sharedParent, takingBox);

        // Assert
        assert.deepEqual(reported(audit, "defaulted-spelling"), ["BoxSharedDto.width: has a default but is not spelled with `?`, so an object literal must still pass it"]);
    });

    it("should hold the parent of a taken class that declares no property of its own", async () => {
        // Arrange
        const emptySubclass = "export abstract class BoxSharedDto {\n    /**\n     * @default 1\n     */\n    width = 1;\n}\nexport class BoxDto extends BoxSharedDto {\n}\n";

        // Act
        const audit = await auditOf(emptySubclass, takingBox);

        // Assert
        assert.deepEqual(reported(audit, "defaulted-spelling"), ["BoxSharedDto.width: has a default but is not spelled with `?`, so an object literal must still pass it"]);
    });
});

describe("taken classes", () => {
    it("should take a class named anywhere in a parameter type, a parent and a held class", async () => {
        // Arrange
        const inputs = "export abstract class BoxSharedDto {\n    width?: number | undefined = 1;\n}\nexport class BoxDto extends BoxSharedDto {\n    inner!: InnerDto;\n}\nexport class InnerDto {\n    size?: number | undefined = 1;\n}\nexport class ListDto {\n    items!: number[];\n}\nexport class UnusedDto {\n    flag?: boolean | undefined = true;\n}\n";

        // Act
        const audit = await auditOf(inputs, "export function run(a: Promise<BoxDto>, b: Inputs.Fixture.ListDto[]): void { return; }\n");

        // Assert
        assert.deepEqual([...audit.takenClasses].sort(), ["BoxDto", "BoxSharedDto", "InnerDto", "ListDto"]);
    });
});

describe("ctor-param-required", () => {
    it("should report only a parameter that is neither optional, defaulted nor rest", async () => {
        // Arrange
        const constructorOfFour = "export class BoxDto {\n    constructor(width: number, depth?: number, height = 1, ...rest: number[]) {\n        this.width = width;\n        if (depth !== undefined) { this.depth = depth; }\n        this.height = height;\n        this.rest = rest;\n    }\n    width!: number;\n    depth?: number | undefined;\n    height?: number | undefined = 1;\n    rest?: number[] | undefined;\n}\n";

        // Act
        const audit = await auditOf(constructorOfFour);

        // Assert
        assert.deepEqual(reported(audit, "ctor-param-required"), ["BoxDto: constructor parameter \"width\" is required, so `new BoxDto()` - the DTO with its defaults - does not type-check"]);
    });
});

describe("ctor-param-mismatch", () => {
    it("should report a parameter never stored, stored under another name, or stored on an undeclared property", async () => {
        // Arrange
        const miswired = "export class BoxDto {\n    constructor(width?: number, colour?: number, size?: number, unused?: number) {\n        if (width !== undefined) { this.width = width; }\n        if (colour !== undefined) { this.color = colour; }\n        if (size !== undefined) { this.size = size; }\n    }\n    width?: number | undefined = 1;\n    color?: number | undefined = 1;\n}\n";

        // Act
        const audit = await auditOf(miswired);

        // Assert
        assert.deepEqual(reported(audit, "ctor-param-mismatch"), [
            "BoxDto: constructor parameter \"colour\" is stored as \"color\"",
            "BoxDto: constructor parameter \"size\" is stored on a property the class does not declare",
            "BoxDto: constructor parameter \"unused\" is never stored on the instance",
        ]);
    });

    it("should accept a parameter stored on a property a parent or grandparent declares, or passed to super", async () => {
        // Arrange
        const threeLevels = "export abstract class RootSharedDto {\n    tolerance?: number | undefined = 0.1;\n}\nexport abstract class BoxSharedDto extends RootSharedDto {\n    width?: number | undefined = 1;\n}\nexport class BoxDto extends BoxSharedDto {\n    constructor(depth?: number, width?: number, tolerance?: number, passed?: number) {\n        super(passed);\n        if (depth !== undefined) { this.depth = depth; }\n        if (width !== undefined) { this.width = width; }\n        if (tolerance !== undefined) { this.tolerance = tolerance; }\n    }\n    depth?: number | undefined = 1;\n}\n";

        // Act
        const audit = await auditOf(threeLevels);

        // Assert
        assert.deepEqual(reported(audit, "ctor-param-mismatch"), []);
    });
});

describe("parentOf", () => {
    it("should find the parent in the subclass's own file before a class of that name elsewhere", async () => {
        // Arrange
        const elsewhere = [OTHER_INPUTS_FILE, "export abstract class ShapeSharedDto {\n    other?: number | undefined = 1;\n}\n"];
        const sameFile = [INPUTS_FILE, "export abstract class ShapeSharedDto {\n    width?: number | undefined = 1;\n}\nexport class ShapeDto extends ShapeSharedDto {\n    depth?: number | undefined = 1;\n}\n"];

        // Act
        const audit = await auditOfFiles([elsewhere, sameFile]);
        const shape = audit.dtos.find((d) => d.name === "ShapeDto");

        // Assert
        assert.deepEqual(audit.inheritedPropNames(shape), ["width"]);
    });

    it("should find a qualified parent by its last name, in another file when that is the only one", async () => {
        // Arrange
        const parentFile = [OTHER_INPUTS_FILE, "export abstract class ShapeSharedDto {\n    other?: number | undefined = 1;\n}\n"];
        const childFile = [INPUTS_FILE, "export class ShapeDto extends Base.ShapeSharedDto {\n    depth?: number | undefined = 1;\n}\nexport class LooseDto extends NotAnInputsDto {\n    size?: number | undefined = 1;\n}\n"];

        // Act
        const audit = await auditOfFiles([parentFile, childFile]);
        const shape = audit.dtos.find((d) => d.name === "ShapeDto");
        const loose = audit.dtos.find((d) => d.name === "LooseDto");

        // Assert
        assert.deepEqual({ shape: audit.parentOf.get(shape)?.file, loose: audit.parentOf.has(loose) }, { shape: OTHER_INPUTS_FILE, loose: false });
    });
});

describe("DTO property counts", () => {
    it("should count a DTO's own and inherited properties, leaving out shapes and kernel handles", async () => {
        // Arrange
        const sharedAndOwn = "export abstract class CountSharedDto {\n    size?: number | undefined = 1;\n    shape!: TopoDSShapePointer;\n}\nexport class CountDto extends CountSharedDto {\n    count?: number | undefined = 1;\n    entity!: JSCADEntity;\n}\n";

        // Act
        const audit = await auditOf(sharedAndOwn);

        // Assert
        assert.deepEqual({ shared: audit.dtoPropCount.get("CountSharedDto"), counted: audit.dtoPropCount.get("CountDto") }, { shared: 1, counted: 2 });
    });

    it("should count the properties of every ancestor", async () => {
        // Arrange
        const threeLevels = "export abstract class RootSharedDto {\n    tolerance?: number | undefined = 0.1;\n}\nexport abstract class BoxSharedDto extends RootSharedDto {\n    width?: number | undefined = 1;\n}\nexport class BoxDto extends BoxSharedDto {\n    depth?: number | undefined = 1;\n}\n";

        // Act
        const audit = await auditOf(threeLevels);

        // Assert
        assert.equal(audit.dtoPropCount.get("BoxDto"), 3);
    });

    it("should ask a method whose DTO counts two properties with the inherited one for an example", async () => {
        // Arrange
        const sharedAndOwn = "export abstract class BoxSharedDto {\n    width?: number | undefined = 1;\n}\nexport class BoxDto extends BoxSharedDto {\n    depth?: number | undefined = 1;\n}\n";
        const service = sourceOf(LIB_FILE, "export class Shapes {\n    /**\n     * Creates a box solid with its sides parallel to the axes.\n     * @param inputs - Box size\n     * @returns A new solid\n     */\n    box(inputs: BoxDto): number { return 0; }\n}\n");
        const member = service.statements[0].members[0];
        const audit = await auditOf(sharedAndOwn);

        // Act
        audit.checkMethod({ kind: "M", file: LIB_FILE, line: 7, path: "shapes.box", name: "box", className: "Shapes", doc: audit.docOf(member), params: ["inputs"], returns: "number", dtoName: "BoxDto", blocks: 1, dtoProps: audit.dtoPropCount.get("BoxDto") });

        // Assert
        assert.deepEqual(reported(audit, "missing-example"), ["shapes.box: takes 2 properties and has no @example"]);
    });
});

describe("pair-parity", () => {
    it("should report a property a singular and its plural in one file declare differently", async () => {
        // Arrange
        const pair = "export class SphereDto {\n    /**\n     * @default 1\n     * @minimum 0\n     */\n    radius?: number | undefined = 1;\n    /**\n     * @default 0\n     */\n    offset?: number | undefined = 0;\n}\nexport class SphereCentersDto {\n    /**\n     * @default 2\n     * @minimum 0\n     */\n    radius?: number | undefined = 2;\n    /**\n     * @default 0\n     */\n    offset?: number | undefined = 0;\n}\n";

        // Act
        const audit = await auditOf(pair);

        // Assert
        assert.deepEqual(reported(audit, "pair-parity"), ["SphereCentersDto.radius: differs from SphereDto.radius in default"]);
    });

    it("should pair a singular with its plural in s, es and Shapes", async () => {
        // Arrange
        const plurals = "export class BoxDto {\n    /**\n     * @minimum 0\n     */\n    width?: number | undefined = 1;\n}\nexport class BoxesDto {\n    /**\n     * @minimum 1\n     */\n    width?: number | undefined = 1;\n}\nexport class DrawDto {\n    /**\n     * @default 1\n     */\n    size?: number | undefined = 1;\n}\nexport class DrawsDto {\n    /**\n     * @default 1\n     */\n    size?: number[] | undefined = [1];\n}\nexport class DrawShapesDto {\n    /**\n     * @default 2\n     */\n    size?: number | undefined = 2;\n}\n";

        // Act
        const audit = await auditOf(plurals);

        // Assert
        assert.deepEqual(reported(audit, "pair-parity"), ["BoxesDto.width: differs from BoxDto.width in minimum", "DrawsDto.size: differs from DrawDto.size in type", "DrawShapesDto.size: differs from DrawDto.size in default"]);
    });

    it("should stay silent on a pair in two files and on a pair sharing an abstract parent", async () => {
        // Arrange
        const singular = [OTHER_INPUTS_FILE, "export class SphereDto {\n    /**\n     * @default 1\n     */\n    radius?: number | undefined = 1;\n}\n"];
        const pluralAndShared = [INPUTS_FILE, "export class SphereCentersDto {\n    /**\n     * @default 2\n     */\n    radius?: number | undefined = 2;\n}\nexport abstract class CubeSharedDto {\n    /**\n     * @default 1\n     */\n    size?: number | undefined = 1;\n}\nexport class CubeDto extends CubeSharedDto {\n    center!: number[];\n}\nexport class CubeCentersDto extends CubeSharedDto {\n    centers!: number[][];\n}\n"];

        // Act
        const audit = await auditOfFiles([singular, pluralAndShared]);

        // Assert
        assert.deepEqual(reported(audit, "pair-parity"), []);
    });
});

describe("default-mismatch", () => {
    it("should report a @default that names another value than the initializer", async () => {
        // Act
        const audit = await auditOf(boxWith("    /**\n     * @default 2\n     */\n    width?: number | undefined = 1;"));

        // Assert
        assert.deepEqual(reported(audit, "default-mismatch"), ["BoxDto.width: @default 2 but the initializer is 1"]);
    });

    it("should tell an infinity from its negation", async () => {
        // Act
        const audit = await auditOf(boxWith("    /**\n     * @default Infinity\n     */\n    limit?: number | undefined = -Infinity;"));

        // Assert
        assert.deepEqual(reported(audit, "default-mismatch"), ["BoxDto.limit: @default Infinity but the initializer is -Infinity"]);
    });

    it("should read an enum member initializer by its member name or its value", async () => {
        // Arrange
        const enumDefaults = "export enum directionEnum { up = \"upward\", down = \"downward\" }\nexport class BoxDto {\n    /**\n     * @default up\n     */\n    first?: directionEnum | undefined = directionEnum.up;\n    /**\n     * @default upward\n     */\n    second?: directionEnum | undefined = directionEnum.up;\n    /**\n     * @default down\n     */\n    third?: directionEnum | undefined = directionEnum.up;\n}\n";

        // Act
        const audit = await auditOf(enumDefaults);

        // Assert
        assert.deepEqual(reported(audit, "default-mismatch"), ["BoxDto.third: @default down but the initializer is directionEnum.up"]);
    });

    it("should agree on lists, infinities, escaped line breaks and an unreadable initializer", async () => {
        // Arrange
        const agreeing = boxWith("    /**\n     * @default [0, 0, 1]\n     */\n    direction?: number[] | undefined = [0, 0, 1];\n    /**\n     * @default Infinity\n     */\n    limit?: number | undefined = Infinity;\n    /**\n     * @default a\\nb\n     */\n    text?: string | undefined = \"a\\nb\";\n    /**\n     * @default 7\n     */\n    computed?: number | undefined = compute();");

        // Act
        const audit = await auditOf(agreeing);

        // Assert
        assert.deepEqual(reported(audit, "default-mismatch"), []);
    });
});

const expressionOf = (text) => {
    const sf = sourceOf(INPUTS_FILE, `const value = ${text};`);
    return [sf.statements[0].declarationList.declarations[0].initializer, sf];
};

describe("evaluateInitializer", () => {
    it("should read literals, their negation and the value keywords", async () => {
        // Arrange
        const audit = await freshAudit();
        const read = (text) => audit.evaluateInitializer(...expressionOf(text));

        // Act & Assert
        assert.deepEqual(
            [read("\"text\""), read("`text`"), read("1e-7"), read("-2"), read("-Infinity"), read("true"), read("false"), read("undefined"), read("NaN")],
            ["text", "text", 1e-7, -2, -Infinity, true, false, undefined, NaN],
        );
    });

    it("should read through assertions and parentheses into lists and objects", async () => {
        // Arrange
        const audit = await freshAudit();
        const read = (text) => audit.evaluateInitializer(...expressionOf(text));

        // Act & Assert
        assert.deepEqual([read("1 as number"), read("(2)"), read("[0, 0, 1] satisfies number[]"), read("[1, [2, 3]]"), read("{ \"a\": 1, b: \"x\" }")], [1, 2, [0, 0, 1], [1, [2, 3]], { a: 1, b: "x" }]);
    });

    it("should call anything else unreadable", async () => {
        // Arrange
        const audit = await freshAudit();
        const read = (text) => audit.evaluateInitializer(...expressionOf(text));

        // Act & Assert
        assert.deepEqual(
            [read("someName"), read("compute()"), read("-\"a\""), read("[1, someName]"), read("{ ...rest }"), read("{ a: someName }"), read("unknownEnum.up")],
            [audit.UNREADABLE, audit.UNREADABLE, audit.UNREADABLE, audit.UNREADABLE, audit.UNREADABLE, audit.UNREADABLE, audit.UNREADABLE],
        );
    });

    it("should read a member of a collected enum as its name and its value", async () => {
        // Arrange
        const audit = await freshAudit();
        audit.collectEnums(sourceOf(INPUTS_FILE, "export enum mixedEnum { text = \"words\", count = 2, bare }\n"));
        const read = (text) => audit.evaluateInitializer(...expressionOf(text));

        // Act & Assert
        assert.deepEqual([read("mixedEnum.text"), read("mixedEnum.count"), read("mixedEnum.bare"), read("mixedEnum.missing")], [
            { enumName: "mixedEnum", member: "text", value: "words" },
            { enumName: "mixedEnum", member: "count", value: 2 },
            { enumName: "mixedEnum", member: "bare", value: "bare" },
            audit.UNREADABLE,
        ]);
    });
});

describe("parseDefaultTag", () => {
    it("should read a @default as the generators do", async () => {
        // Arrange
        const audit = await freshAudit();

        // Act & Assert
        assert.deepEqual(
            ["true", "false", "undefined", "1e-7", "-2", "[0, 0, 1]", "{\"a\": 1}", "[a, b]", "[0] + 1", "{0} items", "\"quoted\"", "plain", ""].map(audit.parseDefaultTag),
            [true, false, undefined, 1e-7, -2, [0, 0, 1], { a: 1 }, { unparsable: "[a, b]" }, "[0] + 1", "{0} items", "quoted", "plain", ""],
        );
    });
});
