import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { FIXTURE_VERSION, fixtureIndex } from "./__fixtures__/load.js";

const PACKAGE_DIRECTORY = join(import.meta.dirname, "..");
const ENTRY = join(PACKAGE_DIRECTORY, "dist", "stdio.js");
const OWN_VERSION = (JSON.parse(readFileSync(join(PACKAGE_DIRECTORY, "package.json"), "utf8")) as { version: string }).version;
const BUILD_TIMEOUT_MS = 60_000;
const SESSION_TIMEOUT_MS = 8_000;

interface Session {
    readonly stdout: string[];
    readonly stderr: string;
    readonly exitCode: number | null;
}

let cacheHome = "";

function newestSourceChange(): number {
    const sources = readdirSync(join(PACKAGE_DIRECTORY, "src"), { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts"))
        .map((entry) => statSync(join(entry.parentPath, entry.name)).mtimeMs);
    return Math.max(...sources);
}

function buildIsStale(): boolean {
    return !existsSync(ENTRY) || statSync(ENTRY).mtimeMs < newestSourceChange();
}

beforeAll(() => {
    if (buildIsStale()) execFileSync("npx", ["tsc", "-p", "tsconfig.build.json"], { cwd: PACKAGE_DIRECTORY, stdio: "ignore", timeout: BUILD_TIMEOUT_MS });
    cacheHome = mkdtempSync(join(tmpdir(), "bitbybit-mcp-stdio-"));
    mkdirSync(join(cacheHome, "bitbybit-mcp"), { recursive: true });
    writeFileSync(join(cacheHome, "bitbybit-mcp", `index-v${FIXTURE_VERSION}.json`), JSON.stringify(fixtureIndex()), "utf8");
}, BUILD_TIMEOUT_MS);

afterAll(() => {
    if (cacheHome) rmSync(cacheHome, { recursive: true, force: true });
});

function run(args: string[], messages: object[]): Promise<Session> {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [ENTRY, ...args], { env: { ...process.env, XDG_CACHE_HOME: cacheHome, BITBYBIT_VERSION: "" }, stdio: ["pipe", "pipe", "pipe"] });
        let out = "";
        let err = "";
        const timer = setTimeout(() => { child.kill(); reject(new Error(`no exit within ${SESSION_TIMEOUT_MS} ms; stdout: ${out}; stderr: ${err}`)); }, SESSION_TIMEOUT_MS);
        child.stdout.on("data", (chunk: Buffer) => { out += chunk.toString(); });
        child.stderr.on("data", (chunk: Buffer) => { err += chunk.toString(); });
        child.on("close", (code) => { clearTimeout(timer); resolve({ stdout: out.split("\n").filter((line) => line !== ""), stderr: err, exitCode: code }); });
        child.on("error", reject);
        const expected = messages.filter((message) => "id" in message).length;
        let answered = 0;
        child.stdout.on("data", () => {
            answered = out.split("\n").filter((line) => line.includes("\"result\"")).length;
            if (answered >= expected) child.stdin.end();
        });
        for (const message of messages) child.stdin.write(`${JSON.stringify(message)}\n`);
        if (expected === 0) child.stdin.end();
    });
}

const INITIALIZE = { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "0.0.0" } } };
const INITIALIZED = { jsonrpc: "2.0", method: "notifications/initialized" };
const LIST_TOOLS = { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} };

describe("the stdio entry", () => {
    it("serves a cached version over stdio with nothing but JSON-RPC on stdout, and exits when stdin closes", async () => {
        // Act
        const session = await run(["--version", FIXTURE_VERSION], [INITIALIZE, INITIALIZED, LIST_TOOLS]);

        // Assert
        expect(session.exitCode).toBe(0);
        expect(session.stdout.map((line) => (JSON.parse(line) as { jsonrpc: string }).jsonrpc)).toEqual(["2.0", "2.0"]);
        expect(session.stderr).toContain(`serving the Bitbybit API index for version ${FIXTURE_VERSION} (from flag)`);
        const listed = JSON.parse(session.stdout[1] ?? "{}") as { result: { tools: { name: string }[] } };
        expect(listed.result.tools.map((tool) => tool.name)).toContain("describe");
    });

    it("prints its own version on stdout for a bare --version and exits", async () => {
        // Act
        const session = await run(["--version"], []);

        // Assert
        expect(session.exitCode).toBe(0);
        expect(session.stdout).toEqual([OWN_VERSION]);
    });

    it("prints the help on stderr, leaving stdout empty", async () => {
        // Act
        const session = await run(["--help"], []);

        // Assert
        expect(session.exitCode).toBe(0);
        expect(session.stdout).toEqual([]);
        expect(session.stderr).toContain("bitbybit-mcp");
    });
});
