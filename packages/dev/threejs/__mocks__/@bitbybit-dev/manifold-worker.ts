/* eslint-disable @typescript-eslint/no-empty-function */
// Mock for @bitbybit-dev/manifold-worker
// This mock is needed because the real package uses Workers which Jest can't handle

export class ManifoldWorkerManager {
    manifoldWorkerState: any = { manifoldWorker: undefined };
    
    constructor() {}
    
    setManifoldWorker(worker: any) {}
    
    genericCallToWorkerPromise = jest.fn().mockResolvedValue({});
    
    getMesh = jest.fn().mockResolvedValue({
        vertProperties: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
        triVerts: new Uint32Array([0, 1, 2]),
        numProp: 3
    });
}

export class ManifoldBitByBit {
    constructor(context?: any, manifoldWorkerManager?: any) {}
}
