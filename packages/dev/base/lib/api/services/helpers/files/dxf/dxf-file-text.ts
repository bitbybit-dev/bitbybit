import { InputError } from "../../../../kernel-calls";
import { bytesOfData } from "../file-bytes";

const FIRST_UTF8_VERSION = 1021;

const UNNAMED_CODE_PAGE = "windows-1252";

const CODE_PAGE_ENCODINGS: ReadonlyMap<string, string> = new Map([
    ["ANSI_874", "windows-874"],
    ["ANSI_932", "shift_jis"],
    ["ANSI_936", "gbk"],
    ["ANSI_949", "euc-kr"],
    ["ANSI_950", "big5"],
    ["ANSI_1250", "windows-1250"],
    ["ANSI_1251", "windows-1251"],
    ["ANSI_1252", "windows-1252"],
    ["ANSI_1253", "windows-1253"],
    ["ANSI_1254", "windows-1254"],
    ["ANSI_1255", "windows-1255"],
    ["ANSI_1256", "windows-1256"],
    ["ANSI_1257", "windows-1257"],
    ["ANSI_1258", "windows-1258"],
]);

const VERSION_IN_HEADER = /(?:^|[\r\n])[ \t]*9[ \t]*(?:\r\n|\r|\n)[ \t]*\$ACADVER[ \t]*(?:\r\n|\r|\n)[ \t]*1[ \t]*(?:\r\n|\r|\n)[ \t]*AC(\d+)/;

const CODE_PAGE_IN_HEADER = /(?:^|[\r\n])[ \t]*9[ \t]*(?:\r\n|\r|\n)[ \t]*\$DWGCODEPAGE[ \t]*(?:\r\n|\r|\n)[ \t]*3[ \t]*(?:\r\n|\r|\n)[ \t]*(\S+)/;

const strictUtf8 = (bytes: Uint8Array): string | undefined => {
    try {
        return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
        return undefined;
    }
};

export const dxfTextOf = (data: unknown, property: string): string => {
    if (typeof data === "string") {
        return data;
    }
    const bytes = bytesOfData(data);
    if (bytes === undefined) {
        throw new InputError(`\`${property}\` must be the text of a DXF file or its bytes; it is ${data === null ? "null" : typeof data}.`, property);
    }
    const utf8 = strictUtf8(bytes);
    if (utf8 !== undefined) {
        return utf8;
    }
    const unnamed = new TextDecoder(UNNAMED_CODE_PAGE).decode(bytes);
    if (Number(VERSION_IN_HEADER.exec(unnamed)?.[1] ?? 0) >= FIRST_UTF8_VERSION) {
        return new TextDecoder().decode(bytes);
    }
    const encoding = CODE_PAGE_ENCODINGS.get(CODE_PAGE_IN_HEADER.exec(unnamed)?.[1]?.toUpperCase() ?? "");
    return encoding === undefined ? unnamed : new TextDecoder(encoding).decode(bytes);
};
