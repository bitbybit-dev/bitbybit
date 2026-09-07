// The doc of the JSCAD inputs namespace itself; scripts/gen-inputs.mjs places it above `export namespace JSCAD`.

/**
 * Every parameter object the JSCAD kernel accepts. JSCAD models by combining primitives with
 * booleans, expansions, hulls and extrusions, working on tessellated geometry rather than exact
 * surfaces, so its DTOs carry mesh-level settings - segment counts, corner styles, expansion deltas -
 * where the OCCT equivalents would carry tolerances.
 * 
 * It is lighter and quicker to start with than OCCT and a good fit when a shape is a combination of
 * simple volumes and manufacturing-grade surface accuracy is not required. Names repeat across
 * kernels: the CircleDto here is not the one in Inputs.OCCT.
 */
