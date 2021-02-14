import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AssetsDb } from './assets.db';
import { BlocklyDb } from './blockly.db';
import { Asset } from './models/asset';
import { BlocklyScript } from './models/blockly-script';
import { Project } from './models/project';
import { TypeScript } from './models/typescript-script';
import { SharedDbContextService } from './shared-db-context';
import { TypeScriptDb } from './typescript.db';

@Injectable()
export class ProjectsDb {

    constructor(
        private readonly sharedDbContext: SharedDbContextService,
        private readonly assets: AssetsDb,
        private readonly typescript: TypeScriptDb,
        private readonly blockly: BlocklyDb,
    ) { }

    getInitial(): Project {
        const currentDate = Date.now();
        return {
            title: 'Initial Project',
            description: 'This project gets created automatically',
            date: currentDate,
            lastEditedDate: currentDate,
        };
    }

    getFullProjects(): Observable<Project[]> {
        return this.getProjects().asObservable().pipe(map(projects => {
            projects.forEach(async project => {
                project.assets = await this.assets.getByProjectId(project.id).toPromise();
                project.typescript = await this.typescript.getByProjectId(project.id).toPromise();
                project.blockly = await this.blockly.getByProjectId(project.id).toPromise();
            });
            return projects;
        }));
    }

    getProjectAssets(id: number): Observable<Asset[]> {
        return this.assets.getByProjectId(id);
    }

    getProjectBlocklyScripts(id: number): Observable<BlocklyScript[]> {
        return this.blockly.getByProjectId(id);
    }

    getProjectTypescriptScripts(id: number): Observable<TypeScript[]> {
        return this.typescript.getByProjectId(id);
    }

    getProjects(): Subject<Project[]> {
        const subject = new Subject<Project[]>();
        const tx = this.sharedDbContext.db.transaction('projects', 'readonly');
        const store = tx.objectStore('projects');
        const index = store.index('by_title');

        const request = index.getAll();
        request.onsuccess = () => {
            const cursor = request.result;
            if (cursor) {
                subject.next(cursor);
                subject.complete();
            } else {
                subject.error('no matches found');
            }
        };
        return subject;
    }

    getByIds(ids: number[]): Observable<Project[]> {
        return this.sharedDbContext.getByIds<Project>(ids, 'projects');
    }

    getById(id: number): Observable<Project> {
        return this.sharedDbContext.getById<Project>(id, 'projects');
    }

    create(project: Project): Observable<Project> {
        return this.sharedDbContext.createOrUpdate<Project>(project, 'projects');
    }

    update(project: Project, id): Observable<Project> {
        return this.sharedDbContext.createOrUpdate<Project>(project, 'projects', id);
    }

    delete(id: number): Observable<Project> {
        return this.sharedDbContext.delete<Project>(id, 'projects');
    }

}
