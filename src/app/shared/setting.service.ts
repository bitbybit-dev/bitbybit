import { ChangeDetectorRef, Injectable } from '@angular/core';
import { WorkspaceSvg, Xml } from 'blockly';
import { assembleBlocks } from '../../blocks/assemble-blocks';
import { languagesEnum, ResourcesInterface, ResourcesService } from '../../resources';
import { localStorageKeysEnum } from './local-storage-keys.enum';

@Injectable()
export class SettingsService {

    constructor() {
    }

    initSettings(workspace: WorkspaceSvg, changeDetector: ChangeDetectorRef) {
        const browserStorage = window.localStorage;
        const languageInSettings = browserStorage.getItem(localStorageKeysEnum.settingsLanguage) as languagesEnum;
        if (languageInSettings !== languagesEnum.en) {
            this.setLanguage(languageInSettings, workspace, changeDetector);
        }
    }

    setLanguage(language: languagesEnum, workspace: WorkspaceSvg, changeDetector: ChangeDetectorRef) {
        const languageImport = import(`src/assets/blockly-languages/${language}.js`);
        languageImport.then(
            s => {
                s.activateLanguage();
                ResourcesService.setLanguage(language);
                const resources = ResourcesService.getResources();
                assembleBlocks();
                const xml = Xml.workspaceToDom(workspace);
                workspace.clear();
                Xml.domToWorkspace(xml, workspace);
                workspace.zoomToFit();
                changeDetector.detectChanges();
                this.setToolboxTexts(resources);
                const toolbox = workspace.getToolbox();
                toolbox.position();
            });
    }

    private setToolboxTexts(resources: ResourcesInterface) {
        const htmlElements = document.getElementsByClassName('blocklyTreeLabel');
        htmlElements[1].textContent = resources.block_toolbox_category_scene;
        htmlElements[2].textContent = resources.block_toolbox_category_core_types;
        htmlElements[3].textContent = resources.block_toolbox_category_core_transforms;
        htmlElements[4].textContent = resources.block_toolbox_category_core_vector;
        htmlElements[5].textContent = resources.block_toolbox_category_geom_point;
        htmlElements[6].textContent = resources.block_toolbox_category_geom_line;
        htmlElements[7].textContent = resources.block_toolbox_category_geom_polyline;
        htmlElements[8].textContent = resources.block_toolbox_category_geom_curve;
        htmlElements[9].textContent = resources.block_toolbox_category_geom_surface;
        htmlElements[10].textContent = resources.block_toolbox_category_loop;
        htmlElements[11].textContent = resources.block_toolbox_category_logic;
        htmlElements[12].textContent = resources.block_toolbox_category_math;
        htmlElements[13].textContent = resources.block_toolbox_category_lists;
        htmlElements[14].textContent = resources.block_toolbox_category_colour;
        htmlElements[15].textContent = resources.block_toolbox_category_text;
        htmlElements[16].textContent = resources.block_toolbox_category_variables;
        htmlElements[17].textContent = resources.block_toolbox_category_functions;
    }
}
