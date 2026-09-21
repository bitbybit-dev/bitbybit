import type { Bom } from "./assembly";
import { FINISHES, type FinishId } from "./materials";
import { ARM_COUNTS, LIMITS, UNITS, maxPropDiameter, type ArmCount, type DroneParams } from "./model";

type SliderKey = keyof typeof LIMITS;

const SLIDERS: { key: SliderKey; label: string }[] = [
    { key: "armLength", label: `Arm length (${UNITS})` },
    { key: "propDiameter", label: `Propeller diameter (${UNITS})` },
];

export type ExportFormat = "step" | "glb";

export const ROTOR_RPM = { min: 0, max: 360, step: 10, initial: 240 } as const;

export interface UiHandlers {
    onChange: (params: DroneParams) => void;
    onSpeed: (rpm: number) => void;
    onEdges: (visible: boolean) => void;
    onExport: (format: ExportFormat) => void;
}

export interface UiHandle {
    setParams: (params: DroneParams) => void;
    setBom: (bom: Bom, bolts: number) => void;
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

export function mountUi(root: HTMLElement, initial: DroneParams, handlers: UiHandlers): UiHandle {
    let params = { ...initial };
    const outputs = new Map<SliderKey, HTMLOutputElement>();
    const sliders = new Map<SliderKey, HTMLInputElement>();

    root.innerHTML = `
        <header class="brand"><img src="/logo.png" alt="bitbybit.dev" /><h1>Drone assembly</h1></header>
        <p class="lead">Twenty-seven parts, placed as instances through sub-assemblies. Change the arms and only the placements change.</p>
        <div class="field"><label>Arms</label><span></span><div class="segments"></div></div>
        <form class="fields"></form>
        <p class="note"></p>
        <div class="field speed">
            <label for="speed">Rotor speed (rpm, 0 lands)</label>
            <output>${ROTOR_RPM.initial}</output>
            <input type="range" id="speed" name="speed" min="${ROTOR_RPM.min}" max="${ROTOR_RPM.max}" step="${ROTOR_RPM.step}" value="${ROTOR_RPM.initial}" />
        </div>
        <div class="toggles">
            <label><input type="checkbox" name="edges" checked /> Edges</label>
        </div>
        <div class="bom">
            <div class="bom-title"><span>Bill of materials</span><span class="bom-totals">-</span></div>
            <table><tbody></tbody></table>
        </div>
        <div class="exports">
            <button type="button" data-format="step">STEP assembly</button>
            <button type="button" data-format="glb">GLB</button>
        </div>
        <p class="status"></p>
    `;

    const segments = query(root, ".segments", HTMLElement);
    const armButtons = new Map<ArmCount, HTMLButtonElement>();
    for (const count of ARM_COUNTS) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = String(count);
        button.addEventListener("click", () => {
            params = { ...params, arms: count };
            syncInputs();
            handlers.onChange(params);
        });
        segments.appendChild(button);
        armButtons.set(count, button);
    }

    const form = query(root, ".fields", HTMLFormElement);
    form.addEventListener("submit", (event) => { event.preventDefault(); });
    for (const field of SLIDERS) {
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

    const finishWrapper = document.createElement("div");
    finishWrapper.className = "field";
    const finishLabel = document.createElement("label");
    finishLabel.textContent = "Finish";
    finishLabel.htmlFor = "finish";
    const finishSelect = document.createElement("select");
    finishSelect.id = "finish";
    for (const [id, finish] of Object.entries(FINISHES)) {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = finish.label;
        finishSelect.appendChild(option);
    }
    finishSelect.addEventListener("change", () => {
        params = { ...params, finish: finishSelect.value as FinishId };
        handlers.onChange(params);
    });
    finishWrapper.append(finishLabel, document.createElement("span"), finishSelect);
    form.appendChild(finishWrapper);

    const speed = query(root, "input[name=speed]", HTMLInputElement);
    const speedOutput = query(root, ".speed output", HTMLOutputElement);
    speed.addEventListener("input", () => {
        speedOutput.value = speed.value;
        handlers.onSpeed(Number(speed.value));
    });
    const edges = query(root, "input[name=edges]", HTMLInputElement);
    edges.addEventListener("change", () => { handlers.onEdges(edges.checked); });

    for (const button of root.querySelectorAll<HTMLButtonElement>(".exports button")) {
        button.addEventListener("click", () => { handlers.onExport(button.dataset["format"] as ExportFormat); });
    }

    const note = query(root, ".note", HTMLElement);
    const totals = query(root, ".bom-totals", HTMLElement);
    const rows = query(root, ".bom tbody", HTMLElement);
    const status = query(root, ".status", HTMLElement);

    function syncInputs(): void {
        for (const [key, slider] of sliders) slider.value = String(params[key]);
        for (const [key, output] of outputs) output.value = String(params[key]);
        for (const [count, button] of armButtons) button.classList.toggle("active", count === params.arms);
        finishSelect.value = params.finish;
        const largest = maxPropDiameter(params.arms, params.armLength);
        note.textContent = params.propDiameter >= largest
            ? `Propellers are limited to ${largest} ${UNITS} here so their tips clear each other and the canopy.`
            : "";
    }

    syncInputs();

    return {
        setParams: (next) => { params = { ...next }; syncInputs(); },
        setBom: (bom, bolts) => {
            totals.textContent = `${bom.parts} parts, ${bom.instances} placed, ${bolts} bolts`;
            rows.replaceChildren(...bom.rows.map((row) => {
                const tr = document.createElement("tr");
                const name = document.createElement("td");
                name.textContent = row.name;
                const count = document.createElement("td");
                count.textContent = `x${row.count}`;
                tr.append(name, count);
                return tr;
            }));
        },
        setStatus: (text) => { status.textContent = text; },
    };
}
