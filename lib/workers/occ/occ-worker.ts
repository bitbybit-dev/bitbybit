import { OpenCascadeInstance } from 'bitbybit-occt/bitbybit-dev-occt/bitbybit-dev-occt';
import { ShapesHelperService } from 'bitbybit-occt/lib/api/shapes-helper.service';
import { VectorHelperService } from 'bitbybit-occt/lib/api/vector-helper.service';
import { CacheHelper } from './cache-helper';
import { OccHelper } from 'bitbybit-occt/lib/occ-helper';
import { OCCTService } from 'bitbybit-occt/lib/occ-service';

let openCascade: OCCTService;
let cacheHelper: CacheHelper;

export const initializationComplete = (occ: OpenCascadeInstance, doNotPost?: boolean) => {
    cacheHelper = new CacheHelper(occ);
    const vecService = new VectorHelperService();
    const shapesService = new ShapesHelperService();

    openCascade = new OCCTService(occ, new OccHelper(vecService, shapesService, occ));
    if (!doNotPost) {
        postMessage('occ-initialised');
    }
    return cacheHelper;
};

type DataInput = {
    /**
     * Action data is used for cashing as a hashed number.
     */
    action: {
        functionName: string;
        inputs: any;
    }
    // Uid is used to know to which promise to resolve when answering
    uid: string;
};

export const onMessageInput = (d: DataInput, postMessage) => {
    postMessage('busy');

    let result;
    try {
        // Ok, so this is baked in memoization as all OCC computations are potentially very expensive
        // we can always return already computed entity hashes. On UI side we only deal with hashes as long
        // as we don't need to render things and when we do need, we call tessellation methods with these hashes
        // and receive real objects. This cache is useful in modeling operations throughout 'run' sessions.
        if (d.action.functionName !== 'shapeToMesh' &&
            d.action.functionName !== 'startedTheRun' &&
            d.action.functionName !== 'cleanAllCache' &&
            d.action.functionName !== 'saveShapeSTEP') {
            // if inputs have shape or shapes properties, these are hashes on which the operations need to be performed.
            // We thus replace these hashes to real objects from the cache before functions are called,
            // this probably looks like smth generic but isn't, so will need to check if it works
            if (d.action.inputs.shape) {
                d.action.inputs.shape = cacheHelper.checkCache(d.action.inputs.shape.hash);
            }
            if (d.action.inputs.shapes && d.action.inputs.shapes.length > 0) {
                d.action.inputs.shapes = d.action.inputs.shapes.map(shape => cacheHelper.checkCache(shape.hash));
            }
            const path = d.action.functionName.split('.');
            let res;
            if (path.length === 3) {
                res = cacheHelper.cacheOp(d.action, () => openCascade[path[0]][path[1]][path[2]](d.action.inputs));
            } else if (path.length === 2) {
                res = cacheHelper.cacheOp(d.action, () => openCascade[path[0]][path[1]](d.action.inputs));
            } else {
                res = cacheHelper.cacheOp(d.action, () => openCascade[d.action.functionName](d.action.inputs));
            }

            if (!cacheHelper.isOCCTObject(res)) {
                result = res;
            }
            else if (Array.isArray(res)) {
                result = res.map(r => ({ hash: r.hash, type: 'occ-shape' })); // if we return multiple shapes we should return array of cached hashes
            } else {
                result = { hash: res.hash, type: 'occ-shape' };
            }
        }
        if (d.action.functionName === 'saveShapeSTEP') {
            d.action.inputs.shape = cacheHelper.checkCache(d.action.inputs.shape.hash);
            result = openCascade.io.saveShapeSTEP(d.action.inputs);
        }
        if (d.action.functionName === 'shapeToMesh') {
            d.action.inputs.shape = cacheHelper.checkCache(d.action.inputs.shape.hash);
            result = openCascade.shapeToMesh(d.action.inputs.shape, d.action.inputs.precision, d.action.inputs.adjustYtoZ);
        }
        // Only the cache that was created in previous run has to be kept, the rest needs to go
        if (d.action.functionName === 'startedTheRun') {
            // if certain threshold is reacherd we clean all the cache
            if (cacheHelper && Object.keys(cacheHelper.usedHashes).length > 10000) {
                cacheHelper.cleanAllCache();
            }
            result = {};
            // if (Object.keys(cacheHelper.hashesFromPreviousRun).length > 0) {
            //     cacheHelper.cleanUpCache();
            //     result = {
            //         argCache: Object.keys(cacheHelper.argCache),
            //         hashesFromPreviousRun: Object.keys(cacheHelper.hashesFromPreviousRun),
            //         usedHashes: Object.keys(cacheHelper.usedHashes),
            //     };
            // }
            // else {
            //     result = {};
            // }
        }

        if (d.action.functionName === 'cleanAllCache') {
            cacheHelper.cleanAllCache();
            result = {};
        }

        // Returns only the hash as main process can't receive pointers
        // But with hash reference we can always initiate further computations
        postMessage({
            uid: d.uid,
            result
        });
    } catch (e) {
        let props;
        if (d && d.action && d.action.inputs) {
            props = `Input values were: {${Object.keys(d.action.inputs).map(key => `${key}: ${d.action.inputs[key]}`).join(',')}}. `;
        }
        let fun;
        if (d && d.action && d.action.functionName) {
            fun = `- ${d.action.functionName}`;
        }
        const message =
            postMessage({
                uid: d.uid,
                result: undefined,
                error: `OCCT computation failed. ${e}. While executing function ${fun}. ${props}`
            });
    }
};
