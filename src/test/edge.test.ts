import initOpenCascade, { OpenCascadeInstance } from '../bitbybit-dev-occt/bitbybit-dev-occt';
import { OccHelper } from "../lib/workers/occ/occ-helper";
import { VectorHelperService } from "../lib/api/vector-helper.service";
import { ShapesHelperService } from "../lib/api/shapes-helper.service";
import { OCCTEdge } from "../lib/workers/occ/services/shapes/edge";

describe('OCCT edge unit tests', () => {
    let edge: OCCTEdge;

    beforeAll(async () => {
        const occt: OpenCascadeInstance = await (initOpenCascade as any).default();
        const vec = new VectorHelperService();
        const s = new ShapesHelperService();
        edge = new OCCTEdge(occt, new OccHelper(vec, s, occt));
    });

    it('can create a circle edge of the right radius and it will mach the length', async () => {
        const e = edge.createCircleEdge({ radius: 10, center: [0, 0, 0], direction: [0, 0, 1] });
        const length = edge.getEdgeLength({ shape: e });
        expect(length.result).toEqual(62.83185307179586);
    });

    it('can create a circle edge and the point on it will be at specific location', async () => {
        const e = edge.createCircleEdge({ radius: 1, center: [0, 1, 0], direction: [1, 1, 0] });
        const point = edge.pointOnEdgeAtParam({ shape: e, param: 0.5 });
        const x = point.result[0];
        const y = point.result[1];
        const z = point.result[2];
        expect(x).toBeCloseTo(-0.7071067811865476);
        expect(y).toBeCloseTo(1.7071067811865475);
        expect(z).toBeCloseTo(0);
    });

});
