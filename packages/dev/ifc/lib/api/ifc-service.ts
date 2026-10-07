import { IFCBeams } from "./services/beams";
import { IFCColumns } from "./services/columns";
import { IFCDoors } from "./services/doors";
import { IFCGeometry } from "./services/geometry";
import { IFCMaterials } from "./services/materials";
import { IFCMembers } from "./services/members";
import { IFCModels } from "./services/model";
import { IFCOpenings } from "./services/openings";
import { IFCProperties } from "./services/properties";
import { IFCQuantities } from "./services/quantities";
import { IFCRoofs } from "./services/roofs";
import { IFCSite } from "./services/site";
import { IFCSlabs } from "./services/slabs";
import { IFCSpaces } from "./services/spaces";
import { IFCSpatial } from "./services/spatial";
import { IFCWalls } from "./services/walls";
import { IFCWindows } from "./services/windows";

/**
 * The entry point to IFC, the open BIM exchange format: `model` creates, reads, writes and edits
 * models; `spatial`, `spaces`, `materials` and `site` add storeys, rooms, materials and the terrain;
 * `walls`, `openings`, `doors`, `windows`, `slabs`, `roofs`, `columns`, `beams` and `members` add
 * elements; `properties` attaches property sets, `quantities` measures, and `geometry` describes
 * elements as a recipe a kernel builds.
 *
 * A model is a value: every method that changes one returns a new model and leaves the one it was
 * given as it was. Elements are parametric IFC4 that other BIM tools edit as walls, slabs and doors.
 * Experimental: names and inputs may still change before the first stable version.
 * @beta
 */
export class IFCService {
    /**
     * Creates, reads, writes and summarizes models, reads and sets single attributes, and moves and
     * removes objects.
     */
    readonly model: IFCModels;
    /**
     * Adds storeys to a model's building, raises or lowers them, and lists them.
     */
    readonly spatial: IFCSpatial;
    /**
     * Adds rooms and areas to storeys and lists them with their areas.
     */
    readonly spaces: IFCSpaces;
    /**
     * Adds materials with their colours, and layer sets that walls and slabs are made of.
     */
    readonly materials: IFCMaterials;
    /**
     * Adds walls, joins them at their corners and clips them under roofs.
     */
    readonly walls: IFCWalls;
    /**
     * Cuts openings through walls and slabs, and moves them along their walls.
     */
    readonly openings: IFCOpenings;
    /**
     * Adds door types and doors placed in walls.
     */
    readonly doors: IFCDoors;
    /**
     * Adds window types and windows placed in walls.
     */
    readonly windows: IFCWindows;
    /**
     * Adds floors, roofs and landings.
     */
    readonly slabs: IFCSlabs;
    /**
     * Adds flat, mono-pitch, gable and hip roofs over rectangles.
     */
    readonly roofs: IFCRoofs;
    /**
     * Adds the site's terrain and trees.
     */
    readonly site: IFCSite;
    /**
     * Adds columns standing on a storey.
     */
    readonly columns: IFCColumns;
    /**
     * Adds beams between two points.
     */
    readonly beams: IFCBeams;
    /**
     * Adds braces, rafters, studs, mullions and other members between two points.
     */
    readonly members: IFCMembers;
    /**
     * Attaches property sets to objects and types, sets and removes their values, and reads them back.
     */
    readonly properties: IFCProperties;
    /**
     * Measures elements and writes and reads their base quantity sets.
     */
    readonly quantities: IFCQuantities;
    /**
     * Describes elements as a recipe a geometry kernel builds into solids.
     */
    readonly geometry: IFCGeometry;

    /**
     * Makes the entry point with every part of the IFC library.
     */
    constructor() {
        this.model = new IFCModels();
        this.spatial = new IFCSpatial();
        this.spaces = new IFCSpaces();
        this.materials = new IFCMaterials();
        this.walls = new IFCWalls();
        this.openings = new IFCOpenings();
        this.doors = new IFCDoors();
        this.windows = new IFCWindows();
        this.slabs = new IFCSlabs();
        this.roofs = new IFCRoofs();
        this.site = new IFCSite();
        this.columns = new IFCColumns();
        this.beams = new IFCBeams();
        this.members = new IFCMembers();
        this.properties = new IFCProperties();
        this.quantities = new IFCQuantities();
        this.geometry = new IFCGeometry();
    }
}
