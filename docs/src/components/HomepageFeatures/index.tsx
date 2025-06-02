import React, { type ReactNode } from "react";
import clsx from "clsx";
import Link from '@docusaurus/Link';
import styles from "./styles.module.css";

type FeatureItem = {
    title: string;
    link: string;
    description: ReactNode;
};

const FeatureList: FeatureItem[] = [
    {
        title: "Getting Started Tutorials",
        link: "/learn/getting-started/overview",
        description: (
            <>
                Dive into our step-by-step tutorials to quickly learn the fundamentals
                and get your 3D projects up and running with Bitbybit.dev.
            </>
        ),
    },
    {
        title: "3D Bits app for Shopify",
        link: "/learn/3d-bits/intro",
        description: (
            <>
                Discover how our "3D Bits" Shopify app can help you integrate stunning
                3D models and AR experiences directly into your e-commerce store.
            </>
        ),
    },
    {
        title: "Our Blog",
        link: "/blog",
        description: (
            <>
                Stay updated with the latest news, feature releases, tutorials, and
                community showcases from the Bitbybit.dev team and users.
            </>
        ),
    },
    {
        title: "Bitbybit GitHub",
        link: "/learn/github/",
        description: (
            <>
                This page serves as a guide to understanding Bitbybit GitHub monorepo, its contents, and how it all fits together to power the Bitbybit platform.
            </>
        ),
    }, {
        title: "Integrate with Three.JS, Babylon.JS and more",
        link: "/learn/npm-packages/intro",
        description: (
            <>
                Integrating with ThreeJS, BabylonJS or other web technologies? Our npm packages provide seamless integration with popular 3D libraries, enabling you to create rich, interactive 3D experiences on the web.
            </>
        ),
    }, {
        title: "Run Visual Scripts On Your Website",
        link: "/learn/runners/intro",
        description: (
            <>
                Use our runners to execute visual scripts on your website. This allows you to create dynamic, interactive 3D experiences without needing extensive coding knowledge.
            </>
        ),
    },
];

function Feature({ title, description, link }: FeatureItem) {
    return (
        <div className={clsx("col col--4", styles.feature)}>
            <div className={clsx("text--center padding-horiz--md", styles.featureContent)}>
                <Link to={link} className={styles.featureLinkWrapper}>
                    <h3 className={styles.featureTitle}>{title}</h3>
                </Link>
                <p className={styles.featureDescription}>{description}</p>
                <Link
                    className={clsx("button button--secondary button--sm", styles.featureButton)}
                    to={link}>
                    Learn More
                </Link>
            </div>
        </div>
    );
}

export default function HomepageFeatures(): ReactNode {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    <div className="col">
                        <div className={`${styles.centerText} ${styles.discord}` }>
                            <a  href="https://discord.gg/GSe3VMe" title="Discord" target="_blank">
                                <img alt="Discord social network" width="40" src="https://bitbybit.dev/assets/social/logo-discord.svg" />
                                <span className={styles.discordText}>JOIN US ON DISCORD!</span>
                            </a>
                        </div>

                    </div>
                </div>
                <div className="row">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}