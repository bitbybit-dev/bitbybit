import type { Layer } from "../house/house-types";

export interface PanelFacts {
    netArea: number;
    rooms: number;
    openings: number;
    seconds: number;
}

export interface PanelHandlers {
    onToggle(key: Layer | "labels", on: boolean): void;
    onDownload(): Promise<void>;
}
