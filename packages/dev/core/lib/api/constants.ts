/**
 * Shared constants for DrawHelper implementations across all game engines.
 * These constants ensure consistency between PlayCanvas, ThreeJS, and BabylonJS implementations.
 */

/**
 * Default material properties for different geometry types
 */
export const MATERIAL_DEFAULTS = {
    /** Depth bias to prevent z-fighting between faces and edges */
    DEPTH_BIAS: 2,
    /** Slope-dependent depth bias */
    SLOPE_DEPTH_BIAS: 2,
    
    /** Metalness values for PBR materials */
    METALNESS: {
        /** For VERB surfaces */
        SURFACE: 0.5,
        /** For JSCAD meshes */
        JSCAD: 0.4,
        /** For OCCT shapes */
        OCCT: 0.4,
        /** For Manifold shapes */
        MANIFOLD: 0.5,
    },
    
    /** Roughness values for PBR materials (inverse of gloss) */
    ROUGHNESS: {
        /** For VERB surfaces */
        SURFACE: 0.7,
        /** For JSCAD meshes */
        JSCAD: 0.6,
        /** For OCCT shapes */
        OCCT: 0.8,
        /** For Manifold shapes */
        MANIFOLD: 0.7,
    },

    /** Gloss values for PBR materials (PlayCanvas uses gloss instead of roughness) */
    GLOSS: {
        /** For VERB surfaces */
        SURFACE: 0.3,
        /** For JSCAD meshes */
        JSCAD: 0.4,
        /** For OCCT shapes */
        OCCT: 0.2,
        /** For Manifold shapes */
        MANIFOLD: 0.3,
    },
} as const;

/**
 * Default geometry rendering options
 */
export const GEOMETRY_DEFAULTS = {
    /** Default line width for polylines and edges */
    LINE_WIDTH: 2,
    /** Default point/sphere size */
    POINT_SIZE: 0.1,
    /** Default opacity (fully opaque) */
    OPACITY: 1,
    /** Default edge width for OCCT shapes */
    EDGE_WIDTH: 2,
    /** Default vertex size for OCCT shapes */
    VERTEX_SIZE: 0.03,
    /** Default tessellation precision for OCCT shapes */
    PRECISION: 0.01,
    /** Default edge index label height */
    EDGE_INDEX_HEIGHT: 0.06,
    /** Default face index label height */
    FACE_INDEX_HEIGHT: 0.06,
    /** Default text line spacing */
    TEXT_LINE_SPACING: 1.5,
    /** Default text vertical offset */
    TEXT_VERTICAL_OFFSET: 0.05,
    /** Default polyline width adjustment */
    POLYLINE_WIDTH: 0.2,
} as const;

/**
 * Default color values (hex strings)
 */
export const DEFAULT_COLORS = {
    /** Default color for basic geometry */
    DEFAULT: "#ff0000",
    /** Default edge color for OCCT shapes */
    EDGE: "#ffffff",
    /** Default polyline color */
    POLYLINE: "#ff00ff",
    /** Default vertex color for OCCT shapes */
    VERTEX: "#ffaaff",
    /** Default face color for OCCT shapes */
    FACE: "#ff0000",
    /** Default back face color - blue to distinguish face orientation */
    BACK_FACE: "#0000ff",
    /** Default edge index label color */
    EDGE_INDEX: "#ff00ff",
    /** Default face index label color */
    FACE_INDEX: "#0000ff",
    /** Default cross-section color for Manifold */
    CROSS_SECTION: "#ff00ff",
} as const;

/**
 * Material cache configuration
 */
export const CACHE_CONFIG = {
    /** Maximum number of materials to cache per scene */
    MAX_MATERIALS: 1000,
    /** Precision for alpha value comparison (decimal places) */
    ALPHA_PRECISION: 4,
} as const;

/**
 * Logging levels for DrawHelper
 */
export enum LogLevel {
    NONE = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4,
}

/**
 * Type definitions for constants
 */
export type MaterialDefaults = typeof MATERIAL_DEFAULTS;
export type GeometryDefaults = typeof GEOMETRY_DEFAULTS;
export type DefaultColors = typeof DEFAULT_COLORS;
export type CacheConfig = typeof CACHE_CONFIG;
