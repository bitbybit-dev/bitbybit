import type { UnitOfLength } from "../helper-types";

export const MILLIMETRES_PER_UNIT: Readonly<Record<UnitOfLength, number>> = { mm: 1, cm: 10, m: 1000, in: 25.4 };
export const CONVERTED_PLACES = 9;
export const TABLE_PLACES: Readonly<Record<UnitOfLength, number>> = { mm: 4, cm: 5, m: 7, in: 4 };
