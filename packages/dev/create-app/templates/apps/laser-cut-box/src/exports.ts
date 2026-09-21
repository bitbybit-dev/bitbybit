import type { Layout, Point2 } from "./panels";

export function downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => { URL.revokeObjectURL(url); }, 1000);
}

export function layoutSvg(layout: Layout, sheetWidth: number, sheetHeight: number): string {
    const polygon = (outline: Point2[], x: number, y: number): string =>
        outline.map(([u, v]) => `${(x + u).toFixed(3)},${(sheetHeight - (y + v)).toFixed(3)}`).join(" ");
    const parts = layout.parts.flatMap((part) => [
        `  <polygon id="${part.id}" points="${polygon(part.outline, part.x, part.y)}" fill="none" stroke="#000" stroke-width="0.1" />`,
        ...(part.slot ? [`  <rect id="${part.id}-handle" x="${(part.x - part.slot.length / 2).toFixed(3)}" y="${(sheetHeight - part.y - part.slot.radius).toFixed(3)}" width="${part.slot.length}" height="${2 * part.slot.radius}" rx="${part.slot.radius}" ry="${part.slot.radius}" fill="none" stroke="#000" stroke-width="0.1" />`] : []),
    ]);
    return [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${sheetWidth}mm" height="${sheetHeight}mm" viewBox="0 0 ${sheetWidth} ${sheetHeight}" style="max-width: 100%; height: auto; display: block">`,
        `  <rect x="0" y="0" width="${sheetWidth}" height="${sheetHeight}" fill="none" stroke="#999" stroke-width="0.1" stroke-dasharray="2 2" />`,
        ...parts,
        "</svg>",
        "",
    ].join("\n");
}
