import { StepSyntaxError } from "../step/errors";
import type { StepIndex } from "../step/step-types";

const ABSENT = -1;
const DENSE_IDS_PER_ROW = 4;
const DENSE_SLACK = 1024;

export class RowsById {
    readonly maxId: number;
    private readonly dense: Int32Array | undefined;
    private readonly sparse: Map<number, number> | undefined;

    constructor(index: StepIndex) {
        let maxId = 0;
        for (let row = 0; row < index.count; row++) {
            maxId = Math.max(maxId, index.ids[row]!);
        }
        this.maxId = maxId;
        if (maxId <= DENSE_IDS_PER_ROW * index.count + DENSE_SLACK) {
            const dense = new Int32Array(maxId + 1).fill(ABSENT);
            for (let row = 0; row < index.count; row++) {
                const id = index.ids[row]!;
                if (dense[id] !== ABSENT) {
                    throw new StepSyntaxError(`The file holds entity #${id} twice`, index.rowStart[row]!);
                }
                dense[id] = row;
            }
            this.dense = dense;
        } else {
            const sparse = new Map<number, number>();
            for (let row = 0; row < index.count; row++) {
                const id = index.ids[row]!;
                if (sparse.has(id)) {
                    throw new StepSyntaxError(`The file holds entity #${id} twice`, index.rowStart[row]!);
                }
                sparse.set(id, row);
            }
            this.sparse = sparse;
        }
    }

    rowOf(id: number): number {
        return (this.dense ? this.dense[id] : this.sparse?.get(id)) ?? ABSENT;
    }
}
