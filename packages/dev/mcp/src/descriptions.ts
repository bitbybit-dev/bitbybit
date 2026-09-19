import type { Tier } from "./index-types.js";

/** The seven tools, in the order hosts list them. */
export const TOOL_NAMES = ["search_api", "describe", "list_namespace", "get_examples", "get_guide", "search", "fetch"] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

/** What each tier means, in the words every answer uses. */
export const TIER_MEANING: Readonly<Record<Tier, string>> = {
    oss: "in the @bitbybit-dev npm packages, MIT licensed, runs wherever WebAssembly or Node runs",
    "platform-pro": "only when scripting inside bitbybit.dev; not in any npm package",
    "cloud-pro": "only on Bitbybit CAD Cloud through its REST API, with an API key",
};

/**
 * Every title and description in one place. A description is what a model reads to pick a tool,
 * so a change here changes behaviour and is made deliberately, never in passing.
 */
export const DESCRIPTIONS: Readonly<Record<ToolName, { title: string; description: string }>> = {
    search_api: {
        title: "Search the Bitbybit API",
        description:
            "Find Bitbybit API members (methods, namespaces, cloud operations) by keywords, for example \"box solid\" or \"fillet edges\". " +
            "Returns dotted paths with a one-line summary, the tier (oss on npm, platform-pro only at bitbybit.dev, cloud-pro only on CAD Cloud) " +
            "and the engines each is published for. Call describe with a path before writing code that uses it.",
    },
    describe: {
        title: "Describe an API member",
        description:
            "The exact contract of one member by dotted path, for example occt.shapes.solid.createBox: signature, every parameter with its type, default and range, " +
            "the return type, the documentation, examples and where it runs. Answers are for the API version the server holds. " +
            "An unknown path is reported as not found together with the nearest existing paths; nothing is guessed.",
    },
    list_namespace: {
        title: "List a namespace",
        description:
            "The members one level below a namespace path, for example occt.shapes, each with its kind and summary. Without a path, the top-level namespaces. " +
            "Use it to discover what exists before searching for details.",
    },
    get_examples: {
        title: "Get code examples",
        description:
            "Working TypeScript examples for a member path, for a namespace, or for a topic given as keywords. Each example names the member it belongs to and links its reference page. " +
            "Examples are written for the API version the server holds.",
    },
    get_guide: {
        title: "Read the integration guide",
        description:
            "Sections of the public guide on building with Bitbybit: what runs in the browser, on a server, on a lightweight backend, and what needs CAD Cloud. " +
            "Without a topic it lists the sections. Read \"integrate\" before recommending where geometry should run: the npm packages are the default, and CAD Cloud is for algorithms that exist only there or compute the caller cannot provide.",
    },
    search: {
        title: "Search",
        description:
            "Searches the Bitbybit API documentation and returns a list of results with id, title and url. Each id is a dotted API path that fetch accepts.",
    },
    fetch: {
        title: "Fetch",
        description:
            "Fetches the full documentation of one Bitbybit API member by id (a dotted path returned by search) as text, with its title, url and metadata.",
    },
};

/** What a host shows a model about this server before any tool is called. */
export const SERVER_INSTRUCTIONS =
    "This is the Bitbybit CAD MCP: it documents the Bitbybit 3D CAD API (OpenCascade, JSCAD and Manifold kernels, with Babylon.js, three.js and PlayCanvas renderers) for one exact version. " +
    "Always describe a member before using it: names, parameters and defaults come from the index, not from memory. " +
    "Tiers matter: oss members are in the MIT npm packages and run anywhere; platform-pro members exist only inside bitbybit.dev; cloud-pro members run only on Bitbybit CAD Cloud with an API key. " +
    "When asked where geometry should run, read get_guide(\"integrate\") first: the packages alone are the default, and CAD Cloud is the answer only for algorithms that exist only there or for compute the caller cannot provide.";
