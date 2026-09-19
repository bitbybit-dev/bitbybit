import { z } from "zod";
import { inlineJsonSchemaReferences } from "./json-schema.js";

export interface ToolAnnotations {
    title: string;
    readOnlyHint: boolean;
    destructiveHint: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
}

export interface ToolLink {
    uri: string;
    name: string;
    mimeType?: string;
    description?: string;
}

export interface ToolResult {
    text: string;
    structured?: Record<string, unknown>;
    links?: ToolLink[];
    isError?: boolean;
}

export type ToolWhere = "server" | "browser";

export type ToolInput = z.ZodObject<z.ZodRawShape>;

export type ToolHandler<TInput extends ToolInput, TContext> = (args: z.output<TInput>, context: TContext) => Promise<ToolResult> | ToolResult;

export interface ToolDefinition<TInput extends ToolInput, TContext> {
    name: string;
    description: string;
    annotations: ToolAnnotations;
    input: TInput;
    where: ToolWhere;
    scope?: string;
    handler?: ToolHandler<TInput, TContext> | undefined;
}

export type AnyToolDefinition<TContext> = ToolDefinition<ToolInput, TContext>;

export const TOOL_CEILING = 8;

export class Registry<TContext> {
    private readonly tools = new Map<string, AnyToolDefinition<TContext>>();

    register<TInput extends ToolInput>(definition: ToolDefinition<TInput, TContext>): this {
        if (this.tools.has(definition.name)) throw new Error(`Tool ${definition.name} is already registered`);
        const { handler } = definition;
        const erased: AnyToolDefinition<TContext> = handler
            ? { ...definition, handler: (args, context) => handler(args as z.output<TInput>, context) }
            : { ...definition, handler: undefined };
        this.tools.set(definition.name, erased);
        return this;
    }

    list(): AnyToolDefinition<TContext>[] {
        return [...this.tools.values()];
    }

    get(name: string): AnyToolDefinition<TContext> | undefined {
        return this.tools.get(name);
    }

    get size(): number {
        return this.tools.size;
    }
}

export function inputJsonSchema(input: ToolInput): Record<string, unknown> {
    return inlineJsonSchemaReferences(z.toJSONSchema(input, { target: "draft-2020-12", io: "input" }));
}

export interface HttpTool {
    name: string;
    description: string;
    annotations: ToolAnnotations;
    inputSchema: Record<string, unknown>;
    call(args: unknown): Promise<ToolResult>;
}

export function toHttp<TContext>(
    registry: Registry<TContext>,
    context: TContext,
    filter?: (definition: AnyToolDefinition<TContext>) => boolean,
): HttpTool[] {
    const tools: HttpTool[] = [];
    for (const definition of registry.list()) {
        const { handler } = definition;
        if (!handler || (filter && !filter(definition))) continue;
        tools.push({
            name: definition.name,
            description: definition.description,
            annotations: definition.annotations,
            inputSchema: inputJsonSchema(definition.input),
            call: async (args: unknown): Promise<ToolResult> => {
                const parsed = definition.input.safeParse(args);
                if (!parsed.success) {
                    return { text: `Invalid arguments for ${definition.name}: ${z.prettifyError(parsed.error)}`, isError: true };
                }
                return handler(parsed.data, context);
            },
        });
    }
    return tools;
}
