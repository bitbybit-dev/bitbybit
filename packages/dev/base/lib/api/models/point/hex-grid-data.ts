import { Base } from "../../inputs/base-inputs";

/**
 * A generated hexagonal grid: the centre point of every hexagon, its corner points, and the
 * row and column structure that placed them. The layout used for honeycomb patterns, perforations
 * and panelised surfaces.
 */
export class HexGridData {
    centers: Base.Point3[];
    hexagons: Base.Point3[][];
    shortestDistEdge: number;
    longestDistEdge: number;
    maxFilletRadius: number;
}