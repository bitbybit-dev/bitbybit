import { describe, it, expect } from "vitest";
import { withDefaults } from "./with-defaults";
import { DtoRegistry } from "./resolve-dto";

class BoxDto {
    width = 1;
    height = 2;
}

class Solid {
    readonly engine = { made: 0 };

    createBox(inputs: { width: number; height: number }): { width: number; height: number; engine: object } {
        this.engine.made += 1;
        return { ...inputs, engine: this.engine };
    }

    helper(): string {
        return this.engine === undefined ? "no engine" : "engine";
    }
}

class Kernel {
    readonly shapes = { solid: new Solid() };
    readonly internals = { secret: { deep: 1 } };
    readonly version = "1";

    identity(): string {
        return "kernel";
    }
}

const registry: DtoRegistry = {
    "shapes.solid.createBox": { dto: BoxDto },
    "identity": {},
};

describe("withDefaults", () => {
    it("should fill the defaults of an operation's DTO before the kernel runs it", () => {
        // Arrange
        const kernel = withDefaults(new Kernel(), registry);

        // Act
        const box = kernel.shapes.solid.createBox({ width: 5 } as { width: number; height: number });

        // Assert
        expect(box).toMatchObject({ width: 5, height: 2 });
    });

    it("should run a listed operation with the kernel object itself as this", () => {
        // Arrange
        const raw = new Kernel();
        const kernel = withDefaults(raw, registry);

        // Act
        const box = kernel.shapes.solid.createBox({ width: 5, height: 2 });

        // Assert
        expect(box.engine).toBe(raw.shapes.solid.engine);
        expect(raw.shapes.solid.engine.made).toBe(1);
    });

    it("should hand back the same wrapped object each time a path is read", () => {
        // Arrange
        const kernel = withDefaults(new Kernel(), registry);

        // Act
        const first = kernel.shapes;
        const second = kernel.shapes;

        // Assert
        expect(first).toBe(second);
    });

    it("should leave an object off every operation's path unwrapped", () => {
        // Arrange
        const raw = new Kernel();
        const kernel = withDefaults(raw, registry);

        // Act
        const internals = kernel.internals;

        // Assert
        expect(internals).toBe(raw.internals);
    });

    it("should run a method the registry does not list as the kernel defines it", () => {
        // Arrange
        const kernel = withDefaults(new Kernel(), registry);

        // Act
        const answer = kernel.shapes.solid.helper();

        // Assert
        expect(answer).toBe("engine");
    });

    it("should call a listed operation that takes no DTO with what it was given", () => {
        // Arrange
        const kernel = withDefaults(new Kernel(), registry);

        // Act
        const name = kernel.identity();

        // Assert
        expect(name).toBe("kernel");
    });

    it("should read plain values and symbol keys through untouched", () => {
        // Arrange
        const raw = new Kernel();
        const kernel = withDefaults(raw, registry);

        // Act
        const version = kernel.version;
        const tag = Object.prototype.toString.call(kernel);

        // Assert
        expect(version).toBe("1");
        expect(tag).toBe("[object Object]");
    });
});
