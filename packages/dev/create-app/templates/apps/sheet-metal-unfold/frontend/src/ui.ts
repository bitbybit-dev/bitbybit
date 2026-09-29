import type { FlatSummary } from "./flat";
import { LIMITS, UNITS, type FlatEstimate, type PartParams } from "./model";

type NumericKey = keyof typeof LIMITS;

const FIELDS: { key: NumericKey; label: string }[] = [
    { key: "baseWidth", label: `Base width (${UNITS})` },
    { key: "flangeHeight", label: `Flange height (${UNITS})` },
    { key: "lipHeight", label: `Lip height (${UNITS}, 0 for none)` },
    { key: "depth", label: `Depth (${UNITS})` },
    { key: "thickness", label: `Sheet thickness (${UNITS})` },
    { key: "bendRadius", label: `Inner bend radius (${UNITS})` },
    { key: "kFactor", label: "K-factor" },
];

export type View = "part" | "flat";
export type ExportFormat = "part-step" | "flat-step" | "flat-dxf";

export interface UiHandlers {
    onChange: (params: PartParams) => void;
    onView: (view: View) => void;
    onUnfold: () => void;
    onExport: (format: ExportFormat) => void;
}

export interface UiHandle {
    accessRoot: HTMLElement;
    setEstimate: (estimate: FlatEstimate, volume: number) => void;
    setFlat: (summary: FlatSummary | null) => void;
    setStatus: (text: string) => void;
    setBusy: (busy: boolean) => void;
}

export function mountPoint(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) throw new Error(`index.html has no #${id} element to mount the panel in`);
    return element;
}

function query<T extends Element>(root: ParentNode, selector: string, kind: new () => T): T {
    const found = root.querySelector(selector);
    if (!(found instanceof kind)) throw new Error(`the panel markup has no ${selector} element of the expected kind`);
    return found;
}

export function mountUi(root: HTMLElement, initial: PartParams, handlers: UiHandlers): UiHandle {
    let params = { ...initial };

    root.innerHTML = `
        <header class="brand"><img src="/logo.png" alt="bitbybit.dev" /><h1>Sheet-metal unfold</h1></header>
        <p class="lead">The channel is built here, in your browser. The flat pattern comes from CAD Cloud's unfold, a Pro algorithm.</p>
        <div class="views">
            <button type="button" data-view="part" class="active">Part</button>
            <button type="button" data-view="flat" disabled>Flat pattern</button>
        </div>
        <form class="fields"></form>
        <div class="facts">
            <div class="line"><span>Material</span><strong class="volume">-</strong></div>
            <div class="line"><span>Bends</span><strong class="bends">-</strong></div>
            <div class="line"><span>Flat length, K-factor estimate</span><strong class="estimate">-</strong></div>
            <div class="line"><span>Flat pattern, CAD Cloud</span><strong class="cloud">not unfolded yet</strong></div>
            <table class="bends hidden"></table>
        </div>
        <button type="button" class="primary unfold">Unfold on CAD Cloud</button>
        <div class="access hidden"></div>
        <div class="exports">
            <button type="button" data-format="part-step">STEP part</button>
            <button type="button" data-format="flat-dxf" disabled>DXF flat</button>
            <button type="button" data-format="flat-step" disabled>STEP flat</button>
        </div>
        <p class="status"></p>
    `;

    const viewButtons = root.querySelectorAll<HTMLButtonElement>(".views button");
    for (const button of viewButtons) {
        button.addEventListener("click", () => {
            for (const other of viewButtons) other.classList.toggle("active", other === button);
            handlers.onView(button.dataset["view"] as View);
        });
    }

    const form = query(root, ".fields", HTMLFormElement);
    form.addEventListener("submit", (event) => { event.preventDefault(); });
    for (const field of FIELDS) {
        const limit = LIMITS[field.key];
        const wrapper = document.createElement("div");
        wrapper.className = "field";
        const label = document.createElement("label");
        label.textContent = field.label;
        label.htmlFor = field.key;
        const output = document.createElement("output");
        output.value = String(params[field.key]);
        const input = document.createElement("input");
        input.type = "range";
        input.id = field.key;
        input.min = String(limit.min);
        input.max = String(limit.max);
        input.step = String(limit.step);
        input.value = String(params[field.key]);
        input.addEventListener("input", () => {
            params = { ...params, [field.key]: Number(input.value) };
            output.value = input.value;
            handlers.onChange(params);
        });
        wrapper.append(label, output, input);
        form.appendChild(wrapper);
    }

    const unfold = query(root, ".unfold", HTMLButtonElement);
    unfold.addEventListener("click", () => { handlers.onUnfold(); });

    const exportButtons = root.querySelectorAll<HTMLButtonElement>(".exports button");
    for (const button of exportButtons) {
        button.addEventListener("click", () => { handlers.onExport(button.dataset["format"] as ExportFormat); });
    }

    const volume = query(root, ".volume", HTMLElement);
    const bends = query(root, ".bends:not(table)", HTMLElement);
    const estimate = query(root, ".estimate", HTMLElement);
    const cloud = query(root, ".cloud", HTMLElement);
    const table = query(root, "table.bends", HTMLTableElement);
    const status = query(root, ".status", HTMLElement);
    const flatView = query(root, '[data-view="flat"]', HTMLButtonElement);
    const flatExports = [...exportButtons].filter((button) => button.dataset["format"]?.startsWith("flat"));

    return {
        accessRoot: query(root, ".access", HTMLElement),
        setEstimate: (flat, cubic) => {
            volume.textContent = `${(cubic / 1000).toFixed(1)} cm³`;
            bends.textContent = String(flat.bends);
            estimate.textContent = `${flat.total.toFixed(2)} ${UNITS}`;
        },
        setFlat: (summary) => {
            const ready = summary !== null && summary.unfolded > 0;
            flatView.disabled = !ready;
            for (const button of flatExports) button.disabled = !ready;
            table.classList.toggle("hidden", !ready);
            if (!summary) { cloud.textContent = "not unfolded yet"; table.innerHTML = ""; return; }
            cloud.textContent = ready
                ? `${summary.developedLength?.toFixed(2) ?? "?"} ${UNITS} developed, ${summary.bends} bends, ${summary.thickness?.toFixed(2) ?? "?"} ${UNITS} thick`
                : summary.problems.join("; ");
            table.innerHTML = ready
                ? `<tr><th>Bend</th><th>Angle</th><th>Inner r</th><th>Allowance</th></tr>` +
                  summary.problems.map((problem) => `<tr><td colspan="4">${problem}</td></tr>`).join("")
                : "";
        },
        setStatus: (text) => { status.textContent = text; },
        setBusy: (busy) => { unfold.disabled = busy; unfold.textContent = busy ? "Unfolding..." : "Unfold on CAD Cloud"; },
    };
}
