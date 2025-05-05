import { Base } from "../../inputs/base-inputs";

export class HexGridData {
    centers: Base.Point3[];
    hexagons: Base.Point3[][];
    shortestDistEdge: number;
    longestDistEdge: number;
    maxFilletRadius: number;
}