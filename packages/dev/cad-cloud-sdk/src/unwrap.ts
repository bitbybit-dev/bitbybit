// ---------------------------------------------------------------------------
// Shared response unwrapper — extracts data from API envelope or throws
// ---------------------------------------------------------------------------

import type { ApiResponse } from "./types/index.js";
import { BitbybitApiError } from "./errors.js";

/**
 * Unwrap a standard `{ ok, data } | { ok, error }` API response envelope.
 * Throws `BitbybitApiError` when the response indicates failure.
 */
export async function unwrap<T>(res: Response): Promise<T> {
    const body: ApiResponse<T> = await res.json() as ApiResponse<T>;
    if (!body.ok) {
        throw new BitbybitApiError({
            code: body.error.code,
            message: body.error.message,
            statusCode: res.status,
            details: body.error.details,
            requestId: body.error.requestId,
        });
    }
    return body.data;
}
