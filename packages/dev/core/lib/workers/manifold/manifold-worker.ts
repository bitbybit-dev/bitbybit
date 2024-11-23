import { CacheHelper, ObjectDefinition } from "./cache-helper";
import { ManifoldService } from "./manifold-service";

let manifold: ManifoldService;
let cacheHelper: CacheHelper;
let dependencies;

export const initializationComplete = (mnf: any, plugins?: any, doNotPost?: boolean) => {
    cacheHelper = new CacheHelper();
    manifold = new ManifoldService(mnf);
    if (!doNotPost) {
        postMessage("manifold-initialised");
    }
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
    postMessage("busy");

    let result;
    try {
        // Ok, so this is baked in memoization as all Manifold computations are potentially expensive
        // we can always return already computed entity hashes. On UI side we only deal with hashes as long
        // as we don't need to render things and when we do need, we call tessellation methods with these hashes
        // and receive real objects. This cache is useful in modeling operations throughout 'run' sessions.
        if (d.action.functionName !== "manifoldToMesh" &&
            d.action.functionName !== "manifoldsToMeshes" &&
            d.action.functionName !== "deleteShape" &&
            d.action.functionName !== "deleteShapes" &&
            d.action.functionName !== "startedTheRun" &&
            d.action.functionName !== "cleanAllCache" &&
            d.action.functionName !== "addManifoldPluginDependency") {
            // if inputs have manifold or manifolds properties, these are hashes on which the operations need to be performed.
            // We thus replace these hashes to real objects from the cache before functions are called,
            // this probably looks like smth generic but isn't, so will need to check if it works
            Object.keys(d.action.inputs).forEach(key => {
                const val = d.action.inputs[key];
                if (val && val.type && val.type === "manifold-shape" && val.hash) {
                    d.action.inputs[key] = cacheHelper.checkCache(d.action.inputs[key].hash);
                }
                if (val && Array.isArray(val) && val.length > 0) {
                    if ((val[0].type && val[0].type === "manifold-shape" && val[0].hash)) {
                        d.action.inputs[key] = d.action.inputs[key].map(manifold => cacheHelper.checkCache(manifold.hash));
                    } else if ((Array.isArray(val[0]) && val[0][0].type && val[0][0].type === "manifold-shape" && val[0][0].hash)) {
                        d.action.inputs[key] = d.action.inputs[key].map(manifolds => manifolds.map(manifold => cacheHelper.checkCache(manifold.hash)));
                    }
                }
            });

            const path = d.action.functionName.split(".");
            let res;
            if (path.length === 3) {
                res = cacheHelper.cacheOp(d.action, () => manifold[path[0]][path[1]][path[2]](d.action.inputs));
            } else if (path.length === 2) {
                res = cacheHelper.cacheOp(d.action, () => manifold[path[0]][path[1]](d.action.inputs));
            } else {
                res = cacheHelper.cacheOp(d.action, () => manifold[d.action.functionName](d.action.inputs));
            }

            if (!cacheHelper.isManifoldObject(res)) {
                if (res.compound && res.data && res.manifolds && res.manifolds.length > 0) {
                    const r: ObjectDefinition<any, any> = res;
                    r.manifolds = r.manifolds.map(s => ({ id: s.id, manifold: { hash: s.manifold.hash, type: "manifold-shape" } }));
                    r.compound = { hash: r.compound.hash, type: "manifold-shape" };
                    result = r;
                } else {
                    result = res;
                }
            }
            else if (Array.isArray(res)) {
                result = res.map(r => ({ hash: r.hash, type: "manifold-shape" })); // if we return multiple shapes we should return array of cached hashes
            } else {
                result = { hash: res.hash, type: "manifold-shape" };
            }
        }
        if (d.action.functionName === "addManifoldPluginDependency") {
            if (manifold && manifold.plugins) {
                Object.keys(d.action.inputs).forEach(c => {
                    manifold.plugins.dependencies[c] = d.action.inputs[c];
                });
            } else {
                dependencies = d.action.inputs;
            }
        }
        if (d.action.functionName === "manifoldToMesh") {
            d.action.inputs.manifold = cacheHelper.checkCache(d.action.inputs.manifold.hash);
            result = manifold.manifoldToMesh(d.action.inputs);
        }
        if (d.action.functionName === "manifoldsToMeshes") {
            if (d.action.inputs.manifolds && d.action.inputs.manifolds.length > 0) {
                d.action.inputs.manifolds = d.action.inputs.manifolds.map(manifold => cacheHelper.checkCache(manifold.hash));
            } else {
                throw new Error("No manifolds detected");
            }
            result = manifold.manifoldsToMeshes(d.action.inputs);
        }
        if (d.action.functionName === "deleteShape") {
            cacheHelper.cleanCacheForHash(d.action.inputs.shape.hash);
            result = {};
        }
        if (d.action.functionName === "deleteShapes") {
            d.action.inputs.manifolds.forEach(manifold => cacheHelper.cleanCacheForHash(manifold.hash));
            result = {};
        }
        // Only the cache that was created in previous run has to be kept, the rest needs to go
        if (d.action.functionName === "startedTheRun") {
            // if certain threshold is reacherd we clean all the cache
            if (cacheHelper && Object.keys(cacheHelper.usedHashes).length > 10000) {
                cacheHelper.cleanAllCache();
            }
            result = {};
        }

        if (d.action.functionName === "cleanAllCache") {
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
            props = `Input values were: {${Object.keys(d.action.inputs).map(key => `${key}: ${JSON.stringify(d.action.inputs[key])}`).join(",")}}. `;
        }
        let fun;
        if (d && d.action && d.action.functionName) {
            fun = `- ${d.action.functionName}`;
        }
        
        postMessage({
            uid: d.uid,
            result: undefined,
            error: `Manifold computation failed. ${e} While executing function ${fun}. ${props}`
        });
    }
};