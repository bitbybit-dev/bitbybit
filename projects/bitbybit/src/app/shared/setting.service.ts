import { ChangeDetectorRef, Injectable } from '@angular/core';
import { WorkspaceSvg, Xml } from 'blockly';
import { assembleBlocks } from '../../blocks/assemble-blocks';
import { languagesEnum, ResourcesInterface, ResourcesService } from '../../resources';
import { localStorageKeysEnum } from './local-storage-keys.enum';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SettingsService {

    constructor() {
    }

    initSettings(workspace: WorkspaceSvg, changeDetector: ChangeDetectorRef): Observable<any> {
        const browserStorage = window.localStorage;
        const languageInSettings = browserStorage.getItem(localStorageKeysEnum.settingsLanguage) as languagesEnum;
        const subject = new Subject();
        if (languageInSettings && languageInSettings !== languagesEnum.en) {
            this.setLanguage(languageInSettings, workspace, changeDetector, subject);
        } else {
            setTimeout(() => {
                subject.next();
            });
        }
        return subject;
    }

    setLanguage(language: languagesEnum, workspace: WorkspaceSvg, changeDetector: ChangeDetectorRef, subject?: Subject<any>) {
        if (language) {
            const languageImport = import(`../../assets/blockly-languages/${language}.js`);
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
                    workspace.zoomCenter(-1);
                    changeDetector.detectChanges();
                    this.setToolboxTexts(resources);
                    const toolbox = workspace.getToolbox();
                    toolbox.position();
                    if (subject) {
                        subject.next();
                    }
                });
        }
    }

    private setToolboxTexts(resources: ResourcesInterface) {

        // this wont work in the long term, categories will have to get some attribute selectors
        const htmlElements = document.getElementsByClassName('blocklyTreeLabel');
        const toolboxCategoryFlatList = [
            resources.block_toolbox_category_scene,
            resources.block_toolbox_category_core_types,
            resources.block_toolbox_category_core_transforms,
            resources.block_toolbox_category_core_vector,
            resources.block_toolbox_category_geom_point,
            resources.block_toolbox_category_create,
            resources.block_toolbox_category_apply,
            resources.block_toolbox_category_geom_line,
            resources.block_toolbox_category_create,
            resources.block_toolbox_category_apply,
            resources.block_toolbox_category_geom_polyline,
            resources.block_toolbox_category_create,
            resources.block_toolbox_category_apply,
            resources.block_toolbox_category_geom_curve,
            resources.block_toolbox_category_create,
            resources.block_toolbox_category_geom_circle,
            resources.block_toolbox_category_geom_ellipse,
            resources.block_toolbox_category_apply,
            resources.block_toolbox_category_geom_circle,
            resources.block_toolbox_category_geom_ellipse,
            resources.block_toolbox_category_geom_surface,
            resources.block_toolbox_category_create,
            resources.block_toolbox_category_geom_sphere,
            resources.block_toolbox_category_geom_cone,
            resources.block_toolbox_category_geom_cylinder,
            resources.block_toolbox_category_geom_extrusion,
            resources.block_toolbox_category_geom_revolution,
            resources.block_toolbox_category_geom_sweep,
            resources.block_toolbox_category_apply,
            resources.block_toolbox_category_geom_sphere,
            resources.block_toolbox_category_geom_cone,
            resources.block_toolbox_category_geom_cylinder,
            resources.block_toolbox_category_geom_extrusion,
            resources.block_toolbox_category_geom_revolution,
            resources.block_toolbox_category_geom_sweep,
            resources.block_toolbox_category_intersect,
            resources.block_toolbox_category_create,
            resources.block_toolbox_category_apply,
            resources.block_toolbox_category_geom_tag,
            resources.block_toolbox_category_io,
            resources.block_toolbox_category_io_text,
            resources.block_toolbox_category_io_http,
            resources.block_toolbox_category_io_json,
            resources.block_toolbox_category_time,
            resources.block_toolbox_category_variables,
            resources.block_toolbox_category_functions,
            resources.block_toolbox_category_date,
            resources.block_toolbox_category_create,
            resources.block_toolbox_category_apply,
            resources.block_toolbox_category_apply_convert,
            resources.block_toolbox_category_apply_get,
            resources.block_toolbox_category_apply_set,
            resources.block_toolbox_category_loop,
            resources.block_toolbox_category_logic,
            resources.block_toolbox_category_math,
            resources.block_toolbox_category_lists,
            resources.block_toolbox_category_colour,
            resources.block_toolbox_category_text,
        ];

        toolboxCategoryFlatList.forEach((resource, index) => {
            htmlElements[index + 1].textContent = resource;
        });
    }
}
