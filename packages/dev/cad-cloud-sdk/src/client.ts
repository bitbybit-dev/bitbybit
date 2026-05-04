// ---------------------------------------------------------------------------
// BitbybitClient — main entry point for the SDK
// ---------------------------------------------------------------------------

import { ModelsEndpoint } from "./endpoints/models.js";
import { TasksEndpoint } from "./endpoints/tasks.js";
import { CadEndpoint } from "./endpoints/cad.js";
import { ConvertEndpoint } from "./endpoints/convert.js";
import { FilesEndpoint } from "./endpoints/files.js";
import { validateRequestBody, getEndpointSchema } from "./validation/index.js";

const DEFAULT_BASE_URL = "https://api.bitbybit.dev";

export interface BitbybitClientOptions {
    /** Your Bitbybit API key (starts with `bbk_`). */
    apiKey: string;
    /**
     * Base URL of the Bitbybit API.
     * @default "https://api.bitbybit.dev"
     */
    baseUrl?: string;
    /**
     * Validate request bodies against JSON Schema before sending.
     * Catches parameter errors early with clear messages.
     * @default true
     */
    validate?: boolean;
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
    private readonly validate: boolean;

    constructor(opts: BitbybitClientOptions) {
        if (!opts.apiKey) {
            throw new Error("BitbybitClient requires an apiKey");
        }

        this.apiKey = opts.apiKey;
        this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
        this.validate = opts.validate !== false;

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
        if (this.validate && body != null && method !== "GET") {
            const endpointKey = pathToEndpointKey(path);
            if (endpointKey) {
                const schemaName = getEndpointSchema(endpointKey);
                if (schemaName) {
                    validateRequestBody(schemaName, body);
                }
            }
        }

        const url = `${this.baseUrl}${path}`;
        const headers: Record<string, string> = {
            "x-api-key": this.apiKey,
        };

        let serializedBody: string | undefined;
        if (body != null) {
            headers["Content-Type"] = "application/json";
            serializedBody = JSON.stringify(body);
        }

        const res = await fetch(url, {
            method,
            headers,
            body: serializedBody,
        });

        return res;
    }
}

// ---------------------------------------------------------------------------
// Path → endpoint key mapping for validation lookup
// ---------------------------------------------------------------------------

const STATIC_PATH_MAP: Record<string, string> = {
    "/api/v1/cad/execute": "cad.execute",
    "/api/v1/cad/pipeline": "cad.pipeline",
    "/api/v1/cad/compound": "cad.compound",
    "/api/v1/models/definitions": "models.definitions",
    "/api/v1/convert/step-to-gltf": "convert.stepToGltf",
    "/api/v1/convert/step-to-gltf-advanced": "convert.stepToGltfAdvanced",
    "/api/v1/files/upload": "files.upload",
};

const MODEL_PATH_RE = /^\/api\/v1\/models\/([a-z][a-z0-9-]*)$/;
const MODEL_BATCH_PATH_RE = /^\/api\/v1\/models\/([a-z][a-z0-9-]*)\/batch$/;

function pathToEndpointKey(path: string): string | undefined {
    const staticKey = STATIC_PATH_MAP[path];
    if (staticKey) return staticKey;

    // /api/v1/models/{slug}/batch → models.batchSubmit
    const batchMatch = MODEL_BATCH_PATH_RE.exec(path);
    if (batchMatch) return "models.batchSubmit";

    // /api/v1/models/{slug} → models.submit.{slug} (per-model) or models.submit (generic)
    const modelMatch = MODEL_PATH_RE.exec(path);
    if (modelMatch) {
        const slug = modelMatch[1];
        // Try per-model schema first (e.g. models.submit.dragon-cup)
        // Caller falls back to generic if per-model is not found
        const perModel = `models.submit.${slug}`;
        if (getEndpointSchema(perModel)) return perModel;
        return "models.submit";
    }

    return undefined;
}
