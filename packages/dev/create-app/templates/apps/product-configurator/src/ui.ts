import { MATERIALS, PRESETS, formatPrice, type Quote } from "./catalog";
import { LIMITS, UNITS, type MaterialId, type PlanterParams } from "./model";

type NumericKey = keyof typeof LIMITS;

const FIELDS: { key: NumericKey; label: string }[] = [
    { key: "width", label: `Width (${UNITS})` },
    { key: "depth", label: `Depth (${UNITS})` },
    { key: "height", label: `Height (${UNITS})` },
    { key: "wallThickness", label: `Wall thickness (${UNITS})` },
    { key: "cornerRadius", label: `Corner radius (${UNITS})` },
    { key: "drainageHoles", label: "Drainage holes" },
];

export type ExportFormat = "step" | "stl" | "glb";

export interface UiHandlers {
    onChange: (params: PlanterParams) => void;
    onExport: (format: ExportFormat) => void;
}

export interface UiHandle {
    setQuote: (quote: Quote) => void;
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

export function mountUi(root: HTMLElement, initial: PlanterParams, handlers: UiHandlers): UiHandle {
    let params = { ...initial };
    const outputs = new Map<NumericKey, HTMLOutputElement>();
    const sliders = new Map<NumericKey, HTMLInputElement>();

    root.innerHTML = `
        <header class="brand"><img src="/logo.png" alt="bitbybit.dev" /><h1>Planter configurator</h1></header>
        <p class="lead">Every dimension rebuilds the solid; the price comes from its measured volume and surface.</p>
        <div class="presets"></div>
        <form class="fields"></form>
        <div class="quote">
            <div class="total"><span>Price</span><span class="amount">-</span></div>
            <div class="line"><span>Material</span><span class="material">-</span></div>
            <div class="line"><span>Finish</span><span class="finish">-</span></div>
            <div class="line"><span>Drainage</span><span class="holes">-</span></div>
        </div>
        <div class="exports">
            <button type="button" data-format="step">STEP</button>
            <button type="button" data-format="stl">STL</button>
            <button type="button" data-format="glb">GLB</button>
        </div>
        <p class="status"></p>
    `;

    const presets = query(root, ".presets", HTMLElement);
    for (const preset of Object.values(PRESETS)) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = preset.label;
        button.addEventListener("click", () => {
            params = { ...preset.params };
            syncInputs();
            handlers.onChange(params);
        });
        presets.appendChild(button);
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
        const input = document.createElement("input");
        input.type = "range";
        input.id = field.key;
        input.min = String(limit.min);
        input.max = String(limit.max);
        input.step = String(limit.step);
        input.addEventListener("input", () => {
            params = { ...params, [field.key]: Number(input.value) };
            output.value = input.value;
            handlers.onChange(params);
        });
        wrapper.append(label, output, input);
        form.appendChild(wrapper);
        outputs.set(field.key, output);
        sliders.set(field.key, input);
    }

    const materialWrapper = document.createElement("div");
    materialWrapper.className = "field";
    const materialLabel = document.createElement("label");
    materialLabel.textContent = "Material";
    materialLabel.htmlFor = "material";
    const materialSelect = document.createElement("select");
    materialSelect.id = "material";
    for (const [id, material] of Object.entries(MATERIALS)) {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = material.label;
        materialSelect.appendChild(option);
    }
    materialSelect.addEventListener("change", () => {
        params = { ...params, material: materialSelect.value as MaterialId };
        handlers.onChange(params);
    });
    materialWrapper.append(materialLabel, document.createElement("span"), materialSelect);
    form.appendChild(materialWrapper);

    for (const button of root.querySelectorAll<HTMLButtonElement>(".exports button")) {
        button.addEventListener("click", () => { handlers.onExport(button.dataset["format"] as ExportFormat); });
    }

    const amount = query(root, ".amount", HTMLElement);
    const material = query(root, ".material", HTMLElement);
    const finish = query(root, ".finish", HTMLElement);
    const holes = query(root, ".holes", HTMLElement);
    const status = query(root, ".status", HTMLElement);

    function syncInputs(): void {
        for (const [key, slider] of sliders) slider.value = String(params[key]);
        for (const [key, output] of outputs) output.value = String(params[key]);
        materialSelect.value = params.material;
    }

    syncInputs();

    return {
        setQuote: (quote) => {
            amount.textContent = formatPrice(quote.total);
            material.textContent = `${formatPrice(quote.material)} for ${quote.litres} l`;
            finish.textContent = formatPrice(quote.finish);
            holes.textContent = formatPrice(quote.holes);
        },
        setStatus: (text) => { status.textContent = text; },
    };
}
