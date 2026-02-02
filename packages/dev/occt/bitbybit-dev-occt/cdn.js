import createBitbybitDevOcctOriginal from "./bitbybit-dev-occt.js";
import { GlobalCDNProvider } from "@bitbybit-dev/base";


/**
 * Extended createBitbybitDevOcct that uses CDN-hosted WASM file by default.
 * This has the same interface as the original createBitbybitDevOcct but
 * automatically configures locateFile to use the CDN for WASM loading.
 * 
 * This is designed for browser/webworker usage where bundling the WASM
 * is problematic (e.g., with webpack).
 *
 * @param moduleOverrides - Emscripten module configuration options
 * @returns Promise that resolves to the initialized OCCT module
 */
const createBitbybitDevOcct = (moduleOverrides = {}) => {
    const cdnWasmUrl = "https://app-store.bitbybit.dev/files/bitbybit-dev-occt.dec37f82.wasm";
    
    // If user provided their own locateFile, wrap it to preserve their customizations
    const userLocateFile = moduleOverrides.locateFile;
    
    return createBitbybitDevOcctOriginal({
        ...moduleOverrides,
        locateFile(path, scriptDirectory) {
            // First check if user wants to handle this path
            if (userLocateFile) {
                const userResult = userLocateFile(path, scriptDirectory);
                if (userResult) {
                    return userResult;
                }
            }
            // Default: use CDN for WASM files
            if (path.endsWith(".wasm")) {
                return cdnWasmUrl;
            }
            return scriptDirectory + path;
        }
    });
};

export default createBitbybitDevOcct;
