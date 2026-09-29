## This template: STEP to glTF command line

A batch converter: STEP and IGES files in, GLB and STL files and a JSON of facts out, in this process, on the open-source OpenCascade kernel. It is the honesty rule as a program: a machine that can run the kernel needs no service to convert a file. The `--cloud` flag exists for the two cases that cannot, and says so.

- `src/kernel.ts` loads the kernel once per run.
- `src/convert.ts` is the conversion: `convertFile(occt, name, text, options)` reads the file through the kernel, counts its solids, faces and edges, measures its volume and extents, writes the GLB with the kernel's converter and the STL from the loaded shape. It is a pure function over the kernel, so the smoke calls it directly.
- `src/cloud.ts` is the same conversion as one CAD Cloud task through the SDK: upload, convert, wait, download. It reads the key from `BITBYBIT_API_KEY` and nothing else. Without the key it throws the message the CLI prints, which names the free in-process answer first.
- `src/cli.ts` parses the arguments, expands directories, runs every file, writes `<name>.glb`, `<name>.stl` and `<name>.json` into `--out`, prints one line per file and a JSON summary, and exits 0, 1 on a failed file, or 2 when `--cloud` was asked without a key.
- `samples/bracket.step` is a plate with a boss, three holes and filleted edges, made with this kernel; the smoke knows its counts.
- `scripts/smoke.ts` converts the sample directly and checks the GLB magic, the STL header and the exact solid, face and edge counts, the volume and the extents; parses arguments and expands a directory; runs the CLI as a child on the sample and checks the three files; runs it with `--cloud` and no key and checks the exit code and that the message carries the CAD Cloud page and the Studio keys page. No key and no network.

Commands:

- `npm run convert -- samples/bracket.step --out out` converts one file; a directory converts every CAD file in it
- `npm run convert -- --help` prints the options
- `npm run smoke` typechecks, lints and runs the checks above; `npm run typecheck` and `npm run lint` run alone as well

## What needs CAD Cloud and where to get it

Nothing, by default: the conversion runs here, free, on the MIT packages, and gives the same result for any file this machine can hold. `--cloud` sends each file to CAD Cloud as one metered conversion task instead, for exactly two situations: a runtime without the memory for the kernel (a serverless or edge function), or a volume of files worth handing to a queue rather than a laptop. If neither applies, do not use it, and do not add cloud calls to this tool to improve it. Any [CAD Cloud plan](https://bitbybit.dev/cad-cloud) includes conversion; the key needs the `convert`, `files` and `tasks` scopes and is created in [Bitbybit Studio](https://studio.bitbybit.dev/keys/billing). It travels in the `BITBYBIT_API_KEY` environment variable only: never in a file in this project, a prompt or a log.
