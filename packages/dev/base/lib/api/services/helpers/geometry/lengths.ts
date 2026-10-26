import type { Base } from "../../../inputs/base-inputs";
import { InputError } from "../../../kernel-calls/errors";
import { roundedTo } from "./scalars";

type UnitOfLength = `${Base.unitOfLengthEnum}`;

const MILLIMETRES_PER_UNIT: Readonly<Record<UnitOfLength, number>> = { mm: 1, cm: 10, m: 1000, in: 25.4 };
const CONVERTED_PLACES = 9;
const TABLE_PLACES: Readonly<Record<UnitOfLength, number>> = { mm: 4, cm: 5, m: 7, in: 6 };

const UNITS: readonly string[] = Object.keys(MILLIMETRES_PER_UNIT);

export const isUnitOfLength = (unit: unknown): unit is UnitOfLength => typeof unit === "string" && UNITS.includes(unit);

export const checkedUnitOfLength = (unit: unknown, property: string): UnitOfLength => {
    if (!isUnitOfLength(unit)) {
        throw new InputError(`\`${property}\` is ${String(unit)}, which is none of ${UNITS.join(", ")}.`, property);
    }
    return unit;
};

export const millimetresPerUnitOf = (unit: UnitOfLength): number => MILLIMETRES_PER_UNIT[unit];

export const lengthConverted = (value: number, from: UnitOfLength, to: UnitOfLength): number => from === to ? value : value * MILLIMETRES_PER_UNIT[from] / MILLIMETRES_PER_UNIT[to];

export const snappedLength = (value: number, from: UnitOfLength, to: UnitOfLength): number => from === to ? value : roundedTo(lengthConverted(value, from, to), CONVERTED_PLACES);

export const tableLength = (value: number, from: UnitOfLength, table: UnitOfLength): number => from === table ? value : roundedTo(lengthConverted(value, from, table), TABLE_PLACES[table]);

export function lengthsConverted<T extends Readonly<Record<K, number>>, K extends keyof T>(record: T, fields: readonly K[], from: UnitOfLength, to: UnitOfLength): T {
    const converted: Partial<Record<K, number>> = {};
    fields.forEach(field => { converted[field] = snappedLength(record[field], from, to); });
    return { ...record, ...converted };
}
