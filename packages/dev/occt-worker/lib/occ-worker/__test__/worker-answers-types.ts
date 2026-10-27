export interface WorkerAnswer {
    uid?: string;
    result?: unknown;
    error?: string;
    errorKind?: string;
    code?: string;
}

export interface WorkerReference {
    hash: number;
    type: string;
}
