// The doc of the Manifold inputs namespace itself; scripts/gen-inputs.mjs places it above `export namespace Manifold`.

/**
 * Every parameter object the Manifold kernel accepts. Manifold specialises in fast, reliably
 * watertight mesh booleans, so its DTOs carry manifold handles and the settings that keep results
 * valid - segment counts, precision and the operands of a boolean.
 * 
 * It also models in 2D: cross sections can be built, offset and booleaned in the plane, then extruded
 * or revolved into solids, which is often the cheapest route to a profile-driven part. Names repeat
 * across kernels: the CircleDto here is not the one in Inputs.OCCT.
 */
