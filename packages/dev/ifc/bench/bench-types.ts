export interface BenchCase {
    name: string;
    budgetMs: number;
    run: () => number[];
}

export interface BenchRow {
    case: string;
    medianMs: number;
    budgetMs: number;
    fingerprint: string;
}
