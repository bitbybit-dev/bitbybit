/**
 * ThreeJS-specific constants for DrawHelper implementation.
 * Re-exports shared constants from @bitbybit-dev/core and adds ThreeJS-specific defaults.
 */

// Re-export shared constants from core
export {
    MATERIAL_DEFAULTS,
    GEOMETRY_DEFAULTS,
    DEFAULT_COLORS,
    CACHE_CONFIG,
    LogLevel,
} from "@bitbybit-dev/core";

// Import for type usage
import type { MaterialDefaults, GeometryDefaults, DefaultColors, CacheConfig } from "@bitbybit-dev/core";

/**
 * ThreeJS-specific material property names (uses roughness instead of gloss)
 */
export const THREEJS_MATERIAL_DEFAULTS = {
    /** Use roughness instead of gloss for ThreeJS PBR materials */
    ROUGHNESS: {
        SURFACE: 0.7,
        JSCAD: 0.6,
        OCCT: 0.8,
        MANIFOLD: 0.7,
    },
} as const;

// Re-export type definitions
export type { MaterialDefaults, GeometryDefaults, DefaultColors, CacheConfig };
