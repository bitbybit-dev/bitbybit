import { languagesEnum } from './languages.enum';
import { ResourcesInterface } from './resources.interface';
import { resourcesEn } from './resources.en';

export class ResourcesService {
    static languageSelected: languagesEnum;

    static getResourcesForSelectedLanguage(): ResourcesInterface {
        let resources: ResourcesInterface;
        switch (ResourcesService.languageSelected) {
            case languagesEnum.en:
                resources = resourcesEn;
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
