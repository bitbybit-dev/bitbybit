import { DEFAULT_IMPLEMENTATION_LEVEL, HEADER_ENTITIES_READ } from "./constants";
import type { IfcFileHeader, IfcValue, StepHeaderEntity } from "./step-types";
import { encodeString } from "./strings";

const READ: ReadonlySet<string> = new Set(HEADER_ENTITIES_READ);

function texts(value: IfcValue | undefined): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function text(value: IfcValue | undefined): string {
    return typeof value === "string" ? value : "";
}

export function headerFromEntities(entities: readonly StepHeaderEntity[]): IfcFileHeader {
    const find = (type: string): readonly IfcValue[] => entities.find((entity) => entity.type === type)?.args ?? [];
    const description = find("FILE_DESCRIPTION");
    const name = find("FILE_NAME");
    const schema = find("FILE_SCHEMA");
    return {
        description: texts(description[0]),
        implementationLevel: text(description[1]) || DEFAULT_IMPLEMENTATION_LEVEL,
        name: text(name[0]),
        timeStamp: text(name[1]),
        author: texts(name[2]),
        organization: texts(name[3]),
        preprocessorVersion: text(name[4]),
        originatingSystem: text(name[5]),
        authorization: text(name[6]),
        schemaIdentifiers: texts(schema[0]),
    };
}

export function otherHeaderEntities(entities: readonly StepHeaderEntity[]): string[] {
    return entities.filter((entity) => !READ.has(entity.type)).map((entity) => entity.text);
}

function list(values: readonly string[]): string {
    return `(${(values.length ? values : [""]).map(encodeString).join(",")})`;
}

export function encodeHeader(header: IfcFileHeader, others: readonly string[] = []): string {
    return [
        "ISO-10303-21;",
        "HEADER;",
        `FILE_DESCRIPTION(${list(header.description)},${encodeString(header.implementationLevel)});`,
        `FILE_NAME(${[
            encodeString(header.name),
            encodeString(header.timeStamp),
            list(header.author),
            list(header.organization),
            encodeString(header.preprocessorVersion),
            encodeString(header.originatingSystem),
            encodeString(header.authorization),
        ].join(",")});`,
        `FILE_SCHEMA(${list(header.schemaIdentifiers)});`,
        ...others,
        "ENDSEC;",
    ].join("\n");
}
