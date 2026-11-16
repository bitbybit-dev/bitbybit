export interface DxfPair {
    readonly code: number;
    readonly value: string;
}

export interface DxfRecord {
    readonly kind: string;
    readonly pairs: readonly DxfPair[];
}

export interface DxfFile {
    readonly pairs: readonly DxfPair[];
    readonly sections: ReadonlyMap<string, readonly DxfPair[]>;
    readonly sectionOrder: readonly string[];
}

export const readDxf = (text: string): DxfFile => {
    const lines = text.split("\n");
    if (lines[lines.length - 1] === "") {
        lines.pop();
    }
    if (lines.length % 2 !== 0) {
        throw new Error(`a DXF file holds pairs of lines; this one has ${lines.length} lines`);
    }
    const pairs: DxfPair[] = [];
    for (let at = 0; at < lines.length; at += 2) {
        const code = Number(lines[at]!.trim());
        if (!Number.isInteger(code)) {
            throw new Error(`line ${at + 1} is not a group code: ${lines[at]}`);
        }
        pairs.push({ code, value: lines[at + 1]! });
    }
    const sections = new Map<string, DxfPair[]>();
    const sectionOrder: string[] = [];
    let current: DxfPair[] | undefined;
    for (let at = 0; at < pairs.length; at++) {
        const pair = pairs[at]!;
        if (pair.code === 0 && pair.value === "SECTION") {
            const name = pairs[at + 1]!.value;
            current = [];
            sections.set(name, current);
            sectionOrder.push(name);
            at++;
        } else if (pair.code === 0 && pair.value === "ENDSEC") {
            current = undefined;
        } else if (current !== undefined) {
            current.push(pair);
        }
    }
    return { pairs, sections, sectionOrder };
};

export const recordsOf = (pairs: readonly DxfPair[]): DxfRecord[] => {
    const records: DxfRecord[] = [];
    let current: DxfPair[] | undefined;
    for (const pair of pairs) {
        if (pair.code === 0) {
            current = [];
            records.push({ kind: pair.value, pairs: current });
        } else {
            current?.push(pair);
        }
    }
    return records;
};

export const valuesOf = (record: DxfRecord, code: number): string[] => record.pairs.filter(pair => pair.code === code).map(pair => pair.value);

export const valueOf = (record: DxfRecord, code: number): string | undefined => valuesOf(record, code)[0];

export const numberOf = (record: DxfRecord, code: number): number => Number(valueOf(record, code));

export const numbersOf = (record: DxfRecord, code: number): number[] => valuesOf(record, code).map(Number);

export const entitiesOf = (file: DxfFile): DxfRecord[] => recordsOf(file.sections.get("ENTITIES") ?? []);

export interface DxfTable {
    readonly name: string;
    readonly head: DxfRecord;
    readonly records: readonly DxfRecord[];
}

export const tablesOf = (file: DxfFile): DxfTable[] => {
    const tables: DxfTable[] = [];
    let open: { head: DxfRecord; records: DxfRecord[] } | undefined;
    for (const record of recordsOf(file.sections.get("TABLES") ?? [])) {
        if (record.kind === "TABLE") {
            open = { head: record, records: [] };
        } else if (record.kind === "ENDTAB") {
            tables.push({ name: valueOf(open!.head, 2)!, head: open!.head, records: open!.records });
            open = undefined;
        } else {
            open?.records.push(record);
        }
    }
    return tables;
};

export const headerVariable = (file: DxfFile, name: string): DxfPair[] => {
    const header = file.sections.get("HEADER") ?? [];
    const at = header.findIndex(pair => pair.code === 9 && pair.value === name);
    if (at < 0) {
        return [];
    }
    const next = header.findIndex((pair, index) => index > at && pair.code === 9);
    return header.slice(at + 1, next < 0 ? header.length : next);
};
