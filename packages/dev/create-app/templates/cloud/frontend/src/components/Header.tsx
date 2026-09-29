import type { ReactElement } from "react";

export function Header(): ReactElement {
    return (
        <header className="header">
            <img src="/logo.png" alt="bitbybit.dev" />
            <h1>Bitbybit CAD Cloud API</h1>
        </header>
    );
}
