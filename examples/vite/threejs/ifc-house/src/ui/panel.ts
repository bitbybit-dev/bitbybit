import type { Layer, RoomSpec } from "../house/house-types";
import type { ElementInfo } from "../scene/scene-types";
import type { PanelFacts, PanelHandlers } from "./ui-types";

const TOGGLES: { key: Layer | "labels"; label: string; on: boolean }[] = [
    { key: "roof", label: "Roof and solar", on: true },
    { key: "first", label: "First floor", on: true },
    { key: "ground", label: "Ground floor", on: true },
    { key: "garden", label: "Garden, trees and carport", on: true },
    { key: "labels", label: "Room names", on: false },
];

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] {
    const made = document.createElement(tag);
    made.className = className;
    if (text !== undefined) {
        made.textContent = text;
    }
    return made;
}

export class HousePanel {
    private readonly selection: HTMLElement;
    private readonly switches = new Map<string, HTMLInputElement>();
    private readonly handlers: PanelHandlers;

    constructor(host: HTMLElement, facts: PanelFacts, rooms: RoomSpec[], areas: Map<string, number>, handlers: PanelHandlers) {
        this.handlers = handlers;
        const panel = element("aside", "panel");
        panel.append(this.header(), this.facts(facts), this.toggles(), this.schedule(rooms, areas));
        this.selection = element("section", "selection");
        this.select(undefined);
        panel.append(this.selection, this.download());
        host.appendChild(panel);
    }

    isOn(key: Layer | "labels"): boolean {
        return this.switches.get(key)?.checked ?? false;
    }

    turn(key: Layer | "labels", on: boolean): void {
        const input = this.switches.get(key);
        if (input && input.checked !== on) {
            input.checked = on;
            input.dispatchEvent(new Event("change"));
        }
    }

    select(info: ElementInfo | undefined): void {
        this.selection.replaceChildren();
        if (!info) {
            this.selection.append(element("p", "hint", "Click any part of the house to see what the IFC file says about it."));
            return;
        }
        this.selection.append(element("div", "selection-type", info.type), element("div", "selection-name", info.name || "Unnamed"), element("code", "selection-id", info.globalId));
    }

    private header(): HTMLElement {
        const header = element("header", "panel-header");
        header.append(
            element("div", "eyebrow", "IFC4 model, authored in your browser"),
            element("h1", "title", "Family house"),
            element("p", "lede", "Two storeys for a cold climate: insulated rendered masonry below, a timber frame clad in charred larch boards above, cantilevered over the garden terrace, under a warm flat roof with a parapet and solar array. The ground, trees, wall build-ups, U-values, rooms and quantities are all in the open BIM file."),
        );
        return header;
    }

    private facts(facts: PanelFacts): HTMLElement {
        const list = element("dl", "facts");
        const rows: [string, string][] = [
            [`${facts.netArea.toFixed(0)} m²`, "net floor area"],
            [String(facts.rooms), "rooms"],
            [String(facts.openings), "windows and doors"],
            [`${facts.seconds.toFixed(1)} s`, "to author and build"],
        ];
        for (const [value, label] of rows) {
            const row = element("div", "fact");
            row.append(element("dt", "fact-value", value), element("dd", "fact-label", label));
            list.append(row);
        }
        return list;
    }

    private toggles(): HTMLElement {
        const section = element("section", "toggles");
        section.append(element("h2", "section-title", "Show"));
        for (const toggle of TOGGLES) {
            const row = element("label", "switch");
            const input = element("input", "switch-input");
            input.type = "checkbox";
            input.checked = toggle.on;
            input.addEventListener("change", () => this.handlers.onToggle(toggle.key, input.checked));
            this.switches.set(toggle.key, input);
            row.append(input, element("span", "switch-track"), element("span", "switch-label", toggle.label));
            section.append(row);
        }
        return section;
    }

    private schedule(rooms: RoomSpec[], areas: Map<string, number>): HTMLElement {
        const section = element("details", "schedule");
        section.append(element("summary", "section-title", "Room schedule"));
        const table = element("table", "rooms");
        for (const room of rooms) {
            const row = element("tr", "room-row");
            const area = areas.get(room.number);
            row.append(element("td", "room-cell-number", room.number), element("td", "room-cell-name", room.name), element("td", "room-cell-area", area === undefined ? "" : `${area.toFixed(1)} m²`));
            table.append(row);
        }
        section.append(table);
        return section;
    }

    private download(): HTMLElement {
        const button = element("button", "download", "Download house.ifc");
        button.addEventListener("click", () => {
            button.disabled = true;
            this.handlers.onDownload().finally(() => {
                button.disabled = false;
            });
        });
        return button;
    }
}

export function showStatus(host: HTMLElement, text: string | undefined): void {
    host.textContent = text ?? "";
    host.classList.toggle("status-hidden", text === undefined);
}
