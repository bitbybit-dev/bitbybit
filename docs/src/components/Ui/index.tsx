import React, { type ReactNode } from "react";
import styles from "./styles.module.css";

/**
 * A label the reader finds on screen: a menu, a button, a tab or a panel, spelled exactly as the app shows it.
 *
 * Usage in MDX files: <Ui>Help</Ui> > <Ui>Tutorials</Ui>
 */
export default function Ui({ children }: { children: ReactNode }): ReactNode {
    return <span className={styles.ui}>{children}</span>;
}
