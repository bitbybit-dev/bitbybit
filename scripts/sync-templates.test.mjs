import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { TEMPLATE_SOURCES, differences, sync } from "./sync-templates.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE = { example: "example", template: "template", paths: ["index.html", "src"] };

function tree(files) {
    const root = mkdtempSync(path.join(tmpdir(), "sync-templates-"));
    for (const [file, text] of Object.entries(files)) {
        mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
        writeFileSync(path.join(root, file), text);
    }
    return root;
}

describe("differences", () => {
    it("should name what the template lacks, what differs and what the example no longer has, within the synced paths only", () => {
        // Arrange
        const root = tree({
            "example/index.html": "<html>",
            "example/src/main.ts": "new",
            "example/src/house/plan.ts": "plan",
            "example/package.json": "{\"name\":\"example\"}",
            "template/src/main.ts": "old",
            "template/src/stale.ts": "stale",
            "template/package.json": "{\"name\":\"template\"}",
        });

        // Act
        const found = differences(root, SOURCE);

        // Assert
        assert.deepEqual(found, {
            missing: ["index.html", path.join("src", "house", "plan.ts")],
            extra: [path.join("src", "stale.ts")],
            changed: [path.join("src", "main.ts")],
        });
    });

    it("should leave out installed packages, builds and operating system files", () => {
        // Arrange
        const root = tree({
            "example/src/main.ts": "same",
            "example/src/node_modules/x.js": "x",
            "example/src/.DS_Store": "x",
            "template/src/main.ts": "same",
            "template/src/dist/main.js": "built",
        });

        // Act
        const found = differences(root, SOURCE);

        // Assert
        assert.deepEqual(found, { missing: [], extra: [], changed: [] });
    });
});

describe("sync", () => {
    it("should make the template's copy equal to the example and keep the template's own files", () => {
        // Arrange
        const root = tree({
            "example/index.html": "<html>",
            "example/src/main.ts": "new",
            "template/src/main.ts": "old",
            "template/src/stale.ts": "stale",
            "template/scripts/smoke.ts": "smoke",
        });

        // Act
        const count = sync(root, SOURCE);

        // Assert
        assert.equal(count, 3);
        assert.deepEqual(differences(root, SOURCE), { missing: [], extra: [], changed: [] });
        assert.equal(readFileSync(path.join(root, "template/src/main.ts"), "utf8"), "new");
        assert.equal(existsSync(path.join(root, "template/src/stale.ts")), false);
        assert.equal(readFileSync(path.join(root, "template/scripts/smoke.ts"), "utf8"), "smoke");
    });
});

describe("the templates copied from examples", () => {
    it("should each name an example and a create-app template that exist", () => {
        // Assert
        for (const source of TEMPLATE_SOURCES) {
            assert.equal(existsSync(path.join(ROOT, source.example, "package.json")), true, source.example);
            assert.equal(existsSync(path.join(ROOT, source.template, "package.json")), true, source.template);
        }
    });
});
