export interface DateParts {
    readonly date?: string;
    readonly time?: string;
}

export interface StyleSuccessor {
    readonly type: string;
    readonly kind: string;
    readonly operation: number;
}
