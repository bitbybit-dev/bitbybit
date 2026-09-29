export type FinishId = "midnight" | "arctic" | "signal";

export type MaterialId = "carbon" | "paint" | "accent" | "emblem" | "aluminium" | "copper" | "steel" | "polymer" | "rubber" | "glass" | "ledGreen" | "ledRed";

export interface MaterialSpec {
    colour: string;
    metalness: number;
    roughness: number;
    clearcoat: number;
    emissive?: string;
}

export interface Finish {
    label: string;
    paint: string;
    accent: string;
    emblem: string;
}

export const FINISHES: Record<FinishId, Finish> = {
    midnight: { label: "Midnight", paint: "#1f2b4d", accent: "#f0cebb", emblem: "#f4f4f4" },
    arctic: { label: "Arctic", paint: "#e9eaec", accent: "#ff7a1a", emblem: "#111214" },
    signal: { label: "Signal", paint: "#ff5a1f", accent: "#f4f4f4", emblem: "#111214" },
};

const FIXED: Record<Exclude<MaterialId, "paint" | "accent" | "emblem">, MaterialSpec> = {
    carbon: { colour: "#23262b", metalness: 0.35, roughness: 0.45, clearcoat: 0.3 },
    aluminium: { colour: "#b9bec6", metalness: 1, roughness: 0.32, clearcoat: 0 },
    copper: { colour: "#b87333", metalness: 1, roughness: 0.5, clearcoat: 0 },
    steel: { colour: "#1c1c1e", metalness: 0.9, roughness: 0.42, clearcoat: 0 },
    polymer: { colour: "#2a2d31", metalness: 0.05, roughness: 0.4, clearcoat: 0.6 },
    rubber: { colour: "#111214", metalness: 0, roughness: 0.92, clearcoat: 0 },
    glass: { colour: "#0c1522", metalness: 0.1, roughness: 0.05, clearcoat: 1 },
    ledGreen: { colour: "#22ff66", metalness: 0, roughness: 0.2, clearcoat: 1, emissive: "#22ff66" },
    ledRed: { colour: "#ff2a2a", metalness: 0, roughness: 0.2, clearcoat: 1, emissive: "#ff2a2a" },
};

export function materialSpec(id: MaterialId, finish: FinishId): MaterialSpec {
    const f = FINISHES[finish];
    if (id === "paint") return { colour: f.paint, metalness: 0.1, roughness: 0.25, clearcoat: 1 };
    if (id === "accent") return { colour: f.accent, metalness: 0.85, roughness: 0.35, clearcoat: 0 };
    if (id === "emblem") return { colour: f.emblem, metalness: 0.2, roughness: 0.5, clearcoat: 0.3 };
    return FIXED[id];
}

export function rgba(hex: string): { r: number; g: number; b: number; a: number } {
    const value = parseInt(hex.slice(1), 16);
    return { r: ((value >> 16) & 255) / 255, g: ((value >> 8) & 255) / 255, b: (value & 255) / 255, a: 1 };
}

export function luminance(hex: string): number {
    const { r, g, b } = rgba(hex);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function edgeColour(surface: string): string {
    return luminance(surface) < 0.3 ? "#f2f2f2" : "#0d0e10";
}
