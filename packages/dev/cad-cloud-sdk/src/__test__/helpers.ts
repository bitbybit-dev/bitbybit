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

export function mockFetcher(
    ...responses: Response[]
): (method: string, path: string, body?: unknown) => Promise<Response> {
    const queue = [...responses];
    return (_method: string, _path: string, _body?: unknown) => {
        const res = queue.shift();
        if (!res) {
            return Promise.reject(new Error("mockFetcher: no more responses"));
        }
        return Promise.resolve(res);
    };
}

export function spyFetcher(...responses: Response[]) {
    const calls: { method: string; path: string; body?: unknown }[] = [];
    const queue = [...responses];
    const fn = (method: string, path: string, body?: unknown) => {
        calls.push({ method, path, body });
        const res = queue.shift();
        if (!res) {
            return Promise.reject(new Error("spyFetcher: no more responses"));
        }
        return Promise.resolve(res);
    };
    return { fn, calls };
}

export function taskResponse(taskId: string, status: string, extra: Record<string, unknown> = {}): Response {
    return okResponse({ taskId, status, ...extra });
}

export function downloadsResponse(...downloads: { format: string; url: string }[]): Response {
    return okResponse({ downloads });
}

export const NO_WAIT = { intervalMs: 0 };
