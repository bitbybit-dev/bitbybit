import type * as Models from "../../api/models";
import type { ClashPartMesh } from "../analysis/clash-types";
import { KEPT_MESH_BYTES, KEPT_PAIRS, KEPT_SOLIDS } from "./constants";
import { recentlyUsed } from "./recent";

function kept<T>(store: Map<string, T>, key: string, most: number, make: () => T): T {
    const known = recentlyUsed(store, key);
    if (known !== undefined) {
        return known;
    }
    const made = make();
    store.set(key, made);
    if (store.size > most) {
        store.delete(store.keys().next().value ?? key);
    }
    return made;
}

function bytesOf(mesh: ClashPartMesh): number {
    return mesh.positions.byteLength + mesh.indices.byteLength;
}

export class ClashStore {
    private readonly meshes = new Map<string, ClashPartMesh>();
    private readonly solids = new Map<string, boolean>();
    private readonly pairs = new Map<string, Models.OCCT.Clash[]>();
    private meshBytes = 0;

    mesh(key: string, make: () => ClashPartMesh): ClashPartMesh {
        const known = recentlyUsed(this.meshes, key);
        if (known !== undefined) {
            return known;
        }
        const made = make();
        this.meshes.set(key, made);
        this.meshBytes += bytesOf(made);
        for (const [oldest, mesh] of this.meshes) {
            if (this.meshBytes <= KEPT_MESH_BYTES || oldest === key) {
                break;
            }
            this.meshes.delete(oldest);
            this.meshBytes -= bytesOf(mesh);
        }
        return made;
    }

    meshable(key: string, make: () => boolean): boolean {
        return kept(this.solids, key, KEPT_SOLIDS, make);
    }

    pair(key: string, make: () => Models.OCCT.Clash[]): Models.OCCT.Clash[] {
        return kept(this.pairs, key, KEPT_PAIRS, make);
    }

    clear(): void {
        this.meshes.clear();
        this.solids.clear();
        this.pairs.clear();
        this.meshBytes = 0;
    }
}
