// A fragment of the OCCT inputs namespace: scripts/gen-occ-inputs.mjs assembles every file in this
// directory, in file-name order, into ../occ-inputs.ts. Edit here, then regenerate.


/**
 * A 3D geometric curve - the underlying mathematical curve, as opposed to the topological edge
 * that carries it.
 *
 * A handle to a shape living inside the OpenCascade kernel, not the geometry itself. The kernel
 * runs as WebAssembly with its own memory, so what crosses back into JavaScript is this small
 * reference; pass it to the next operation to keep building. It cannot be inspected or edited
 * directly - use the shapes and query APIs for that - and it stays valid until the kernel's cache
 * is cleared.
 */
export type GeomCurvePointer = { hash: number, type: "occ-shape" };
/**
 * A curve in 2D parameter space, used when working on a surface's own UV domain rather than in
 * world coordinates.
 *
 * A handle to a shape living inside the OpenCascade kernel, not the geometry itself. The kernel
 * runs as WebAssembly with its own memory, so what crosses back into JavaScript is this small
 * reference; pass it to the next operation to keep building. It cannot be inspected or edited
 * directly - use the shapes and query APIs for that - and it stays valid until the kernel's cache
 * is cleared.
 */
export type Geom2dCurvePointer = { hash: number, type: "occ-shape" };
/**
 * A geometric surface - the underlying mathematical surface, as opposed to the topological face
 * bounded by wires that sits on it.
 *
 * A handle to a shape living inside the OpenCascade kernel, not the geometry itself. The kernel
 * runs as WebAssembly with its own memory, so what crosses back into JavaScript is this small
 * reference; pass it to the next operation to keep building. It cannot be inspected or edited
 * directly - use the shapes and query APIs for that - and it stays valid until the kernel's cache
 * is cleared.
 */
export type GeomSurfacePointer = { hash: number, type: "occ-shape" };
/**
 * A vertex: a single point in the topological structure, the end of an edge.
 *
 * A handle to a shape living inside the OpenCascade kernel, not the geometry itself. The kernel
 * runs as WebAssembly with its own memory, so what crosses back into JavaScript is this small
 * reference; pass it to the next operation to keep building. It cannot be inspected or edited
 * directly - use the shapes and query APIs for that - and it stays valid until the kernel's cache
 * is cleared.
 */
export type TopoDSVertexPointer = { hash: number, type: "occ-shape" };
/**
 * An edge: a bounded piece of a curve between two vertices.
 *
 * A handle to a shape living inside the OpenCascade kernel, not the geometry itself. The kernel
 * runs as WebAssembly with its own memory, so what crosses back into JavaScript is this small
 * reference; pass it to the next operation to keep building. It cannot be inspected or edited
 * directly - use the shapes and query APIs for that - and it stays valid until the kernel's cache
 * is cleared.
 */
export type TopoDSEdgePointer = { hash: number, type: "occ-shape" };
/**
 * A wire: a connected sequence of edges. A closed planar wire is what you turn into a face.
 *
 * A handle to a shape living inside the OpenCascade kernel, not the geometry itself. The kernel
 * runs as WebAssembly with its own memory, so what crosses back into JavaScript is this small
 * reference; pass it to the next operation to keep building. It cannot be inspected or edited
 * directly - use the shapes and query APIs for that - and it stays valid until the kernel's cache
 * is cleared.
 */
export type TopoDSWirePointer = { hash: number, type: "occ-shape" };
/**
 * A face: a bounded region of a surface, outlined by wires. Extrude, revolve or loft a face to
 * get a solid.
 *
 * A handle to a shape living inside the OpenCascade kernel, not the geometry itself. The kernel
 * runs as WebAssembly with its own memory, so what crosses back into JavaScript is this small
 * reference; pass it to the next operation to keep building. It cannot be inspected or edited
 * directly - use the shapes and query APIs for that - and it stays valid until the kernel's cache
 * is cleared.
 */
export type TopoDSFacePointer = { hash: number, type: "occ-shape" };
/**
 * A shell: a set of faces joined along their edges. Close a shell and it can become a solid.
 *
 * A handle to a shape living inside the OpenCascade kernel, not the geometry itself. The kernel
 * runs as WebAssembly with its own memory, so what crosses back into JavaScript is this small
 * reference; pass it to the next operation to keep building. It cannot be inspected or edited
 * directly - use the shapes and query APIs for that - and it stays valid until the kernel's cache
 * is cleared.
 */
export type TopoDSShellPointer = { hash: number, type: "occ-shape" };
/**
 * A solid: a closed, watertight volume, and the shape kind most downstream operations and
 * exporters expect.
 *
 * A handle to a shape living inside the OpenCascade kernel, not the geometry itself. The kernel
 * runs as WebAssembly with its own memory, so what crosses back into JavaScript is this small
 * reference; pass it to the next operation to keep building. It cannot be inspected or edited
 * directly - use the shapes and query APIs for that - and it stays valid until the kernel's cache
 * is cleared.
 */
export type TopoDSSolidPointer = { hash: number, type: "occ-shape" };
/**
 * A compound solid: several solids sharing faces, as in a partitioned volume.
 *
 * A handle to a shape living inside the OpenCascade kernel, not the geometry itself. The kernel
 * runs as WebAssembly with its own memory, so what crosses back into JavaScript is this small
 * reference; pass it to the next operation to keep building. It cannot be inspected or edited
 * directly - use the shapes and query APIs for that - and it stays valid until the kernel's cache
 * is cleared.
 */
export type TopoDSCompSolidPointer = { hash: number, type: "occ-shape" };
/**
 * A compound: an arbitrary grouping of shapes of any kind, moved and exported as one while
 * remaining separate inside.
 *
 * A handle to a shape living inside the OpenCascade kernel, not the geometry itself. The kernel
 * runs as WebAssembly with its own memory, so what crosses back into JavaScript is this small
 * reference; pass it to the next operation to keep building. It cannot be inspected or edited
 * directly - use the shapes and query APIs for that - and it stays valid until the kernel's cache
 * is cleared.
 */
export type TopoDSCompoundPointer = { hash: number, type: "occ-shape" };

/**
 * A handle to an OpenCascade document - the container used for assemblies, holding a shape
 * hierarchy along with names, colours and placements. This is what STEP assembly import and export
 * work against, as opposed to a single loose shape.
 */
export type TDocStdDocumentPointer = { hash: number, type: "occ-entity" };

/**
 * Any shape handle, whatever its kind - vertex, edge, wire, face, shell, solid or compound.
 * Operations that work on shapes generically take this; ones that need a specific kind take the
 * specific pointer type instead, which is how the types stop you passing an edge where a solid is
 * required.
 */
export type TopoDSShapePointer = TopoDSVertexPointer | TopoDSEdgePointer | TopoDSWirePointer | TopoDSFacePointer | TopoDSShellPointer | TopoDSSolidPointer | TopoDSCompoundPointer;

