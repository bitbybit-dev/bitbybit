import initOpenCascade, { OpenCascadeInstance } from "bitbybit-occt/bitbybit-dev-occt/bitbybit-dev-occt";
import * as Inputs from "bitbybit-occt/lib/api/inputs";
import { CacheHelper } from "./cache-helper";
import { initializationComplete, onMessageInput } from "./occ-worker";

describe('OCCT wire unit tests', () => {
    let occt: OpenCascadeInstance;

    let cacheHelper: CacheHelper;
    beforeAll(async () => {
        occt = await initOpenCascade();
        cacheHelper = initializationComplete(occt, true);
    });

    beforeEach(() => {
        cacheHelper.cleanAllCache();
    });

    it('should', () => {
        expect(true).toBe(true);
    });

    it('should create a wire', async () => {
        const cdto = new Inputs.OCCT.CircleDto(1, [0, 0, 0], [0, 1, 0]);
        const wire = await callAction<Inputs.OCCT.CircleDto>('shapes.wire.createCircleWire', cdto);
        expect(wire.hash).toEqual(1646405596);
        expect(wire.type).toEqual('occ-shape');
    });

    it('should get length of a wire', async () => {
        const cdto = new Inputs.OCCT.CircleDto(1, [0, 0, 0], [0, 1, 0]);
        const wire = await callAction<Inputs.OCCT.CircleDto>('shapes.wire.createCircleWire', cdto);
        expect(wire.hash).toEqual(1646405596);
        expect(wire.type).toEqual('occ-shape');
        const length = await callAction<Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSWirePointer>>('shapes.wire.getWireLength', { shape: wire });
        expect(length).toBe(6.283185307179586);
    });


    it('should create advanced loft through straight sections', async () => {
        const loft = await createLoft(callAction);
        expect(loft.hash).toBe(716684607);
        expect(loft.type).toBe('occ-shape');
    });

    it('should loft advanced and use cache', async () => {
        const loft1 = await createLoft(callAction);
        const loft2 = await createLoft(callAction);

        expect(loft1.hash).toBe(loft2.hash);
        expect(loft2.type).toBe('occ-shape');
    });

    it('should subdivide wire into points', async () => {
        const cdto1 = new Inputs.OCCT.CircleDto(1, [0, 0, 0], [0, 1, 0]);
        const wire1 = await callAction<Inputs.OCCT.CircleDto>('shapes.wire.createCircleWire', cdto1);
        const divDto = new Inputs.OCCT.DivideDto(wire1, 10);
        const points = await callAction<Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSWirePointer>>('shapes.wire.divideWireByParamsToPoints', divDto);
        expect(points.length).toBe(11);
        expect(points).toEqual([
            [0, 0, 1],
            [0.5877852522924731, 0, 0.8090169943749475],
            [0.9510565162951535, 0, 0.30901699437494745],
            [0.9510565162951536, 0, -0.30901699437494734],
            [0.5877852522924732, 0, -0.8090169943749473],
            [1.2246467991473532e-16, 0, -1],
            [-0.587785252292473, 0, -0.8090169943749475],
            [-0.9510565162951535, 0, -0.30901699437494756],
            [-0.9510565162951536, 0, 0.30901699437494723],
            [-0.5877852522924734, 0, 0.8090169943749473],
            [-2.4492935982947064e-16, 0, 1]
        ]);
    });

    it('should subdivide wire into points', async () => {
        const cdto1 = new Inputs.OCCT.CircleDto(1, [0, 0, 0], [0, 1, 0]);
        const wire1 = await callAction<Inputs.OCCT.CircleDto>('shapes.wire.createCircleWire', cdto1);
        const divDto = new Inputs.OCCT.DivideDto(wire1, 10);
        await callAction<Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSWirePointer>>('shapes.wire.divideWireByParamsToPoints', divDto);
        const points2 = await callAction<Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSWirePointer>>('shapes.wire.divideWireByParamsToPoints', divDto);
        expect(points2.length).toBe(11);
        expect(points2).toEqual([
            [0, 0, 1],
            [0.5877852522924731, 0, 0.8090169943749475],
            [0.9510565162951535, 0, 0.30901699437494745],
            [0.9510565162951536, 0, -0.30901699437494734],
            [0.5877852522924732, 0, -0.8090169943749473],
            [1.2246467991473532e-16, 0, -1],
            [-0.587785252292473, 0, -0.8090169943749475],
            [-0.9510565162951535, 0, -0.30901699437494756],
            [-0.9510565162951536, 0, 0.30901699437494723],
            [-0.5877852522924734, 0, 0.8090169943749473],
            [-2.4492935982947064e-16, 0, 1]
        ]);
    });

    it('should get lengths of edges', async () => {
        const boxDto = new Inputs.OCCT.BoxDto(1, 1, 1);
        const box = await callAction<Inputs.OCCT.BoxDto>('shapes.solid.createBox', boxDto);
        expect(box.hash).toBe(-470453211);
        expect(box.type).toBe('occ-shape');
        const edges = await callAction<Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>>('shapes.edge.getEdges', { shape: box });
        const lengths = await callAction<Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSShapePointer>>('shapes.edge.getEdgesLengths', { shapes: edges });
        expect(lengths.length).toBe(12);
        expect(lengths).toEqual([
            1, 1, 1, 1, 1,
            1, 1, 1, 1, 1,
            1, 1
        ]);
        const lengths2 = await callAction<Inputs.OCCT.ShapesDto<Inputs.OCCT.TopoDSShapePointer>>('shapes.edge.getEdgesLengths', { shapes: edges });
        expect(lengths2.length).toBe(12);
        expect(lengths2).toEqual([
            1, 1, 1, 1, 1,
            1, 1, 1, 1, 1,
            1, 1
        ]);
    });

    it('should get edges of a box and subdivide them into points', async () => {
        const boxDto = new Inputs.OCCT.BoxDto(1, 1, 1);
        const box = await callAction<Inputs.OCCT.BoxDto>('shapes.solid.createBox', boxDto);
        expect(box.hash).toBe(-470453211);
        expect(box.type).toBe('occ-shape');
        const edges = await callAction<Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>>('shapes.edge.getEdges', { shape: box });
        expect(edges.length).toBe(12);
        const expectedEdgesResultBeforeCache = [
            { hash: 1474984972, type: 'occ-shape' },
            { hash: 1474985003, type: 'occ-shape' },
            { hash: 1474985034, type: 'occ-shape' },
            { hash: 1474985065, type: 'occ-shape' },
            { hash: 1474985096, type: 'occ-shape' },
            { hash: 1474985127, type: 'occ-shape' },
            { hash: 1474985158, type: 'occ-shape' },
            { hash: 1474985189, type: 'occ-shape' },
            { hash: 1474985220, type: 'occ-shape' },
            { hash: 1474985251, type: 'occ-shape' },
            { hash: -1520107425, type: 'occ-shape' },
            { hash: -1520107394, type: 'occ-shape' }
        ];
        expect(edges).toEqual(expectedEdgesResultBeforeCache);
        const edgesAfterCache = await callAction<Inputs.OCCT.ShapeDto<Inputs.OCCT.TopoDSShapePointer>>('shapes.edge.getEdges', { shape: box });
        expect(edgesAfterCache).toEqual(expectedEdgesResultBeforeCache);

        const points = await Promise.all(
            edgesAfterCache.map(edge => {
                const divDto = new Inputs.OCCT.DivideDto(edge, 4);
                return callAction<Inputs.OCCT.DivideDto<Inputs.OCCT.TopoDSWirePointer>>('shapes.edge.divideEdgeByParamsToPoints', divDto);
            })
        );
        expect(points).toEqual([
            [
                [-0.5, -0.5, -0.5],
                [-0.5, -0.5, -0.25],
                [-0.5, -0.5, 0],
                [-0.5, -0.5, 0.25],
                [-0.5, -0.5, 0.5]
            ],
            [
                [-0.5, -0.5, 0.5],
                [-0.5, -0.25, 0.5],
                [-0.5, 0, 0.5],
                [-0.5, 0.25, 0.5],
                [-0.5, 0.5, 0.5]
            ],
            [
                [-0.5, 0.5, 0.5],
                [-0.5, 0.5, 0.25],
                [-0.5, 0.5, 0],
                [-0.5, 0.5, -0.25],
                [-0.5, 0.5, -0.5]
            ],
            [
                [-0.5, 0.5, -0.5],
                [-0.5, 0.25, -0.5],
                [-0.5, 0, -0.5],
                [-0.5, -0.25, -0.5],
                [-0.5, -0.5, -0.5]
            ],
            [
                [0.5, -0.5, 0.5],
                [0.5, -0.5, 0.25],
                [0.5, -0.5, 0],
                [0.5, -0.5, -0.25],
                [0.5, -0.5, -0.5]
            ],
            [
                [0.5, 0.5, 0.5],
                [0.5, 0.25, 0.5],
                [0.5, 0, 0.5],
                [0.5, -0.25, 0.5],
                [0.5, -0.5, 0.5]
            ],
            [
                [0.5, 0.5, -0.5],
                [0.5, 0.5, -0.25],
                [0.5, 0.5, 0],
                [0.5, 0.5, 0.25],
                [0.5, 0.5, 0.5]
            ],
            [
                [0.5, -0.5, -0.5],
                [0.5, -0.25, -0.5],
                [0.5, 0, -0.5],
                [0.5, 0.25, -0.5],
                [0.5, 0.5, -0.5]
            ],
            [
                [-0.5, -0.5, -0.5],
                [-0.25, -0.5, -0.5],
                [0, -0.5, -0.5],
                [0.25, -0.5, -0.5],
                [0.5, -0.5, -0.5]
            ],
            [
                [0.5, -0.5, 0.5],
                [0.25, -0.5, 0.5],
                [0, -0.5, 0.5],
                [-0.25, -0.5, 0.5],
                [-0.5, -0.5, 0.5]
            ],
            [
                [0.5, 0.5, -0.5],
                [0.25, 0.5, -0.5],
                [0, 0.5, -0.5],
                [-0.25, 0.5, -0.5],
                [-0.5, 0.5, -0.5]
            ],
            [
                [-0.5, 0.5, 0.5],
                [-0.25, 0.5, 0.5],
                [0, 0.5, 0.5],
                [0.25, 0.5, 0.5],
                [0.5, 0.5, 0.5]
            ]
        ])
    });

    const callAction: <T>(functionName: string, inputs: T) => any = (functionName, inputs) => {
        return new Promise((resolve, reject) => {
            try {
                onMessageInput({
                    action: {
                        functionName,
                        inputs
                    },
                    uid: 'sdadwa',
                }, (data) => {
                    if (data !== 'busy') {
                        resolve(data.result)
                    }
                    if (data.error) {
                        console.error('ERROR HAPPENED: ', data.error);
                        reject(data.error)
                    }
                });
            } catch (err) {
                console.error('ERROR HAPPENED: ', err);
                reject(err)
            }
        });
    }

});

async function createLoft(callAction: <T>(functionName: string, inputs: T) => any) {
    const cdto1 = new Inputs.OCCT.CircleDto(1, [0, 0, 0], [0, 1, 0]);
    const wire1 = await callAction<Inputs.OCCT.CircleDto>('shapes.wire.createCircleWire', cdto1);

    const cdto2 = new Inputs.OCCT.CircleDto(2, [0, 1, 0], [0, 1, 0]);
    const wire2 = await callAction<Inputs.OCCT.CircleDto>('shapes.wire.createCircleWire', cdto2);

    const cdto3 = new Inputs.OCCT.CircleDto(1.5, [0, 2, 0], [0, 1, 0]);
    const wire3 = await callAction<Inputs.OCCT.CircleDto>('shapes.wire.createCircleWire', cdto3);

    const ldto = new Inputs.OCCT.LoftAdvancedDto([wire1, wire2, wire3]);
    ldto.closed = true;
    ldto.straight = true;
    const loft = await callAction<Inputs.OCCT.LoftAdvancedDto<Inputs.OCCT.TopoDSShapePointer>>('operations.loftAdvanced', ldto);
    return loft;
}

