import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import ts from "typescript";
import { ROOT } from "./lib/surface.mjs";
import { kernelSurface } from "./lib/kernel-surface.mjs";
import { allProps, bare, boundsOf, constraintOf, constraintsOf, dtoClasses, generateResolved, mirrorReexports, nestedOf, registryText } from "./gen-dto-meta.mjs";

const INPUTS_DIR = path.join(ROOT, "packages/dev/fixture/lib/api/inputs");
const KERNEL_FILE = path.join(ROOT, "packages/dev/fixture/lib/kernel.ts");

const sourceOf = (text, file = path.join(INPUTS_DIR, "fixture-inputs.ts")) => ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);

const numberWithTags = (...tags) => sourceOf(`class Dto {\n    /**\n     * A value.\n${tags.map((tag) => `     * ${tag}\n`).join("")}     */\n    value?: number | undefined = 1;\n}\n`).statements[0].members[0];

const dtoOf = (members) => `export namespace Fixture {\n    export enum directionEnum { up = "up", down = "down" }\n    export class TestDto {\n${members}\n    }\n}\n`;

const constraintsFor = (members) => {
    const enums = new Map();
    const classes = dtoClasses([sourceOf(dtoOf(members))], new Map(), enums);
    return constraintsOf(classes, "Fixture.TestDto", enums);
};

const ENUMS = new Map([["Fixture.directionEnum", ["up", "down"]], ["Base.colorModeEnum", ["rgb", "hex"]]]);

describe("constraintOf", () => {
    it("should map number, boolean and string to their kinds", () => {
        // Act & Assert
        assert.deepEqual([constraintOf("number", "Fixture", ENUMS), constraintOf("boolean", "Fixture", ENUMS), constraintOf("string", "Fixture", ENUMS)], ["k.number", "k.boolean", "k.string"]);
    });

    it("should read through a trailing undefined and line breaks in the type", () => {
        // Act & Assert
        assert.deepEqual([constraintOf("number | undefined", "Fixture", ENUMS), constraintOf("boolean\n        | undefined", "Fixture", ENUMS)], ["k.number", "k.boolean"]);
    });

    it("should map a color with or without the Base qualifier", () => {
        // Act & Assert
        assert.deepEqual([constraintOf("Color", "Fixture", ENUMS), constraintOf("Base.Color | undefined", "Fixture", ENUMS)], ["k.color", "k.color"]);
    });

    it("should map points and vectors of two and three coordinates", () => {
        // Act & Assert
        assert.deepEqual(
            [constraintOf("Base.Point2", "Fixture", ENUMS), constraintOf("Point3", "Fixture", ENUMS), constraintOf("Base.Vector2", "Fixture", ENUMS), constraintOf("Vector3 | undefined", "Fixture", ENUMS)],
            ["k.point2", "k.point3", "k.vector2", "k.vector3"],
        );
    });

    it("should map a point of either two or three coordinates in either order", () => {
        // Act & Assert
        assert.deepEqual([constraintOf("Base.Point2 | Base.Point3", "Fixture", ENUMS), constraintOf("Point3 | Point2 | undefined", "Fixture", ENUMS)], ["k.point", "k.point"]);
    });

    it("should map a union of string literals to the values it allows", () => {
        // Act & Assert
        assert.equal(constraintOf("\"left\" | \"right\" | undefined", "Fixture", ENUMS), "k.oneOf([\"left\", \"right\"])");
    });

    it("should map a string enum of the property's namespace and of another namespace", () => {
        // Act & Assert
        assert.deepEqual(
            [constraintOf("directionEnum", "Fixture", ENUMS), constraintOf("Base.colorModeEnum | undefined", "Fixture", ENUMS)],
            ["k.oneOf([\"up\", \"down\"])", "k.oneOf([\"rgb\", \"hex\"])"],
        );
    });

    it("should map lists of any kind, nested lists and a parenthesized union list", () => {
        // Act & Assert
        assert.deepEqual(
            [constraintOf("number[]", "Fixture", ENUMS), constraintOf("Base.Point3[][] | undefined", "Fixture", ENUMS), constraintOf("(Base.Point2 | Base.Point3)[]", "Fixture", ENUMS), constraintOf("directionEnum[]", "Fixture", ENUMS)],
            ["k.list(k.number)", "k.list(k.list(k.point3))", "k.list(k.point)", "k.list(k.oneOf([\"up\", \"down\"]))"],
        );
    });

    it("should fall back to opaque for what it cannot check", () => {
        // Act & Assert
        assert.deepEqual(
            [
                constraintOf("TopoDS_Shape", "Fixture", ENUMS),
                constraintOf("T", "Fixture", ENUMS),
                constraintOf("number | string", "Fixture", ENUMS),
                constraintOf("\"only\"", "Fixture", ENUMS),
                constraintOf("number[] | Base.Point3", "Fixture", ENUMS),
                constraintOf("undefined | number", "Fixture", ENUMS),
                constraintOf("unknownEnum", "Fixture", ENUMS),
                constraintOf("Base.Point4", "Fixture", ENUMS),
            ],
            ["k.opaque", "k.opaque", "k.opaque", "k.opaque", "k.opaque", "k.opaque", "k.opaque", "k.opaque"],
        );
    });

    it("should not find an enum of another namespace by its bare name", () => {
        // Act & Assert
        assert.equal(constraintOf("colorModeEnum", "Fixture", ENUMS), "k.opaque");
    });
});

describe("boundsOf", () => {
    it("should read a finite minimum and maximum", () => {
        // Act & Assert
        assert.equal(boundsOf(numberWithTags("@minimum 0", "@maximum 10")), "{ min: 0, max: 10 }");
    });

    it("should make a minimum exclusive with exclusiveMinimum true", () => {
        // Act & Assert
        assert.equal(boundsOf(numberWithTags("@minimum 0", "@maximum Infinity", "@exclusiveMinimum true")), "{ min: 0, exclusiveMin: true }");
    });

    it("should make a maximum exclusive with exclusiveMaximum true", () => {
        // Act & Assert
        assert.equal(boundsOf(numberWithTags("@maximum 1", "@exclusiveMaximum true")), "{ max: 1, exclusiveMax: true }");
    });

    it("should list both bounds before both exclusive flags", () => {
        // Act & Assert
        assert.equal(boundsOf(numberWithTags("@exclusiveMaximum true", "@exclusiveMinimum true", "@maximum 1", "@minimum -0.5")), "{ min: -0.5, max: 1, exclusiveMin: true, exclusiveMax: true }");
    });

    it("should leave out infinite bounds", () => {
        // Act & Assert
        assert.deepEqual([boundsOf(numberWithTags("@minimum -Infinity", "@maximum Infinity")), boundsOf(numberWithTags("@minimum -Infinity", "@maximum 5"))], [undefined, "{ max: 5 }"]);
    });

    it("should not make an infinite or missing bound exclusive", () => {
        // Act & Assert
        assert.deepEqual([boundsOf(numberWithTags("@minimum -Infinity", "@exclusiveMinimum true")), boundsOf(numberWithTags("@exclusiveMaximum true"))], [undefined, undefined]);
    });

    it("should only make a bound exclusive when the flag says true", () => {
        // Act & Assert
        assert.equal(boundsOf(numberWithTags("@minimum 0", "@exclusiveMinimum false")), "{ min: 0 }");
    });

    it("should return nothing for a property without bounds", () => {
        // Act & Assert
        assert.equal(boundsOf(numberWithTags("@default 1")), undefined);
    });

    it("should read only the JSDoc block nearest the property", () => {
        // Arrange
        const twoBlocks = sourceOf("class Dto {\n    /**\n     * @minimum 5\n     */\n    /**\n     * @maximum 7\n     */\n    value?: number | undefined = 6;\n}\n").statements[0].members[0];

        // Act & Assert
        assert.equal(boundsOf(twoBlocks), "{ max: 7 }");
    });
});

const namespaceFixture = `
export namespace Fixture {
    export enum directionEnum { up = "up", down = "down" }
    export enum countEnum { one = "one", two = 2 }
    export type ShapeLike = { id: string };
    export interface Named { name: string }
    export class PointDto {
        /**
         * Radius in model units.
         * @default 1
         * @minimum 0
         * @exclusiveMinimum true
         */
        radius?: number | undefined = 1;
        center!: Base.Point3;
        label?: string | undefined;
        [key: string]: unknown;
    }
    export class GenericDto<T extends ShapeLike = ShapeLike, U = number> {
        shape!: T;
    }
    export class ChildDto extends PointDto {
        extra?: boolean | undefined = true;
    }
    export class QualifiedChildDto extends Other.PointDto {
        own?: number | undefined = 2;
    }
}
export class OutsideDto {
    value = 1;
}
`;

describe("dtoClasses", () => {
    it("should key every class of a namespace by namespace and name, and ignore a class outside one", () => {
        // Act
        const classes = dtoClasses([sourceOf(namespaceFixture)]);

        // Assert
        assert.deepEqual([...classes.keys()], ["Fixture.PointDto", "Fixture.GenericDto", "Fixture.ChildDto", "Fixture.QualifiedChildDto"]);
    });

    it("should record each named property's type, initializer, definite assignment and bounds", () => {
        // Act
        const point = dtoClasses([sourceOf(namespaceFixture)]).get("Fixture.PointDto");

        // Assert
        assert.deepEqual(point.props, [
            { name: "radius", type: "number | undefined", defaulted: true, required: false, bounds: "{ min: 0, exclusiveMin: true }" },
            { name: "center", type: "Base.Point3", defaulted: false, required: true, bounds: undefined },
            { name: "label", type: "string | undefined", defaulted: false, required: false, bounds: undefined },
        ]);
    });

    it("should record the parent as written, qualified or not", () => {
        // Act
        const classes = dtoClasses([sourceOf(namespaceFixture)]);

        // Assert
        assert.deepEqual([classes.get("Fixture.PointDto").parent, classes.get("Fixture.ChildDto").parent, classes.get("Fixture.QualifiedChildDto").parent], [undefined, "PointDto", "Other.PointDto"]);
    });

    it("should record each type parameter with its constraint and default", () => {
        // Act
        const generic = dtoClasses([sourceOf(namespaceFixture)]).get("Fixture.GenericDto");

        // Assert
        assert.deepEqual(generic.typeParams, [{ name: "T", text: "T extends ShapeLike = ShapeLike" }, { name: "U", text: "U = number" }]);
    });

    it("should collect a string enum's values and skip an enum with a member that is not a string", () => {
        // Arrange
        const enums = new Map();

        // Act
        dtoClasses([sourceOf(namespaceFixture)], new Map(), enums);

        // Assert
        assert.deepEqual([...enums], [["Fixture.directionEnum", ["up", "down"]]]);
    });

    it("should list every name each namespace declares", () => {
        // Arrange
        const declared = new Map();

        // Act
        dtoClasses([sourceOf(namespaceFixture)], declared);

        // Assert
        assert.deepEqual([...declared.get("Fixture")], ["directionEnum", "countEnum", "ShapeLike", "Named", "PointDto", "GenericDto", "ChildDto", "QualifiedChildDto"]);
    });
});

const inheritanceFixture = `
export namespace Fixture {
    export class BaseShapeDto {
        tolerance?: number | undefined = 0.1;
        label?: string | undefined;
    }
    export class ShapeDto extends BaseShapeDto {
        shape!: TopoDS_Shape;
    }
    export class MeshDto extends ShapeDto {
        precision?: number | undefined = 0.01;
    }
    export abstract class SphereSharedDto {
        radius?: number | undefined = 1;
        segments?: number | undefined = 24;
    }
    export class SphereCentersDto extends SphereSharedDto {
        centers!: Base.Point3[];
    }
    export class ForeignParentDto extends Missing.ParentDto {
        own?: number | undefined = 1;
    }
    export class LoopADto extends LoopBDto {
        a?: number | undefined = 1;
    }
    export class LoopBDto extends LoopADto {
        b?: number | undefined = 1;
    }
    export class PointHolderDto {
        center?: Base.Point2 | Base.Point3 | undefined = [0, 0];
    }
    export class Point3HolderDto extends PointHolderDto {
        center?: Base.Point3 | undefined = [0, 0, 0];
    }
}
`;

describe("allProps", () => {
    it("should put a concrete parent's properties first, through every ancestor", () => {
        // Act
        const names = allProps(dtoClasses([sourceOf(inheritanceFixture)]), "Fixture.MeshDto").map((p) => p.name);

        // Assert
        assert.deepEqual(names, ["tolerance", "label", "shape", "precision"]);
    });

    it("should find a parent of another namespace by its qualified name", () => {
        // Arrange
        const qualified = sourceOf("export namespace Base {\n    export class OriginDto {\n        origin?: number | undefined = 0;\n    }\n}\nexport namespace Fixture {\n    export class OriginDto {\n        decoy?: number | undefined = 0;\n    }\n    export class PlacedDto extends Base.OriginDto {\n        size?: number | undefined = 1;\n    }\n}\n");

        // Act
        const names = allProps(dtoClasses([qualified]), "Fixture.PlacedDto").map((p) => p.name);

        // Assert
        assert.deepEqual(names, ["origin", "size"]);
    });

    it("should list only a class's own properties when its parent is not among the classes", () => {
        // Act
        const names = allProps(dtoClasses([sourceOf(inheritanceFixture)]), "Fixture.ForeignParentDto").map((p) => p.name);

        // Assert
        assert.deepEqual(names, ["own"]);
    });

    it("should stop at a class it has already listed", () => {
        // Act
        const names = allProps(dtoClasses([sourceOf(inheritanceFixture)]), "Fixture.LoopADto").map((p) => p.name);

        // Assert
        assert.deepEqual(names, ["b", "a"]);
    });

    it("should return nothing for a class it does not know", () => {
        // Act & Assert
        assert.deepEqual(allProps(dtoClasses([sourceOf(inheritanceFixture)]), "Fixture.MissingDto"), []);
    });
});

describe("bare", () => {
    it("should drop whitespace, undefined and the type arguments", () => {
        // Act & Assert
        assert.deepEqual([bare("Fixture.InnerDto<number> | undefined"), bare("InnerDto | OtherDto"), bare("undefined | InnerDto")], ["Fixture.InnerDto", "InnerDto|OtherDto", "InnerDto"]);
    });
});

const nestingFixture = `
export namespace Fixture {
    export class InnerDto {
        size?: number | undefined = 1;
    }
    export class GenericInnerDto<T> {
        value!: T;
    }
    export class HolderDto {
        inner!: InnerDto;
        maybeInner?: InnerDto | undefined;
        genericInner!: GenericInnerDto<number>;
        foreign!: Other.OuterDto;
        inners!: InnerDto[];
        either!: InnerDto | GenericInnerDto<number>;
        self?: HolderDto | undefined;
        size?: number | undefined = 2;
        unknownDto!: MissingDto;
    }
    export class SubHolderDto extends HolderDto {
        extra!: InnerDto;
    }
}
export namespace Other {
    export class OuterDto {
        flag?: boolean | undefined = true;
    }
}
`;

describe("nestedOf", () => {
    it("should list each property holding one DTO of its own, qualified by namespace", () => {
        // Act
        const nested = nestedOf(dtoClasses([sourceOf(nestingFixture)]), "Fixture.HolderDto");

        // Assert
        assert.deepEqual(nested, [["inner", "Fixture.InnerDto"], ["maybeInner", "Fixture.InnerDto"], ["genericInner", "Fixture.GenericInnerDto"], ["foreign", "Other.OuterDto"]]);
    });

    it("should include the nested properties a class inherits, and one holding its parent", () => {
        // Act
        const nested = nestedOf(dtoClasses([sourceOf(nestingFixture)]), "Fixture.SubHolderDto");

        // Assert
        assert.deepEqual(nested.map(([name]) => name), ["inner", "maybeInner", "genericInner", "foreign", "self", "extra"]);
    });
});

describe("constraintsOf", () => {
    it("should wrap a definitely assigned property in required", () => {
        // Act & Assert
        assert.equal(constraintsFor("        shape!: TopoDS_Shape;\n        center!: Base.Point3;\n        label?: string | undefined;"), "{ shape: k.required(k.opaque), center: k.required(k.point3), label: k.string }");
    });

    it("should not require a default spelled without ?, and treat one without a type as opaque", () => {
        // Act & Assert
        assert.equal(constraintsFor("        size = 0;\n        tag: string = \"a\";"), "{ size: k.opaque, tag: k.string }");
    });

    it("should bound a number by its tags, exclusive where they say so", () => {
        // Arrange
        const members = "        /**\n         * @minimum 0\n         * @exclusiveMinimum true\n         */\n        precision?: number | undefined = 0.01;";

        // Act & Assert
        assert.equal(constraintsFor(members), "{ precision: k.between(k.number, { min: 0, exclusiveMin: true }) }");
    });

    it("should bound a required number inside required", () => {
        // Arrange
        const members = "        /**\n         * @minimum 1\n         */\n        count!: number;";

        // Act & Assert
        assert.equal(constraintsFor(members), "{ count: k.required(k.between(k.number, { min: 1 })) }");
    });

    it("should bound each number of a list of numbers", () => {
        // Arrange
        const members = "        /**\n         * @minimum 0\n         * @maximum 1\n         */\n        params?: number[] | undefined;";

        // Act & Assert
        assert.equal(constraintsFor(members), "{ params: k.list(k.between(k.number, { min: 0, max: 1 })) }");
    });

    it("should ignore bounds on a value that is not a number or a list of numbers", () => {
        // Arrange
        const members = "        /**\n         * @minimum 0\n         */\n        center?: Base.Point3 | undefined = [0, 0, 0];\n        /**\n         * @minimum 0\n         */\n        grid?: number[][] | undefined;";

        // Act & Assert
        assert.equal(constraintsFor(members), "{ center: k.point3, grid: k.list(k.list(k.number)) }");
    });

    it("should leave a number with infinite bounds unbounded", () => {
        // Arrange
        const members = "        /**\n         * @minimum -Infinity\n         * @maximum Infinity\n         */\n        angle?: number | undefined = 0;";

        // Act & Assert
        assert.equal(constraintsFor(members), "{ angle: k.number }");
    });

    it("should constrain an enum of the namespace to its values", () => {
        // Act & Assert
        assert.equal(constraintsFor("        direction?: directionEnum | undefined = directionEnum.up;"), "{ direction: k.oneOf([\"up\", \"down\"]) }");
    });

    it("should list a concrete parent's properties before the class's own", () => {
        // Act
        const text = constraintsOf(dtoClasses([sourceOf(inheritanceFixture)]), "Fixture.ShapeDto", new Map());

        // Assert
        assert.equal(text, "{ tolerance: k.number, label: k.string, shape: k.required(k.opaque) }");
    });

    it("should list an abstract parent's properties after the class's own", () => {
        // Act
        const text = constraintsOf(dtoClasses([sourceOf(inheritanceFixture)]), "Fixture.SphereCentersDto", new Map());

        // Assert
        assert.equal(text, "{ centers: k.required(k.list(k.point3)), radius: k.number, segments: k.number }");
    });

    it("should list a property a subclass redeclares once", () => {
        // Act
        const text = constraintsOf(dtoClasses([sourceOf(inheritanceFixture)]), "Fixture.Point3HolderDto", new Map());

        // Assert
        assert.equal(text.split("center:").length, 2);
    });

    it("should constrain a property a subclass narrows by the subclass's declaration", () => {
        // Act
        const text = constraintsOf(dtoClasses([sourceOf(inheritanceFixture)]), "Fixture.Point3HolderDto", new Map());

        // Assert
        assert.equal(text, "{ center: k.point3 }");
    });
});

const registryInputs = `
export namespace Fixture {
    export class InnerDto {
        size?: number | undefined = 1;
    }
    export class BoxDto {
        width?: number | undefined = 1;
        inner!: InnerDto;
    }
    export class AreaDto<T> {
        shape!: T;
    }
}
`;

const registryKernel = `
export class Kernel {
    shapes: Shapes;
    version(): string { return "1"; }
}
export class Shapes {
    box(inputs: Inputs.Fixture.BoxDto): number { return 0; }
    area(inputs: Inputs.Fixture.AreaDto<TopoDS_Shape>): number { return 0; }
    boxes(inputs: Inputs.Fixture.BoxDto): number[] { return []; }
}
`;

const FIXTURE_KERNEL = { name: "fixture", label: "Fixture", kernelRoot: "Kernel", constant: "fixtureDtoRegistry" };

const registryOf = (inputs, kernel) => {
    const enums = new Map();
    const classes = dtoClasses([sourceOf(inputs)], new Map(), enums);
    const kernelSf = ts.createSourceFile(KERNEL_FILE, kernel, ts.ScriptTarget.Latest, true);
    const kernelClasses = new Map(kernelSf.statements.filter(ts.isClassDeclaration).map((node) => [node.name.text, { node, sf: kernelSf, file: KERNEL_FILE, duplicates: [] }]));
    return registryText(FIXTURE_KERNEL, classes, enums, kernelSurface(kernelClasses, "Kernel"));
};

describe("registryText", () => {
    it("should write every operation by its sorted dotted path, with one sorted constraint table per DTO", () => {
        // Act
        const text = registryOf(registryInputs, registryKernel);

        // Assert
        assert.equal(text, [
            "// GENERATED by scripts/gen-dto-meta.mjs from the Kernel surface - do not edit.",
            "// Regenerate with `npm run gen:dto-meta` at the repository root.",
            "import { constraintKinds as k, DtoConstraints, DtoRegistry } from \"@bitbybit-dev/base\";",
            "import * as Inputs from \"./inputs\";",
            "",
            "const Fixture_AreaDto: DtoConstraints = { shape: k.required(k.opaque) };",
            "const Fixture_BoxDto: DtoConstraints = { width: k.number, inner: k.required(k.opaque) };",
            "",
            "/**",
            " * Every public operation of the Fixture kernel by its dotted path, the inputs DTO it",
            " * takes, and what each property of that DTO accepts. `resolveInputs` from the base package reads",
            " * it to lay a caller's properties over that DTO's defaults before the kernel runs, and",
            " * `validateInputs` to check what the call was given.",
            " */",
            "export const fixtureDtoRegistry: DtoRegistry = {",
            "    \"shapes.area\": { dto: Inputs.Fixture.AreaDto, constraints: Fixture_AreaDto },",
            "    \"shapes.box\": { dto: Inputs.Fixture.BoxDto, nested: { inner: Inputs.Fixture.InnerDto }, constraints: Fixture_BoxDto },",
            "    \"shapes.boxes\": { dto: Inputs.Fixture.BoxDto, nested: { inner: Inputs.Fixture.InnerDto }, constraints: Fixture_BoxDto },",
            "    \"version\": {},",
            "};",
            "",
        ].join("\n"));
    });

    it("should refuse a method whose parameter is not an inputs DTO", () => {
        // Arrange
        const kernel = "export class Kernel {\n    scale(factor: number): number { return factor; }\n}\n";

        // Act & Assert
        assert.throws(() => registryOf(registryInputs, kernel), { message: "fixture: scale takes number, not an inputs DTO" });
    });

    it("should refuse a DTO that is not a class of the inputs namespaces", () => {
        // Arrange
        const kernel = "export class Kernel {\n    make(inputs: Inputs.Fixture.MissingDto): number { return 0; }\n}\n";

        // Act & Assert
        assert.throws(() => registryOf(registryInputs, kernel), { message: "fixture: make takes Inputs.Fixture.MissingDto, which is not a class in the inputs namespaces" });
    });
});

const mirrorInputs = `
export namespace Fixture {
    export type ShapeLike = { id: string };
    export class PointDto {
        x?: number | undefined = 0;
        y?: number | undefined = 0;
        label?: string | undefined;
    }
    export class NamedPointDto extends PointDto {
        name?: string | undefined = "a";
        y?: number | undefined = 1;
    }
    export class ShapeDto<T extends ShapeLike = ShapeLike, U = Base.Point3, V = Other.PointDto> {
        shape!: T;
        tolerance?: number | undefined = 1e-7;
    }
    export class PlainDto {
        value!: number;
    }
}
export namespace Alpha {
    export class ZetaDto {
        on?: boolean | undefined = true;
    }
    export class AlphaDto {
        off!: boolean;
    }
}
`;

const mirrorIndex = `
export * from "./fixture-inputs";
export * from "@bitbybit-dev/base/lib/api/inputs";
export { JSCAD, Missing } from "@bitbybit-dev/jscad/lib/api/inputs";
export { Hidden } from "@bitbybit-dev/occt/lib/api/inputs";
export { local };
`;

const lowerMirrors = () => new Map([["@bitbybit-dev/base", new Set(["Base", "Color"])], ["@bitbybit-dev/jscad", new Set(["JSCAD"])], ["@bitbybit-dev/occt", new Set(["OCCT"])]]);
const indexOf = (text) => sourceOf(text, path.join(INPUTS_DIR, "index.ts"));
const MIRROR_TARGET = () => ({ name: "fixture", withDefaults: "@bitbybit-dev/base" });

describe("generateResolved", () => {
    it("should alias every DTO with the keys its defaults fill, by sorted namespace and name", () => {
        // Act
        const text = generateResolved(MIRROR_TARGET(), { files: [sourceOf(mirrorInputs)], index: indexOf(""), namespaces: new Map() });

        // Assert
        assert.equal(text, [
            "// GENERATED by scripts/gen-dto-meta.mjs from the inputs DTOs - do not edit.",
            "// Regenerate with `npm run gen:dto-meta` at the repository root.",
            "/* eslint-disable @typescript-eslint/no-namespace */",
            "import { WithDefaults } from \"@bitbybit-dev/base\";",
            "import * as Inputs from \"../inputs\";",
            "",
            "/**",
            " * The Alpha inputs DTOs as their defaults leave them: every property with a default is present,",
            " * the way `resolveDto` hands a DTO to the code that reads it.",
            " */",
            "export namespace Alpha {",
            "    export type AlphaDto = Inputs.Alpha.AlphaDto;",
            "    export type ZetaDto = WithDefaults<Inputs.Alpha.ZetaDto, \"on\">;",
            "}",
            "",
            "/**",
            " * The Fixture inputs DTOs as their defaults leave them: every property with a default is present,",
            " * the way `resolveDto` hands a DTO to the code that reads it.",
            " */",
            "export namespace Fixture {",
            "    export type NamedPointDto = WithDefaults<Inputs.Fixture.NamedPointDto, \"x\" | \"y\" | \"name\">;",
            "    export type PlainDto = Inputs.Fixture.PlainDto;",
            "    export type PointDto = WithDefaults<Inputs.Fixture.PointDto, \"x\" | \"y\">;",
            "    export type ShapeDto<T extends Inputs.Fixture.ShapeLike = Inputs.Fixture.ShapeLike, U = Base.Point3, V = Other.PointDto> = WithDefaults<Inputs.Fixture.ShapeDto<T, U, V>, \"tolerance\">;",
            "}",
            "",
        ].join("\n"));
    });

    it("should import WithDefaults from where the target says", () => {
        // Act
        const text = generateResolved({ name: "base", withDefaults: "../kernel-calls" }, { files: [sourceOf(mirrorInputs)], index: indexOf(""), namespaces: new Map() });

        // Assert
        assert.equal(text.split("\n")[3], "import { WithDefaults } from \"../kernel-calls\";");
    });

    it("should re-export the lower mirrors after the imports", () => {
        // Act
        const text = generateResolved(MIRROR_TARGET(), { files: [sourceOf(mirrorInputs)], index: indexOf(mirrorIndex), namespaces: lowerMirrors() });

        // Assert
        assert.deepEqual(text.split("\n").slice(4, 8), [
            "import * as Inputs from \"../inputs\";",
            "export * from \"@bitbybit-dev/base/lib/api/resolved-inputs\";",
            "export type { JSCAD } from \"@bitbybit-dev/jscad/lib/api/resolved-inputs\";",
            "",
        ]);
    });

    it("should record the namespaces its mirror exports, its own and the re-exported, for the mirrors after it", () => {
        // Arrange
        const namespaces = lowerMirrors();

        // Act
        generateResolved(MIRROR_TARGET(), { files: [sourceOf(mirrorInputs)], index: indexOf(mirrorIndex), namespaces });

        // Assert
        assert.deepEqual([...namespaces.get("@bitbybit-dev/fixture")], ["Fixture", "Alpha", "Base", "Color", "JSCAD"]);
    });
});

describe("mirrorReexports", () => {
    it("should re-export a whole lower mirror, and by type only the namespaces a lower mirror has", () => {
        // Arrange
        const target = { name: "fixture", namespaces: new Set() };

        // Act
        const lines = mirrorReexports(target, indexOf(mirrorIndex), lowerMirrors());

        // Assert
        assert.deepEqual({ lines, namespaces: [...target.namespaces] }, {
            lines: ["export * from \"@bitbybit-dev/base/lib/api/resolved-inputs\";", "export type { JSCAD } from \"@bitbybit-dev/jscad/lib/api/resolved-inputs\";"],
            namespaces: ["Base", "Color", "JSCAD"],
        });
    });

    it("should refuse a re-export of a package whose mirror is not generated before it", () => {
        // Arrange
        const target = { name: "fixture", namespaces: new Set() };
        const index = indexOf("export * from \"@bitbybit-dev/core/lib/api/inputs\";\n");

        // Act & Assert
        assert.throws(() => mirrorReexports(target, index, lowerMirrors()), { message: "fixture: its inputs re-export @bitbybit-dev/core/lib/api/inputs, which has no mirror generated before it" });
    });
});
