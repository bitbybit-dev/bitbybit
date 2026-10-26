import type * as Inputs from "../../api/inputs";
import {
    IGES_DATA_COLUMNS, IGES_DEFAULT_PARAMETER_DELIMITER, IGES_DEFAULT_RECORD_DELIMITER, IGES_EXTENSIONS, IGES_GLOBAL_SECTION, IGES_HOLLERITH, IGES_NAMED_UNITS_FLAG,
    IGES_RECORD_LENGTH, IGES_UNIT_FLAGS, IGES_UNIT_FLAG_FIELD, IGES_UNIT_NAMES, IGES_UNIT_NAME_FIELD, STEP_CONVERSION_NAMES, STEP_CONVERSION_UNIT, STEP_EXTENSIONS,
    STEP_INSTANCE, STEP_LENGTH_UNIT, STEP_REFERENCE, STEP_SI_LENGTH, STEP_SI_PREFIXES, STEP_UNIT_CONTEXT, STEP_UNIT_WORD,
} from "./file-units.constants";

type UnitOfLength = Inputs.Base.unitOfLengthEnum;

export function stepOrIgesKindOf(fileName: string): "step" | "iges" | undefined {
    const extension = fileName.toLowerCase().split(".").pop() ?? "";
    if (STEP_EXTENSIONS.includes(extension)) {
        return "step";
    }
    return IGES_EXTENSIONS.includes(extension) ? "iges" : undefined;
}

function forEachStepStatement(text: string, visit: (statement: string) => void): void {
    let pieces: string[] = [];
    let start = 0;
    let at = 0;
    while (at < text.length) {
        const character = text[at];
        if (character === "'") {
            const end = text.indexOf("'", at + 1);
            at = end < 0 ? text.length : end + 1;
        } else if (character === "/" && text[at + 1] === "*") {
            pieces.push(text.slice(start, at));
            const end = text.indexOf("*/", at + 2);
            at = end < 0 ? text.length : end + 2;
            start = at;
        } else if (character === ";") {
            pieces.push(text.slice(start, at));
            visit(pieces.join(""));
            pieces = [];
            at++;
            start = at;
        } else {
            at++;
        }
    }
}

function stepUnitOf(body: string): UnitOfLength | undefined {
    const si = STEP_SI_LENGTH.exec(body);
    if (si !== null) {
        return STEP_SI_PREFIXES[(si[2] ?? si[1]!).toUpperCase()];
    }
    const converted = STEP_CONVERSION_UNIT.exec(body);
    return converted === null ? undefined : STEP_CONVERSION_NAMES[converted[1]!.trim().toUpperCase()];
}

export function stepLengthUnit(text: string): UnitOfLength | undefined {
    const instances = new Map<string, string>();
    forEachStepStatement(text, statement => {
        if (!STEP_UNIT_WORD.test(statement)) {
            return;
        }
        const instance = STEP_INSTANCE.exec(statement);
        if (instance !== null) {
            instances.set(instance[1]!, instance[2]!);
        }
    });
    const units = [...instances.values()].flatMap(body => {
        const context = STEP_UNIT_CONTEXT.exec(body);
        if (context === null) {
            return [];
        }
        const lengths = [...context[1]!.matchAll(STEP_REFERENCE)].map(reference => instances.get(reference[1]!) ?? "").filter(unit => STEP_LENGTH_UNIT.test(unit));
        return lengths.length === 1 ? [stepUnitOf(lengths[0]!)] : [undefined];
    });
    return units.length > 0 && units.every(unit => unit !== undefined && unit === units[0]) ? units[0] : undefined;
}

function igesRecords(text: string): string[] {
    const lines = text.split(/\r?\n/);
    if (lines.length === 1 && text.length > IGES_RECORD_LENGTH) {
        return Array.from({ length: Math.ceil(text.length / IGES_RECORD_LENGTH) }, (_, index) => text.slice(index * IGES_RECORD_LENGTH, (index + 1) * IGES_RECORD_LENGTH));
    }
    return lines;
}

function igesGlobalFields(global: string): string[] {
    const fields: string[] = [];
    let parameter = IGES_DEFAULT_PARAMETER_DELIMITER;
    let record = IGES_DEFAULT_RECORD_DELIMITER;
    let at = 0;
    while (at < global.length) {
        const hollerith = IGES_HOLLERITH.exec(global.slice(at));
        let value: string;
        if (hollerith !== null) {
            const start = at + hollerith[0].length;
            value = global.slice(start, start + Number(hollerith[1]));
            at = start + value.length;
            while (global[at] === " ") {
                at++;
            }
        } else {
            const next = [global.indexOf(parameter, at), global.indexOf(record, at)].filter(index => index >= 0);
            const end = next.length === 0 ? global.length : Math.min(...next);
            value = global.slice(at, end).trim();
            at = end;
        }
        fields.push(value);
        if (fields.length === 1 && value !== "") {
            parameter = value;
        } else if (fields.length === 2 && value !== "") {
            record = value;
        }
        if (global[at] === record) {
            break;
        }
        at++;
    }
    return fields;
}

export function igesLengthUnit(text: string): UnitOfLength | undefined {
    const global = igesRecords(text).filter(line => line[IGES_DATA_COLUMNS] === IGES_GLOBAL_SECTION).map(line => line.slice(0, IGES_DATA_COLUMNS)).join("");
    const fields = igesGlobalFields(global);
    const flag = fields[IGES_UNIT_FLAG_FIELD - 1]?.trim() ?? "";
    if (flag === IGES_NAMED_UNITS_FLAG) {
        return IGES_UNIT_NAMES[(fields[IGES_UNIT_NAME_FIELD - 1] ?? "").trim().toUpperCase()];
    }
    return IGES_UNIT_FLAGS[flag];
}
