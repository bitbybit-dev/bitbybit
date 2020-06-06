import { languagesEnum } from './languages.enum';
import { resourcesEn } from './resources.en';
import { ResourcesInterface } from './resources.interface';
import { resourcesLt } from './resources.lt';

export class ResourcesService {
    static languageSelected: languagesEnum;

    static getResourcesForSelectedLanguage(): ResourcesInterface {
        let resources: ResourcesInterface;
        switch (ResourcesService.languageSelected) {
            case languagesEnum.en:
                resources = resourcesEn;
                break;
            case languagesEnum.lt:
                resources = resourcesLt;
                break;
            default:
                break;
        }
        return resources;
    }

    static setLanguage(language: languagesEnum) {
        ResourcesService.languageSelected = language;
    }
}
