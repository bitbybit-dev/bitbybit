import React from "react";
import Link from "@docusaurus/Link";
import map from "@site/src/data/platform-map.json";
import styles from "./styles.module.css";

interface MapItem {
    readonly name: string;
    readonly detail: string;
    readonly href: string;
    readonly plan?: string;
    readonly packages?: readonly string[];
}

interface MapLayer {
    readonly title: string;
    readonly items: readonly MapItem[];
}

/**
 * The platform as layers, from where you work down to the kernels that compute, each part linking to its page and
 * naming the npm packages it ships as. The layers live in src/data/platform-map.json, which names only packages this
 * repository publishes.
 *
 * Usage in MDX files: <PlatformMap />
 */
export default function PlatformMap(): React.JSX.Element {
    const layers = (map as { readonly layers: readonly MapLayer[] }).layers;
    return (
        <figure className={styles.map} aria-label="The Bitbybit platform, from where you work down to the kernels">
            {layers.map((layer) => (
                <section key={layer.title} className={styles.layer}>
                    <h3 className={styles.title}>{layer.title}</h3>
                    <ul className={styles.items}>
                        {layer.items.map((item) => (
                            <li key={item.name} className={styles.item}>
                                <Link to={item.href} className={styles.link}>
                                    <span className={styles.name}>
                                        {item.name}
                                        {item.plan === undefined ? null : <span className={styles.plan}>{item.plan}</span>}
                                    </span>
                                    <span className={styles.detail}>{item.detail}</span>
                                    {item.packages === undefined ? null : (
                                        <span className={styles.packages}>
                                            {item.packages.map((name) => <code key={name}>{name}</code>)}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </figure>
    );
}
