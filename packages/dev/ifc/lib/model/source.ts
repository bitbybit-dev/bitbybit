import type { IfcSchema } from "../schema/schema";
import { ROOT_ENTITY } from "../schema/constants";
import { StepSyntaxError } from "../step/errors";
import { decodeArguments } from "../step/reader";
import { firstStringIn, plainText, referenceCapacity, referenceList, referencesInto, textOf } from "../step/scanner";
import type { IfcEntity, IfcValue, StepIndex } from "../step/step-types";
import { decodeString } from "../step/strings";
import type { GlobalIdOwners, SourceUsers } from "./model-types";
import { RowsById } from "./rows-by-id";

const NO_IDS: readonly number[] = [];
const UNSEEN = -1;

export class IfcSource {
    readonly index: StepIndex;
    readonly schema: IfcSchema;
    readonly maxId: number;
    private readonly rows: RowsById;
    private readonly decoded = new Map<number, IfcEntity>();
    private readonly typeOfCode: readonly (string | undefined)[];
    private readonly spell: (typeName: string) => string;
    private typeIds: Map<string, number[]> | undefined;
    private globalIdOwners: GlobalIdOwners | undefined;
    private users: SourceUsers | undefined;

    constructor(index: StepIndex, schema: IfcSchema) {
        this.index = index;
        this.schema = schema;
        this.rows = new RowsById(index);
        this.maxId = this.rows.maxId;
        this.typeOfCode = index.typeTable.map((name) => schema.entityName(name));
        this.spell = (typeName: string): string => schema.typeName(typeName) ?? typeName;
    }

    has(id: number): boolean {
        return this.rows.rowOf(id) >= 0;
    }

    typeOf(id: number): string | undefined {
        const row = this.rows.rowOf(id);
        return row < 0 ? undefined : this.typeOfRow(row);
    }

    rawTypeOf(id: number): string | undefined {
        const row = this.rows.rowOf(id);
        return row < 0 ? undefined : this.index.typeTable[this.index.typeCodes[row]!] || "complex instance";
    }

    get(id: number): IfcEntity | undefined {
        const known = this.decoded.get(id);
        if (known) {
            return known;
        }
        const entity = this.decode(id);
        if (entity) {
            this.decoded.set(id, entity);
        }
        return entity;
    }

    peek(id: number): IfcEntity | undefined {
        return this.decoded.get(id) ?? this.decode(id);
    }

    referenceList(id: number): number[] | undefined {
        const row = this.rows.rowOf(id);
        return row < 0 ? undefined : referenceList(this.index.bytes, this.index.argStart[row]!, this.index.argEnd[row]!);
    }

    rawArguments(id: number): IfcValue[] | undefined {
        const row = this.rows.rowOf(id);
        return row < 0 ? undefined : decodeArguments(this.index.bytes, this.index.argStart[row]!, this.index.argEnd[row]!, this.spell);
    }

    private decode(id: number): IfcEntity | undefined {
        const row = this.rows.rowOf(id);
        if (row < 0) {
            return undefined;
        }
        const type = this.typeOfRow(row);
        if (type === undefined) {
            throw new StepSyntaxError(`Entity #${id} is a ${this.rawTypeOf(id)!}, which ${this.schema.name} does not define`, this.index.rowStart[row]!);
        }
        return { id, type, args: decodeArguments(this.index.bytes, this.index.argStart[row]!, this.index.argEnd[row]!, this.spell) };
    }

    idsOfType(type: string): readonly number[] {
        if (!this.typeIds) {
            const lists: number[][] = this.typeOfCode.map(() => []);
            for (let row = 0; row < this.index.count; row++) {
                lists[this.index.typeCodes[row]!]!.push(this.index.ids[row]!);
            }
            const index = new Map<string, number[]>();
            this.typeOfCode.forEach((name, code) => {
                if (name !== undefined && lists[code]!.length) {
                    index.set(name, [...(index.get(name) ?? []), ...lists[code]!]);
                }
            });
            this.typeIds = index;
        }
        return this.typeIds.get(type) ?? NO_IDS;
    }

    ownersOfGlobalId(globalId: string): readonly number[] {
        this.globalIdOwners ??= this.indexGlobalIds();
        const first = this.globalIdOwners.first.get(globalId);
        return first === undefined ? NO_IDS : [first, ...(this.globalIdOwners.more.get(globalId) ?? NO_IDS)];
    }

    usersOf(id: number): readonly number[] {
        const row = this.rows.rowOf(id);
        if (row < 0) {
            return NO_IDS;
        }
        if (!this.users) {
            this.users = this.indexUsers();
        }
        return Array.from(this.users.users.subarray(this.users.offsets[row], this.users.offsets[row + 1]));
    }

    private indexGlobalIds(): GlobalIdOwners {
        const first = new Map<string, number>();
        const more = new Map<string, number[]>();
        const { bytes, argStart, argEnd, ids, count, typeCodes } = this.index;
        const rooted = this.typeOfCode.map((type) => type !== undefined && this.schema.isSubtypeOf(type, ROOT_ENTITY));
        for (let row = 0; row < count; row++) {
            const span = rooted[typeCodes[row]!] ? firstStringIn(bytes, argStart[row]!, argEnd[row]!) : undefined;
            if (!span) {
                continue;
            }
            const globalId = plainText(bytes, span[0], span[1]) ?? decodeString(textOf(bytes, span[0], span[1]), span[0]);
            if (!first.has(globalId)) {
                first.set(globalId, ids[row]!);
                continue;
            }
            const list = more.get(globalId);
            if (list) {
                list.push(ids[row]!);
            } else {
                more.set(globalId, [ids[row]!]);
            }
        }
        return { first, more };
    }

    private typeOfRow(row: number): string | undefined {
        return this.typeOfCode[this.index.typeCodes[row]!];
    }

    private indexUsers(): SourceUsers {
        const { ids, count } = this.index;
        const offsets = new Int32Array(count + 1);
        const seen = new Int32Array(count).fill(UNSEEN);
        let scratch = new Int32Array(0);
        const targetRows = (row: number, stamp: number): number => {
            const start = this.index.argStart[row]!;
            const end = this.index.argEnd[row]!;
            if (scratch.length < referenceCapacity(start, end)) {
                scratch = new Int32Array(2 * referenceCapacity(start, end));
            }
            const found = referencesInto(this.index.bytes, start, end, scratch);
            let kept = 0;
            for (let at = 0; at < found; at++) {
                const target = this.rows.rowOf(scratch[at]!);
                if (target >= 0 && seen[target] !== stamp) {
                    seen[target] = stamp;
                    scratch[kept++] = target;
                }
            }
            return kept;
        };
        for (let row = 0; row < count; row++) {
            const kept = targetRows(row, row);
            for (let at = 0; at < kept; at++) {
                offsets[scratch[at]! + 1]!++;
            }
        }
        for (let row = 0; row < count; row++) {
            offsets[row + 1] = offsets[row + 1]! + offsets[row]!;
        }
        const users = new Int32Array(offsets[count]!);
        const filled = offsets.slice(0, count);
        for (let row = 0; row < count; row++) {
            const kept = targetRows(row, row + count);
            for (let at = 0; at < kept; at++) {
                users[filled[scratch[at]!]!++] = ids[row]!;
            }
        }
        return { offsets, users };
    }
}
