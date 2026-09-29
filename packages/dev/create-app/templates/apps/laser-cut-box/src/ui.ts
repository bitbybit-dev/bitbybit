import { LIMITS, UNITS, type BoxParams, type Layout } from "./panels";

type NumericKey = keyof typeof LIMITS;

const FIELDS: { key: NumericKey; label: string }[] = [
    { key: "length", label: `Length (${UNITS})` },
    { key: "width", label: `Width (${UNITS})` },
    { key: "height", label: `Height (${UNITS})` },
    { key: "thickness", label: `Sheet thickness (${UNITS})` },
    { key: "kerf", label: `Kerf (${UNITS})` },
    { key: "fingerWidth", label: `Finger width (${UNITS})` },
    { key: "sheetWidth", label: `Sheet width (${UNITS})` },
    { key: "sheetHeight", label: `Sheet height (${UNITS})` },
    { key: "gap", label: `Gap between parts (${UNITS})` },
];

export type View = "assembled" | "flat";
export type ExportFormat = "dxf" | "svg" | "step";

export interface UiHandlers {
    onChange: (params: BoxParams) => void;
    onView: (view: View) => void;
    onExport: (format: ExportFormat) => void;
}

export interface UiHandle {
    setFacts: (layout: Layout, params: BoxParams) => void;
    setStatus: (text: string) => void;
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

export function mountUi(root: HTMLElement, initial: BoxParams, handlers: UiHandlers): UiHandle {
    let params = { ...initial };

    root.innerHTML = `
        <header class="brand"><img src="/logo.png" alt="bitbybit.dev" /><h1>Laser-cut box</h1></header>
        <p class="lead">A finger-jointed box from one sheet. Every part is cut from the same outline the preview shows.</p>
        <div class="views">
            <button type="button" data-view="assembled" class="active">Assembled</button>
            <button type="button" data-view="flat">Cutting layout</button>
        </div>
        <form class="fields"></form>
        <div class="facts">
            <div class="line"><span>Parts</span><strong class="parts">-</strong></div>
            <div class="line"><span>Layout</span><strong class="layout">-</strong></div>
            <div class="line"><span>Sheet used</span><strong class="used">-</strong></div>
        </div>
        <div class="exports">
            <button type="button" data-format="dxf">DXF</button>
            <button type="button" data-format="svg">SVG</button>
            <button type="button" data-format="step">STEP</button>
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

    const lidWrapper = document.createElement("div");
    lidWrapper.className = "field";
    const lidLabel = document.createElement("label");
    lidLabel.textContent = "Lid";
    lidLabel.htmlFor = "lid";
    const lid = document.createElement("input");
    lid.type = "checkbox";
    lid.id = "lid";
    lid.checked = params.lid;
    lid.addEventListener("change", () => {
        params = { ...params, lid: lid.checked };
        handlers.onChange(params);
    });
    lidWrapper.append(lidLabel, lid);
    form.appendChild(lidWrapper);

    for (const button of root.querySelectorAll<HTMLButtonElement>(".exports button")) {
        button.addEventListener("click", () => { handlers.onExport(button.dataset["format"] as ExportFormat); });
    }

    const parts = query(root, ".parts", HTMLElement);
    const layoutText = query(root, ".layout", HTMLElement);
    const used = query(root, ".used", HTMLElement);
    const status = query(root, ".status", HTMLElement);

    return {
        setFacts: (layout, p) => {
            parts.textContent = String(layout.parts.length);
            layoutText.textContent = layout.fits ? "fits the sheet" : `needs ${Math.ceil(layout.usedWidth)} by ${Math.ceil(layout.usedHeight)} ${UNITS}`;
            const share = (layout.parts.reduce((sum, part) => sum + part.width * part.height, 0) / (p.sheetWidth * p.sheetHeight)) * 100;
            used.textContent = `${share.toFixed(0)}% of ${p.sheetWidth} by ${p.sheetHeight} ${UNITS}`;
        },
        setStatus: (text) => { status.textContent = text; },
    };
}
