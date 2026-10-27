import type * as BABYLON from "@babylonjs/core";

const freedMaterials = new WeakSet<BABYLON.Material>();
const watchedWearers = new WeakMap<BABYLON.Material, WeakSet<BABYLON.AbstractMesh>>();

function liveWearersOf(material: BABYLON.Material): BABYLON.AbstractMesh[] {
    const holders = material.getScene().multiMaterials.filter(multi => multi.subMaterials.includes(material));
    return [material, ...holders]
        .flatMap(worn => worn.getBindedMeshes())
        .filter(mesh => !mesh.isDisposed());
}

function wearersWatchedFor(material: BABYLON.Material): WeakSet<BABYLON.AbstractMesh> {
    const known = watchedWearers.get(material);
    if (known) {
        return known;
    }
    const watched = new WeakSet<BABYLON.AbstractMesh>();
    watchedWearers.set(material, watched);
    return watched;
}

export function freeWithItsLastUser(material: BABYLON.Material, user: BABYLON.AbstractMesh): void {
    const watched = wearersWatchedFor(material);
    if (watched.has(user)) {
        return;
    }
    watched.add(user);
    user.onDisposeObservable.addOnce(() => {
        const stillWearing = liveWearersOf(material);
        if (stillWearing.length > 0) {
            stillWearing.forEach(other => freeWithItsLastUser(material, other));
        } else if (!freedMaterials.has(material)) {
            freedMaterials.add(material);
            material.dispose();
        }
    });
}
