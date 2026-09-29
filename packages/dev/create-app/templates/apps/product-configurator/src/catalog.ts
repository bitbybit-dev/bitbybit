import type { MaterialId, PlanterModel, PlanterParams } from "./model";

export interface Material {
    label: string;
    pricePerLitre: number;
    colour: string;

    roughness: number;

    clearcoat: number;
}

export const MATERIALS: Record<MaterialId, Material> = {
    terracotta: { label: "Terracotta", pricePerLitre: 6.5, colour: "#b5583a", roughness: 0.85, clearcoat: 0 },
    concrete: { label: "Concrete", pricePerLitre: 4.0, colour: "#8d8d86", roughness: 0.95, clearcoat: 0 },
    oak: { label: "Oak", pricePerLitre: 14.0, colour: "#c8a36b", roughness: 0.5, clearcoat: 0.4 },
};

export const PRESETS = {
    windowsill: { label: "Windowsill", params: { width: 40, depth: 14, height: 12, wallThickness: 1, cornerRadius: 2, drainageHoles: 3, material: "terracotta" } },
    balcony: { label: "Balcony", params: { width: 60, depth: 24, height: 22, wallThickness: 1.5, cornerRadius: 4, drainageHoles: 4, material: "concrete" } },
    patio: { label: "Patio", params: { width: 90, depth: 40, height: 40, wallThickness: 2.5, cornerRadius: 6, drainageHoles: 6, material: "oak" } },
} satisfies Record<string, { label: string; params: PlanterParams }>;

export type PresetId = keyof typeof PRESETS;

export const CURRENCY = "EUR";
export const BASE_PRICE = 12;
export const FINISH_PER_SQUARE_METRE = 18;
export const HOLE_SURCHARGE = 0.5;

export interface Quote {
    litres: number;
    material: number;
    finish: number;
    holes: number;
    total: number;
}

export function quoteFor(params: PlanterParams, model: Pick<PlanterModel, "volume" | "surfaceArea">): Quote {
    const litres = model.volume / 1000;
    const material = MATERIALS[params.material].pricePerLitre * litres;
    const finish = (model.surfaceArea / 10000) * FINISH_PER_SQUARE_METRE;
    const holes = params.drainageHoles * HOLE_SURCHARGE;
    const total = BASE_PRICE + material + finish + holes;
    return { litres: round(litres, 2), material: round(material), finish: round(finish), holes: round(holes), total: round(total) };
}

export function formatPrice(amount: number): string {
    return new Intl.NumberFormat("en", { style: "currency", currency: CURRENCY }).format(amount);
}

function round(value: number, digits = 2): number {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
}
