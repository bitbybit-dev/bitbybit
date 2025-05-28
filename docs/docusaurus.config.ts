import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
    title: "Bitbybit",
    tagline: "Learn How To Use The Platform",
    favicon: "img/logo-gold-small.png",

    // Set the production url of your site here
    url: "https://learn.bitbybit.dev",
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often '/<projectName>/'
    baseUrl: "/",

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
            } as Preset.Options,
        ],
    ],
    themeConfig: {
        // Replace with your project's social card
        image: "img/docusaurus-social-card.jpg",
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

                { to: "/blog", label: "Blog", position: "left" },
                {
                    href: "https://bitbybit.dev/auth/pick-plan",
                    label: "Support the Mission",
                    position: "right", // Or 'left' if you prefer
                    className: "navbar__button--support", // Custom class for styling
                    "aria-label": "Support the Project Mission", // For accessibility
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
