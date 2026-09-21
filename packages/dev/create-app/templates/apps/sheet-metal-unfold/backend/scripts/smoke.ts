import type { AddressInfo } from "node:net";
import { createApp, NO_KEY_CODE } from "../src/app.js";
import type { CloudGateway } from "../src/cloud.js";

const problems: string[] = [];

async function serve(gateway: CloudGateway | null): Promise<{ url: string; close: () => void }> {
    const server = createApp(gateway).listen(0);
    await new Promise<void>((resolve) => server.once("listening", () => { resolve(); }));
    const { port } = server.address() as AddressInfo;
    return { url: `http://127.0.0.1:${port}`, close: () => server.close() };
}

const FLAT_STEP = "ISO-10303-21;\nHEADER;\nENDSEC;\nDATA;\nENDSEC;\nEND-ISO-10303-21;\n";
const calls: string[] = [];
const fake: CloudGateway = {
    uploadStep(fileName, stepText) { calls.push(`upload ${fileName} ${stepText.length}`); return Promise.resolve("file-1"); },
    unfoldSolid(body) { calls.push(`unfold ${body.stepFileId} k=${body.kFactor} ${body.outputs.formats.join("+")}`); return Promise.resolve({ taskId: "task-1" }); },
    waitForTask(taskId) { calls.push(`wait ${taskId}`); return Promise.resolve({ status: "completed", metadata: { report: [{ solidIndex: 0, ok: true, thickness: 2, kFactor: 0.44, bends: [], flatBBox: [0, 0, 120, 60], flatArea: 7200 }] }, error: null }); },
    downloads(taskId) { calls.push(`downloads ${taskId}`); return Promise.resolve([{ format: "step", downloadUrl: "https://example.test/flat.step", filename: "flat.step" }, { format: "glb", downloadUrl: "https://example.test/flat.glb", filename: "flat.glb" }]); },
    fetchText(url) { calls.push(`fetch ${url}`); return Promise.resolve(FLAT_STEP); },
};

const withoutKey = await serve(null);
const locked = await fetch(`${withoutKey.url}/api/unfold`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stepText: "x" }) });
const lockedBody = (await locked.json()) as { code?: string; help?: string };
if (locked.status !== 503) problems.push(`without a key the unfold answered ${locked.status}, expected 503`);
if (lockedBody.code !== NO_KEY_CODE) problems.push(`without a key the code was ${lockedBody.code ?? "missing"}, expected ${NO_KEY_CODE}`);
if (!lockedBody.help?.includes("https://bitbybit.dev/cad-cloud") || !lockedBody.help.includes("https://studio.bitbybit.dev/keys/billing")) problems.push("the no-key answer does not say where to get a key");
const health = (await (await fetch(`${withoutKey.url}/api/health`)).json()) as { cloud: string };
if (health.cloud !== "no key") problems.push(`health without a key reports ${health.cloud}`);
withoutKey.close();

const withKey = await serve(fake);
const unfolded = await fetch(`${withKey.url}/api/unfold`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stepText: "ISO-10303-21;", fileName: "channel.step", kFactor: 0.4 }) });
const result = (await unfolded.json()) as { taskId?: string; report?: unknown[]; flatStep?: string; downloads?: unknown[] };
if (unfolded.status !== 200) problems.push(`with a key the unfold answered ${unfolded.status}: ${JSON.stringify(result)}`);
if (result.taskId !== "task-1") problems.push("the task id is not passed through");
if (!Array.isArray(result.report) || result.report.length !== 1) problems.push("the report from the task metadata is not passed through");
if (result.flatStep !== FLAT_STEP) problems.push("the flat STEP text is not fetched and passed through");
if (!Array.isArray(result.downloads) || result.downloads.length !== 2) problems.push("the downloads are not passed through");
const expectedCalls = ["upload channel.step 13", "unfold file-1 k=0.4 step+gltf", "wait task-1", "downloads task-1", "fetch https://example.test/flat.step"];
if (JSON.stringify(calls) !== JSON.stringify(expectedCalls)) problems.push(`the gateway was called as ${JSON.stringify(calls)}, expected ${JSON.stringify(expectedCalls)}`);
const rejected = await fetch(`${withKey.url}/api/unfold`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
if (rejected.status !== 400) problems.push(`a request without stepText answered ${rejected.status}, expected 400`);
withKey.close();

console.log(JSON.stringify({ template: "sheet-metal-unfold/backend", noKey: { status: locked.status, code: lockedBody.code }, unfold: { status: unfolded.status, calls } }));
if (problems.length) {
    console.error(`smoke: ${problems.join("; ")}`);
    process.exit(1);
}
