/**
 * Every parameter object the IFC library accepts. IFC is the open BIM exchange format: a model is a
 * graph of building elements, the storeys that contain them, their materials, types and properties,
 * with geometry kept as parametric extrusions and clippings.
 *
 * Every method that changes a model takes one and returns a new one, leaving the one it was given
 * as it was, so keep the result and pass it on. Lengths are in the model's length unit, millimetres
 * unless the model was created with another; positions on a storey are in its plan, X and Y, with Z
 * up from the storey's elevation. Experimental, as the IFC library is.
 * @beta
 */
