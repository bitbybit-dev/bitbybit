// The doc of the OCCT inputs namespace itself; scripts/gen-inputs.mjs places it above `export namespace OCCT`.

/**
 * Every parameter object the OpenCascade kernel accepts. The kernel works on a boundary
 * representation - vertices, edges, wires, faces, shells, solids and compounds - so most DTOs here
 * carry one or more shape handles plus the numbers that drive the operation: radii, lengths,
 * directions, tolerances and fillet or chamfer sizes.
 * 
 * Two things are worth knowing before reading further. Shape arguments are opaque handles returned
 * by a previous call, not geometry you construct by hand, so operations chain: build a wire, turn it
 * into a face, extrude the face into a solid. And the names deliberately repeat across kernels -
 * there is a CircleDto here, another in Inputs.JSCAD, another in Inputs.Manifold and another in
 * Inputs.Verb - so check the namespace, not just the class name.
 */
