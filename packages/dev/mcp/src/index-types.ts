
export type Tier = "oss" | "platform-pro" | "cloud-pro";

export type MemberKind = "method" | "property" | "namespace" | "cloud-operation";

export type Engine = "babylonjs" | "threejs" | "playcanvas";

export interface IndexField {
    name: string;
    type: string;
    optional: boolean;
    doc: string;
    default?: unknown;
    min?: number;
    max?: number;
    step?: number;
    options?: readonly { value: string; label: string }[];
}

export interface IndexParam {
    name: string;
    type: string;
    optional: boolean;
    fields?: IndexField[];
}

export interface IndexMember {
    path: string;
    kind: MemberKind;
    name: string;
    className: string | null;
    signature: string | null;
    async: boolean;
    params: IndexParam[];
    returns: string | null;
    summary: string;
    doc: string;
    docUrl: string | null;
    engines: Engine[];
    tier: Tier;
    onApi3d: boolean;
    weight: number | null;
    examples: string[];
    endpoint?: string;
    httpMethod?: string;
    scope?: string;
    group?: string;
    drawable?: boolean;
    deprecated?: string;
    engineSignatures?: Partial<Record<Engine, string | null>>;
    cloudSummary?: string;
    cloudParams?: IndexParam[];
}

export interface IndexEnum {
    name: string;
    summary: string;
    values: { key: string; value: string }[];
}

export interface IndexExample {
    path: string;
    code: string;
}

export interface ApiIndex {
    version: string;
    engines: Engine[];
    bundleSha256: Partial<Record<Engine, string>>;
    namespaces: string[];
    members: IndexMember[];
    enums: Record<string, IndexEnum>;
    examples: Record<string, IndexExample>;
}
