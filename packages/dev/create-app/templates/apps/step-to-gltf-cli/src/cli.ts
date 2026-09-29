import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { convertFile, defaultOptions, type ConvertOptions, type Stats } from "./convert.js";
import { convertViaCloud, NO_KEY_EXIT, NO_KEY_MESSAGE, KEY_VARIABLE } from "./cloud.js";
import { loadKernel } from "./kernel.js";

const CAD_EXTENSIONS = new Set([".step", ".stp", ".iges", ".igs"]);
const USAGE = `usage: npm run convert -- <file or directory>... [--out <dir>] [--precision <n>] [--stl-precision <n>] [--no-stl] [--cloud]

  Converts STEP and IGES files to GLB (and STL) in this process, on the open-source OpenCascade
  kernel, and writes a JSON of facts beside each result. Nothing leaves this machine.

  --out <dir>        where to write (default: out)
  --precision <n>    glTF mesh precision as a fraction of each edge (default: ${defaultOptions.meshPrecision})
  --stl-precision <n> STL mesh precision in model units (default: ${defaultOptions.stlPrecision})
  --no-stl           write only GLB and the stats
  --cloud            convert on CAD Cloud instead, one task per file; needs ${KEY_VARIABLE} in the environment.
                     For a serverless function or a volume of files, not for a machine that can run the kernel.
`;

interface Args {
    inputs: string[];
    out: string;
    cloud: boolean;
    options: ConvertOptions;
}

export function parseArgs(argv: string[]): Args {
    const args: Args = { inputs: [], out: "out", cloud: false, options: { ...defaultOptions } };
    const rest = [...argv];
    for (let arg = rest.shift(); arg !== undefined; arg = rest.shift()) {
        if (arg === "--out") args.out = rest.shift() ?? args.out;
        else if (arg === "--precision") args.options.meshPrecision = Number(rest.shift() ?? args.options.meshPrecision);
        else if (arg === "--stl-precision") args.options.stlPrecision = Number(rest.shift() ?? args.options.stlPrecision);
        else if (arg === "--no-stl") args.options.stl = false;
        else if (arg === "--cloud") args.cloud = true;
        else if (arg === "--help" || arg === "-h") { console.log(USAGE); process.exit(0); }
        else if (arg.startsWith("--")) throw new Error(`unknown option ${arg}\n${USAGE}`);
        else args.inputs.push(arg);
    }
    if (args.inputs.length === 0) throw new Error(`nothing to convert\n${USAGE}`);
    if (!(args.options.meshPrecision > 0) || !(args.options.stlPrecision > 0)) throw new Error("--precision and --stl-precision must be positive numbers");
    return args;
}

export function expandInputs(inputs: string[]): string[] {
    const files: string[] = [];
    for (const input of inputs) {
        const path = resolve(input);
        if (!existsSync(path)) throw new Error(`${input}: no such file or directory`);
        if (statSync(path).isDirectory()) {
            for (const entry of readdirSync(path).sort()) {
                if (CAD_EXTENSIONS.has(extname(entry).toLowerCase())) files.push(join(path, entry));
            }
        } else {
            files.push(path);
        }
    }
    if (files.length === 0) throw new Error("no .step, .stp, .iges or .igs files among the inputs");
    return files;
}

async function main(): Promise<void> {
    const args = parseArgs(process.argv.slice(2));
    const files = expandInputs(args.inputs);
    mkdirSync(args.out, { recursive: true });
    if (args.cloud && !process.env[KEY_VARIABLE]) {
        console.error(NO_KEY_MESSAGE);
        process.exit(NO_KEY_EXIT);
    }
    const occt = await loadKernel();
    const results: Stats[] = [];
    let failures = 0;
    for (const file of files) {
        const name = basename(file, extname(file));
        const text = readFileSync(file, "utf8");
        try {
            const converted = convertFile(occt, basename(file), text, args.options);
            let source = "in-process";
            if (args.cloud) {
                const cloud = await convertViaCloud(basename(file), text, args.options);
                converted.glb = cloud.glb;
                converted.stats.glbBytes = cloud.glb.byteLength;
                source = `CAD Cloud task ${cloud.taskId}`;
            }
            writeFileSync(join(args.out, `${name}.glb`), converted.glb);
            if (converted.stl !== null) writeFileSync(join(args.out, `${name}.stl`), converted.stl);
            writeFileSync(join(args.out, `${name}.json`), `${JSON.stringify({ ...converted.stats, source }, null, 2)}\n`);
            results.push(converted.stats);
            console.log(`ok    ${basename(file)}  ${converted.stats.solids} solid(s), ${converted.stats.faces} faces, ${converted.stats.edges} edges, ${converted.stats.glbBytes} bytes of GLB (${source}, ${converted.stats.ms} ms)`);
        } catch (error) {
            failures++;
            console.error(`FAIL  ${basename(file)}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    console.log(JSON.stringify({ converted: results.length, failed: failures, out: resolve(args.out) }));
    process.exit(failures > 0 ? 1 : 0);
}

const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]).endsWith(join("src", "cli.ts"));
if (invokedDirectly) {
    main().catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
    });
}
