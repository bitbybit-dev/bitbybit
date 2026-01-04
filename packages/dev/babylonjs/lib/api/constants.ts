/**
 * BabylonJS-specific constants for DrawHelper implementation.
 * Re-exports shared constants from core and adds BabylonJS-specific values.
 */

// Re-export shared constants from core
export {
    MATERIAL_DEFAULTS,
    GEOMETRY_DEFAULTS,
    DEFAULT_COLORS,
    CACHE_CONFIG,
    LogLevel,
} from "@bitbybit-dev/core";

/**
 * BabylonJS-specific material defaults
 * BabylonJS uses PBRMetallicRoughnessMaterial which has similar properties
 */
export const BABYLONJS_MATERIAL_DEFAULTS = {
    /** Default metallic value for BabylonJS materials */
    METALLIC: 1.0,
    /** Default roughness values for BabylonJS materials */
    ROUGHNESS: {
        SURFACE: 0.6,
        JSCAD: 0.6,
        OCCT: 0.6,
        MANIFOLD: 0.6,
    },
    /** Default alpha mode for transparent materials */
    ALPHA_MODE: 1,
} as const;
