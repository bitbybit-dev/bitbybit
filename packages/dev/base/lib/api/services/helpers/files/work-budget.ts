export class WorkBudget {
    private used = 0;

    constructor(readonly capacity: number) { }

    static forInput(inputSize: number, perUnit: number, floor: number, ceiling: number = Number.POSITIVE_INFINITY): WorkBudget {
        const scaled = Number.isFinite(inputSize) && inputSize > 0 ? inputSize * perUnit : 0;
        return new WorkBudget(Math.min(ceiling, Math.max(floor, scaled)));
    }

    get spent(): number {
        return this.used;
    }

    get remaining(): number {
        return Math.max(0, this.capacity - this.used);
    }

    get exhausted(): boolean {
        return this.used > this.capacity;
    }

    spend(units: number): boolean {
        this.used += units > 0 ? units : 0;
        return this.used <= this.capacity;
    }

    affords(units: number): boolean {
        return this.used + (units > 0 ? units : 0) <= this.capacity;
    }
}
