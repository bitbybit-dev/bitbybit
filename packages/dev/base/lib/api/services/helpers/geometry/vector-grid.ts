import type { UniqueVectors, VectorCellRange } from "../helper-types";

const CELL_KEY_DIMENSIONS = 6;

const CELL_SIZE_IN_TOLERANCES = 8;

const CELL_PROBE_MARGIN_IN_TOLERANCES = 1.5;

const EXACT_CELL_BITS = 50;

const CELL_ARITHMETIC_SAFE_MULTIPLE_OF_TOLERANCE = 2 ** EXACT_CELL_BITS;

const CELL_HASH_WORD = 4294967296;

const HASH_SEED = 0x9E3779B1;

const HASH_MIX_LOW = 0x85EBCA6B;

const HASH_MIX_HIGH = 0xC2B2AE35;

const HASH_FOLD_SHIFT = 15;

const hashCells = (vectorLength: number, cells: number[]): number => {
    let hash = Math.imul(vectorLength + 1, HASH_SEED);
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i]!;
        const lowWord = cell % CELL_HASH_WORD;
        const highWord = (cell - lowWord) / CELL_HASH_WORD;
        hash = Math.imul(hash ^ lowWord, HASH_MIX_LOW);
        hash = Math.imul(hash ^ highWord, HASH_MIX_HIGH);
        hash ^= hash >>> HASH_FOLD_SHIFT;
    }
    return hash;
};

const neverMatchesAnyVector = (vector: readonly number[], tolerance: number): boolean => {
    for (let i = 0; i < vector.length; i++) {
        if (!Number.isFinite(vector[i])) {
            return true;
        }
    }
    return vector.length > 0 && !(tolerance > 0);
};

const sameWithin = (vector: readonly number[], other: readonly number[], tolerance: number): boolean => {
    if (vector.length !== other.length) {
        return false;
    }
    for (let i = 0; i < vector.length; i++) {
        if (!(Math.abs(vector[i]! - other[i]!) < tolerance)) {
            return false;
        }
    }
    return true;
};

const vectorCellRange = (vector: readonly number[], tolerance: number): VectorCellRange | undefined => {
    const keyDimensions = Math.min(vector.length, CELL_KEY_DIMENSIONS);
    if (keyDimensions > 0 && !Number.isFinite(tolerance)) {
        return undefined;
    }
    const cellSize = tolerance * CELL_SIZE_IN_TOLERANCES;
    const probeMargin = tolerance * CELL_PROBE_MARGIN_IN_TOLERANCES;
    const center: number[] = [];
    const lowest: number[] = [];
    const highest: number[] = [];
    for (let i = 0; i < keyDimensions; i++) {
        const component = vector[i]!;
        if (Math.abs(component) / tolerance >= CELL_ARITHMETIC_SAFE_MULTIPLE_OF_TOLERANCE) {
            return undefined;
        }
        const lowestCell = Math.floor((component - probeMargin) / cellSize);
        const highestCell = Math.floor((component + probeMargin) / cellSize);
        const cellsToProbe = highestCell - lowestCell + 1;
        if (!Number.isInteger(lowestCell) || !Number.isInteger(highestCell) || cellsToProbe < 1 || cellsToProbe > 2) {
            return undefined;
        }
        center.push(Math.floor(component / cellSize));
        lowest.push(lowestCell);
        highest.push(highestCell);
    }
    return { center, lowest, highest };
};

const firstMatchInCells = (keptByCell: Map<number, number[]>, vectorLength: number, cellRange: VectorCellRange, matches: (index: number) => boolean): number | undefined => {
    const { lowest, highest } = cellRange;
    const probe = lowest.slice();
    let first: number | undefined;
    for (;;) {
        for (const index of keptByCell.get(hashCells(vectorLength, probe)) ?? []) {
            if ((first === undefined || index < first) && matches(index)) {
                first = index;
            }
        }
        let dimension = probe.length - 1;
        while (dimension >= 0 && probe[dimension] === highest[dimension]) {
            probe[dimension] = lowest[dimension]!;
            dimension--;
        }
        if (dimension < 0) {
            return first;
        }
        probe[dimension] = probe[dimension]! + 1;
    }
};

const addToCell = (keptByCell: Map<number, number[]>, vectorLength: number, cellRange: VectorCellRange, index: number): void => {
    const cellKey = hashCells(vectorLength, cellRange.center);
    const cell = keptByCell.get(cellKey);
    if (cell === undefined) {
        keptByCell.set(cellKey, [index]);
    } else {
        cell.push(index);
    }
};

/**
 * Keeps the first of every group of vectors that agree within `tolerance` in each component, and
 * says for every vector given which kept one it matched: the first in order, as a plain scan finds.
 * Kept vectors are filed in a grid of cells a few tolerances wide, so a vector is compared only with
 * those in the cells it could match. The grid only narrows the candidates; every one is still
 * compared component by component. A vector the grid cannot place (a component not finite, a
 * tolerance that is not positive and finite, a magnitude where the cell arithmetic stops being exact)
 * is compared with every kept vector instead, and kept ones of that kind are held apart, where the
 * grid path looks too.
 */
export const uniqueVectors = (vectors: readonly number[][], tolerance: number): UniqueVectors => {
    const kept: number[][] = [];
    const indexes: number[] = [];
    const keptByCell = new Map<number, number[]>();
    const keptOutsideCells: number[] = [];
    const keep = (vector: number[]): number => kept.push(vector) - 1;
    for (const vector of vectors) {
        if (neverMatchesAnyVector(vector, tolerance)) {
            indexes.push(keep(vector));
            continue;
        }
        const matches = (index: number): boolean => sameWithin(vector, kept[index]!, tolerance);
        const cellRange = vectorCellRange(vector, tolerance);
        if (cellRange === undefined) {
            const found = kept.findIndex((_, index) => matches(index));
            if (found >= 0) {
                indexes.push(found);
            } else {
                const index = keep(vector);
                keptOutsideCells.push(index);
                indexes.push(index);
            }
            continue;
        }
        const inCells = firstMatchInCells(keptByCell, vector.length, cellRange, matches);
        const outside = keptOutsideCells.find(matches);
        const found = inCells === undefined ? outside : outside === undefined ? inCells : Math.min(inCells, outside);
        if (found === undefined) {
            const index = keep(vector);
            addToCell(keptByCell, vector.length, cellRange, index);
            indexes.push(index);
        } else {
            indexes.push(found);
        }
    }
    return { kept, indexes };
};
