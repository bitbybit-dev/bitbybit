# {{PROJECT_NAME}}

A command-line converter from STEP and IGES to GLB and STL, built on the open-source [Bitbybit](https://bitbybit.dev) OpenCascade kernel. Files are converted in this process, on this machine; nothing is uploaded and no account is needed. Beside each result it writes a JSON with what the file contained: solids, faces, edges, volume, extents, sizes and timing.

```bash
npm install
npm run convert -- samples/bracket.step --out out     # one file
npm run convert -- ./incoming --out out                # every .step, .stp, .iges, .igs in a directory
npm run convert -- --help                              # the options
npm run smoke                                          # typecheck, lint, then the checks on the sample
npm run lint                                           # the lint rules, at error
```

## When to use `--cloud`, and when not to

By default the kernel runs here, and that is the right answer for a laptop, a build server or a Node service with a few hundred megabytes to spare: it is free, it is the same algorithm CAD Cloud runs, and the file never leaves the machine.

`--cloud` converts each file as one task on [CAD Cloud](https://bitbybit.dev/cad-cloud) instead. It exists for two cases: a serverless or edge function that cannot load a 35 MB kernel, and a volume of files you would rather hand to a queue than to a laptop. It needs `BITBYBIT_API_KEY` in the environment (any plan; keys live in [Bitbybit Studio](https://studio.bitbybit.dev/keys/billing)), and without it the tool explains this and exits with code 2. Every cloud conversion is metered on the key's account.

## How it is put together

| File | Role |
|---|---|
| `src/convert.ts` | one file through the kernel: load, count, measure, GLB, STL |
| `src/cli.ts` | arguments, directories, outputs, exit codes |
| `src/cloud.ts` | the same conversion as a CAD Cloud task, key from the environment |
| `samples/bracket.step` | a part made with this kernel, whose counts the smoke knows |
| `scripts/smoke.ts` | the checks: exact counts on the sample, the CLI end to end, the no-key path |

## Working with an AI agent

`AGENTS.md` explains the project to a coding agent, and the free Bitbybit CAD MCP server is configured for Claude Code, Cursor and VS Code, so the agent looks the API up instead of guessing it. Ask it to add an option, then let it run `npm run smoke`.

Scaffolded by `@bitbybit-dev/create-app` {{CLI_VERSION}}. [Documentation](https://learn.bitbybit.dev), [the packages](https://github.com/bitbybit-dev/bitbybit), [Discord](https://discord.gg/GSe3VMe).
