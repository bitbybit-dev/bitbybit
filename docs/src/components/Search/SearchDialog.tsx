import React, { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Link from "@docusaurus/Link";
import { useHistory } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { hitOf, loadPagefind } from "./pagefind";
import { excerptParts, SEARCH_SECTIONS } from "./sections";
import type { PagefindModule, PagefindResult, SearchHit } from "./search-types";
import styles from "./styles.module.css";

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 200;

type IndexState = "loading" | "ready" | "missing";

function Excerpt({ text }: { text: string }): ReactNode {
    return excerptParts(text).map((part, index) => part.marked ? <mark key={index}>{part.text}</mark> : <React.Fragment key={index}>{part.text}</React.Fragment>);
}

/**
 * The search dialog over the Pagefind index: a query, the sections to narrow it to with how many pages each holds,
 * and the matching pages with their excerpts and the headings that matched. Arrow keys move through the pages,
 * Enter opens one and Escape closes the dialog.
 */
export default function SearchDialog({ onClose }: { onClose: () => void }): ReactNode {
    const scriptUrl = useBaseUrl("/pagefind/pagefind.js");
    const history = useHistory();
    const input = useRef<HTMLInputElement>(null);
    const [pagefind, setPagefind] = useState<PagefindModule | null>(null);
    const [indexState, setIndexState] = useState<IndexState>("loading");
    const [sections, setSections] = useState<{ label: string; count: number }[]>([]);
    const [section, setSection] = useState<string | undefined>(undefined);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<PagefindResult[]>([]);
    const [hits, setHits] = useState<SearchHit[]>([]);
    const [active, setActive] = useState(0);

    useEffect(() => {
        input.current?.focus();
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        loadPagefind(scriptUrl).then(async (loaded) => {
            setPagefind(loaded);
            setIndexState(loaded === null ? "missing" : "ready");
            if (loaded !== null) {
                const counts = (await loaded.filters()).section ?? {};
                setSections(SEARCH_SECTIONS.filter((each) => counts[each.label] !== undefined).map((each) => ({ label: each.label, count: counts[each.label] ?? 0 })));
            }
        });
        return () => {
            document.body.style.overflow = overflow;
        };
    }, [scriptUrl]);

    useEffect(() => {
        if (pagefind === null || query.trim() === "") {
            setResults([]);
            setHits([]);
            return;
        }
        let current = true;
        pagefind.debouncedSearch(query, section === undefined ? {} : { filters: { section } }, DEBOUNCE_MS).then(async (search) => {
            if (search === null || !current) {
                return;
            }
            const first = await Promise.all(search.results.slice(0, PAGE_SIZE).map(hitOf));
            if (current) {
                setResults(search.results);
                setHits(first);
                setActive(0);
            }
        });
        return () => {
            current = false;
        };
    }, [pagefind, query, section]);

    const showMore = useCallback(async () => {
        const more = await Promise.all(results.slice(hits.length, hits.length + PAGE_SIZE).map(hitOf));
        setHits((shown) => [...shown, ...more]);
    }, [results, hits.length]);

    const narrow = (label: string | undefined): void => {
        setSection(label);
        input.current?.focus();
    };

    const open = useCallback((url: string) => {
        onClose();
        history.push(url);
    }, [history, onClose]);

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
        if (event.key === "Escape") {
            event.preventDefault();
            onClose();
        } else if (event.key === "ArrowDown" && hits.length > 0) {
            event.preventDefault();
            setActive((index) => Math.min(index + 1, hits.length - 1));
        } else if (event.key === "ArrowUp" && hits.length > 0) {
            event.preventDefault();
            setActive((index) => Math.max(index - 1, 0));
        } else if (event.key === "Enter" && hits[active] !== undefined && event.target === input.current) {
            event.preventDefault();
            open(hits[active].url);
        }
    };

    useEffect(() => {
        document.getElementById(`search-hit-${active}`)?.scrollIntoView({ block: "nearest" });
    }, [active]);

    const empty = query.trim() === "";
    return createPortal(
        <div className={styles.backdrop} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
            <div className={styles.dialog} role="dialog" aria-modal="true" aria-label="Search the docs" onKeyDown={onKeyDown}>
                <div className={styles.field}>
                    <svg className={styles.fieldIcon} viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 3a7.5 7.5 0 0 1 5.96 12.06l4.24 4.24-1.4 1.4-4.24-4.24A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" /></svg>
                    <input
                        ref={input}
                        className={styles.input}
                        type="search"
                        placeholder="Search the docs"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        role="combobox"
                        aria-expanded={hits.length > 0}
                        aria-controls="search-hits"
                        aria-activedescendant={hits.length > 0 ? `search-hit-${active}` : undefined}
                        autoComplete="off"
                        spellCheck={false}
                    />
                    <button type="button" className={styles.close} onClick={onClose} aria-label="Close search">Esc</button>
                </div>
                {sections.length > 0 && (
                    <div className={styles.sections} role="group" aria-label="Narrow to a section">
                        <button type="button" className={section === undefined ? styles.sectionOn : styles.section} aria-pressed={section === undefined} onClick={() => narrow(undefined)}>All</button>
                        {sections.map((each) => (
                            <button key={each.label} type="button" className={section === each.label ? styles.sectionOn : styles.section} aria-pressed={section === each.label} onClick={() => narrow(section === each.label ? undefined : each.label)}>
                                {each.label} <span className={styles.count}>{each.count}</span>
                            </button>
                        ))}
                    </div>
                )}
                <div className={styles.body}>
                    {indexState === "missing" && (
                        <p className={styles.note}>There is no search index yet. On <code>npm start</code>, search uses the index of the last build: run <code>npm run build</code> once in <code>docs/</code>, then search again.</p>
                    )}
                    {indexState === "ready" && empty && <p className={styles.note}>Search every page of the docs: the Designer, the coding editors, the API and the blog.</p>}
                    {indexState === "ready" && !empty && hits.length === 0 && <p className={styles.note}>No page matches {section === undefined ? "" : `in ${section} `}- try fewer or other words.</p>}
                    {hits.length > 0 && (
                        <ul id="search-hits" className={styles.hits} role="listbox" aria-label="Pages found">
                            {hits.map((hit, index) => (
                                <li key={hit.id} id={`search-hit-${index}`} role="option" aria-selected={index === active} className={index === active ? styles.hitActive : styles.hit} onMouseEnter={() => setActive(index)}>
                                    <Link to={hit.url} className={styles.hitLink} onClick={onClose}>
                                        <span className={styles.hitSection}>{hit.section}</span>
                                        <span className={styles.hitTitle}>{hit.title}</span>
                                        <span className={styles.hitExcerpt}><Excerpt text={hit.excerpt} /></span>
                                    </Link>
                                    {hit.headings.length > 0 && (
                                        <ul className={styles.headings}>
                                            {hit.headings.map((heading) => (
                                                <li key={heading.url}>
                                                    <Link to={heading.url} className={styles.heading} onClick={onClose}>
                                                        <span className={styles.headingTitle}>{heading.title}</span>
                                                        <span className={styles.hitExcerpt}><Excerpt text={heading.excerpt} /></span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                    {hits.length < results.length && (
                        <button type="button" className={styles.more} onClick={showMore}>Show more ({results.length - hits.length} left)</button>
                    )}
                </div>
            </div>
        </div>,
        document.body,
    );
}
