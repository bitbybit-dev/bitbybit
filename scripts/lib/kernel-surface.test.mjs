import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import ts from "typescript";
import { ROOT } from "./surface.mjs";
import { kernelSurface } from "./kernel-surface.mjs";

const KERNEL_FILE = path.join(ROOT, "packages/dev/fixture/lib/kernel.ts");

const classesOf = (text) => {
    const sf = ts.createSourceFile(KERNEL_FILE, text, ts.ScriptTarget.Latest, true);
    return new Map(sf.statements.filter(ts.isClassDeclaration).map((node) => [node.name.text, { node, sf, file: KERNEL_FILE, duplicates: [] }]));
};

const kernelOfThreeClasses = `
/**
 * The root of the fixture kernel.
 */
export class Kernel {
    shapes: Shapes;
    io: Io;
    private hiddenShapes: Shapes;
    protected guardedShapes: Shapes;
    static sharedShapes: Shapes;
    helper: NotAClassOfTheKernel;
    constructor(shapes: Shapes, io: Io) { this.shapes = shapes; this.io = io; }
    /**
     * Returns the version text.
     */
    version(): string { return "1"; }
    private reset(): void { return; }
    protected clean(): void { return; }
    static create(): Kernel { return new Kernel(new Shapes(), new Io()); }
    private untyped() { return 1; }
}
export class Shapes {
    solid: Solid;
    /**
     * Makes a box.
     */
    box(inputs: Inputs.Fixture.BoxDto): TopoDS_Solid { return inputs; }
}
export class Solid {
    owner: Shapes;
    volume(inputs: Inputs.Fixture.ShapeDto<TopoDS_Solid>, context): number { return 0; }
}
export class Io {
    kernel: Kernel;
    read(inputs: Inputs.Fixture.FileDto): Promise<string> { return Promise.resolve(""); }
}
`;

const surfaceOf = (text) => kernelSurface(classesOf(text), "Kernel");

describe("kernelSurface", () => {
    it("should reach every API class by the dotted prefix a path resolves through", () => {
        // Act
        const surface = surfaceOf(kernelOfThreeClasses);

        // Assert
        assert.deepEqual([...surface.keys()], ["", "shapes", "shapes.solid", "io"]);
    });

    it("should name the class under each prefix", () => {
        // Act
        const surface = surfaceOf(kernelOfThreeClasses);

        // Assert
        assert.deepEqual([...surface.values()].map((cls) => cls.className), ["Kernel", "Shapes", "Solid", "Io"]);
    });

    it("should list a method by its dotted path with its parameters, return type and doc", () => {
        // Act
        const box = surfaceOf(kernelOfThreeClasses).get("shapes").methods[0];

        // Assert
        assert.deepEqual(box, {
            name: "box",
            path: "shapes.box",
            doc: "/**\n     * Makes a box.\n     */",
            params: [{ name: "inputs", type: "Inputs.Fixture.BoxDto" }],
            returns: "TopoDS_Solid",
        });
    });

    it("should keep the type arguments of a parameter and call an untyped one unknown", () => {
        // Act
        const volume = surfaceOf(kernelOfThreeClasses).get("shapes.solid").methods[0];

        // Assert
        assert.deepEqual(volume.params, [{ name: "inputs", type: "Inputs.Fixture.ShapeDto<TopoDS_Solid>" }, { name: "context", type: "unknown" }]);
    });

    it("should list only the public instance members of a class", () => {
        // Act
        const root = surfaceOf(kernelOfThreeClasses).get("");

        // Assert
        assert.deepEqual({ props: root.props, methods: root.methods.map((m) => m.path) }, {
            props: [{ name: "shapes", className: "Shapes" }, { name: "io", className: "Io" }],
            methods: ["version"],
        });
    });

    it("should keep the class doc and the file relative to the repository root", () => {
        // Act
        const root = surfaceOf(kernelOfThreeClasses).get("");

        // Assert
        assert.deepEqual({ doc: root.doc, file: root.file }, {
            doc: "/**\n * The root of the fixture kernel.\n */",
            file: "packages/dev/fixture/lib/kernel.ts",
        });
    });

    it("should record a property leading back up the path without walking it again", () => {
        // Act
        const surface = surfaceOf(kernelOfThreeClasses);

        // Assert
        assert.deepEqual({ solid: surface.get("shapes.solid").props, io: surface.get("io").props, walked: surface.has("shapes.solid.owner") || surface.has("io.kernel") }, {
            solid: [{ name: "owner", className: "Shapes" }],
            io: [{ name: "kernel", className: "Kernel" }],
            walked: false,
        });
    });

    it("should reach one class under every property that holds it", () => {
        // Arrange
        const twoPropertiesOfOneClass = "export class Kernel {\n    left: Side;\n    right: Side;\n}\nexport class Side {\n    width(): number { return 1; }\n}\n";

        // Act
        const surface = surfaceOf(twoPropertiesOfOneClass);

        // Assert
        assert.deepEqual([...surface.values()].flatMap((cls) => cls.methods.map((m) => m.path)), ["left.width", "right.width"]);
    });

    it("should return an empty surface when the root class is missing", () => {
        // Act
        const surface = kernelSurface(classesOf(kernelOfThreeClasses), "Missing");

        // Assert
        assert.equal(surface.size, 0);
    });

    it("should refuse a class that extends another", () => {
        // Arrange
        const extending = "export class Kernel extends Base {\n    version(): string { return \"1\"; }\n}\n";

        // Act & Assert
        assert.throws(() => surfaceOf(extending), { message: "packages/dev/fixture/lib/kernel.ts: Kernel extends Base; the generator emits flat classes" });
    });

    it("should refuse a public method without a return type", () => {
        // Arrange
        const untyped = "export class Kernel {\n    version() { return \"1\"; }\n}\n";

        // Act & Assert
        assert.throws(() => surfaceOf(untyped), { message: "packages/dev/fixture/lib/kernel.ts: Kernel.version has no return type annotation" });
    });

    it("should refuse a method with type parameters", () => {
        // Arrange
        const generic = "export class Kernel {\n    same<T>(inputs: T): T { return inputs; }\n}\n";

        // Act & Assert
        assert.throws(() => surfaceOf(generic), { message: "packages/dev/fixture/lib/kernel.ts: Kernel.same has type parameters" });
    });

    it("should refuse an optional parameter", () => {
        // Arrange
        const optional = "export class Kernel {\n    run(inputs?: number): void { return; }\n}\n";

        // Act & Assert
        assert.throws(() => surfaceOf(optional), { message: "packages/dev/fixture/lib/kernel.ts: Kernel.run has an optional, default or rest parameter" });
    });

    it("should refuse a parameter with a default", () => {
        // Arrange
        const defaulted = "export class Kernel {\n    run(inputs = 1): void { return; }\n}\n";

        // Act & Assert
        assert.throws(() => surfaceOf(defaulted), /Kernel\.run has an optional, default or rest parameter/);
    });

    it("should refuse a rest parameter", () => {
        // Arrange
        const rest = "export class Kernel {\n    run(...inputs: number[]): void { return; }\n}\n";

        // Act & Assert
        assert.throws(() => surfaceOf(rest), /Kernel\.run has an optional, default or rest parameter/);
    });
});
