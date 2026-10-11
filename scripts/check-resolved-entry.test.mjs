import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import ts from "typescript";
import { ROOT } from "./lib/surface.mjs";
import { ALLOW_FILE, PACKAGES, WORKERS, callablesOf, checkCallable, checkEntries, dtoClassesOf, importAliasesOf, inputsModel, walkedEntries } from "./check-resolved-entry.mjs";

const DIR = path.join(ROOT, "packages/dev/fixture/lib");
const INPUTS_FILE = path.join(DIR, "api/inputs/fixture-inputs.ts");
const LIB_FILE = path.join(DIR, "api/service.ts");
const TYPES_FILE = path.join(DIR, "api/types.ts");

const INPUTS = `export namespace Fixture {
    export class BoxDto {
        width?: number | undefined = 1;
        height!: number;
    }
    export class OtherDto {
        size?: number | undefined = 2;
    }
    export class PlainDto {
        shape!: number;
    }
    export abstract class RoundSharedDto {
        radius?: number | undefined = 1;
    }
    export class RoundDto extends RoundSharedDto {
        center!: number[];
    }
    export type BoxAlias = BoxDto;
    export type EitherDto = BoxDto | OtherDto;
    export type PlainAlias = PlainDto;
    export enum sideEnum { left = "left", right = "right" }
}
`;

const HEADER = "import * as Inputs from \"./inputs\";\nimport * as Resolved from \"./resolved-inputs\";\nimport { resolveDto } from \"@bitbybit-dev/base\";\n";

const programOf = (files) => {
    const options = { noResolve: true, noLib: true, types: [], target: ts.ScriptTarget.Latest };
    const sources = new Map(Object.entries(files).map(([file, text]) => [file, ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)]));
    const host = ts.createCompilerHost(options);
    host.getSourceFile = (file) => sources.get(file);
    host.fileExists = (file) => sources.has(file);
    host.readFile = (file) => sources.get(file)?.text;
    host.directoryExists = (dir) => [...sources.keys()].some((file) => file.startsWith(`${dir}/`));
    return ts.createProgram([...sources.keys()], options, host);
};

const run = (lib, { allow = {}, extra = {}, pkg = "fixture" } = {}) => {
    const program = programOf({ [INPUTS_FILE]: INPUTS, [LIB_FILE]: HEADER + lib, ...extra });
    const chains = { fixture: ["fixture"], "fixture-worker": ["fixture"] };
    const model = inputsModel(chains, new Map([["fixture", dtoClassesOf([program.getSourceFile(INPUTS_FILE)])]]));
    const entries = [LIB_FILE, ...Object.keys(extra)].map((file) => ({ pkg, file, relFile: path.basename(file) }));
    return checkEntries({ entries, program, model, allow });
};

const problems = (result) => result.findings.map((f) => `${f.where.replace(/^\S+:\d+ /, "")}: ${f.problem}`);
const passing = (result) => result.passing.map((w) => w.replace(/^\S+:\d+ /, ""));

const method = (signature, body) => `export class Service {\n    ${signature} {\n${body.map((line) => `        ${line}\n`).join("")}    }\n}\n`;
const resolvesBox = "const resolved = resolveDto(Inputs.Fixture.BoxDto, inputs) as Resolved.Fixture.BoxDto;";

describe("resolved entry", () => {
    it("should pass a method that resolves its DTO first and reads only the result", () => {
        // Act
        const result = run(method("make(inputs: Inputs.Fixture.BoxDto): number", [resolvesBox, "return resolved.width + resolved.height;"]));

        // Assert
        assert.deepEqual({ passing: passing(result), problems: problems(result) }, { passing: ["Service.make"], problems: [] });
    });

    it("should report a method that never resolves, one that resolves late, and one that reads the raw inputs after resolving", () => {
        // Arrange
        const lib = [
            method("never(inputs: Inputs.Fixture.BoxDto): number", ["return inputs.width;"]),
            method("late(inputs: Inputs.Fixture.BoxDto): number", ["const twice = 2;", resolvesBox, "return resolved.width * twice;"]),
            method("raw(inputs: Inputs.Fixture.BoxDto): number", [resolvesBox, "return resolved.width + inputs.height;"]),
        ].join("");

        // Act
        const result = run(lib);

        // Assert
        assert.deepEqual(problems(result), [
            "Service.never: never resolves its inputs (first statement: `return inputs.width;`)",
            "Service.late: resolves its inputs, but not as its first statement (first: `const twice = 2;`)",
            "Service.raw: reads the raw `inputs` after resolving it (line 19)",
        ]);
    });

    it("should report a resolution against another DTO, of another value, or cast to another DTO's mirror", () => {
        // Arrange
        const lib = [
            method("against(inputs: Inputs.Fixture.BoxDto): number", ["const resolved = resolveDto(Inputs.Fixture.OtherDto, inputs);", "return resolved.size;"]),
            method("copy(inputs: Inputs.Fixture.BoxDto): number", ["const resolved = resolveDto(Inputs.Fixture.BoxDto, { ...inputs });", "return resolved.width;"]),
            method("cast(inputs: Inputs.Fixture.BoxDto): number", ["const resolved = resolveDto(Inputs.Fixture.BoxDto, inputs) as Resolved.Fixture.OtherDto;", "return resolved.size;"]),
        ].join("");

        // Act
        const result = run(lib);

        // Assert
        assert.deepEqual(problems(result), [
            "Service.against: takes Fixture.BoxDto but resolves against Inputs.Fixture.OtherDto",
            "Service.copy: resolves { ...inputs }, not its parameter `inputs`",
            "Service.cast: resolves Fixture.BoxDto but casts it to Resolved.Fixture.OtherDto",
        ]);
    });

    it("should count a DTO's inherited defaults and pass over a DTO without any", () => {
        // Arrange
        const lib = [
            method("round(inputs: Inputs.Fixture.RoundDto): number[]", ["return inputs.center;"]),
            method("plain(inputs: Inputs.Fixture.PlainDto): number", ["return inputs.shape;"]),
        ].join("");

        // Act
        const result = run(lib);

        // Assert
        assert.deepEqual({ problems: problems(result), withoutDefaults: result.withoutDefaults }, { problems: ["Service.round: never resolves its inputs (first statement: `return inputs.center;`)"], withoutDefaults: 1 });
    });
});

describe("every parameter", () => {
    it("should hold a DTO taken as a later parameter", () => {
        // Act
        const result = run(method("draw(mesh: number, options: Partial<Inputs.Fixture.OtherDto>): number", ["return mesh + (options.size ?? 0);"]));

        // Assert
        assert.deepEqual(problems(result), ["Service.draw: never resolves its inputs (first statement: `return mesh + (options.size ?? 0);`)"]);
    });

    it("should report a second DTO parameter the leading statements do not resolve", () => {
        // Arrange
        const signature = "draw(inputs: Inputs.Fixture.BoxDto, mesh: number, options: Partial<Inputs.Fixture.OtherDto>): number";

        // Act
        const result = run(method(signature, [resolvesBox, "return resolved.width + mesh + (options.size ?? 0);"]));

        // Assert
        assert.deepEqual(problems(result), ["Service.draw: never resolves `options` in its first 2 statements, one per parameter taking a DTO with defaults"]);
    });

    it("should pass two DTO parameters resolved by the first two statements in either order", () => {
        // Arrange
        const signature = "draw(inputs: Inputs.Fixture.BoxDto, options: Partial<Inputs.Fixture.OtherDto>): number";
        const resolvesOptions = "const opts = resolveDto(Inputs.Fixture.OtherDto, options) as Resolved.Fixture.OtherDto;";

        // Act
        const result = run(method(signature, [resolvesOptions, resolvesBox, "return resolved.width + opts.size;"]));

        // Assert
        assert.deepEqual({ passing: passing(result), problems: problems(result) }, { passing: ["Service.draw"], problems: [] });
    });

    it("should report a second DTO parameter resolved after the leading statements, and a raw read of it", () => {
        // Arrange
        const signature = "draw(inputs: Inputs.Fixture.BoxDto, options: Inputs.Fixture.OtherDto): number";
        const late = method(signature, [resolvesBox, "const width = resolved.width;", "const opts = resolveDto(Inputs.Fixture.OtherDto, options);", "return width + opts.size;"]);
        const raw = method(signature.replace("draw", "drawRaw"), ["const opts = resolveDto(Inputs.Fixture.OtherDto, options);", resolvesBox, "return resolved.width + opts.size + (options.size ?? 0);"]);

        // Act
        const result = run(late + raw);

        // Assert
        assert.deepEqual(problems(result), [
            "Service.draw: resolves `options`, but not in its first 2 statements, one per parameter taking a DTO with defaults",
            "Service.drawRaw: reads the raw `options` after resolving it (line 16)",
        ]);
    });
});

describe("wrapped DTO types", () => {
    it("should read the DTO through Partial, Readonly, Required, NonNullable, a nullable union, Omit, Pick and an intersection", () => {
        // Arrange
        const types = [
            "Partial<Inputs.Fixture.BoxDto>",
            "Readonly<Inputs.Fixture.BoxDto>",
            "Required<Inputs.Fixture.BoxDto>",
            "NonNullable<Inputs.Fixture.BoxDto>",
            "Inputs.Fixture.BoxDto | undefined",
            "null | (Inputs.Fixture.BoxDto)",
            "Omit<Inputs.Fixture.BoxDto, \"height\">",
            "Pick<Inputs.Fixture.BoxDto, \"width\">",
            "Inputs.Fixture.BoxDto & { scene: number }",
        ];
        const lib = types.map((type, i) => method(`m${i}(inputs: ${type}): number`, ["return 1;"])).join("");

        // Act
        const result = run(lib);

        // Assert
        assert.deepEqual(problems(result), types.map((_, i) => `Service.m${i}: never resolves its inputs (first statement: \`return 1;\`)`));
    });

    it("should pass each wrapped DTO resolved on entry", () => {
        // Arrange
        const types = ["Partial<Inputs.Fixture.BoxDto>", "Inputs.Fixture.BoxDto | undefined", "Readonly<Omit<Inputs.Fixture.BoxDto, \"height\">>"];
        const lib = types.map((type, i) => method(`m${i}(inputs: ${type}): number`, [resolvesBox, "return resolved.width;"])).join("");

        // Act
        const result = run(lib);

        // Assert
        assert.deepEqual({ passing: passing(result), problems: problems(result) }, { passing: ["Service.m0", "Service.m1", "Service.m2"], problems: [] });
    });

    it("should leave alone a DTO's mirror, its class as a value and one of its property types", () => {
        // Arrange
        const types = ["Resolved.Fixture.BoxDto", "typeof Inputs.Fixture.BoxDto", "Inputs.Fixture.BoxDto[\"width\"]", "Inputs.Fixture.sideEnum"];
        const lib = types.map((type, i) => method(`m${i}(inputs: ${type}): number`, ["return 1;"])).join("");

        // Act
        const result = run(lib);

        // Assert
        assert.deepEqual({ passing: result.passing, problems: problems(result), withoutDefaults: result.withoutDefaults }, { passing: [], problems: [], withoutDefaults: 0 });
    });
});

describe("failing closed", () => {
    it("should report a DTO with defaults taken in a form the check does not follow", () => {
        // Arrange
        const types = [
            "Inputs.Fixture.BoxDto[]",
            "ReadonlyArray<Inputs.Fixture.BoxDto>",
            "Inputs.Fixture.BoxDto | Inputs.Fixture.OtherDto",
            "Promise<Inputs.Fixture.BoxDto>",
            "{ box: Inputs.Fixture.BoxDto }",
            "[Inputs.Fixture.BoxDto, number]",
            "Other.Inputs.Fixture.BoxDto",
            "BoxDto",
        ];
        const lib = types.map((type, i) => method(`m${i}(inputs: ${type}): number`, ["return 1;"])).join("");

        // Act
        const result = run(lib);

        // Assert
        assert.deepEqual(problems(result), [
            "Service.m0: its parameter `inputs` is a list of Inputs.Fixture.BoxDto, a DTO with defaults; this check follows only a resolveDto call on the parameter itself",
            "Service.m1: its parameter `inputs` is a list of Inputs.Fixture.BoxDto, a DTO with defaults; this check follows only a resolveDto call on the parameter itself",
            "Service.m2: its parameter `inputs` names Inputs.Fixture.BoxDto, a DTO with defaults, in `Inputs.Fixture.BoxDto | Inputs.Fixture.OtherDto`, a form this check does not follow to a resolveDto call",
            "Service.m2: its parameter `inputs` names Inputs.Fixture.OtherDto, a DTO with defaults, in `Inputs.Fixture.BoxDto | Inputs.Fixture.OtherDto`, a form this check does not follow to a resolveDto call",
            "Service.m3: its parameter `inputs` names Inputs.Fixture.BoxDto, a DTO with defaults, in `Promise<Inputs.Fixture.BoxDto>`, a form this check does not follow to a resolveDto call",
            "Service.m4: its parameter `inputs` names Inputs.Fixture.BoxDto, a DTO with defaults, in `{ box: Inputs.Fixture.BoxDto }`, a form this check does not follow to a resolveDto call",
            "Service.m5: its parameter `inputs` names Inputs.Fixture.BoxDto, a DTO with defaults, in `[Inputs.Fixture.BoxDto, number]`, a form this check does not follow to a resolveDto call",
            "Service.m6: its parameter `inputs` names Other.Inputs.Fixture.BoxDto, a DTO with defaults, in `Other.Inputs.Fixture.BoxDto`, a form this check does not follow to a resolveDto call",
            "Service.m7: its parameter `inputs` names BoxDto, a DTO with defaults, in `BoxDto`, a form this check does not follow to a resolveDto call",
        ]);
    });

    it("should report a union of DTOs an inputs alias declares", () => {
        // Act
        const result = run(method("m(inputs: Inputs.Fixture.EitherDto): number", ["return 1;"]));

        // Assert
        assert.deepEqual(problems(result), [
            "Service.m: its parameter `inputs` names BoxDto, a DTO with defaults, in `Inputs.Fixture.EitherDto`, a form this check does not follow to a resolveDto call",
            "Service.m: its parameter `inputs` names OtherDto, a DTO with defaults, in `Inputs.Fixture.EitherDto`, a form this check does not follow to a resolveDto call",
        ]);
    });

    it("should stay silent on a DTO without defaults in a form it does not follow", () => {
        // Act
        const result = run(method("m(inputs: Inputs.Fixture.PlainDto[]): number", ["return 1;"]));

        // Assert
        assert.deepEqual(problems(result), []);
    });

    it("should report a name under Inputs that is no class, alias, enum or interface", () => {
        // Act
        const result = run(method("m(inputs: Inputs.Fixture.MissingDto): number", ["return 1;"]));

        // Assert
        assert.deepEqual(problems(result), ["Service.m: takes Inputs.Fixture.MissingDto, which is not a class in the inputs fixture reaches"]);
    });

    it("should report an intersection of two DTOs and a destructured DTO", () => {
        // Arrange
        const lib = [
            method("both(inputs: Inputs.Fixture.BoxDto & Inputs.Fixture.OtherDto): number", ["return 1;"]),
            method("split({ width }: Inputs.Fixture.BoxDto): number", ["return width ?? 0;"]),
        ].join("");

        // Act
        const result = run(lib);

        // Assert
        assert.deepEqual(problems(result), [
            "Service.both: its parameter `inputs` intersects several DTOs (Inputs.Fixture.BoxDto, Inputs.Fixture.OtherDto); say which one it resolves",
            "Service.split: destructures its inputs in the parameter list, so they are read before any default applies",
        ]);
    });

    it("should report reads of the parameters through arguments", () => {
        // Act
        const result = run(method("m(inputs: Inputs.Fixture.BoxDto): number", [resolvesBox, "return resolved.width + arguments[0].height;"]));

        // Assert
        assert.deepEqual(problems(result), ["Service.m: reads its parameters through `arguments` (line 7)"]);
    });

    it("should report a parameter the type checker gives no symbol, rather than count no reads", () => {
        // Arrange
        const program = programOf({ [INPUTS_FILE]: INPUTS, [LIB_FILE]: HEADER + method("m(inputs: Inputs.Fixture.BoxDto): number", [resolvesBox, "return inputs.width;"]) });
        const sf = program.getSourceFile(LIB_FILE);
        const model = inputsModel({ fixture: ["fixture"] }, new Map([["fixture", dtoClassesOf([program.getSourceFile(INPUTS_FILE)])]]));
        const blind = { getSymbolAtLocation: () => undefined, getAliasedSymbol: () => undefined, getShorthandAssignmentValueSymbol: () => undefined };

        // Act
        const result = checkCallable(callablesOf(sf)[0].fn, sf, { pkg: "fixture", model, checker: blind, aliasesOf: importAliasesOf });

        // Assert
        assert.deepEqual(result.problems, ["its parameter `inputs` has no symbol the type checker can follow, so its raw reads cannot be counted"]);
    });
});

describe("spellings followed", () => {
    it("should follow an aliased Inputs import, a namespace import under another name and an import-equals alias", () => {
        // Arrange
        const extra = {
            [path.join(DIR, "api/aliased.ts")]: "import { Inputs as I } from \"@bitbybit-dev/fixture\";\nexport function named(inputs: I.Fixture.BoxDto): number { return inputs.height; }\n",
            [path.join(DIR, "api/star.ts")]: "import * as In from \"./inputs\";\nimport { resolveDto } from \"@bitbybit-dev/base\";\nexport function star(inputs: In.Fixture.BoxDto): number { const r = resolveDto(In.Fixture.BoxDto, inputs); return r.height; }\n",
            [path.join(DIR, "api/equals.ts")]: "import * as Inputs from \"./inputs\";\nimport Box = Inputs.Fixture.BoxDto;\nexport function equals(inputs: Box): number { return inputs.height; }\n",
        };

        // Act
        const result = run("", { extra });

        // Assert
        assert.deepEqual({ passing: passing(result), problems: problems(result) }, {
            passing: ["star"],
            problems: [
                "named: never resolves its inputs (first statement: `return inputs.height;`)",
                "equals: never resolves its inputs (first statement: `return inputs.height;`)",
            ],
        });
    });

    it("should follow a type alias declared in the file, in another file and in the inputs", () => {
        // Arrange
        const extra = { [TYPES_FILE]: "import * as Inputs from \"./inputs\";\nexport type Options = Partial<Inputs.Fixture.BoxDto>;\n" };
        const lib = "import { Options } from \"./types\";\ntype Local = Inputs.Fixture.BoxDto;\n" + [
            method("local(inputs: Local): number", ["return 1;"]),
            method("imported(inputs: Options): number", ["return 1;"]),
            method("declared(inputs: Inputs.Fixture.BoxAlias): number", [resolvesBox, "return resolved.width;"]),
            method("plain(inputs: Inputs.Fixture.PlainAlias): number", ["return inputs.shape;"]),
        ].join("");

        // Act
        const result = run(lib, { extra });

        // Assert
        assert.deepEqual({ passing: passing(result), problems: problems(result), withoutDefaults: result.withoutDefaults }, {
            passing: ["Service.declared"],
            problems: [
                "Service.local: never resolves its inputs (first statement: `return 1;`)",
                "Service.imported: never resolves its inputs (first statement: `return 1;`)",
            ],
            withoutDefaults: 1,
        });
    });

    it("should walk public arrow and function-expression properties, and skip private ones", () => {
        // Arrange
        const lib = "export class Service {\n    arrow = (inputs: Inputs.Fixture.BoxDto): number => inputs.height;\n    expression = function (inputs: Inputs.Fixture.BoxDto): number { return inputs.height; };\n    concise = (inputs: Inputs.Fixture.BoxDto) => resolveDto(Inputs.Fixture.BoxDto, inputs);\n    private hidden = (inputs: Inputs.Fixture.BoxDto): number => inputs.height;\n}\n";

        // Act
        const result = run(lib);

        // Assert
        assert.deepEqual({ passing: passing(result), problems: problems(result) }, {
            passing: ["Service.concise"],
            problems: [
                "Service.arrow: never resolves its inputs (first statement: `inputs.height`)",
                "Service.expression: never resolves its inputs (first statement: `return inputs.height;`)",
            ],
        });
    });

    it("should walk exported const functions and exported functions of a namespace, and skip what is not exported", () => {
        // Arrange
        const lib = [
            "export const arrow = (inputs: Inputs.Fixture.BoxDto): number => inputs.height;",
            "export const expression = function (inputs: Inputs.Fixture.BoxDto): number { return inputs.height; };",
            "const hidden = (inputs: Inputs.Fixture.BoxDto): number => inputs.height;",
            "export namespace Outer.Inner { export function spaced(inputs: Inputs.Fixture.BoxDto): number { return inputs.height; } function local(inputs: Inputs.Fixture.BoxDto): number { return inputs.height; } }",
            "",
        ].join("\n");

        // Act
        const result = run(lib);

        // Assert
        assert.deepEqual(problems(result), [
            "arrow: never resolves its inputs (first statement: `inputs.height`)",
            "expression: never resolves its inputs (first statement: `return inputs.height;`)",
            "Outer.Inner.spaced: never resolves its inputs (first statement: `return inputs.height;`)",
        ]);
    });

    it("should read a worker package's DTOs through its kernel's inputs", () => {
        // Act
        const result = run(method("save(inputs: Inputs.Fixture.BoxDto): number", ["return inputs.height;"]), { pkg: "fixture-worker" });

        // Assert
        assert.deepEqual(problems(result), ["Service.save: never resolves its inputs (first statement: `return inputs.height;`)"]);
    });
});

describe("the allow list", () => {
    it("should keep a failing method it lists out of the findings", () => {
        // Act
        const result = run(method("make(inputs: Inputs.Fixture.BoxDto): number", ["return inputs.height;"]), { allow: { "service.ts#Service.make": "resolves later on purpose" } });

        // Assert
        assert.deepEqual({ allowed: result.allowed.map((w) => w.replace(/^\S+:\d+ /, "")), problems: problems(result) }, { allowed: ["Service.make"], problems: [] });
    });

    it("should report an entry whose method now passes, one naming no method and one naming a method without defaults", () => {
        // Arrange
        const lib = method("make(inputs: Inputs.Fixture.BoxDto): number", [resolvesBox, "return resolved.width;"]) + method("plain(inputs: Inputs.Fixture.PlainDto): number", ["return inputs.shape;"]);
        const allow = { "service.ts#Service.make": "stale", "service.ts#Service.gone": "stale", "service.ts#Service.plain": "stale" };

        // Act
        const result = run(lib, { allow });

        // Assert
        assert.deepEqual(result.findings.map((f) => `${f.key}: ${f.problem}`), [
            `service.ts#Service.make: now resolves its inputs on entry, so it must come out of ${ALLOW_FILE}`,
            `service.ts#Service.gone: ${ALLOW_FILE} names a method that does not exist or takes no DTO with defaults`,
            `service.ts#Service.plain: ${ALLOW_FILE} names a method that does not exist or takes no DTO with defaults`,
        ]);
    });
});

describe("the walked files", () => {
    it("should walk the hand-written worker files under their kernel's inputs, and none of the generated ones", () => {
        // Act
        const entries = walkedEntries();
        const worker = entries.filter((e) => e.pkg.endsWith("-worker"));

        // Assert
        assert.deepEqual({
            handIo: worker.some((e) => e.relFile === "occt-worker/lib/api-hand/occt/io.ts" && e.pkg === "occt-worker"),
            init: worker.some((e) => e.relFile === "occt-worker/lib/api/bitbybit-occt.ts"),
            generated: worker.filter((e) => /\/lib\/api\/(occt|manifold|cross-section|mesh)\//.test(e.relFile)).length,
            chains: Object.fromEntries(Object.entries(WORKERS).map(([pkg, chain]) => [pkg, chain.join(",")])),
        }, {
            handIo: true,
            init: true,
            generated: 0,
            chains: { "occt-worker": PACKAGES.occt.join(","), "jscad-worker": PACKAGES.jscad.join(","), "manifold-worker": PACKAGES.manifold.join(","), "ifc-worker": PACKAGES.ifc.join(",") },
        });
    });
});
