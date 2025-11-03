import { CacheHelper } from "./cache-helper";
import { Jscad } from "@bitbybit-dev/jscad";

let jscad: Jscad;
let cacheHelper: CacheHelper;

export const initializationComplete = (jcd: any, plugins?: any, doNotPost?: boolean) => {
    cacheHelper = new CacheHelper();
    jscad = new Jscad(jcd);
    if (!doNotPost) {
        postMessage("jscad-initialised");
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
    uid: string;
};

export const onMessageInput = (d: DataInput, postMessage) => {
    postMessage("busy");

    let result;
    try {
        if (d.action.functionName !== "startedTheRun" &&
            d.action.functionName !== "cleanAllCache") {

            // If inputs have geometry properties with hashes, replace them with cached objects
            Object.keys(d.action.inputs).forEach(key => {
                const val = d.action.inputs[key];
                if (val && val.type && val.type === "jscad-geometry" && val.hash) {
                    const cachedGeometry = cacheHelper.checkCache(d.action.inputs[key].hash);
                    if (!cachedGeometry) {
                        throw new Error(`Geometry with hash ${d.action.inputs[key].hash} not found in cache. The cache may have been cleaned. Please regenerate the geometry.`);
                    }
                    d.action.inputs[key] = cachedGeometry;
                }
                if (val && Array.isArray(val) && val.length > 0) {
                    if ((val[0].type && val[0].type === "jscad-geometry" && val[0].hash)) {
                        d.action.inputs[key] = d.action.inputs[key].map(geometry => {
                            const cachedGeometry = cacheHelper.checkCache(geometry.hash);
                            if (!cachedGeometry) {
                                throw new Error(`Geometry with hash ${geometry.hash} not found in cache. The cache may have been cleaned. Please regenerate the geometry.`);
                            }
                            return cachedGeometry;
                        });
                    } else if ((Array.isArray(val[0]) && val[0][0].type && val[0][0].type === "jscad-geometry" && val[0][0].hash)) {
                        d.action.inputs[key] = d.action.inputs[key].map(geometries => geometries.map(geometry => {
                            const cachedGeometry = cacheHelper.checkCache(geometry.hash);
                            if (!cachedGeometry) {
                                throw new Error(`Geometry with hash ${geometry.hash} not found in cache. The cache may have been cleaned. Please regenerate the geometry.`);
                            }
                            return cachedGeometry;
                        }));
                    }
                }
            });

            // this is service and path
            const path = d.action.functionName.split(".");
            if (path.length === 2) {
                result = cacheHelper.cacheOp(d.action, () => jscad[path[0]][path[1]](d.action.inputs));
            } else {
                result = cacheHelper.cacheOp(d.action, () => jscad[d.action.functionName](d.action.inputs));
            }
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
            props = `Input values were: {${Object.keys(d.action.inputs).map(key => `${key}: ${d.action.inputs[key]}`).join(",")}}. `;
        }
        let fun;
        if (d && d.action && d.action.functionName) {
            fun = `- ${d.action.functionName}`;
        }
        postMessage({
            uid: d.uid,
            result: undefined,
            error: `JSCAD computation failed when executing function ${fun}. ${props}Original message: ${e}`
        });
    }
};
