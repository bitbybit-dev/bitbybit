import { Registry } from "../registry.js";
import type { DocsContext } from "../context.js";
import { searchApi } from "./search-api.js";
import { describe } from "./describe.js";
import { listNamespace } from "./list-namespace.js";
import { getExamples } from "./get-examples.js";
import { getGuide } from "./get-guide.js";
import { search } from "./search.js";
import { fetchTool } from "./fetch.js";

export function createDocsRegistry(): Registry<DocsContext> {
    return new Registry<DocsContext>()
        .register(searchApi)
        .register(describe)
        .register(listNamespace)
        .register(getExamples)
        .register(getGuide)
        .register(search)
        .register(fetchTool);
}
