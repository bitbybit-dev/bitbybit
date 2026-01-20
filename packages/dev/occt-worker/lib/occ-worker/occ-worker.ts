import { BitbybitOcctModule } from "@bitbybit-dev/occt/bitbybit-dev-occt/bitbybit-dev-occt";
import { ShapesHelperService, VectorHelperService, OccHelper, OCCTService, Models } from "@bitbybit-dev/occt";
import { CacheHelper } from "./cache-helper";

let openCascade: OCCTService;
let cacheHelper: CacheHelper;

let dependencies;

export const initializationComplete = (occ: BitbybitOcctModule, plugins: any, doNotPost?: boolean) => {
    cacheHelper = new CacheHelper(occ);
    const vecService = new VectorHelperService();
    const shapesService = new ShapesHelperService();

    openCascade = new OCCTService(occ, new OccHelper(vecService, shapesService, occ));
    if (plugins) {
        openCascade.plugins = plugins;
        if (dependencies) {
            Object.keys(dependencies).forEach(c => {
                openCascade.plugins.dependencies[c] = dependencies[c];
            });
        }
    }
    if (!doNotPost) {
        postMessage("occ-initialised");
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
    postMessage("busy");

    let result;
    try {
        // Ok, so this is baked in memoization as all OCC computations are potentially very expensive
        // we can always return already computed entity hashes. On UI side we only deal with hashes as long
        // as we don't need to render things and when we do need, we call tessellation methods with these hashes
        // and receive real objects. This cache is useful in modeling operations throughout 'run' sessions.
        if (d.action.functionName !== "shapeToMesh" &&
            d.action.functionName !== "shapesToMeshes" &&
            d.action.functionName !== "deleteShape" &&
            d.action.functionName !== "deleteShapes" &&
            d.action.functionName !== "startedTheRun" &&
            d.action.functionName !== "cleanAllCache" &&
            d.action.functionName !== "addOc" &&
            d.action.functionName !== "saveShapeSTEP") {
            // if inputs have shape or shapes properties, these are hashes on which the operations need to be performed.
            // We thus replace these hashes to real objects from the cache before functions are called,
            // this probably looks like smth generic but isn't, so will need to check if it works
            Object.keys(d.action.inputs).forEach(key => {
                const val = d.action.inputs[key];
                if (val && val.type && val.type === "occ-shape" && val.hash) {
                    const cachedShape = cacheHelper.checkCache(d.action.inputs[key].hash);
                    if (!cachedShape) {
                        throw new Error(`Shape with hash ${d.action.inputs[key].hash} not found in cache. The cache may have been cleaned. Please regenerate the shape.`);
                    }
                    d.action.inputs[key] = cachedShape;
                }
                if (val && Array.isArray(val) && val.length > 0) {
                    if ((val[0].type && val[0].type === "occ-shape" && val[0].hash)) {
                        d.action.inputs[key] = d.action.inputs[key].map(shape => {
                            const cachedShape = cacheHelper.checkCache(shape.hash);
                            if (!cachedShape) {
                                throw new Error(`Shape with hash ${shape.hash} not found in cache. The cache may have been cleaned. Please regenerate the shape.`);
                            }
                            return cachedShape;
                        });
                    } else if ((Array.isArray(val[0]) && val[0][0].type && val[0][0].type === "occ-shape" && val[0][0].hash)) {
                        d.action.inputs[key] = d.action.inputs[key].map(shapes => shapes.map(shape => {
                            const cachedShape = cacheHelper.checkCache(shape.hash);
                            if (!cachedShape) {
                                throw new Error(`Shape with hash ${shape.hash} not found in cache. The cache may have been cleaned. Please regenerate the shape.`);
                            }
                            return cachedShape;
                        }));
                    }
                }
            });

            const path = d.action.functionName.split(".");
            let res;
            if (path.length === 3) {
                res = cacheHelper.cacheOp(d.action, () => openCascade[path[0]][path[1]][path[2]](d.action.inputs));
            } else if (path.length === 2) {
                res = cacheHelper.cacheOp(d.action, () => openCascade[path[0]][path[1]](d.action.inputs));
            } else {
                res = cacheHelper.cacheOp(d.action, () => openCascade[d.action.functionName](d.action.inputs));
            }

            if (!cacheHelper.isOCCTObject(res)) {
                if (res.compound && res.data && res.shapes && res.shapes.length > 0) {
                    const r: Models.OCCT.ObjectDefinition<any, any> = res;
                    r.shapes = r.shapes.map(s => ({ id: s.id, shape: { hash: s.shape.hash, type: "occ-shape" } }));
                    r.compound = { hash: r.compound.hash, type: "occ-shape" };
                    result = r;
                } else {
                    result = res;
                }

            }
            else if (Array.isArray(res)) {
                result = res.map(r => ({ hash: r.hash, type: "occ-shape" })); // if we return multiple shapes we should return array of cached hashes
            } else {
                result = { hash: res.hash, type: "occ-shape" };
            }
        }
        if (d.action.functionName === "saveShapeSTEP") {
            const cachedShape = cacheHelper.checkCache(d.action.inputs.shape.hash);
            if (!cachedShape) {
                throw new Error(`Shape with hash ${d.action.inputs.shape.hash} not found in cache. The cache may have been cleaned. Please regenerate the shape.`);
            }
            d.action.inputs.shape = cachedShape;
            result = openCascade.io.saveShapeSTEP(d.action.inputs);
        }
        if (d.action.functionName === "addOc") {
            if (openCascade && openCascade.plugins) {
                Object.keys(d.action.inputs).forEach(c => {
                    openCascade.plugins.dependencies[c] = d.action.inputs[c];
                });
            } else {
                dependencies = d.action.inputs;
            }
        }
        if (d.action.functionName === "shapeToMesh") {
            const cachedShape = cacheHelper.checkCache(d.action.inputs.shape.hash);
            if (!cachedShape) {
                throw new Error(`Shape with hash ${d.action.inputs.shape.hash} not found in cache. The cache may have been cleaned. Please regenerate the shape.`);
            }
            d.action.inputs.shape = cachedShape;
            result = openCascade.shapeToMesh(d.action.inputs);
        }
        if (d.action.functionName === "shapesToMeshes") {
            if (d.action.inputs.shapes && d.action.inputs.shapes.length > 0) {
                d.action.inputs.shapes = d.action.inputs.shapes.map(shape => {
                    const cachedShape = cacheHelper.checkCache(shape.hash);
                    if (!cachedShape) {
                        throw new Error(`Shape with hash ${shape.hash} not found in cache. The cache may have been cleaned. Please regenerate the shape.`);
                    }
                    return cachedShape;
                });
            } else {
                throw new Error("No shapes detected");
            }
            result = openCascade.shapesToMeshes(d.action.inputs);
        }
        if (d.action.functionName === "deleteShape") {
            cacheHelper.cleanCacheForHash(d.action.inputs.shape.hash);
            result = {};
        }
        if (d.action.functionName === "deleteShapes") {
            d.action.inputs.shapes.forEach(shape => cacheHelper.cleanCacheForHash(shape.hash));
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
            error: `OCCT computation failed. ${e} While executing function ${fun}. ${props}`
        });
    }
};
