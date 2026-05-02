/**
 * Creates a mock Response with a JSON body matching the API envelope.
 */
export function okResponse<T>(data: T, status = 200): Response {
    return new Response(JSON.stringify({ ok: true, data }), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

export function errorResponse(
    code: string,
    message: string,
    status = 400,
    details?: unknown,
    requestId?: string,
): Response {
    return new Response(
        JSON.stringify({
            ok: false,
            error: { code, message, details, requestId },
        }),
        { status, headers: { "Content-Type": "application/json" } },
    );
}

/**
 * Creates a fetcher function stub that returns the given responses in order.
 */
export function mockFetcher(
    ...responses: Response[]
): (method: string, path: string, body?: unknown) => Promise<Response> {
    const queue = [...responses];
    return async (_method: string, _path: string, _body?: unknown) => {
        const res = queue.shift();
        if (!res) throw new Error("mockFetcher: no more responses");
        return res;
    };
}

/**
 * Creates a fetcher that tracks calls and returns responses in order.
 */
export function spyFetcher(...responses: Response[]) {
    const calls: { method: string; path: string; body?: unknown }[] = [];
    const queue = [...responses];
    const fn = async (method: string, path: string, body?: unknown) => {
        calls.push({ method, path, body });
        const res = queue.shift();
        if (!res) throw new Error("spyFetcher: no more responses");
        return res;
    };
    return { fn, calls };
}
