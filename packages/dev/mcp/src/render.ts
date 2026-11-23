import type { Engine, IndexConventionChange, IndexEngineDoc, IndexExample, IndexField, IndexMember, IndexParam } from "./index-types.js";
import type { NamedType } from "./index-reader.js";
import { TIER_MEANING } from "./descriptions.js";

type IndexOption = NonNullable<IndexField["options"]>[number];

function renderOption(option: IndexOption): string {
    return option.label === option.value ? option.value : `${option.label} = ${JSON.stringify(option.value)}`;
}

function renderField(field: IndexField): string {
    const parts = [`${field.name}${field.optional ? "?" : ""}: ${field.type}`];
    if (field.default !== undefined) {
        parts.push(`default ${JSON.stringify(field.default)}`);
    }
    if (field.min !== undefined || field.max !== undefined) {
        parts.push(`range ${field.min ?? "..."} to ${field.max ?? "..."}`);
    }
    if (field.step !== undefined) {
        parts.push(`step ${field.step}`);
    }
    if (field.options) {
        parts.push(`one of ${field.options.map(renderOption).join(", ")}`);
    }
    const doc = field.doc ? ` - ${field.doc.replace(/\s+/g, " ")}` : "";
    return `- ${parts.join("; ")}${doc}`;
}

function renderParam(param: IndexParam): string[] {
    const head = `**${param.name}${param.optional ? "?" : ""}**: \`${param.type}\``;
    if (!param.fields || param.fields.length === 0) {
        return [head];
    }
    return [head, ...param.fields.map(renderField)];
}

function renderExample(example: IndexExample): string {
    return ["```typescript", example.code, "```"].join("\n");
}

function renderConventions(changes: readonly IndexConventionChange[]): string[] {
    if (changes.length === 0) {
        return [];
    }
    return [
        "## Conventions level",
        "",
        "A conventions level may change what it gives: it is among the operations, or in a service, whose results depend on the level the library runs by. Set the level with `bitbybit.setConventions`, or `conventions` in the options of `initBitByBit`; left unset, the library behaves as it did before levels existed. Describe setConventions for more.",
        ...changes.map((change) => `- From level ${change.level}: ${change.change}`),
        "",
    ];
}

function renderEngineDocs(engineDocs: Partial<Record<Engine, IndexEngineDoc>>): string[] {
    return [
        "Each engine documents it differently:",
        "",
        ...Object.entries(engineDocs).flatMap(([engine, { doc, examples }]) => [
            `### ${engine}`,
            "",
            doc,
            "",
            ...examples.flatMap((code) => [renderExample({ path: "", code }), ""]),
        ]),
    ];
}

function renderTypes(types: readonly NamedType[]): string[] {
    return types.length === 0 ? [] : ["## Types", "", "Describe one by its name for its fields:", ...types.map(({ key, type }) => `- \`${key}\`${type.summary ? `: ${type.summary}` : ""}`), ""];
}

export function renderType(named: NamedType, version: string, used: readonly NamedType[]): string {
    const lines = [`# ${named.key}`, "", "- kind: type", `- version: ${version}`, ""];
    if (named.type.doc) {
        lines.push(named.type.doc, "");
    }
    lines.push("## Fields", "", ...named.type.fields.map(renderField), "", ...renderTypes(used));
    return lines.join("\n").trimEnd() + "\n";
}

export function renderMember(member: IndexMember, version: string, examples: IndexExample[], types: readonly NamedType[] = []): string {
    const lines: string[] = [`# ${member.path}`, ""];
    const facts = [`kind: ${member.kind}`, `tier: ${member.tier} (${TIER_MEANING[member.tier]})`, `version: ${version}`];
    if (member.engines.length > 0) {
        facts.push(`engines: ${member.engines.join(", ")}`);
    }
    if (member.onApi3d) {
        facts.push("runs on CAD Cloud: yes");
    }
    if (member.endpoint) {
        facts.push(`endpoint: ${member.httpMethod ?? "POST"} ${member.endpoint}`);
    }
    if (member.scope) {
        facts.push(`API key scope: ${member.scope}`);
    }
    if (member.deprecated !== undefined) {
        facts.push(member.deprecated ? `deprecated: ${member.deprecated}` : "deprecated");
    }
    if (member.drawable) {
        facts.push("drawable: the result can be drawn directly");
    }
    lines.push(...facts.map((fact) => `- ${fact}`), "");
    if (member.signature) {
        lines.push("```typescript", member.signature, "```", "");
    }
    if (member.engineSignatures) {
        lines.push("Signature by engine:", ...Object.entries(member.engineSignatures).map(([engine, signature]) => `- ${engine}: \`${signature ?? "none"}\``), "");
    }
    if (member.engineDocs) {
        lines.push(...renderEngineDocs(member.engineDocs));
    } else if (member.doc) {
        lines.push(member.doc, "");
    } else if (member.summary) {
        lines.push(member.summary, "");
    }
    lines.push(...renderConventions(member.conventions ?? []));
    if (member.params.length > 0) {
        lines.push("## Parameters", "");
        for (const param of member.params) {
            lines.push(...renderParam(param));
        }
        lines.push("");
    }
    if (member.cloudParams) {
        lines.push("## Parameters on CAD Cloud", "", "The signature above is the browser one; a cad_execute or pipeline step takes these inputs instead.", "");
        if (member.cloudSummary) {
            lines.push(member.cloudSummary, "");
        }
        for (const param of member.cloudParams) {
            lines.push(...renderParam(param));
        }
        lines.push("");
    }
    if (member.returns) {
        lines.push(`## Returns`, "", `\`${member.returns}\`${member.async ? " (async)" : ""}`, "");
    }
    lines.push(...renderTypes(types));
    if (examples.length > 0 && !member.engineDocs) {
        lines.push("## Examples", "", ...examples.map(renderExample), "");
    }
    if (member.docUrl) {
        lines.push(`Reference: ${member.docUrl}`);
    }
    return lines.join("\n").trimEnd() + "\n";
}

export function renderLine(member: IndexMember): string {
    const tier = member.tier === "oss" ? "" : ` [${member.tier}]`;
    return `- ${member.path} (${member.kind})${tier}${member.summary ? `: ${member.summary}` : ""}`;
}
