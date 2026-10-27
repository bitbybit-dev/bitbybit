import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";

interface Exposure {
    readonly exposedAs?: string;
    readonly internal?: string;
    readonly pending?: boolean;
}

type Manifest = Record<string, Record<string, Exposure>>;

const PENDING_CEILING = 0;
const HELPERS = new URL("./", import.meta.url);
const SERVICES = new URL("../", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("exposure.json", HELPERS), "utf8")) as Manifest;
const DOMAINS = readdirSync(HELPERS).filter(name => statSync(new URL(name, HELPERS)).isDirectory() && name !== "dxf").sort();
const modules = DOMAINS
    .flatMap(domain => readdirSync(new URL(`${domain}/`, HELPERS)).map(name => `${domain}/${name}`))
    .filter(name => name.endsWith(".ts") && !name.endsWith(".test.ts") && !name.includes(".constants") && !name.endsWith("-types.ts"))
    .sort();
const entries = Object.entries(manifest).flatMap(([module, helpers]) => Object.entries(helpers).map(([helper, exposure]) => ({ module, helper, exposure })));

const bodyOf = (source: string, opening: RegExp): string | undefined => {
    const start = source.search(opening);
    if (start < 0) {
        return undefined;
    }
    const open = source.indexOf("{\n", start);
    const end = source.indexOf("\n    }\n", open);
    return source.slice(open + 1, end < 0 ? source.length : end);
};

const reachedFrom = (source: string, method: string): string => {
    const bodies: string[] = [];
    const pending = [new RegExp(`\\n {4}${method}\\(inputs`)];
    const seen = new Set<string>();
    while (pending.length > 0) {
        const body = bodyOf(source, pending.pop()!);
        if (body === undefined) {
            continue;
        }
        bodies.push(body);
        for (const [, called] of body.matchAll(/this\.(\w+)\(/g)) {
            if (!seen.has(called!)) {
                seen.add(called!);
                pending.push(new RegExp(`\\n {4}private ${called!}\\(`));
            }
        }
    }
    return bodies.join("\n");
};

describe("how base's helpers reach users", () => {
    it("should keep every helper in a domain folder, none loose beside the manifest", () => {
        // Act
        const loose = readdirSync(HELPERS).filter(name => name.endsWith(".ts") && !name.endsWith(".test.ts") && name !== "helper-types.ts");

        // Assert
        expect(loose).toEqual([]);
    });

    it("should list every export of every helper module in exposure.json, and nothing else", async () => {
        // Arrange
        const exported = await Promise.all(modules.map(async module => [module, Object.keys(await import(new URL(module, HELPERS).href) as object).sort()]));

        // Act
        const listed = modules.map(module => [module, Object.keys(manifest[module] ?? {}).sort()]);

        // Assert
        expect(listed).toEqual(exported);
        expect(Object.keys(manifest).sort()).toEqual(modules);
    });

    it("should mark each helper exactly one way: exposed, internal with a reason, or waiting to be exposed", () => {
        // Act
        const unclear = entries.filter(({ exposure }) => {
            const ways = [exposure.exposedAs !== undefined, exposure.internal !== undefined, exposure.pending === true].filter(Boolean).length;
            return ways !== 1 || exposure.internal?.trim() === "";
        });

        // Assert
        expect(unclear.map(({ module, helper }) => `${module} ${helper}`)).toEqual([]);
    });

    it("should name, for each exposed helper, a public method in a service whose body below its signature, or a private method it calls, calls the helper", () => {
        // Act
        const unreached = entries.filter(({ helper, exposure }) => {
            if (exposure.exposedAs === undefined) {
                return false;
            }
            const [service, method] = exposure.exposedAs.split(".");
            const file = new URL(`${service}.ts`, SERVICES);
            if (!existsSync(file)) {
                return true;
            }
            const source = readFileSync(file, "utf8");
            return !new RegExp(`\\n {4}${method}\\(inputs`).test(source) || !new RegExp(`\\b${helper}\\(`).test(reachedFrom(source, method!));
        });

        // Assert
        expect(unreached.map(({ module, helper, exposure }) => `${module} ${helper} -> ${exposure.exposedAs}`)).toEqual([]);
    });

    it("should only ever have fewer helpers waiting to be exposed, the count recorded here", () => {
        // Act
        const pending = entries.filter(({ exposure }) => exposure.pending === true).length;

        // Assert
        expect(pending, "a helper was exposed (lower PENDING_CEILING to the new count) or a new one waits (expose it instead)").toBe(PENDING_CEILING);
    });
});
