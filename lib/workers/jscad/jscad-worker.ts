import { CacheHelper } from './cache-helper';
import { Jscad } from './jscad-service';

let jscad: Jscad;
let cacheHelper: CacheHelper;

export const initializationComplete = (jcd: any) => {
    cacheHelper = new CacheHelper(jcd);
    console.log(jcd);
    jscad = new Jscad(jcd);
    postMessage('jscad-initialised');
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

        if (d.action.functionName !== 'startedTheRun' &&
            d.action.functionName !== 'cleanAllCache') {

            // if (d.action.functionName !== 'shapeToMesh' &&
            //     d.action.functionName !== 'downloadSolidSTL' &&
            //     d.action.functionName !== 'downloadSolidsSTL' &&
            //     d.action.functionName !== 'startedTheRun' &&
            //     d.action.functionName !== 'cleanAllCache' &&
            //     d.action.functionName !== 'saveShapeSTEP') {
            // if inputs have shape or shapes properties, these are hashes on which the operations need to be performed.
            // We thus replace these hashes to real objects from the cache before functions are called,
            // this probably looks like smth generic but isn't, so will need to check if it works

            // if (d.action.inputs.mesh) {
            //     d.action.inputs.mesh = cacheHelper.checkCache(d.action.inputs.mesh);
            // }

            // if (d.action.inputs.meshes && d.action.inputs.meshes.length > 0) {
            //     d.action.inputs.meshes = d.action.inputs.meshes.map(hash => cacheHelper.checkCache(hash));
            // } else if (!isNaN(d.action.inputs.meshes)) {
            //     d.action.inputs.meshes = cacheHelper.checkCache(d.action.inputs.meshes);
            // }
            // if (d.action.inputs.geometry) {
            //     d.action.inputs.geometry = cacheHelper.checkCache(d.action.inputs.geometry);
            // }
            // if (d.action.inputs.objects && d.action.inputs.objects.length > 0) {
            //     d.action.inputs.objects = d.action.inputs.objects.map(hash => cacheHelper.checkCache(hash));
            // }

            // this is service and path
            const path = d.action.functionName.split('.');
            if (path.length === 2) {
                // result = jscad[path[0]][path[1]](d.action.inputs);
                result = cacheHelper.cacheOp(d.action, () => jscad[path[0]][path[1]](d.action.inputs));
            } else {
                // result = jscad[d.action.functionName](d.action.inputs);
                result = cacheHelper.cacheOp(d.action, () => jscad[d.action.functionName](d.action.inputs));
            }
            // result = () => jscad[d.action.functionName](d.action.inputs);
        }
       
        // if (d.action.functionName === 'shapeToMesh') {
        //     if (d.action.inputs.mesh) {
        //         d.action.inputs.mesh = cacheHelper.checkCache(d.action.inputs.mesh);
        //         result = jscad.shapeToMesh(d.action.inputs);

        //     } else if (d.action.inputs.meshes && d.action.inputs.meshes.length > 0) {
        //         const meshes = d.action.inputs.meshes.map(hash => cacheHelper.checkCache(hash));

        //         result = meshes.map((mesh) => {
        //             return jscad.shapeToMesh({ ...d.action.inputs, mesh });
        //         })
        //     }else if (!isNaN(d.action.inputs.meshes)) {
        //         const meshes = d.action.inputs.meshes = cacheHelper.checkCache(d.action.inputs.meshes);

        //         result = meshes.map((mesh) => {
        //             return jscad.shapeToMesh({ ...d.action.inputs, mesh });
        //         })
        //     }
        // }

        // if (d.action.functionName === 'downloadSolidSTL') {
        //     if (d.action.inputs.mesh) {
        //         d.action.inputs.mesh = cacheHelper.checkCache(d.action.inputs.mesh);
        //         result = jscad.downloadSolidSTL(d.action.inputs);
        //     }
        // }

        // if (d.action.functionName === 'downloadSolidsSTL') {
        //     if (d.action.inputs.meshes && d.action.inputs.meshes.length > 0) {
        //         d.action.inputs.meshes = d.action.inputs.meshes.map(hash => cacheHelper.checkCache(hash));
        //         result = jscad.downloadSolidsSTL(d.action.inputs);
        //     }else if (!isNaN(d.action.inputs.meshes)) {
        //         const meshes = d.action.inputs.meshes = cacheHelper.checkCache(d.action.inputs.meshes);
        //         result = jscad.downloadSolidsSTL({ ...d.action.inputs, meshes });
        //     }
        // }
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
                error: `JSCAD computation failed when executing function ${fun}. ${props}Original message: ${e}`
            });
    }
};
