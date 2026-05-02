// ---------------------------------------------------------------------------
// SDK error class
// ---------------------------------------------------------------------------

export class BitbybitApiError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly details?: unknown;
    readonly requestId?: string;

    constructor(opts: {
        code: string;
        message: string;
        statusCode: number;
        details?: unknown;
        requestId?: string;
    }) {
        super(opts.message);
        this.name = "BitbybitApiError";
        this.code = opts.code;
        this.statusCode = opts.statusCode;
        this.details = opts.details;
        this.requestId = opts.requestId;
    }
}
