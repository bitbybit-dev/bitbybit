import { Base } from "./inputs/base-inputs";
import { Vector } from "./bitbybit";

export class DrawHelperCore {

    constructor(public readonly vector: Vector) { }

    computeEdgeMiddlePos(edge: { edge_index: number; vertex_coord: Base.Point3[]; }): Base.Point3 {
        let pos;
        if (edge.vertex_coord.length === 2) {
            const midFloor = edge.vertex_coord[0];
            const midCeil = edge.vertex_coord[1];
            pos = this.vector.lerp({
                first: midFloor,
                second: midCeil,
                fraction: 0.5,
            });
        } else if (edge.vertex_coord.length === 3) {
            pos = edge.vertex_coord[1];
        } else {
            const midFloor = edge.vertex_coord[Math.floor(edge.vertex_coord.length / 2)];
            const midCeil = edge.vertex_coord[Math.floor(edge.vertex_coord.length / 2 + 1)];
            pos = this.vector.lerp({
                first: midFloor,
                second: midCeil,
                fraction: 0.5,
            });
        }
        return pos;
    }

    computeFaceMiddlePos(vertexCoordVec: number[][]): number[] {
        let x = 0;
        let y = 0;
        let z = 0;

        let realLength = 0;
        vertexCoordVec.forEach(v => {
            x += v[0];
            y += v[1];
            z += v[2];
            realLength++;
        });

        return [x / realLength, y / realLength, z / realLength];
    }
}