import { Injectable } from '@angular/core';
import { ArcRotateCamera, Engine, Matrix, Vector3, Scene } from '@babylonjs/core';
import { BitByBitBlocklyHelperService } from '../../blocks/_shared/bit-by-bit-blockly-helper.service';

@Injectable()
export class TagService {

    constructor() {
    }

    handleTags(camera: ArcRotateCamera, tagsNeedUpdate: boolean, engine: Engine, scene: Scene) {
        if (!tagsNeedUpdate && BitByBitBlocklyHelperService.tagBag.length > 0 &&
            BitByBitBlocklyHelperService.tagBag.find(tag => tag.needsUpdate)) {
            tagsNeedUpdate = true;
        }
        if (tagsNeedUpdate && BitByBitBlocklyHelperService.tagBag.length > 0) {
            BitByBitBlocklyHelperService.tagBag.forEach(tag => {
                const textNode = document.querySelector('#' + tag.id);
                const vector = new Vector3(tag.position[0], tag.position[1], tag.position[2]);
                const renWidth = engine.getRenderWidth();
                const renHeight = engine.getRenderHeight();
                const pos = Vector3.Project(
                    vector,
                    Matrix.IdentityReadOnly,
                    scene.getTransformMatrix(),
                    camera.viewport.toGlobal(
                        renWidth,
                        renHeight));
                const defStyle = 'position: absolute; transform: translate(-50%, -50%); font-weight: 400;';

                const distance = Vector3.Distance(camera.position, vector);
                const size = tag.adaptDepth ? Math.ceil(BitByBitBlocklyHelperService.remap(distance,
                    0, 100,
                    tag.size, 3)) : tag.size;
                if (pos.x > 0 && pos.x < renWidth &&
                    pos.y > 0 && pos.y < renHeight &&
                    pos.z > 0 && pos.z < 1 && size > 3) {
                    (textNode as any).style =
                        `${defStyle} font-size: ${size}px; color: ${tag.colour}; left: ${pos.x}px; top: ${pos.y}px; display: inline;`;
                }
                else {
                    (textNode as any).style = 'display: none;';
                }
            });
        }
    }

    removeTagsIfNeeded() {
        if (this.tagsExist()) {
            BitByBitBlocklyHelperService.tagBag.forEach(tag => {
                const element = document.getElementById(tag.id);
                element.parentNode.removeChild(element);
            });
        }
        BitByBitBlocklyHelperService.tagBag = [];
    }

    tagsExist(){
        return BitByBitBlocklyHelperService.tagBag.length > 0;
    }
}
