import { BitbybitOcctModule } from "../../../bitbybit-dev-occt/bitbybit-dev-occt";
import { OccHelper } from "../../occ-helper";
import { OCCTAssemblyManager } from "./manager";
import { OCCTAssemblyQuery } from "./query";

/**
 * High-level OCCT Assembly service for creating and querying assembly documents.
 * 
 * The manager provides methods for:
 * - Building assembly documents from structure definitions
 * - Creating parts and nodes for visual programming
 * - Modifying document labels (color, name)
 * - Exporting to STEP and glTF formats
 * - Loading STEP files into documents
 * 
 * The query provides methods for:
 * - Querying document parts, hierarchy, colors, and transforms
 * - Getting shapes from labels
 * 
 * All methods use document handles directly (no global document storage).
 * The caller is responsible for managing document lifetime by calling document.delete() when done.
 * 
 * @example
 * ```typescript
 * // Create assembly document
 * const document = occt.assembly.manager.buildAssemblyDocument({ structure });
 * 
 * // Query document parts
 * const parts = occt.assembly.query.getDocumentParts({ document });
 * 
 * // Export to STEP
 * const stepData = occt.assembly.manager.exportDocumentToStep({ document });
 * 
 * // Clean up when done
 * document.delete();
 * ```
 */
export class OCCTAssembly {
    public readonly manager: OCCTAssemblyManager;
    public readonly query: OCCTAssemblyQuery;

    constructor(
        occ: BitbybitOcctModule,
        och: OccHelper
    ) {
        this.manager = new OCCTAssemblyManager(occ, och);
        this.query = new OCCTAssemblyQuery(occ, och);
    }

}
