#!/usr/bin/env node

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
}

type EngineType = "threejs" | "babylonjs" | "playcanvas";
type BundlerType = "vite";
type LanguageType = "typescript";

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

async function promptProjectOptions(projectNameArg?: string): Promise<ProjectOptions> {
    interface PromptAnswers {
        projectName?: string;
        engine: EngineType;
    }

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
            }
        ]);
    }

    return {
        projectName: projectNameArg || answers.projectName!,
        engine: answers.engine,
        bundler: "vite",
        language: "typescript"
    };
}

async function createProject(options: ProjectOptions): Promise<void> {
    const { projectName, engine, bundler, language } = options;
    const targetDir = path.resolve(process.cwd(), projectName);

    console.log();
    console.log(chalk.gray("─".repeat(72)));
    console.log();
    console.log(chalk.white.bold("  📋 Project Configuration:"));
    console.log();
    console.log(`  ${chalk.gray("Project:")}     ${chalk.white.bold(projectName)}`);
    console.log(`  ${chalk.gray("Engine:")}      ${ENGINE_COLORS[engine](ENGINE_DISPLAY_NAMES[engine])}`);
    console.log(`  ${chalk.gray("Bundler:")}     ${chalk.magenta("Vite")}`);
    console.log(`  ${chalk.gray("Language:")}    ${chalk.blue("TypeScript")}`);
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

async function main(): Promise<void> {
    const program = new Command();

    program
        .name("@bitbybit-dev/create-app")
        .description("Scaffold a new Bit By Bit Developers 3D/CAD project")
        .version("0.21.0")
        .argument("[project-name]", "Name of the project to create")
        .option("-e, --engine <engine>", "Game engine to use (threejs, babylonjs, playcanvas)")
        .action(async (projectName: string | undefined, cmdOptions: { engine?: string }) => {
            await displayWelcome();

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

            // If both project name and engine are provided, skip prompts
            if (projectName && cmdOptions.engine) {
                options = {
                    projectName,
                    engine: cmdOptions.engine as EngineType,
                    bundler: "vite",
                    language: "typescript"
                };
            } else {
                options = await promptProjectOptions(projectName);
            }

            await createProject(options);
        });

    await program.parseAsync(process.argv);
}

main().catch((error) => {
    console.error(chalk.red("\n  ✖ Unexpected error:"), error);
    process.exit(1);
});
