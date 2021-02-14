import { DefaultEntity } from './default-entity';

export class Asset extends DefaultEntity {
    projectId: number;
    extension?: string;
    multiFile?: boolean;
    title: string;
    files: File[];
}
