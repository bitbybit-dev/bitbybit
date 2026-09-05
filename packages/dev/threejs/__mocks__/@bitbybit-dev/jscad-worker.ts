/* eslint-disable @typescript-eslint/no-empty-function */
// Mock for @bitbybit-dev/jscad-worker
// This mock is needed because the real package uses Workers which Jest can't handle

export class JSCADWorkerManager {
    jscadWorkerState: any = { jscadWorker: undefined };
    
    constructor() {}
    
    setJscadWorker(_worker: any) {}
    
    genericCallToWorkerPromise = jest.fn().mockResolvedValue({});
}

export class JSCADText {
    constructor(_context?: any, _jscadWorkerManager?: any) {}
    
    // Returns array of polylines (array of [x, y] points)
    createVectorText = jest.fn().mockResolvedValue([]);
}

export class JSCAD {
    constructor(_context?: any, _jscadWorkerManager?: any) {}
}
