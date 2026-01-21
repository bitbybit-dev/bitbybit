/* eslint-disable @typescript-eslint/no-empty-function */
// Mock for @bitbybit-dev/jscad-worker
// This mock is needed because the real package uses Workers which Jest can't handle

export class JSCADWorkerManager {
    jscadWorkerState: any = { jscadWorker: undefined };
    
    constructor() {}
    
    setJscadWorker(worker: any) {}
    
    genericCallToWorkerPromise = jest.fn().mockResolvedValue({});
}

export class JSCADText {
    constructor(context?: any, jscadWorkerManager?: any) {}
    
    createVectorText = jest.fn().mockResolvedValue({
        positions: [],
        indices: []
    });
}

export class JSCAD {
    constructor(context?: any, jscadWorkerManager?: any) {}
}
