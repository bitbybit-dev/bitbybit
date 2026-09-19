/**
 * The API index: one record per member of the Bitbybit API, published for every release at
 * `https://git-cdn.bitbybit.dev/v<version>/ai-context/index.json`. Every tool in this package
 * answers from that document and never from memory, so an answer is exact for the version the
 * caller has installed. These types mirror the document's shape.
 */

/** Where a member lives: on npm under the MIT licence, only at bitbybit.dev, or only on CAD Cloud. */
export type Tier = "oss" | "platform-pro" | "cloud-pro";

/** What kind of thing a record describes. */
export type MemberKind = "method" | "property" | "namespace" | "cloud-operation";

/** The rendering engines the API is published for. */
export type Engine = "babylonjs" | "threejs" | "playcanvas";

/** One property of a parameter object, with the constraints its documentation declares. */
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

/** One parameter of a method; `fields` is present when the parameter is a documented object. */
export interface IndexParam {
    name: string;
    type: string;
    optional: boolean;
    fields?: IndexField[];
}

/** One member of the API, addressed by its dotted path such as `occt.shapes.solid.createBox`. */
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
}

/** An enumeration the API's parameters use, by its qualified name. */
export interface IndexEnum {
    name: string;
    summary: string;
    values: { key: string; value: string }[];
}

/** An example snippet, keyed by `<path>#<n>` in the index's `examples` map. */
export interface IndexExample {
    path: string;
    code: string;
}

/** The whole document. */
export interface ApiIndex {
    version: string;
    engines: Engine[];
    bundleSha256: Partial<Record<Engine, string>>;
    namespaces: string[];
    members: IndexMember[];
    enums: Record<string, IndexEnum>;
    examples: Record<string, IndexExample>;
}
