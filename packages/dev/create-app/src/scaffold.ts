import fs from "fs-extra";
import path from "path";

export const DOTFILE_PREFIX = "_dot-";
export const AGENT_LAYER_DIR = "_agent";
export const AGENTS_FILE = "AGENTS.md";
export const AGENT_SECTION_FILE = "AGENTS.section.md";
const PLACEHOLDER = /\{\{([A-Z][A-Z0-9_]*)\}\}/g;
const SKIPPED_DIRS = new Set(["node_modules", ".git"]);
const TEXT_EXTENSIONS = new Set([
    ".md", ".json", ".jsonc", ".ts", ".tsx", ".mts", ".mjs", ".js", ".cjs", ".html", ".css", ".svg",
    ".toml", ".cs", ".csproj", ".txt", ".yml", ".yaml", ".env", ".example", ".vars", ".astro",
]);

export type PlaceholderValues = Record<string, string>;

/**
 * Every file under `dir` except the trees nobody scaffolds into (node_modules, .git), deepest last.
 */
export async function listFiles(dir: string): Promise<string[]> {
    const out: string[] = [];
    const walk = async (current: string): Promise<void> => {
        for (const entry of await fs.readdir(current, { withFileTypes: true })) {
            if (SKIPPED_DIRS.has(entry.name)) continue;
            const full = path.join(current, entry.name);
            if (entry.isDirectory()) await walk(full);
            else out.push(full);
        }
    };
    await walk(dir);
    return out.sort();
}

/**
 * npm drops `.gitignore` and `.npmrc` from every package tarball and makes no promise about the other
 * dotfiles, so a template carries every dotfile and dot-directory as `_dot-<name>` and this restores
 * the real names after the copy: `_dot-gitignore` becomes `.gitignore`, `_dot-vscode/mcp.json`
 * becomes `.vscode/mcp.json`. Returns the restored paths.
 */
export async function restoreTemplateDotfiles(dir: string): Promise<string[]> {
    const restored: string[] = [];
    const walk = async (current: string): Promise<void> => {
        for (const entry of await fs.readdir(current, { withFileTypes: true })) {
            if (SKIPPED_DIRS.has(entry.name)) continue;
            const from = path.join(current, entry.name);
            if (entry.isDirectory()) await walk(from);
            if (!entry.name.startsWith(DOTFILE_PREFIX)) continue;
            const to = path.join(current, `.${entry.name.slice(DOTFILE_PREFIX.length)}`);
            await fs.move(from, to, { overwrite: true });
            restored.push(to);
        }
    };
    await walk(dir);
    return restored;
}

/**
 * Replaces `{{NAME}}` in every text file under `dir` with `values[NAME]`, and fails when any
 * placeholder is left: a scaffold with `{{PROJECT_NAME}}` still in it is not a finished project,
 * and the CLI would otherwise report success over it.
 */
export async function renderPlaceholders(dir: string, values: PlaceholderValues): Promise<void> {
    const leftovers: string[] = [];
    for (const file of await listFiles(dir)) {
        if (!TEXT_EXTENSIONS.has(path.extname(file))) continue;
        const text = await fs.readFile(file, "utf8");
        if (!PLACEHOLDER.test(text)) { PLACEHOLDER.lastIndex = 0; continue; }
        PLACEHOLDER.lastIndex = 0;
        const rendered = text.replace(PLACEHOLDER, (whole: string, name: string) => {
            const value = values[name];
            if (value === undefined) { leftovers.push(`${path.relative(dir, file)}: ${whole}`); return whole; }
            return value;
        });
        await fs.writeFile(file, rendered, "utf8");
    }
    if (leftovers.length) {
        throw new Error(`placeholders left unrendered (known: ${Object.keys(values).join(", ")}):\n  ${leftovers.join("\n  ")}`);
    }
}

/**
 * The shared agent layer (`templates/_agent`: AGENTS.md, CLAUDE.md and the three MCP configurations)
 * goes into every scaffold; the template's own `AGENTS.section.md`, when it has one, is appended to
 * AGENTS.md and removed, so the scaffold carries one file an agent reads. `sectionFile` names a
 * section kept outside the template directory (the cloud templates share one).
 */
export async function applyAgentLayer(templatesRoot: string, targetDir: string, values: PlaceholderValues, sectionFile?: string): Promise<void> {
    await fs.copy(path.join(templatesRoot, AGENT_LAYER_DIR), targetDir, { overwrite: false, errorOnExist: false });
    const staged = path.join(targetDir, AGENT_SECTION_FILE);
    const section = sectionFile ?? staged;
    if (await fs.pathExists(section)) {
        const agents = path.join(targetDir, AGENTS_FILE);
        const text = await fs.readFile(section, "utf8");
        await fs.appendFile(agents, `\n${text.endsWith("\n") ? text : `${text}\n`}`);
        if (section === staged) await fs.remove(staged);
    }
    await restoreTemplateDotfiles(targetDir);
    await renderPlaceholders(targetDir, values);
}
