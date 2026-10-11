import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import type * as OpenApiPlugin from "docusaurus-plugin-openapi-docs";
import packageJson from "./package.json";
import { existsSync, mkdirSync, readFileSync } from "fs";
import shotPlaceholders from "./src/remark/shot-placeholders";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// Written by scripts/build-id.js before every build and start; the footer shows it and the site
// serves it at /build-id.json, so the two can never disagree. A config loaded without it (an IDE,
// a bare docusaurus command) shows "dev".
function readBuildId(): string {
    try {
        const parsed = JSON.parse(readFileSync("./static/build-id.json", "utf8")) as { buildId?: unknown };
        return typeof parsed.buildId === "string" && parsed.buildId.length > 0 ? parsed.buildId : "dev";
    } catch {
        return "dev";
    }
}
const buildId = readBuildId();

// Screenshots not published yet, shown on a local start only: LEARN_MEDIA_LOCAL=1 reads the unpublished
// images in .learn-media-local/ (gitignored), serves their files, and lets <Shot>
// and the pages' shot placeholders show them. A build refuses it, so no candidate is ever deployed.
interface LocalMedia {
    id: string;
    url: string;
    width: number;
    height: number;
    alt: string;
    kind: string;
    bytes: number;
}
function readLocalMedia(): LocalMedia[] {
    if (process.env.LEARN_MEDIA_LOCAL !== "1") {
        return [];
    }
    if (process.argv.includes("build")) {
        throw new Error("LEARN_MEDIA_LOCAL is for a local start only: a build shows published media alone");
    }
    try {
        return JSON.parse(readFileSync("./.learn-media-local/manifest.json", "utf8")) as LocalMedia[];
    } catch {
        throw new Error("LEARN_MEDIA_LOCAL is set, but .learn-media-local/manifest.json is missing: copy the candidates in first");
    }
}
const localMedia = readLocalMedia();

// The editor the learn pages embed their Rete, Blockly and TypeScript scripts in is the published one. On a local
// start, an editor named by LEARN_EDITOR_URL, or by the gitignored file .learn-editor-url, is tried first: each
// embed uses it when it answers and falls back to the published editor when it does not. A build reads neither.
const editorUrl = "https://s.bitbybit.dev";
function readLocalEditorUrl(): string | null {
    if (process.argv.includes("build")) {
        return null;
    }
    const configured = process.env.LEARN_EDITOR_URL ?? (existsSync("./.learn-editor-url") ? readFileSync("./.learn-editor-url", "utf8") : "");
    return configured.trim() === "" ? null : new URL(configured.trim()).toString();
}
const localEditorUrl = readLocalEditorUrl();

// Search reads a Pagefind index that only a build makes (build/pagefind). A local start serves the last build's copy
// from .search-index/ (gitignored, kept by npm run index-search), so search works on npm start too and picks up the
// next build without a restart; a build serves its own index.
const localSearchIndex = process.argv.includes("build") ? [] : [".search-index"];
if (localSearchIndex.length > 0) {
    mkdirSync("./.search-index", { recursive: true });
}

// The local candidates fill the shot placeholders of the learn pages and of the blog alike.
const localMediaPlugins = localMedia.length > 0 ? [[shotPlaceholders, { entries: localMedia.map((entry) => ({ id: entry.id, kind: entry.kind })) }]] : [];

const config: Config = {
    customFields: {
        bitbybitVersion: packageJson.version,
        buildId,
        learnMediaLocal: localMedia,
        editorUrl,
        localEditorUrl,
    },
    staticDirectories: [...(localMedia.length > 0 ? ["static", ".learn-media-local/static"] : ["static"]), ...localSearchIndex],
    title: "Bitbybit",
    tagline: "Learn How To Use The Platform",
    favicon: "img/favicon-96x96.png",
    markdown: { mermaid: true },

    headTags: [
        // Favicons sized as multiples of 48px so Google can index them for search results.
        // No .ico is declared, and static/favicon.ico is deliberately absent: Cloudflare Pages
        // serves .ico files with "Content-Type: null", and with nosniff set that cannot be
        // decoded as an image. Google probes /favicon.ico regardless of what is declared here,
        // and a 200 it cannot decode is worse than a clean 404 - the 404 makes it fall through
        // to the PNGs below. Do not restore the file.
        {
            tagName: "link",
            attributes: {
                rel: "icon",
                type: "image/png",
                href: "/img/favicon-96x96.png",
                sizes: "96x96",
            },
        },
        {
            tagName: "link",
            attributes: {
                rel: "icon",
                type: "image/png",
                href: "/img/favicon-192x192.png",
                sizes: "192x192",
            },
        },
        {
            tagName: "link",
            attributes: {
                rel: "apple-touch-icon",
                href: "/img/favicon-192x192.png",
            },
        },
        {
            tagName: "script",
            attributes: { type: "application/ld+json" },
            innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                    {
                        "@type": "Organization",
                        "@id": "https://bitbybit.dev/#organization",
                        "name": "Bit by bit developers",
                        "url": "https://bitbybit.dev",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://bitbybit.dev/logo-gold-small.png"
                        },
                        "sameAs": [
                            "https://github.com/bitbybit-dev/bitbybit",
                            "https://discord.gg/GSe3VMe",
                            "https://www.youtube.com/@bitbybitdev",
                            "https://www.linkedin.com/company/bitbybit-dev",
                            "https://x.com/bitbybit_dev",
                            "https://www.instagram.com/bitbybit.dev/"
                        ]
                    },
                    {
                        "@type": "WebSite",
                        "@id": "https://learn.bitbybit.dev/#website",
                        "url": "https://learn.bitbybit.dev",
                        "name": "Bitbybit Learning Center",
                        "description": "Tutorials, guides, and blog posts for learning 3D CAD programming with bitbybit.dev – visual programming, TypeScript, OpenCascade, BabylonJS, Three.js, and PlayCanvas.",
                        "publisher": { "@id": "https://bitbybit.dev/#organization" },
                        "isPartOf": { "@id": "https://bitbybit.dev/#website" }
                    },
                    {
                        "@type": "Course",
                        "@id": "https://learn.bitbybit.dev/#course",
                        "name": "Learn Bitbybit 3D CAD Programming",
                        "url": "https://learn.bitbybit.dev/learn/intro",
                        "description": "Free learning resources for browser-based 3D CAD development. Covers getting started, visual programming with Rete nodes, block-based coding with Blockly, TypeScript API usage, and integration with BabylonJS, Three.js, and PlayCanvas.",
                        "provider": { "@id": "https://bitbybit.dev/#organization" },
                        "educationalLevel": "Beginner to Advanced",
                        "inLanguage": "en",
                        "isAccessibleForFree": true,
                        "hasCourseInstance": {
                            "@type": "CourseInstance",
                            "courseMode": "online",
                            "courseWorkload": "Self-paced"
                        }
                    },
                    {
                        "@type": "Blog",
                        "@id": "https://learn.bitbybit.dev/#blog",
                        "name": "Bitbybit Blog",
                        "url": "https://learn.bitbybit.dev/blog",
                        "description": "News, tutorials, and updates from the bitbybit.dev 3D CAD platform.",
                        "publisher": { "@id": "https://bitbybit.dev/#organization" },
                        "isPartOf": { "@id": "https://learn.bitbybit.dev/#website" },
                        "inLanguage": "en"
                    }
                ]
            })
        }
    ],

    // Set the production url of your site here
    url: "https://learn.bitbybit.dev",
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: "/",
    trailingSlash: false,
    
    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: "Bit by bit developers", // Usually your GitHub org/user name.
    projectName: "bitbybit", // Usually your repo name.

    onBrokenLinks: "throw",
    onBrokenMarkdownLinks: "warn",

    // Even if you don't use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: "en",
        locales: ["en"],
    },
    presets: [
        [
            "classic",
            {
                docs: {
                    path: "learn",
                    routeBasePath: "learn",
                    sidebarPath: "./sidebars.ts",
                    onInlineTags: "throw",
                    editUrl:
                        "https://github.com/bitbybit-dev/bitbybit/tree/master/docs/",
                    remarkPlugins: localMediaPlugins,
                },
                blog: {
                    remarkPlugins: localMediaPlugins,
                    blogTitle: "Bitbybit Blog",
                    blogDescription: "Release notes, tutorials and product news from the bitbybit.dev 3D CAD platform - visual programming, OpenCascade geometry, Shopify 3D configurators and the open-source packages behind them.",
                    showReadingTime: true,
                    feedOptions: {
                        type: ["rss", "atom"],
                        xslt: true,
                    },
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl:
                        "https://github.com/bitbybit-dev/bitbybit/tree/master/docs/",
                    // Useful options to enforce blogging best practices
                    onInlineTags: "warn",
                    onInlineAuthors: "warn",
                    onUntruncatedBlogPosts: "warn",
                },
                theme: {
                    customCss: "./src/css/custom.css",
                },
                sitemap: {
                    lastmod: "date",
                    changefreq: null,
                    priority: null,
                    ignorePatterns: [
                        "/learn/tags", "/learn/tags/**",
                        "/blog/tags", "/blog/tags/**",
                        "/api/tags", "/api/tags/**",
                        "/blog/page/**",
                        "/blog/authors", "/blog/authors/**",
                    ],
                },
            } as Preset.Options,
        ],
    ],
    plugins: [
        "docusaurus-plugin-sass",
        function polyfillPlugin() {
            return {
                name: "node-polyfills",
                configureWebpack() {
                    return {
                        resolve: {
                            fallback: {
                                path: require.resolve("path-browserify"),
                            },
                        },
                    };
                },
            };
        },
        [
            "docusaurus-plugin-openapi-docs",
            {
                id: "openapi",
                docsPluginId: "api",
                config: {
                    "openapi-docs": {
                        specPath: "static/openapi.json",
                        outputDir: "api/openapi-docs",
                        hideSendButton: true,
                    } as OpenApiPlugin.Options,
                },
            },
        ],
        [
            "@docusaurus/plugin-content-docs",
            {
                id: "api",
                path: "api",
                routeBasePath: "api",
                sidebarPath: "./sidebarsApi.ts",
                docItemComponent: "@theme/ApiItem",
            },
        ],
    ],
    themes: ["docusaurus-theme-openapi-docs", "@docusaurus/theme-mermaid"],
    themeConfig: {
        // Replace with your project's social card
        image: "img/learn-bitbybit-social-card.jpeg",
        mermaid: {
            theme: { light: "base", dark: "base" },
            options: {
                themeVariables: {
                    primaryColor: "#f0cebb",
                    primaryTextColor: "#1a1c1f",
                    primaryBorderColor: "#dc966e",
                    secondaryColor: "#f7e2d4",
                    secondaryTextColor: "#1a1c1f",
                    secondaryBorderColor: "#dc966e",
                    tertiaryColor: "#fdf3ec",
                    tertiaryTextColor: "#1a1c1f",
                    tertiaryBorderColor: "#dc966e",
                    lineColor: "#dc966e",
                    // Sequence diagrams take their arrow colour from textColor, which is the dark
                    // shape text above; on the page background that is invisible, so the arrows
                    // follow the line colour like every other connector.
                    signalColor: "#dc966e",
                    clusterBkg: "transparent",
                    clusterBorder: "#dc966e",
                    edgeLabelBackground: "#f0cebb",
                    fontFamily: "var(--ifm-font-family-base)",
                },
            },
        },
        colorMode: {
            defaultMode: "dark",
            disableSwitch: false,
            respectPrefersColorScheme: false,
        },
        navbar: {
            title: "Bitbybit",
            logo: {
                alt: "Bitbybit Logo",
                src: "img/logo-gold-small.png",
            },
            items: [
                {
                    type: "docSidebar",
                    sidebarId: "tutorialSidebar",
                    position: "left",
                    label: "Learn",
                },
                { to: "/learn/getting-started/overview", label: "Getting Started", position: "left" },
                { to: "/learn/designer/intro", label: "Designer", position: "left" },
                { to: "/learn/code/intro", label: "Code", position: "left" },
                { to: "/learn/3d-bits/intro", label: "3D Bits", position: "left" },
                { to: "/learn/using-ai-with-bitbybit/intro", label: "AI", position: "left" },
                {
                    type: "dropdown",
                    label: "Engines",
                    position: "left",
                    items: [
                        { to: "/learn/getting-started/engines/babylonjs", label: "BabylonJS" },
                        { to: "/learn/getting-started/engines/threejs", label: "ThreeJS" },
                        { to: "/learn/getting-started/engines/playcanvas", label: "PlayCanvas" },
                    ],
                },
                { to: "/blog", label: "Blog", position: "left", className: "navbar-hide-medium" },
                { to: "/api/cloud-api", label: "API", position: "left", className: "navbar-hide-medium" },
                { to: "https://bitbybit.dev", label: "Home", position: "left", className: "navbar-hide-medium" },
                { type: "search", position: "right" },
                {
                    href: "https://bitbybit.dev/auth/pick-plan",
                    label: "Support the Mission",
                    position: "right", // Or 'left' if you prefer
                    className: "navbar__button--support", // Custom class for styling
                    "aria-label": "Support the Project Mission", // For accessibility
                },
                {
                    href: "https://bitbybit.dev/auth/sign-up",
                    label: "Sign Up",
                    position: "right",
                    className: "navbar__button--support",
                    "aria-label": "Sign Up to Bitbybit.dev",
                },
                {
                    href: "https://docs.bitbybit.dev",
                    label: "API Reference",
                    position: "right",
                    className: "navbar-hide-narrow",
                    "aria-label": "TypeScript API Reference",
                },
                {
                    href: "https://github.com/bitbybit-dev/bitbybit",
                    label: "GitHub",
                    position: "right",
                    className: "navbar-hide-narrow",
                },
            ],
        },
        footer: {
            links: [
                {
                    title: "Main",
                    items: [
                        {
                            label: "Learn",
                            to: "/learn/intro",
                        },
                        {
                            label: "Getting Started",
                            to: "/learn/getting-started/overview",
                        },
                        {
                            label: "Designer",
                            to: "/learn/designer/intro",
                        },
                        {
                            label: "Code",
                            to: "/learn/code/intro",
                        },
                        {
                            label: "TypeScript API Reference",
                            href: "https://docs.bitbybit.dev",
                        },
                        {
                            label: "CAD Cloud API",
                            to: "/api/cloud-api",
                        },
                        {
                            label: "bitbybit.dev",
                            href: "https://bitbybit.dev",
                        },
                    ],
                },
                {
                    title: "Community",
                    items: [
                        {
                            label: "Discord",
                            href: "https://discord.gg/GSe3VMe",
                        },
                        {
                            label: "LinkedIn",
                            href: "https://www.linkedin.com/company/bitbybit-dev",
                        },
                        {
                            label: "X",
                            href: "https://x.com/bitbybit_dev",
                        },
                        {
                            label: "YouTube",
                            href: "https://www.youtube.com/@bitbybitdev",
                        },
                        {
                            label: "Facebook",
                            href: "https://www.facebook.com/bitbybitdev",
                        },
                        {
                            label: "Instagram",
                            href: "https://www.instagram.com/bitbybit.dev",
                        },
                        {
                            label: "Pinterest",
                            href: "https://www.pinterest.com/bitbybit_dev/",
                        }
                    ],
                },
                {
                    title: "More",
                    items: [
                        {
                            label: "Blog",
                            to: "/blog",
                        },
                        {
                            label: "GitHub",
                            href: "https://github.com/bitbybit-dev/bitbybit",
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} Bit by bit developers <span class="bb-build" title="Version ${packageJson.version}, build ${buildId}">v${packageJson.version} · ${buildId}</span>`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    } as Preset.ThemeConfig,
};

export default config;
