import { InputError } from "../../../../kernel-calls";
import type { DxfEntityRecord, DxfGroup } from "./dxf-reader-types";
import { BINARY_SENTINEL, QUOTED_LENGTH } from "./dxf-reader.constants";
import { DXF_HEX_RADIX } from "./dxf.constants";

export const dxfGroupsOf = (text: string): DxfGroup[] => {
    if (text.startsWith(BINARY_SENTINEL)) {
        throw new InputError("`dxf` is a binary DXF file; save it as ASCII DXF, which every CAD program can write.", "dxf");
    }
    const lines = text.split(/\r\n|\r|\n/);
    const groups: DxfGroup[] = [];
    for (let at = 0; at + 1 < lines.length; at += 2) {
        const codeText = lines[at]!.trim();
        if (codeText === "" && at + 2 >= lines.length) {
            break;
        }
        const code = Number(codeText);
        if (codeText === "" || !Number.isInteger(code)) {
            throw new InputError(`\`dxf\` is damaged: line ${at + 1} should hold a group code, a whole number, and holds "${codeText.slice(0, QUOTED_LENGTH)}".`, "dxf");
        }
        groups.push({ code, value: lines[at + 1]!, line: at + 1 });
    }
    return groups;
};

interface OpenRecord {
    readonly type: string;
    readonly groups: DxfGroup[];
    readonly vertices: DxfEntityRecord[];
}

export const recordsOf = (groups: readonly DxfGroup[]): DxfEntityRecord[] => {
    const records: OpenRecord[] = [];
    let current: OpenRecord | undefined;
    let polyline: OpenRecord | undefined;
    for (const group of groups) {
        if (group.code !== 0) {
            current?.groups.push(group);
            continue;
        }
        const type = group.value.trim();
        current = { type, groups: [], vertices: [] };
        if (type === "VERTEX") {
            polyline?.vertices.push(current);
            continue;
        }
        if (type === "SEQEND") {
            polyline = undefined;
            continue;
        }
        polyline = type === "POLYLINE" ? current : undefined;
        records.push(current);
    }
    return records;
};

export const numberIn = (group: DxfGroup): number => {
    const text = group.value.trim();
    const value = Number(text);
    if (text === "" || !Number.isFinite(value)) {
        throw new InputError(`\`dxf\` is damaged: line ${group.line + 1} should hold a number for group code ${group.code} and holds "${text.slice(0, QUOTED_LENGTH)}".`, "dxf");
    }
    return value;
};

export const valueOf = (record: DxfEntityRecord, code: number): string | undefined => record.groups.find(group => group.code === code)?.value;

export const textOf = (record: DxfEntityRecord, code: number, fallback = ""): string => valueOf(record, code)?.trim() ?? fallback;

export const numberOf = (record: DxfEntityRecord, code: number, fallback: number): number => {
    const group = record.groups.find(candidate => candidate.code === code);
    if (group === undefined) {
        return fallback;
    }
    return numberIn(group);
};

export const numbersOf = (record: DxfEntityRecord, code: number): number[] =>
    record.groups.filter(group => group.code === code).map(numberIn);

export const decodedText = (value: string): string =>
    value.replace(/\\U\+([0-9A-Fa-f]{4})/g, (_match, hex: string) => String.fromCharCode(parseInt(hex, DXF_HEX_RADIX)));
