import { describe, it, expect } from "vitest";
import { resolveInputs } from "@bitbybit-dev/base";
import { occtDtoRegistry } from "../../api/dto-registry";

describe("the operation defaults documents rely on", () => {
    it("should keep every input default an operation, a filter or a sketch command fills in", async () => {
        // Arrange
        const paths = Object.keys(occtDtoRegistry).filter(path => !path.startsWith("design.")).sort();

        // Act
        const lines = paths.map(path => `  ${JSON.stringify(path)}: ${JSON.stringify(resolveInputs(occtDtoRegistry, path, {}))}`);

        // Assert
        await expect(`{\n${lines.join(",\n")}\n}\n`).toMatchFileSnapshot("./operation-defaults.json");
    });
});
