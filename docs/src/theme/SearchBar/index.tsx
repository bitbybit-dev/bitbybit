import React, { useCallback, useEffect, useState, type ReactNode } from "react";
import SearchDialog from "@site/src/components/Search/SearchDialog";
import styles from "@site/src/components/Search/styles.module.css";

function typingInto(target: EventTarget | null): boolean {
    return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

/**
 * The navbar's search button. It opens the search dialog, as do Ctrl+K (Cmd+K on a Mac) anywhere and / when
 * no field has the focus.
 */
export default function SearchBar(): ReactNode {
    const [open, setOpen] = useState(false);
    const [shortcut, setShortcut] = useState("Ctrl K");
    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (/Mac|iPhone|iPad/.test(navigator.platform)) {
            setShortcut("⌘ K");
        }
        const onKeyDown = (event: KeyboardEvent): void => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setOpen((isOpen) => !isOpen);
            } else if (event.key === "/" && !typingInto(event.target)) {
                event.preventDefault();
                setOpen(true);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    return (
        <>
            <button type="button" className={styles.trigger} onClick={() => setOpen(true)} aria-label="Search the docs" aria-keyshortcuts="Control+K Meta+K /">
                <svg className={styles.triggerIcon} viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 3a7.5 7.5 0 0 1 5.96 12.06l4.24 4.24-1.4 1.4-4.24-4.24A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" /></svg>
                <span className={styles.triggerLabel}>Search</span>
                <kbd className={styles.triggerKeys}>{shortcut}</kbd>
            </button>
            {open && <SearchDialog onClose={close} />}
        </>
    );
}
