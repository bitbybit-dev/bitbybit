// ---------------------------------------------------------------------------
// BitbybitClient — main entry point for the SDK
// ---------------------------------------------------------------------------

import { ModelsEndpoint } from "./endpoints/models.js";
import { TasksEndpoint } from "./endpoints/tasks.js";
import { CadEndpoint } from "./endpoints/cad.js";
import { ConvertEndpoint } from "./endpoints/convert.js";
import { FilesEndpoint } from "./endpoints/files.js";

const DEFAULT_BASE_URL = "https://api.bitbybit.dev";

export interface BitbybitClientOptions {
    /** Your Bitbybit API key (starts with `bbk_`). */
    apiKey: string;
    /**
     * Base URL of the Bitbybit API.
     * @default "https://api.bitbybit.dev"
     */
    baseUrl?: string;
}

/**
 * Type-safe client for the Bitbybit CAD Cloud API.
 *
 * **Server-side only** — never expose your API key in frontend code.
 *
 * @example
 * ```ts
 * import { BitbybitClient } from "@bitbybit-dev/cad-cloud-sdk";
 *
 * const client = new BitbybitClient({ apiKey: process.env.BITBYBIT_API_KEY! });
 *
 * // Generate a dragon cup and get a GLB download URL
 * const { downloadUrl } = await client.models.run("dragon-cup", {
 *     params: { height: 10, radiusBottom: 5 },
 *     outputs: { formats: ["gltf"] },
 * });
 * ```
 */
export class BitbybitClient {
    /** Parametric model generation. */
    readonly models: ModelsEndpoint;

    /** Task status, polling, and result retrieval. */
    readonly tasks: TasksEndpoint;

    /** Raw CAD operations (execute, pipeline, compound). */
    readonly cad: CadEndpoint;

    /** STEP → glTF conversion. */
    readonly convert: ConvertEndpoint;

    /** File upload and management. */
    readonly files: FilesEndpoint;

    private readonly baseUrl: string;
    private readonly apiKey: string;

    constructor(opts: BitbybitClientOptions) {
        if (!opts.apiKey) {
            throw new Error("BitbybitClient requires an apiKey");
        }

        this.apiKey = opts.apiKey;
        this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");

        const fetcher = this.request.bind(this);
        this.models = new ModelsEndpoint(fetcher);
        this.tasks = new TasksEndpoint(fetcher);
        this.cad = new CadEndpoint(fetcher);
        this.convert = new ConvertEndpoint(fetcher);
        this.files = new FilesEndpoint(fetcher);
    }

    /** Check API health. */
    async health(): Promise<{ ok: boolean; instance: string; timestamp: string }> {
        const res = await fetch(`${this.baseUrl}/health`);
        return res.json() as Promise<{ ok: boolean; instance: string; timestamp: string }>;
    }

    /**
     * Low-level request method used by all endpoints.
     * Can also be used directly for custom / future endpoints.
     */
    async request(method: string, path: string, body?: unknown): Promise<Response> {
        const url = `${this.baseUrl}${path}`;
        const headers: Record<string, string> = {
            "x-api-key": this.apiKey,
            "Content-Type": "application/json",
        };

        const res = await fetch(url, {
            method,
            headers,
            body: body != null ? JSON.stringify(body) : undefined,
        });

        return res;
    }
}
