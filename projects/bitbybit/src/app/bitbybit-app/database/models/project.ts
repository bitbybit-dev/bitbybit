import { Asset } from './asset';
import { BlocklyScript } from './blockly-script';
import { TypeScript } from './typescript-script';
import { DefaultEntity } from './default-entity';

export class Project extends DefaultEntity {
    title: string;
    description: string;
    typescript?: TypeScript[];
    blockly?: BlocklyScript[];
    assets?: Asset[];
}
