import { describe, it, expect } from "vitest";
import { withDefaults } from "./with-defaults";
import { DtoRegistry } from "./resolve-dto";

class BoxDto {
    width = 1;
    height = 2;
}

const SOLID_TAG: unique symbol = Symbol("solid");

class Solid {
    readonly engine = { made: 0 };
    readonly [SOLID_TAG] = "solid";

    createBox(inputs: { width: number; height: number }): { width: number; height: number; engine: object } {
        this.engine.made += 1;
        return { ...inputs, engine: this.engine };
    }

    self(): Solid {
        return this;
    }

    helper(): string {
        return this.engine === undefined ? "no engine" : "engine";
    }

    area(width: number, height: number): number {
        return width * height;
    }
}

class Kernel {
    readonly shapes = { solid: new Solid() };
    readonly internals = { secret: { deep: 1 } };
    readonly pending: { later: () => string } | null = null;
    readonly version = "1";

    identity(): string {
        return "kernel";
    }
}

const registry: DtoRegistry = {
    "shapes.solid.createBox": { dto: BoxDto },
    "shapes.solid.self": {},
    "pending.later": {},
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

    it("should hand a listed operation the unwrapped object as this, not the wrapper", () => {
        // Arrange
        const raw = new Kernel();
        const kernel = withDefaults(raw, registry);

        // Act
        const self = kernel.shapes.solid.self();

        // Assert
        expect(self).toBe(raw.shapes.solid);
        expect(self).not.toBe(kernel.shapes.solid);
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

    it("should read null on an operation's path as null", () => {
        // Arrange
        const kernel = withDefaults(new Kernel(), registry);

        // Act
        const pending = kernel.pending;

        // Assert
        expect(pending).toBeNull();
    });

    it("should run a method the registry does not list as the kernel defines it", () => {
        // Arrange
        const kernel = withDefaults(new Kernel(), registry);

        // Act
        const answer = kernel.shapes.solid.helper();

        // Assert
        expect(answer).toBe("engine");
    });

    it("should hand back the kernel's own function for a method the registry does not list", () => {
        // Arrange
        const kernel = withDefaults(new Kernel(), registry);

        // Act
        const helper: unknown = Reflect.get(kernel.shapes.solid, "helper");

        // Assert
        expect(helper).toBe(Reflect.get(Solid.prototype, "helper"));
    });

    it("should pass every argument of a method the registry does not list through", () => {
        // Arrange
        const kernel = withDefaults(new Kernel(), registry);

        // Act
        const area = kernel.shapes.solid.area(2, 3);

        // Assert
        expect(area).toBe(6);
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

    it("should read symbol keys through untouched below the root", () => {
        // Arrange
        const kernel = withDefaults(new Kernel(), registry);

        // Act
        const solidTag = kernel.shapes.solid[SOLID_TAG];
        const objectTag = Object.prototype.toString.call(kernel.shapes.solid);

        // Assert
        expect(solidTag).toBe("solid");
        expect(objectTag).toBe("[object Object]");
    });
});
