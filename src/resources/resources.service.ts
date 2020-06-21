import { languagesEnum } from './languages.enum';
import { resourcesEn } from './resources.en';
import { ResourcesInterface } from './resources.interface';
import { resourcesLt } from './resources.lt';

export class ResourcesService {
    static languageSelected: languagesEnum;
    static resources: ResourcesInterface = {...resourcesEn};
    static getResources(): ResourcesInterface {
        return ResourcesService.resources;
    }

    private static updateResources(resources: ResourcesInterface, languageResources: ResourcesInterface) {
        Object.keys(resources).forEach(key => {
            if (languageResources[key]){
                resources[key] = languageResources[key];
            }
        });
    }

    static setLanguage(language: languagesEnum) {
        ResourcesService.languageSelected = language;
        switch (ResourcesService.languageSelected) {
            case languagesEnum.en:
                ResourcesService.updateResources(ResourcesService.resources, resourcesEn);
                break;
            case languagesEnum.lt:
                ResourcesService.updateResources(ResourcesService.resources, resourcesLt);
                break;
            default:
                break;
        }
    }
}
