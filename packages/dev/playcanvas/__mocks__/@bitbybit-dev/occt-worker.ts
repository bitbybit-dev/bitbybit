 
// Mock for @bitbybit-dev/occt-worker
// This mock is needed because the real package uses import.meta.url which Jest can't handle

export class OCCTWorkerManager {
    occWorkerState: any = { occ: undefined };
    
    constructor() {}
    
    setOccWorker(_worker: any) {}
    
    shapeToMesh = jest.fn().mockResolvedValue({
        faceList: [],
        edgeList: []
    });
}

export class OCCT {
    constructor(_context?: any, _occWorkerManager?: any) {}
}

// Base class for OCCT IO operations - extended by core package
export class OCCTIO {
    occWorkerManager: any;
    
    constructor(occWorkerManager?: any) {
        this.occWorkerManager = occWorkerManager;
    }
}
