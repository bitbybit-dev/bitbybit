import { CacheHelper, ObjectDefinition } from "./cache-helper";
import { ManifoldService } from "@bitbybit-dev/manifold";

let manifold: ManifoldService;
let cacheHelper: CacheHelper;

export const initializationComplete = (mnf: any, _plugins?: any, doNotPost?: boolean) => {
    cacheHelper = new CacheHelper();
    manifold = new ManifoldService(mnf);
    if (!doNotPost) {
        postMessage("manifold-initialised");
    }
};

export type DataInput = {
    /**
     * Action data is used for cashing as a hashed number.
     */
    action: {
        functionName: string;
        inputs: any;
    }
    uid: string;
};

type HashedManifold = { hash: string | number };
type Callable = (inputs: unknown) => unknown;

export const onMessageInput = (d: DataInput, postMessage: (message: unknown) => void) => {
    postMessage("busy");

    let result;
    try {
        if (d.action.functionName !== "manifoldToMesh" &&
            d.action.functionName !== "manifoldsToMeshes" &&
            d.action.functionName !== "deleteManifoldOrCrossSection" &&
            d.action.functionName !== "deleteManifoldsOrCrossSections" &&
            d.action.functionName !== "manifoldToMeshPointer" &&
            d.action.functionName !== "startedTheRun" &&
            d.action.functionName !== "cleanAllCache" &&
            d.action.functionName !== "addManifoldPluginDependency") {
            Object.keys(d.action.inputs).forEach(key => {
                const val = d.action.inputs[key];
                if (val && val.type && val.type === "manifold-shape" && val.hash) {
                    const cachedManifold = cacheHelper.checkCache(d.action.inputs[key].hash);
                    if (!cachedManifold) {
                        throw new Error(`Manifold with hash ${d.action.inputs[key].hash} not found in cache. The cache may have been cleaned. Please regenerate the manifold.`);
                    }
                    d.action.inputs[key] = cachedManifold;
                }
                if (val && Array.isArray(val) && val.length > 0) {
                    if ((val[0].type && val[0].type === "manifold-shape" && val[0].hash)) {
                        d.action.inputs[key] = d.action.inputs[key].map((manifold: HashedManifold) => {
                            const cachedManifold = cacheHelper.checkCache(manifold.hash);
                            if (!cachedManifold) {
                                throw new Error(`Manifold with hash ${manifold.hash} not found in cache. The cache may have been cleaned. Please regenerate the manifold.`);
                            }
                            return cachedManifold;
                        });
                    } else if ((Array.isArray(val[0]) && val[0][0].type && val[0][0].type === "manifold-shape" && val[0][0].hash)) {
                        d.action.inputs[key] = d.action.inputs[key].map((manifolds: HashedManifold[]) => manifolds.map((manifold: HashedManifold) => {
                            const cachedManifold = cacheHelper.checkCache(manifold.hash);
                            if (!cachedManifold) {
                                throw new Error(`Manifold with hash ${manifold.hash} not found in cache. The cache may have been cleaned. Please regenerate the manifold.`);
                            }
                            return cachedManifold;
                        }));
                    }
                }
            });

            const path = d.action.functionName.split(".");
            let res;
            if (path.length === 3) {
                res = cacheHelper.cacheOp(d.action, () => (manifold as unknown as Record<string, Record<string, Record<string, Callable>>>)[path[0]!]![path[1]!]![path[2]!]!(d.action.inputs));
            } else if (path.length === 2) {
                res = cacheHelper.cacheOp(d.action, () => (manifold as unknown as Record<string, Record<string, Callable>>)[path[0]!]![path[1]!]!(d.action.inputs));
            } else {
                res = cacheHelper.cacheOp(d.action, () => (manifold as unknown as Record<string, Callable>)[d.action.functionName]!(d.action.inputs));
            }

            if (!cacheHelper.isManifoldObject(res)) {
                if (res && res.compound && res.data && res.manifolds && res.manifolds.length > 0) {
                    const r: ObjectDefinition<any, any> = res;
                    r.manifolds = r.manifolds!.map(s => ({ id: s.id, manifold: { hash: s.manifold.hash, type: "manifold-shape" } }));
                    r.compound = { hash: r.compound.hash, type: "manifold-shape" };
                    result = r;
                } else {
                    result = res;
                }
            }
            else if (Array.isArray(res)) {
                result = res.map(r => ({ hash: r.hash, type: "manifold-shape" }));
            } else {
                result = { hash: res.hash, type: "manifold-shape" };
            }
        }
        if (d.action.functionName === "addManifoldPluginDependency") {
            if (manifold && manifold.plugins) {
                Object.keys(d.action.inputs).forEach(c => {
                    manifold.plugins.dependencies[c] = d.action.inputs[c];
                });
            }
        }
        if (d.action.functionName === "manifoldToMesh") {
            const cachedManifold = cacheHelper.checkCache(d.action.inputs.manifold.hash);
            if (!cachedManifold) {
                throw new Error(`Manifold with hash ${d.action.inputs.manifold.hash} not found in cache. The cache may have been cleaned. Please regenerate the manifold.`);
            }
            d.action.inputs.manifold = cachedManifold;
            result = manifold.decomposeManifoldOrCrossSection(d.action.inputs);
        }
        if (d.action.functionName === "manifoldToMeshPointer") {
            const cachedManifold = cacheHelper.checkCache(d.action.inputs.manifold.hash);
            if (!cachedManifold) {
                throw new Error(`Manifold with hash ${d.action.inputs.manifold.hash} not found in cache. The cache may have been cleaned. Please regenerate the manifold.`);
            }
            d.action.inputs.manifold = cachedManifold;
            const r = manifold.manifold.manifoldToMesh(d.action.inputs);
            const hash = cacheHelper.computeHash(d.action);
            cacheHelper.addToCache(hash, r);
            result = { hash, type: "manifold-shape" };
        }
        if (d.action.functionName === "manifoldsToMeshes") {
            if (d.action.inputs.manifolds && d.action.inputs.manifolds.length > 0) {
                d.action.inputs.manifolds = d.action.inputs.manifolds.map((manifold: HashedManifold) => {
                    const cachedManifold = cacheHelper.checkCache(manifold.hash);
                    if (!cachedManifold) {
                        throw new Error(`Manifold with hash ${manifold.hash} not found in cache. The cache may have been cleaned. Please regenerate the manifold.`);
                    }
                    return cachedManifold;
                });
            } else {
                throw new Error("No manifolds detected");
            }
            result = manifold.decomposeManifoldsOrCrossSections(d.action.inputs);
        }
        if (d.action.functionName === "deleteManifoldOrCrossSection") {
            cacheHelper.cleanCacheForHash(d.action.inputs.manifoldOrCrossSection.hash);
            result = {};
        }
        if (d.action.functionName === "deleteManifoldsOrCrossSections") {
            d.action.inputs.manifoldsOrCrossSections.forEach((manifold: HashedManifold) => cacheHelper.cleanCacheForHash(manifold.hash));
            result = {};
        }
        if (d.action.functionName === "startedTheRun") {
            if (cacheHelper && Object.keys(cacheHelper.usedHashes).length > 10000) {
                cacheHelper.cleanAllCache();
            }
            result = {};
        }

        if (d.action.functionName === "cleanAllCache") {
            cacheHelper.cleanAllCache();
            result = {};
        }

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