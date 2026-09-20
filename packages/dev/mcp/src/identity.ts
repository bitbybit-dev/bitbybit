export interface ServerIcon {
    src: string;
    mimeType?: "image/png" | "image/jpeg" | "image/svg+xml" | "image/webp";
    sizes?: string[];
    theme?: "light" | "dark";
}

export interface ServerBranding {
    title?: string;
    websiteUrl?: string;
    icons?: ServerIcon[];
}

export const SERVER_IDENTITY: Required<ServerBranding> = {
    title: "Bitbybit CAD MCP",
    websiteUrl: "https://learn.bitbybit.dev/learn/using-ai-with-bitbybit/mcp/bitbybit-mcp",
    icons: [{ src: "https://learn.bitbybit.dev/img/favicon-192x192.png", mimeType: "image/png", sizes: ["192x192"] }],
};
