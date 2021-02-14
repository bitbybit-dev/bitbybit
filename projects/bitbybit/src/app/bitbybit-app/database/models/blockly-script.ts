import { DefaultEntity } from './default-entity';

export class BlocklyScript extends DefaultEntity {
    projectId?: number;
    title?: string;
    script?: string;
    image?: any;
}
