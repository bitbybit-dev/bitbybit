#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import gradient from "gradient-string";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simplified, cleaner ASCII logo
const BITBYBIT_LOGO = `
╭──────────────────────────────────────────────────────────────────────╮
│                                                                      │
│           ░█▀▄░▀█▀░▀█▀░█▀▄░█░█░█▀▄░▀█▀░▀█▀░░░░░█▀▄░█▀▀░█░█           │
│           ░█▀▄░░█░░░█░░█▀▄░░█░░█▀▄░░█░░░█░░░░░░█░█░█▀▀░▀▄▀           │
│           ░▀▀░░▀▀▀░░▀░░▀▀░░░▀░░▀▀░░▀▀▀░░▀░░░▀░░▀▀░░▀▀▀░░▀░           │
│                                                                      │
│                    3D CAD Development on the Web                     │
╰──────────────────────────────────────────────────────────────────────╯
`;

interface ProjectOptions {
    projectName: string;
    engine: "threejs" | "babylonjs" | "playcanvas";
    bundler: "vite";
    language: "typescript";
    occtArchitecture: "32" | "64" | "64-mt";
}

interface CloudProjectOptions {
    projectName: string;
    backend: "hono-sdk" | "hono-rest" | "nodejs-sdk" | "nodejs-rest" | "dotnet-rest";
}

type AppType = "frontend" | "cloud";

type EngineType = "threejs" | "babylonjs" | "playcanvas";
type BundlerType = "vite";
type LanguageType = "typescript";
type OcctArchitectureType = "32" | "64" | "64-mt";
type BackendType = "hono-sdk" | "hono-rest" | "nodejs-sdk" | "nodejs-rest" | "dotnet-rest";

const ENGINE_DISPLAY_NAMES: Record<EngineType, string> = {
    "threejs": "Three.js",
    "babylonjs": "Babylon.js",
    "playcanvas": "PlayCanvas"
};

const ENGINE_DESCRIPTIONS: Record<EngineType, string> = {
    "threejs": "Lightweight and flexible 3D library",
    "babylonjs": "Powerful and feature-rich game engine",
    "playcanvas": "Fast and lightweight WebGL game engine"
};

const ENGINE_COLORS: Record<EngineType, (text: string) => string> = {
    "threejs": chalk.hex("#049EF4"),    // Three.js blue
    "babylonjs": chalk.hex("#E0684B"),  // Babylon.js red/orange
    "playcanvas": chalk.hex("#FF6600")  // PlayCanvas orange
};

const OCCT_ARCHITECTURE_DISPLAY_NAMES: Record<OcctArchitectureType, string> = {
    "32": "32-bit (Default)",
    "64": "64-bit",
    "64-mt": "64-bit Multi-threaded"
};

const OCCT_ARCHITECTURE_DESCRIPTIONS: Record<OcctArchitectureType, string> = {
    "32": "Supported on all browsers",
    "64": "May not be supported on all browsers",
    "64-mt": "Requires special server configuration (COOP/COEP headers)"
};

const BACKEND_DISPLAY_NAMES: Record<BackendType, string> = {
    "hono-sdk": "Hono + SDK (Cloudflare Workers)",
    "hono-rest": "Hono + REST (Cloudflare Workers)",
    "nodejs-sdk": "Node.js Express + SDK",
    "nodejs-rest": "Node.js Express + REST",
    "dotnet-rest": "ASP.NET Core + REST (.NET 10)",
};

const BACKEND_DESCRIPTIONS: Record<BackendType, string> = {
    "hono-sdk": "Type-safe SDK on Cloudflare Workers edge runtime",
    "hono-rest": "Raw fetch calls on Cloudflare Workers edge runtime",
    "nodejs-sdk": "Type-safe SDK on Node.js with Express 5",
    "nodejs-rest": "Raw fetch calls on Node.js with Express 5",
    "dotnet-rest": "HttpClient calls on ASP.NET Core minimal API",
};

const BACKEND_COLORS: Record<BackendType, (text: string) => string> = {
    "hono-sdk": chalk.hex("#FF6633"),
    "hono-rest": chalk.hex("#FF6633"),
    "nodejs-sdk": chalk.hex("#68A063"),
    "nodejs-rest": chalk.hex("#68A063"),
    "dotnet-rest": chalk.hex("#512BD4"),
};

async function displayWelcome(): Promise<void> {
    console.clear();
    // Create a beautiful gold gradient for the logo
    const goldGradient = gradient(["#F0CEBB", "#fff6f3", "#d6b39f", "#F0CEBB"]);
    
    console.log(goldGradient(BITBYBIT_LOGO));
    console.log();
    console.log(chalk.gray("─".repeat(72)));
    console.log();
    console.log(chalk.white.bold("  Welcome to the Bit By Bit Developers Project Scaffolder! 🚀"));
    console.log();
    console.log(chalk.gray("  Create stunning 3D/CAD applications using our powerful"));
    console.log(chalk.gray("  geometry kernels: OCCT (OpenCascade), JSCAD, and Manifold."));
    console.log();
    console.log(chalk.gray("─".repeat(72)));
    console.log();
    console.log(chalk.cyan("  🌐 Website: ") + chalk.underline.cyan("https://bitbybit.dev"));
    console.log(chalk.yellow("  ⭐ Subscribe: ") + chalk.underline.yellow("https://bitbybit.dev/auth/pick-plan"));
    console.log(chalk.gray("     Best way to support us is Silver or Gold plan subscription!"));
    console.log();
    console.log(chalk.gray("─".repeat(72)));
    console.log();
}

async function promptAppType(): Promise<AppType> {
    const { appType } = await inquirer.prompt<{ appType: AppType }>([
        {
            type: "list",
            name: "appType",
            message: chalk.cyan("🏗️  What type of application would you like to create?"),
            choices: [
                {
                    name: `${chalk.green("● Frontend App")}        ${chalk.gray("- Browser-based 3D/CAD app with a game engine (Three.js, Babylon.js, PlayCanvas)")}`,
                    value: "frontend" as AppType,
                    short: "Frontend App"
                },
                {
                    name: `${chalk.hex("#FF6633")("● CAD Cloud App")}       ${chalk.gray("- Backend + Frontend using managed Bitbybit CAD Cloud servers")}`,
                    value: "cloud" as AppType,
                    short: "CAD Cloud App"
                },
            ],
            default: "frontend"
        }
    ]);
    return appType;
}

async function promptCloudProjectOptions(projectNameArg?: string): Promise<CloudProjectOptions> {
    interface CloudAnswers {
        projectName?: string;
        backend: BackendType;
    }

    const backendChoices = [
        {
            name: `${BACKEND_COLORS["hono-sdk"]("● Hono + SDK")}        ${chalk.gray("- Type-safe SDK on Cloudflare Workers edge runtime")}`,
            value: "hono-sdk" as BackendType,
            short: "Hono + SDK"
        },
        {
            name: `${BACKEND_COLORS["hono-rest"]("● Hono + REST")}       ${chalk.gray("- Raw fetch calls on Cloudflare Workers edge runtime")}`,
            value: "hono-rest" as BackendType,
            short: "Hono + REST"
        },
        {
            name: `${BACKEND_COLORS["nodejs-sdk"]("● Node.js + SDK")}     ${chalk.gray("- Type-safe SDK on Node.js with Express 5")}`,
            value: "nodejs-sdk" as BackendType,
            short: "Node.js + SDK"
        },
        {
            name: `${BACKEND_COLORS["nodejs-rest"]("● Node.js + REST")}    ${chalk.gray("- Raw fetch calls on Node.js with Express 5")}`,
            value: "nodejs-rest" as BackendType,
            short: "Node.js + REST"
        },
        {
            name: `${BACKEND_COLORS["dotnet-rest"]("● .NET + REST")}       ${chalk.gray("- HttpClient calls on ASP.NET Core minimal API (.NET 10)")}`,
            value: "dotnet-rest" as BackendType,
            short: ".NET + REST"
        },
    ];

    let answers: CloudAnswers;

    if (!projectNameArg) {
        answers = await inquirer.prompt<CloudAnswers>([
            {
                type: "input",
                name: "projectName",
                message: chalk.cyan("📁 What is your project name?"),
                default: "my-bitbybit-cloud-app",
                validate: (input: string) => {
                    if (!input.trim()) return "Project name is required";
                    if (!/^[a-z0-9-_]+$/i.test(input)) return "Project name can only contain letters, numbers, hyphens, and underscores";
                    return true;
                }
            },
            {
                type: "list",
                name: "backend",
                message: chalk.cyan("⚡ Which backend would you like to use?"),
                choices: backendChoices,
                default: "hono-sdk"
            },
        ]);
    } else {
        answers = await inquirer.prompt<CloudAnswers>([
            {
                type: "list",
                name: "backend",
                message: chalk.cyan("⚡ Which backend would you like to use?"),
                choices: backendChoices,
                default: "hono-sdk"
            },
        ]);
    }

    return {
        projectName: projectNameArg || answers.projectName!,
        backend: answers.backend,
    };
}

async function promptProjectOptions(projectNameArg?: string): Promise<ProjectOptions> {
    interface PromptAnswers {
        projectName?: string;
        engine: EngineType;
        occtArchitecture: OcctArchitectureType;
    }

    const occtArchitectureChoices = [
        {
            name: `${chalk.green("● 32-bit")}          ${chalk.gray("- Supported on all browsers (recommended)")}`,
            value: "32" as OcctArchitectureType,
            short: "32-bit"
        },
        {
            name: `${chalk.yellow("● 64-bit")}          ${chalk.gray("- May not be supported on all browsers")}`,
            value: "64" as OcctArchitectureType,
            short: "64-bit"
        },
        {
            name: `${chalk.magenta("● 64-bit MT")}       ${chalk.gray("- Requires COOP/COEP server headers")}`,
            value: "64-mt" as OcctArchitectureType,
            short: "64-bit MT"
        }
    ];

    let answers: PromptAnswers;
    
    // Only ask for project name if not provided as argument
    if (!projectNameArg) {
        answers = await inquirer.prompt<PromptAnswers>([
            {
                type: "input",
                name: "projectName",
                message: chalk.cyan("📁 What is your project name?"),
                default: "my-bitbybit-app",
                validate: (input: string) => {
                    if (!input.trim()) {
                        return "Project name is required";
                    }
                    if (!/^[a-z0-9-_]+$/i.test(input)) {
                        return "Project name can only contain letters, numbers, hyphens, and underscores";
                    }
                    return true;
                }
            },
            {
                type: "list",
                name: "engine",
                message: chalk.cyan("🎮 Which 3D engine would you like to use?"),
                choices: [
                    {
                        name: `${ENGINE_COLORS["threejs"]("● Three.js")}    ${chalk.gray("- Lightweight and popular 3D library")}`,
                        value: "threejs",
                        short: "Three.js"
                    },
                    {
                        name: `${ENGINE_COLORS["babylonjs"]("● Babylon.js")}  ${chalk.gray("- Powerful and feature-rich game engine")}`,
                        value: "babylonjs",
                        short: "Babylon.js"
                    },
                    {
                        name: `${ENGINE_COLORS["playcanvas"]("● PlayCanvas")}  ${chalk.gray("- Fast and lightweight WebGL game engine")}`,
                        value: "playcanvas",
                        short: "PlayCanvas"
                    }
                ],
                default: "threejs"
            },
            {
                type: "list",
                name: "occtArchitecture",
                message: chalk.cyan("⚙️  Which OCCT worker architecture would you like to use?"),
                choices: occtArchitectureChoices,
                default: "32"
            }
        ]);
    } else {
        answers = await inquirer.prompt<PromptAnswers>([
            {
                type: "list",
                name: "engine",
                message: chalk.cyan("🎮 Which 3D engine would you like to use?"),
                choices: [
                    {
                        name: `${ENGINE_COLORS["threejs"]("● Three.js")}    ${chalk.gray("- Lightweight and flexible 3D library")}`,
                        value: "threejs",
                        short: "Three.js"
                    },
                    {
                        name: `${ENGINE_COLORS["babylonjs"]("● Babylon.js")}  ${chalk.gray("- Powerful and feature-rich game engine")}`,
                        value: "babylonjs",
                        short: "Babylon.js"
                    },
                    {
                        name: `${ENGINE_COLORS["playcanvas"]("● PlayCanvas")}  ${chalk.gray("- Fast and lightweight WebGL game engine")}`,
                        value: "playcanvas",
                        short: "PlayCanvas"
                    }
                ],
                default: "threejs"
            },
            {
                type: "list",
                name: "occtArchitecture",
                message: chalk.cyan("⚙️  Which OCCT worker architecture would you like to use?"),
                choices: occtArchitectureChoices,
                default: "32"
            }
        ]);
    }

    return {
        projectName: projectNameArg || answers.projectName!,
        engine: answers.engine,
        bundler: "vite",
        language: "typescript",
        occtArchitecture: answers.occtArchitecture
    };
}

async function createProject(options: ProjectOptions): Promise<void> {
    const { projectName, engine, bundler, language, occtArchitecture } = options;
    const targetDir = path.resolve(process.cwd(), projectName);

    const occtArchColors: Record<OcctArchitectureType, (text: string) => string> = {
        "32": chalk.green,
        "64": chalk.yellow,
        "64-mt": chalk.magenta
    };

    console.log();
    console.log(chalk.gray("─".repeat(72)));
    console.log();
    console.log(chalk.white.bold("  📋 Project Configuration:"));
    console.log();
    console.log(`  ${chalk.gray("Project:")}     ${chalk.white.bold(projectName)}`);
    console.log(`  ${chalk.gray("Engine:")}      ${ENGINE_COLORS[engine](ENGINE_DISPLAY_NAMES[engine])}`);
    console.log(`  ${chalk.gray("Bundler:")}     ${chalk.magenta("Vite")}`);
    console.log(`  ${chalk.gray("Language:")}    ${chalk.blue("TypeScript")}`);
    console.log(`  ${chalk.gray("OCCT Arch:")}   ${occtArchColors[occtArchitecture](OCCT_ARCHITECTURE_DISPLAY_NAMES[occtArchitecture])}`);
    console.log();
    console.log(chalk.gray("─".repeat(72)));
    console.log();

    // Check if directory exists
    if (fs.existsSync(targetDir)) {
        const { overwrite } = await inquirer.prompt([
            {
                type: "confirm",
                name: "overwrite",
                message: chalk.yellow(`⚠️  Directory "${projectName}" already exists. Do you want to overwrite it?`),
                default: false
            }
        ]);

        if (!overwrite) {
            console.log(chalk.red("\n  ✖ Project creation cancelled.\n"));
            process.exit(0);
        }

        const spinner = ora("Removing existing directory...").start();
        await fs.remove(targetDir);
        spinner.succeed("Existing directory removed");
    }

    // Create project directory
    const spinner = ora({
        text: "Creating project structure...",
        color: "cyan"
    }).start();

    try {
        // Copy template files
        const templateDir = path.join(__dirname, "..", "templates", bundler, engine, language);
        
        if (!fs.existsSync(templateDir)) {
            spinner.fail("Template not found");
            console.error(chalk.red(`\n  ✖ Template for ${bundler}/${engine}/${language} not found.`));
            console.error(chalk.gray(`    Looking in: ${templateDir}`));
            process.exit(1);
        }

        await fs.copy(templateDir, targetDir);
        spinner.succeed("Project structure created");

        // Update package.json with project name
        const packageJsonPath = path.join(targetDir, "package.json");
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = await fs.readJson(packageJsonPath);
            packageJson.name = projectName;
            await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
        }

        // Update main.ts with OCCT architecture if not default (32-bit)
        if (occtArchitecture !== "32") {
            const mainTsPath = path.join(targetDir, "src", "main.ts");
            if (fs.existsSync(mainTsPath)) {
                let mainTsContent = await fs.readFile(mainTsPath, "utf-8");
                
                // Find the options object and add occtArchitecture property
                const optionsPattern = /(const options:\s*InitBitByBitOptions\s*=\s*\{[\s\S]*?enableManifold:\s*true),(\s*\};)/;
                const replacement = `$1,\n        occtArchitecture: "${occtArchitecture}"$2`;
                
                mainTsContent = mainTsContent.replace(optionsPattern, replacement);
                await fs.writeFile(mainTsPath, mainTsContent, "utf-8");
            }
        }

        // Create vite.config.ts with COOP/COEP headers for 64-bit multi-threaded
        if (occtArchitecture === "64-mt") {
            const viteConfigPath = path.join(targetDir, "vite.config.ts");
            const viteConfigContent = `import { defineConfig } from "vite";

// COOP/COEP headers required for SharedArrayBuffer support in multi-threaded OCCT
// Using 'credentialless' instead of 'require-corp' to allow cross-origin CDN resources
export default defineConfig({
    server: {
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "credentialless",
        },
    },
    preview: {
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "credentialless",
        },
    },
});
`;
            await fs.writeFile(viteConfigPath, viteConfigContent, "utf-8");
        }

        // Success message
        console.log();
        console.log(chalk.gray("─".repeat(72)));
        console.log();
        console.log(chalk.gray("  Home:          ") + chalk.underline.cyan("https://bitbybit.dev"));
        console.log(chalk.gray("  Learn:         ") + chalk.underline.cyan("https://learn.bitbybit.dev"));
        console.log(chalk.gray("  Blog:          ") + chalk.underline.cyan("https://learn.bitbybit.dev/blog"));
        console.log(chalk.gray("  Documentation: ") + chalk.underline.cyan("https://docs.bitbybit.dev"));
        console.log(chalk.gray("  Community:     ") + chalk.underline.cyan("https://discord.gg/GSe3VMe"));
        console.log(chalk.gray("  GitHub:        ") + chalk.underline.cyan("https://github.com/bitbybit-dev/bitbybit"));
        console.log(chalk.gray("  LinkedIn:      ") + chalk.underline.cyan("https://www.linkedin.com/company/bitbybit-dev/"));
        console.log(chalk.gray("  X:             ") + chalk.underline.cyan("https://x.com/bitbybit_dev"));
        console.log(chalk.gray("  YouTube:       ") + chalk.underline.cyan("https://www.youtube.com/@bitbybitdev"));
        console.log(chalk.gray("  Facebook:      ") + chalk.underline.cyan("https://www.facebook.com/bitbybitdev"));
        console.log();
        console.log(chalk.green.bold("  ✔ Project created successfully! 🎉"));
        console.log();
        console.log(chalk.white("  Next steps:"));
        console.log();
        console.log(chalk.gray("  1. Navigate to your project:"));
        console.log(chalk.cyan(`     cd ${projectName}`));
        console.log();
        console.log(chalk.gray("  2. Install dependencies:"));
        console.log(chalk.cyan("     npm install"));
        console.log();
        console.log(chalk.gray("  3. Start the development server:"));
        console.log(chalk.cyan("     npm run dev"));
        console.log();

        // Show architecture-specific notes
        if (occtArchitecture === "64") {
            console.log(chalk.yellow("  ⚠️  Note: 64-bit OCCT may not be supported on all browsers."));
            console.log(chalk.gray("     Some older browsers may lack WebAssembly Memory64 support."));
            console.log();
        } else if (occtArchitecture === "64-mt") {
            console.log(chalk.yellow("  ⚠️  Note: 64-bit Multi-threaded OCCT requires special server configuration."));
            console.log(chalk.gray("     Your server must send these headers for SharedArrayBuffer support:"));
            console.log(chalk.gray("     • Cross-Origin-Opener-Policy: same-origin"));
            console.log(chalk.gray("     • Cross-Origin-Embedder-Policy: require-corp"));
            console.log(chalk.gray("     Vite dev server is pre-configured, but production servers need setup."));
            console.log();
        }

        console.log(chalk.gray("─".repeat(72)));
        console.log();
        console.log(chalk.yellow.bold("  ⭐ Support Bit By Bit Developers with a Silver or Gold subscription:"));
        console.log(chalk.yellow.italic("     https://bitbybit.dev/auth/pick-plan"));
        console.log();
        console.log(chalk.gray("─".repeat(72)));
        console.log();
        console.log(chalk.white("  Happy coding! 💻✨"));
        console.log();

    } catch (error) {
        spinner.fail("Failed to create project");
        console.error(chalk.red("\n  ✖ Error creating project:"), error);
        process.exit(1);
    }
}

function generateCloudReadme(projectName: string, backend: BackendType): string {
    const backendName = BACKEND_DISPLAY_NAMES[backend];

    const keyConfigSection = backend === "dotnet-rest"
        ? `Edit \`backend/appsettings.Development.json\`:

\`\`\`json
{
  "Bitbybit": {
    "ApiKey": "your-api-key-here",
    "ApiUrl": "https://api.bitbybit.dev"
  }
}
\`\`\``
        : backend.startsWith("hono")
            ? `Edit \`backend/.dev.vars\`:

\`\`\`
BITBYBIT_API_KEY=your-api-key-here
BITBYBIT_API_URL=https://api.bitbybit.dev
\`\`\``
            : `Edit \`backend/.env\`:

\`\`\`
BITBYBIT_API_KEY=your-api-key-here
BITBYBIT_API_URL=https://api.bitbybit.dev
\`\`\``;

    const backendStartCmd = backend === "dotnet-rest"
        ? "cd backend\ndotnet run"
        : "cd backend\nnpm install\nnpm run dev";

    return `# ${projectName}

A CAD Cloud application powered by [Bitbybit](https://bitbybit.dev) managed CAD servers.

## Architecture

\`\`\`
┌─────────────────────────────┐        ┌─────────────────────────────┐
│        frontend/            │        │  Bitbybit CAD Cloud API     │
│  React 19 + Vite + Three.js │──/api──▶  ${backendName.padEnd(27)} │──▶  api.bitbybit.dev
│  Port 5173                  │ proxy  │  Port 3000                  │
└─────────────────────────────┘        └─────────────────────────────┘
\`\`\`

The frontend never calls the Bitbybit API directly — your **API key stays on the server**. Vite's dev proxy forwards \`/api/*\` requests to \`localhost:3000\`.

## Prerequisites

- **Node.js** ≥ 20
${backend === "dotnet-rest" ? "- **.NET** ≥ 10\n" : ""}- A **Bitbybit API key** — purchase one at [bitbybit.dev/auth/pick-plan?api-keys=true](https://bitbybit.dev/auth/pick-plan?api-keys=true)
${backend.startsWith("hono") ? "- **Wrangler** CLI (installed as a dev dependency)\n" : ""}
## Quick Start

### 1. Configure your API key

${keyConfigSection}

### 2. Start the backend

\`\`\`bash
${backendStartCmd}
\`\`\`

The backend starts on **port 3000**.

### 3. Start the frontend (separate terminal)

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

### 4. Open the app

Navigate to **http://localhost:5173** in your browser.

## What This App Demonstrates

### Single CAD Operation
Click **Generate** to create a parametric "dragon cup" model. The backend submits the request to Bitbybit CAD Cloud, polls until complete, and returns a glTF download URL. The frontend loads it into a Three.js scene.

### Batch Generation
Click **Generate Batch** to create 3 model variations in parallel.

### Pipelines
Several pipeline examples are available:

| Pipeline | What it does |
|----------|-------------|
| **Translate → Union → Fillet** | Creates two boxes, translates one, unions them, fillets edges — demonstrates \`$ref:N\` step references |
| **Map Cylinders** | Uses a \`map\` step to create cylinders at different positions — demonstrates iteration |
| **Map Spheres** | Maps over an array to create multiple spheres — demonstrates \`$item\` references |
| **Choice** | Uses a \`choice\` step to conditionally create a box or cylinder — demonstrates branching |
| **File Input** | Upload a STEP file, fillet its edges — demonstrates file upload flow |

## Project Structure

\`\`\`
${projectName}/
├── README.md
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/    # Three.js viewer, header, API key warning
│   │   └── panels/        # Models and Pipelines UI panels
│   ├── vite.config.ts     # Dev proxy: /api → localhost:3000
│   └── package.json
└── backend/
${backend === "dotnet-rest" ? `    ├── Program.cs
    ├── BitbybitClient.cs
    ├── appsettings.json
    └── dotnet-rest.csproj` : `    ├── src/
    │   ├── index.ts           # Routes
    │   └── bitbybit-client.ts # API calls
    └── package.json`}
\`\`\`

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| \`POST\` | \`/api/generate\` | Single CAD operation (dragon cup) |
| \`POST\` | \`/api/generate-batch\` | Parallel batch generation |
| \`GET\` | \`/api/task/:id\` | Poll / fetch task result |
| \`POST\` | \`/api/pipeline/translate-union-fillet\` | Pipeline: translate → union → fillet |
| \`POST\` | \`/api/pipeline/map-cylinders\` | Pipeline: map cylinders |
| \`POST\` | \`/api/pipeline/map-spheres\` | Pipeline: map spheres |
| \`POST\` | \`/api/pipeline/choice\` | Pipeline: conditional logic |
| \`POST\` | \`/api/pipeline/file-input\` | Pipeline: file upload + fillet |
| \`GET\` | \`/api/proxy-download?url=...\` | Proxy glTF downloads (avoids CORS) |

## Getting an API Key

1. Create an account on [bitbybit.dev](https://bitbybit.dev)
2. Go to [bitbybit.dev/auth/pick-plan?api-keys=true](https://bitbybit.dev/auth/pick-plan?api-keys=true)
3. Purchase a Starter, Professional, or Business API key plan
4. Manage your keys in [Bitbybit Studio](https://studio.bitbybit.dev/keys/billing)

## Learn More

- [SDK Documentation](https://learn.bitbybit.dev/api/sdk/typescript/intro)
- [Pipeline Guide](https://learn.bitbybit.dev/api/sdk/typescript/pipelines)
- [Bitbybit GitHub](https://github.com/bitbybit-dev/bitbybit)
- [Discord Community](https://discord.gg/GSe3VMe)
`;
}

async function createCloudProject(options: CloudProjectOptions): Promise<void> {
    const { projectName, backend } = options;
    const targetDir = path.resolve(process.cwd(), projectName);

    console.log();
    console.log(chalk.gray("─".repeat(72)));
    console.log();
    console.log(chalk.white.bold("  📋 Project Configuration:"));
    console.log();
    console.log(`  ${chalk.gray("Project:")}     ${chalk.white.bold(projectName)}`);
    console.log(`  ${chalk.gray("Type:")}        ${chalk.hex("#FF6633")("CAD Cloud App")}`);
    console.log(`  ${chalk.gray("Backend:")}     ${BACKEND_COLORS[backend](BACKEND_DISPLAY_NAMES[backend])}`);
    console.log(`  ${chalk.gray("Frontend:")}    ${chalk.cyan("React 19 + Vite + Three.js")}`);
    console.log();
    console.log(chalk.gray("─".repeat(72)));
    console.log();

    // Check if directory exists
    if (fs.existsSync(targetDir)) {
        const { overwrite } = await inquirer.prompt([
            {
                type: "confirm",
                name: "overwrite",
                message: chalk.yellow(`⚠️  Directory "${projectName}" already exists. Do you want to overwrite it?`),
                default: false
            }
        ]);

        if (!overwrite) {
            console.log(chalk.red("\n  ✖ Project creation cancelled.\n"));
            process.exit(0);
        }

        const spinner = ora("Removing existing directory...").start();
        await fs.remove(targetDir);
        spinner.succeed("Existing directory removed");
    }

    const spinner = ora({
        text: "Creating project structure...",
        color: "cyan"
    }).start();

    try {
        const cloudTemplatesDir = path.join(__dirname, "..", "templates", "cloud");

        // Copy frontend
        const frontendTemplateDir = path.join(cloudTemplatesDir, "frontend");
        const frontendTargetDir = path.join(targetDir, "frontend");
        await fs.copy(frontendTemplateDir, frontendTargetDir);

        // Update frontend package.json name
        const frontendPackageJsonPath = path.join(frontendTargetDir, "package.json");
        if (fs.existsSync(frontendPackageJsonPath)) {
            const packageJson = await fs.readJson(frontendPackageJsonPath);
            packageJson.name = `${projectName}-frontend`;
            await fs.writeJson(frontendPackageJsonPath, packageJson, { spaces: 4 });
        }

        // Copy backend
        const backendTemplateDir = path.join(cloudTemplatesDir, "backends", backend);
        const backendTargetDir = path.join(targetDir, "backend");
        await fs.copy(backendTemplateDir, backendTargetDir);

        // Update backend package.json name (if applicable — not dotnet)
        const backendPackageJsonPath = path.join(backendTargetDir, "package.json");
        if (fs.existsSync(backendPackageJsonPath)) {
            const packageJson = await fs.readJson(backendPackageJsonPath);
            packageJson.name = `${projectName}-backend`;
            await fs.writeJson(backendPackageJsonPath, packageJson, { spaces: 4 });
        }

        // For Hono backends, update wrangler.jsonc name
        const wranglerPath = path.join(backendTargetDir, "wrangler.jsonc");
        if (fs.existsSync(wranglerPath)) {
            let wranglerContent = await fs.readFile(wranglerPath, "utf-8");
            wranglerContent = wranglerContent.replace(/"name":\s*"[^"]*"/, `"name": "${projectName}-backend"`);
            await fs.writeFile(wranglerPath, wranglerContent, "utf-8");
        }

        // For nodejs backends, copy .env.example to .env
        const envExamplePath = path.join(backendTargetDir, ".env.example");
        if (fs.existsSync(envExamplePath)) {
            await fs.copy(envExamplePath, path.join(backendTargetDir, ".env"));
        }

        // For Hono backends, create .dev.vars
        if (backend.startsWith("hono")) {
            const devVarsContent = "# Get your API key at https://bitbybit.dev/auth/pick-plan?api-keys=true\nBITBYBIT_API_KEY=\nBITBYBIT_API_URL=https://api.bitbybit.dev\n";
            await fs.writeFile(path.join(backendTargetDir, ".dev.vars"), devVarsContent, "utf-8");
        }

        // For dotnet, create appsettings.Development.json
        if (backend === "dotnet-rest") {
            const devSettings = {
                Bitbybit: {
                    ApiKey: "",
                    ApiUrl: "https://api.bitbybit.dev"
                }
            };
            await fs.writeJson(path.join(backendTargetDir, "appsettings.Development.json"), devSettings, { spaces: 2 });
        }

        // Generate README.md
        await fs.writeFile(path.join(targetDir, "README.md"), generateCloudReadme(projectName, backend), "utf-8");

        spinner.succeed("Project structure created");

        // Success message
        console.log();
        console.log(chalk.gray("─".repeat(72)));
        console.log();
        console.log(chalk.gray("  Home:          ") + chalk.underline.cyan("https://bitbybit.dev"));
        console.log(chalk.gray("  Learn:         ") + chalk.underline.cyan("https://learn.bitbybit.dev"));
        console.log(chalk.gray("  SDK Docs:      ") + chalk.underline.cyan("https://learn.bitbybit.dev/api/sdk/typescript/intro"));
        console.log(chalk.gray("  Community:     ") + chalk.underline.cyan("https://discord.gg/GSe3VMe"));
        console.log(chalk.gray("  GitHub:        ") + chalk.underline.cyan("https://github.com/bitbybit-dev/bitbybit"));
        console.log();
        console.log(chalk.green.bold("  ✔ CAD Cloud project created successfully! 🎉"));
        console.log();
        console.log(chalk.white("  Next steps:"));
        console.log();
        console.log(chalk.gray("  1. Navigate to your project:"));
        console.log(chalk.cyan(`     cd ${projectName}`));
        console.log();

        if (backend === "dotnet-rest") {
            console.log(chalk.gray("  2. Add your API key to backend/appsettings.Development.json"));
            console.log();
            console.log(chalk.gray("  3. Start the backend:"));
            console.log(chalk.cyan("     cd backend && dotnet run"));
            console.log();
        } else if (backend.startsWith("hono")) {
            console.log(chalk.gray("  2. Add your API key to backend/.dev.vars"));
            console.log();
            console.log(chalk.gray("  3. Start the backend:"));
            console.log(chalk.cyan("     cd backend && npm install && npm run dev"));
            console.log();
        } else {
            console.log(chalk.gray("  2. Add your API key to backend/.env"));
            console.log();
            console.log(chalk.gray("  3. Start the backend:"));
            console.log(chalk.cyan("     cd backend && npm install && npm run dev"));
            console.log();
        }

        console.log(chalk.gray("  4. Start the frontend (in a separate terminal):"));
        console.log(chalk.cyan(`     cd ${projectName}/frontend && npm install && npm run dev`));
        console.log();
        console.log(chalk.gray("  5. Open ") + chalk.cyan("http://localhost:5173") + chalk.gray(" in your browser"));
        console.log();
        console.log(chalk.gray("─".repeat(72)));
        console.log();
        console.log(chalk.yellow.bold("  🔑 You need a Bitbybit API key to use CAD Cloud:"));
        console.log(chalk.yellow("     1. Create an account on https://bitbybit.dev"));
        console.log(chalk.yellow("     2. Purchase an API key plan at:"));
        console.log(chalk.underline.yellow("        https://bitbybit.dev/auth/pick-plan?api-keys=true"));
        console.log();
        console.log(chalk.gray("─".repeat(72)));
        console.log();
        console.log(chalk.white("  Happy coding! 💻✨"));
        console.log();

    } catch (error) {
        spinner.fail("Failed to create project");
        console.error(chalk.red("\n  ✖ Error creating project:"), error);
        process.exit(1);
    }
}

async function main(): Promise<void> {
    const program = new Command();

    program
        .name("@bitbybit-dev/create-app")
        .description("Scaffold a new Bit By Bit Developers 3D/CAD project")
        .version("1.0.0-rc.2")
        .argument("[project-name]", "Name of the project to create")
        .option("-e, --engine <engine>", "Game engine to use (threejs, babylonjs, playcanvas)")
        .option("-o, --occt-architecture <arch>", "OCCT worker architecture (32, 64, 64-mt). Default: 32")
        .option("-t, --type <type>", "App type (frontend, cloud)")
        .option("-b, --backend <backend>", "Backend for cloud app (hono-sdk, hono-rest, nodejs-sdk, nodejs-rest, dotnet-rest)")
        .action(async (projectName: string | undefined, cmdOptions: { engine?: string; occtArchitecture?: string; type?: string; backend?: string }) => {
            await displayWelcome();

            // Determine app type
            let appType: AppType;
            if (cmdOptions.type) {
                if (cmdOptions.type !== "frontend" && cmdOptions.type !== "cloud") {
                    console.error(chalk.red(`\n  ✖ Invalid app type: ${cmdOptions.type}`));
                    console.error(chalk.gray(`    Valid options: frontend, cloud`));
                    process.exit(1);
                }
                appType = cmdOptions.type as AppType;
            } else {
                appType = await promptAppType();
            }

            if (appType === "cloud") {
                // Validate backend option if provided
                if (cmdOptions.backend) {
                    const validBackends = ["hono-sdk", "hono-rest", "nodejs-sdk", "nodejs-rest", "dotnet-rest"];
                    if (!validBackends.includes(cmdOptions.backend)) {
                        console.error(chalk.red(`\n  ✖ Invalid backend: ${cmdOptions.backend}`));
                        console.error(chalk.gray(`    Valid options: ${validBackends.join(", ")}`));
                        process.exit(1);
                    }
                }

                let cloudOptions: CloudProjectOptions;
                if (projectName && cmdOptions.backend) {
                    cloudOptions = { projectName, backend: cmdOptions.backend as BackendType };
                } else {
                    cloudOptions = await promptCloudProjectOptions(projectName);
                }
                await createCloudProject(cloudOptions);
            } else {
                let options: ProjectOptions;

                // If engine is provided via CLI, validate it
                if (cmdOptions.engine) {
                    const validEngines = ["threejs", "babylonjs", "playcanvas"];
                    if (!validEngines.includes(cmdOptions.engine)) {
                        console.error(chalk.red(`\n  ✖ Invalid engine: ${cmdOptions.engine}`));
                        console.error(chalk.gray(`    Valid options: ${validEngines.join(", ")}`));
                        process.exit(1);
                    }
                }

                // If OCCT architecture is provided via CLI, validate it
                if (cmdOptions.occtArchitecture) {
                    const validArchitectures = ["32", "64", "64-mt"];
                    if (!validArchitectures.includes(cmdOptions.occtArchitecture)) {
                        console.error(chalk.red(`\n  ✖ Invalid OCCT architecture: ${cmdOptions.occtArchitecture}`));
                        console.error(chalk.gray(`    Valid options: ${validArchitectures.join(", ")}`));
                        process.exit(1);
                    }
                }

                // If all options are provided via CLI, skip prompts
                if (projectName && cmdOptions.engine && cmdOptions.occtArchitecture) {
                    options = {
                        projectName,
                        engine: cmdOptions.engine as EngineType,
                        bundler: "vite",
                        language: "typescript",
                        occtArchitecture: cmdOptions.occtArchitecture as OcctArchitectureType
                    };
                } else if (projectName && cmdOptions.engine) {
                    options = await promptProjectOptions(projectName);
                    options.engine = cmdOptions.engine as EngineType;
                } else {
                    options = await promptProjectOptions(projectName);
                }

                await createProject(options);
            }
        });

    await program.parseAsync(process.argv);
}

main().catch((error) => {
    console.error(chalk.red("\n  ✖ Unexpected error:"), error);
    process.exit(1);
});
