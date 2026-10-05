import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { invalidJson, isChecked, jsonProblem } from "./check-json.mjs";

describe("jsonProblem", () => {
    it("should accept plain JSON", () => {
        // Act
        const problem = jsonProblem("{\n    \"compilerOptions\": {\n        \"strict\": true\n    }\n}\n");

        // Assert
        assert.equal(problem, null);
    });

    it("should reject a line comment", () => {
        // Act
        const problem = jsonProblem("// the base config\n{\n    \"strict\": true\n}\n");

        // Assert
        assert.equal(typeof problem, "string");
    });

    it("should reject a block comment inside an object", () => {
        // Act
        const problem = jsonProblem("{\n    /* emit nothing */\n    \"noEmit\": true\n}\n");

        // Assert
        assert.equal(typeof problem, "string");
    });

    it("should reject a trailing comma", () => {
        // Act
        const problem = jsonProblem("{\n    \"lib\": [\"es2020\", \"dom\",],\n}\n");

        // Assert
        assert.equal(typeof problem, "string");
    });

    it("should accept comment-like text inside a string", () => {
        // Act
        const problem = jsonProblem("{ \"pattern\": \"// not a comment /* either */\" }");

        // Assert
        assert.equal(problem, null);
    });
});

describe("isChecked", () => {
    it("should check a JSON file anywhere outside the excluded trees", () => {
        // Act
        const checked = ["tsconfig.base.cad.json", "packages/dev/occt/tsconfig.json", "scripts/worker-parity.allow.json"].map(isChecked);

        // Assert
        assert.deepEqual(checked, [true, true, true]);
    });

    it("should leave out the documentation site and the examples", () => {
        // Act
        const checked = ["docs/tsconfig.json", "examples/vite/threejs/cup/tsconfig.json"].map(isChecked);

        // Assert
        assert.deepEqual(checked, [false, false]);
    });

    it("should leave out anything under a node_modules directory", () => {
        // Act
        const checked = ["node_modules/pkg/package.json", "packages/dev/base/node_modules/pkg/tsconfig.json"].map(isChecked);

        // Assert
        assert.deepEqual(checked, [false, false]);
    });

    it("should not mistake a path that merely starts with an excluded name for that tree", () => {
        // Act
        const checked = ["docs-extra/config.json", "packages/dev/core/examples/data.json"].map(isChecked);

        // Assert
        assert.deepEqual(checked, [true, true]);
    });

    it("should check only json files", () => {
        // Act
        const checked = ["wrangler.jsonc", "README.md"].map(isChecked);

        // Assert
        assert.deepEqual(checked, [false, false]);
    });
});

describe("invalidJson", () => {
    it("should list every checked file that does not parse, with its problem, and skip excluded ones", () => {
        // Arrange
        const contents = new Map([
            ["tsconfig.json", "{ \"files\": [] }"],
            ["packages/dev/occt/tsconfig.json", "// generated\n{ \"files\": [] }"],
            ["scripts/allow.json", "{ \"a\": 1, }"],
            ["docs/tsconfig.json", "// the site's own\n{}"],
        ]);

        // Act
        const invalid = invalidJson([...contents.keys()], (file) => contents.get(file));

        // Assert
        assert.deepEqual(invalid.map((entry) => entry.file), ["packages/dev/occt/tsconfig.json", "scripts/allow.json"]);
        assert.ok(invalid.every((entry) => typeof entry.problem === "string" && entry.problem.length > 0));
    });

    it("should not read a file it does not check", () => {
        // Arrange
        const read = [];

        // Act
        invalidJson(["examples/a.json", "node_modules/b/package.json", "c.json"], (file) => { read.push(file); return "{}"; });

        // Assert
        assert.deepEqual(read, ["c.json"]);
    });
});
