import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import type { AuthInfo, StandardSchemaWithJSON } from "@modelcontextprotocol/server";
import type { z } from "zod";
import { inputJsonSchema } from "./registry.js";
import type { AnyToolDefinition, Registry, ToolInput, ToolResult } from "./registry.js";

export interface McpServerOptions<TContext> {
    name: string;
    version: string;
    instructions?: string;
    filter?: (definition: AnyToolDefinition<TContext>) => boolean;
}

export interface RequestHandlerOptions<TContext> {
    name: string;
    version: string;
    instructions?: string;
    filterFor?: (context: TContext) => (definition: AnyToolDefinition<TContext>) => boolean;
    onError?: (error: Error) => void;
}

export interface RequestHandler<TContext> {
    fetch(request: Request, context: TContext): Promise<Response>;
}

const REQUEST_CONTEXT = "dev.bitbybit/request-context";

type TextContent = { type: "text"; text: string };
type LinkContent = { type: "resource_link"; uri: string; name: string; mimeType?: string; description?: string };

function toCallToolResult(result: ToolResult): { content: (TextContent | LinkContent)[]; structuredContent?: Record<string, unknown>; isError?: boolean } {
    const links: LinkContent[] = (result.links ?? []).map((link) => ({
        type: "resource_link",
        uri: link.uri,
        name: link.name,
        ...(link.mimeType === undefined ? {} : { mimeType: link.mimeType }),
        ...(link.description === undefined ? {} : { description: link.description }),
    }));
    return {
        content: [{ type: "text", text: result.text }, ...links],
        ...(result.structured ? { structuredContent: result.structured } : {}),
        ...(result.isError ? { isError: true } : {}),
    };
}

function advertised<TInput extends ToolInput>(input: TInput): StandardSchemaWithJSON<z.input<TInput>, z.output<TInput>> {
    const json = inputJsonSchema(input);
    const standard = input["~standard"] as StandardSchemaWithJSON<z.input<TInput>, z.output<TInput>>["~standard"];
    return { "~standard": { ...standard, jsonSchema: { input: () => json, output: () => json } } };
}

export function bindRegistry<TContext>(
    server: McpServer,
    registry: Registry<TContext>,
    context: TContext,
    filter?: (definition: AnyToolDefinition<TContext>) => boolean,
): string[] {
    const bound: string[] = [];
    for (const definition of registry.list()) {
        const { handler } = definition;
        if (!handler || (filter && !filter(definition))) continue;
        const { annotations } = definition;
        server.registerTool(
            definition.name,
            {
                title: annotations.title,
                description: definition.description,
                inputSchema: advertised(definition.input),
                annotations: {
                    title: annotations.title,
                    readOnlyHint: annotations.readOnlyHint,
                    destructiveHint: annotations.destructiveHint,
                    ...(annotations.idempotentHint === undefined ? {} : { idempotentHint: annotations.idempotentHint }),
                    ...(annotations.openWorldHint === undefined ? {} : { openWorldHint: annotations.openWorldHint }),
                },
            },
            async (args) => toCallToolResult(await handler(args, context)),
        );
        bound.push(definition.name);
    }
    return bound;
}

export function createMcpServer<TContext>(registry: Registry<TContext>, context: TContext, options: McpServerOptions<TContext>): McpServer {
    const server = new McpServer(
        { name: options.name, version: options.version },
        options.instructions === undefined ? {} : { instructions: options.instructions },
    );
    bindRegistry(server, registry, context, options.filter);
    return server;
}

function carrying<TContext>(context: TContext): AuthInfo {
    return { token: "", clientId: "", scopes: [], extra: { [REQUEST_CONTEXT]: context } };
}

function carried<TContext>(authInfo: AuthInfo | undefined): TContext {
    const context = authInfo?.extra?.[REQUEST_CONTEXT];
    if (context === undefined) throw new Error("The request carries no context; serve it through the request handler's own fetch");
    return context as TContext;
}

export function createRequestHandler<TContext>(registry: Registry<TContext>, options: RequestHandlerOptions<TContext>): RequestHandler<TContext> {
    const handler = createMcpHandler(
        ({ authInfo }) => {
            const context = carried<TContext>(authInfo);
            const server = new McpServer(
                { name: options.name, version: options.version },
                options.instructions === undefined ? {} : { instructions: options.instructions },
            );
            bindRegistry(server, registry, context, options.filterFor?.(context));
            return server;
        },
        { legacy: "stateless", responseMode: "json", ...(options.onError === undefined ? {} : { onerror: options.onError }) },
    );
    return { fetch: (request, context) => handler.fetch(request, { authInfo: carrying(context) }) };
}
