import { CacheHelper } from "./cache-helper";
import { Jscad } from "./jscad-service";

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
