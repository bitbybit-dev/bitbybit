import type { IndexExample, IndexField, IndexMember, IndexParam } from "./index-types.js";
import { TIER_MEANING } from "./descriptions.js";

function renderField(field: IndexField): string {
    const parts = [`${field.name}${field.optional ? "?" : ""}: ${field.type}`];
    if (field.default !== undefined) parts.push(`default ${JSON.stringify(field.default)}`);
    if (field.min !== undefined || field.max !== undefined) parts.push(`range ${field.min ?? "..."} to ${field.max ?? "..."}`);
    if (field.step !== undefined) parts.push(`step ${field.step}`);
    if (field.options) parts.push(`one of ${field.options.map((option) => option.value).join(", ")}`);
    const doc = field.doc ? ` - ${field.doc.replace(/\s+/g, " ")}` : "";
    return `- ${parts.join("; ")}${doc}`;
}

function renderParam(param: IndexParam): string[] {
    const head = `**${param.name}${param.optional ? "?" : ""}**: \`${param.type}\``;
    if (!param.fields || param.fields.length === 0) return [head];
    return [head, ...param.fields.map(renderField)];
}

function renderExample(example: IndexExample): string {
    return ["```typescript", example.code, "```"].join("\n");
}

/** A member as markdown a model reads well: the facts first, the prose after, the examples last. */
export function renderMember(member: IndexMember, version: string, examples: IndexExample[]): string {
    const lines: string[] = [`# ${member.path}`, ""];
    const facts = [`kind: ${member.kind}`, `tier: ${member.tier} (${TIER_MEANING[member.tier]})`, `version: ${version}`];
    if (member.engines.length > 0) facts.push(`engines: ${member.engines.join(", ")}`);
    if (member.onApi3d) facts.push("runs on CAD Cloud: yes");
    if (member.endpoint) facts.push(`endpoint: ${member.httpMethod ?? "POST"} ${member.endpoint}`);
    if (member.scope) facts.push(`API key scope: ${member.scope}`);
    if (member.deprecated) facts.push(`deprecated: ${member.deprecated}`);
    if (member.drawable) facts.push("drawable: the result can be drawn directly");
    lines.push(...facts.map((fact) => `- ${fact}`), "");
    if (member.signature) lines.push("```typescript", member.signature, "```", "");
    if (member.engineSignatures) {
        lines.push("Signature by engine:", ...Object.entries(member.engineSignatures).map(([engine, signature]) => `- ${engine}: \`${signature ?? "none"}\``), "");
    }
    if (member.doc) lines.push(member.doc, "");
    else if (member.summary) lines.push(member.summary, "");
    if (member.params.length > 0) {
        lines.push("## Parameters", "");
        for (const param of member.params) lines.push(...renderParam(param));
        lines.push("");
    }
    if (member.returns) lines.push(`## Returns`, "", `\`${member.returns}\`${member.async ? " (async)" : ""}`, "");
    if (examples.length > 0) {
        lines.push("## Examples", "", ...examples.map(renderExample), "");
    }
    if (member.docUrl) lines.push(`Reference: ${member.docUrl}`);
    return lines.join("\n").trimEnd() + "\n";
}

/** The one-line form a list shows. */
export function renderLine(member: IndexMember): string {
    const tier = member.tier === "oss" ? "" : ` [${member.tier}]`;
    return `- ${member.path} (${member.kind})${tier}${member.summary ? `: ${member.summary}` : ""}`;
}
