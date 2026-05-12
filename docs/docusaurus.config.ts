import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import type * as OpenApiPlugin from "docusaurus-plugin-openapi-docs";
import packageJson from "./package.json";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    customFields: {
        bitbybitVersion: packageJson.version,
    },
    title: "Bitbybit",
    tagline: "Learn How To Use The Platform",
    favicon: "img/logo-gold-small.png",
    markdown: { mermaid: true },

    headTags: [
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
                    editUrl:
                        "https://github.com/bitbybit-dev/bitbybit/docs",
                },
                blog: {
                    showReadingTime: true,
                    feedOptions: {
                        type: ["rss", "atom"],
                        xslt: true,
                    },
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl:
                        "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
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
                { to: "/learn/code/intro", label: "Code", position: "left" },
                { to: "/learn/3d-bits/intro", label: "3D Bits", position: "left" },
                { to: "/learn/getting-started/engines/threejs", label: "ThreeJS", position: "left" },
                { to: "/learn/getting-started/engines/babylonjs", label: "BabylonJS", position: "left" },
                { to: "/learn/getting-started/engines/playcanvas", label: "PlayCanvas", position: "left" },
                { to: "/blog", label: "Blog", position: "left" },
                { to: "/api/cloud-api", label: "API", position: "left" },
                { to: "https://bitbybit.dev", label: "Home", position: "left" },
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
                    href: "https://github.com/bitbybit-dev/bitbybit",
                    label: "GitHub",
                    position: "right",
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
                            label: "Code",
                            to: "/learn/code/intro",
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
                            href: "https://github.com/facebook/docusaurus",
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} Bit by bit developers`,
        },
        prism: {
            theme: prismThemes.github,
            darkTheme: prismThemes.dracula,
        },
    } as Preset.ThemeConfig,
};

export default config;
