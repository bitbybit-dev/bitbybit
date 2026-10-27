/**
 * A model, the elements to describe and how to group them for `geometry.recipe`.
 */
export class GeometryDto<T> {
    constructor(model?: T, elements?: string[], groupByClass?: boolean, propertySets?: boolean) {
        if (model !== undefined) { this.model = model; }
        if (elements !== undefined) { this.elements = elements; }
        if (groupByClass !== undefined) { this.groupByClass = groupByClass; }
        if (propertySets !== undefined) { this.propertySets = propertySets; }
    }
    /**
     * The model whose elements are described.
     * @default undefined
     */
    model!: T;
    /**
     * The elements to describe, each by GlobalId or by the id it was added with. Leave it out for
     * every element with a body.
     * @default undefined
     * @optional true
     */
    elements?: string[] | undefined;
    /**
     * When true, the elements of each storey, or other part of the structure, are grouped by IFC
     * class, such as `Walls`; when false they lie in the structure's group.
     * @default true
     */
    groupByClass?: boolean | undefined = true;
    /**
     * When true, each element's property set values join its results' tags, named like
     * `Pset_WallCommon.IsExternal`, so they reach what the results become, such as STEP properties.
     * @default false
     */
    propertySets?: boolean | undefined = false;
}
/**
 * A model and the elements to check for `geometry.unsupported`.
 */
export class GeometryElementsDto<T> {
    constructor(model?: T, elements?: string[]) {
        if (model !== undefined) { this.model = model; }
        if (elements !== undefined) { this.elements = elements; }
    }
    /**
     * The model whose elements are checked.
     * @default undefined
     */
    model!: T;
    /**
     * The elements to check, each by GlobalId or by the id it was added with. Leave it out for
     * every element with a body.
     * @default undefined
     * @optional true
     */
    elements?: string[] | undefined;
}
/**
 * A model, the elements to build, and how to build them for `geometry.toShapes`, which builds the
 * model's recipe as OpenCascade shapes.
 */
export class GeometryToShapesDto<T> {
    constructor(model?: T, elements?: string[], adjustZtoY?: boolean, emptyWhenFailed?: boolean, facetedMeshes?: boolean, maxTriangles?: number) {
        if (model !== undefined) { this.model = model; }
        if (elements !== undefined) { this.elements = elements; }
        if (adjustZtoY !== undefined) { this.adjustZtoY = adjustZtoY; }
        if (emptyWhenFailed !== undefined) { this.emptyWhenFailed = emptyWhenFailed; }
        if (facetedMeshes !== undefined) { this.facetedMeshes = facetedMeshes; }
        if (maxTriangles !== undefined) { this.maxTriangles = maxTriangles; }
    }
    /**
     * The model whose elements are built.
     * @default undefined
     */
    model!: T;
    /**
     * The elements to build, each by GlobalId or by the id it was added with. Leave it out for
     * every element with a body.
     * @default undefined
     * @optional true
     */
    elements?: string[] | undefined;
    /**
     * When true, the shapes turn a quarter turn about X so the model's Z points along Y, which is up
     * when drawn: `(x, y, z)` becomes `(x, z, -y)`.
     * @default true
     */
    adjustZtoY?: boolean | undefined = true;
    /**
     * When true, an element that cannot be built comes back as an empty compound and the others are
     * built; when false, it stops the build.
     * @default true
     */
    emptyWhenFailed?: boolean | undefined = true;
    /**
     * When true, elements stored as triangle meshes become faceted solids that cut and fillet like
     * any shape; when false they keep their triangles, which draw and export faster.
     * @default false
     */
    facetedMeshes?: boolean | undefined = false;
    /**
     * The most triangles a mesh built as a faceted solid may hold; a larger one is not built and
     * counts as an element that failed.
     * @default 100000
     * @minimum 0
     * @maximum Infinity
     * @step 10000
     */
    maxTriangles?: number | undefined = 100000;
}
/**
 * A model, the elements to build, and how to build them for `geometry.toDocument`, which builds the
 * model's recipe into an OpenCascade assembly document.
 */
export class GeometryToDocumentDto<T> {
    constructor(model?: T, elements?: string[], name?: string, emptyWhenFailed?: boolean, facetedMeshes?: boolean, maxTriangles?: number, groupByClass?: boolean, propertySets?: boolean) {
        if (model !== undefined) { this.model = model; }
        if (elements !== undefined) { this.elements = elements; }
        if (name !== undefined) { this.name = name; }
        if (emptyWhenFailed !== undefined) { this.emptyWhenFailed = emptyWhenFailed; }
        if (facetedMeshes !== undefined) { this.facetedMeshes = facetedMeshes; }
        if (maxTriangles !== undefined) { this.maxTriangles = maxTriangles; }
        if (groupByClass !== undefined) { this.groupByClass = groupByClass; }
        if (propertySets !== undefined) { this.propertySets = propertySets; }
    }
    /**
     * The model whose elements are built.
     * @default undefined
     */
    model!: T;
    /**
     * The elements to build, each by GlobalId or by the id it was added with. Leave it out for
     * every element with a body.
     * @default undefined
     * @optional true
     */
    elements?: string[] | undefined;
    /**
     * The name of the assembly at the top of the document, which holds every element.
     * @default Model
     */
    name?: string | undefined = "Model";
    /**
     * When true, an element that cannot be built is left out of the document and the others are
     * built; when false, it stops the build.
     * @default true
     */
    emptyWhenFailed?: boolean | undefined = true;
    /**
     * When true, elements stored as triangle meshes become faceted solids that cut and fillet like
     * any shape; when false STEP carries their triangles as tessellated geometry, smaller and faster.
     * @default false
     */
    facetedMeshes?: boolean | undefined = false;
    /**
     * The most triangles a mesh built as a faceted solid may hold; a larger one is not built and
     * counts as an element that failed.
     * @default 100000
     * @minimum 0
     * @maximum Infinity
     * @step 10000
     */
    maxTriangles?: number | undefined = 100000;
    /**
     * When true, each storey's elements are gathered in assemblies by IFC class, such as `Walls`
     * and `Slabs`; when false they lie in the storey's assembly directly.
     * @default true
     */
    groupByClass?: boolean | undefined = true;
    /**
     * When true, each element's product carries its property set values as properties, named by set
     * and property, such as `Pset_WallCommon.IsExternal`, beside its GlobalId and IFC type.
     * @default true
     */
    propertySets?: boolean | undefined = true;
}
/**
 * A model, the elements to write, and the file options for `geometry.toStep`, which writes the
 * model's elements as a STEP file of OpenCascade shapes.
 */
export class GeometryToStepDto<T> {
    constructor(model?: T, elements?: string[], name?: string, fileName?: string, emptyWhenFailed?: boolean, facetedMeshes?: boolean, maxTriangles?: number, compress?: boolean, tryDownload?: boolean, groupByClass?: boolean, propertySets?: boolean) {
        if (model !== undefined) { this.model = model; }
        if (elements !== undefined) { this.elements = elements; }
        if (name !== undefined) { this.name = name; }
        if (fileName !== undefined) { this.fileName = fileName; }
        if (emptyWhenFailed !== undefined) { this.emptyWhenFailed = emptyWhenFailed; }
        if (facetedMeshes !== undefined) { this.facetedMeshes = facetedMeshes; }
        if (maxTriangles !== undefined) { this.maxTriangles = maxTriangles; }
        if (compress !== undefined) { this.compress = compress; }
        if (tryDownload !== undefined) { this.tryDownload = tryDownload; }
        if (groupByClass !== undefined) { this.groupByClass = groupByClass; }
        if (propertySets !== undefined) { this.propertySets = propertySets; }
    }
    /**
     * The model whose elements are written.
     * @default undefined
     */
    model!: T;
    /**
     * The elements to write, each by GlobalId or by the id it was added with. Leave it out for
     * every element with a body.
     * @default undefined
     * @optional true
     */
    elements?: string[] | undefined;
    /**
     * The name of the assembly at the top of the file, which holds every element.
     * @default Model
     */
    name?: string | undefined = "Model";
    /**
     * The file name, used for the download and written into the file's header.
     * @default model.step
     */
    fileName?: string | undefined = "model.step";
    /**
     * When true, an element that cannot be built is left out of the file and the others are
     * written; when false, it stops the export.
     * @default true
     */
    emptyWhenFailed?: boolean | undefined = true;
    /**
     * When true, elements stored as triangle meshes are written as faceted solids; when false they
     * are written as tessellated geometry, which is faster and smaller.
     * @default false
     */
    facetedMeshes?: boolean | undefined = false;
    /**
     * The most triangles a mesh built as a faceted solid may hold; a larger one is not built and
     * counts as an element that failed.
     * @default 100000
     * @minimum 0
     * @maximum Infinity
     * @step 10000
     */
    maxTriangles?: number | undefined = 100000;
    /**
     * When true, the file is written as gzip-compressed STEP-Z.
     * @default false
     */
    compress?: boolean | undefined = false;
    /**
     * When true, a browser download of the file is started where that is possible; the bytes are
     * returned either way.
     * @default false
     */
    tryDownload?: boolean | undefined = false;
    /**
     * When true, each storey's elements are gathered in assemblies by IFC class, such as `Walls`
     * and `Slabs`; when false they lie in the storey's assembly directly.
     * @default true
     */
    groupByClass?: boolean | undefined = true;
    /**
     * When true, each element's product carries its property set values as properties, named by set
     * and property, such as `Pset_WallCommon.IsExternal`, beside its GlobalId and IFC type.
     * @default true
     */
    propertySets?: boolean | undefined = true;
}
/**
 * An element `geometry.recipe` had to leave out, as `geometry.unsupported` lists it.
 */
export class GeometryProblemDto {
    /**
     * The GlobalId of the element left out.
     * @default ""
     */
    globalId = "";
    /**
     * Its IFC type, such as `IfcWall`.
     * @default ""
     */
    type = "";
    /**
     * What could not be described, in a sentence.
     * @default ""
     */
    message = "";
}
