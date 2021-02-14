import { Injectable } from '@angular/core';
import { Observable } from '@babylonjs/core';
import { Subject } from 'rxjs';
import { AssetsDb } from './assets.db';
import { BlocklyDb } from './blockly.db';
import { Project } from './models/project';
import { ProjectsDb } from './projects.db';
import { SharedDbContextService } from './shared-db-context';
import { TypeScriptDb } from './typescript.db';

@Injectable()
export class DatabaseService {

    constructor(
        public readonly projects: ProjectsDb,
        public readonly assets: AssetsDb,
        public readonly typescript: TypeScriptDb,
        public readonly blockly: BlocklyDb,
        private readonly sharedDbContext: SharedDbContextService,
    ) { }

    initiate(): Subject<any> {
        const subject = new Subject<any>();
        const request = window.indexedDB.open('bitbybit-db');

        request.onupgradeneeded = () => {
            // The database did not previously exist, so create object stores and indexes.
            const db = request.result;
            const store = db.createObjectStore('projects', { keyPath: 'id', autoIncrement: true });
            store.createIndex('by_title', 'title', { unique: false });
            store.createIndex('by_date', 'date', { unique: false });
            store.put(this.projects.getInitial());

            const assetsStore = db.createObjectStore('assets', { keyPath: 'id', autoIncrement: true });
            assetsStore.createIndex('by_title', 'title', { unique: true });
            assetsStore.createIndex('by_id', 'id', { unique: true });
            assetsStore.createIndex('by_projectId', 'projectId', { unique: false });

            const typescriptStore = db.createObjectStore('typescript', { keyPath: 'id', autoIncrement: true });
            typescriptStore.createIndex('by_title', 'title', { unique: true });
            typescriptStore.createIndex('by_id', 'id', { unique: true });
            typescriptStore.createIndex('by_projectId', 'projectId', { unique: false });
            typescriptStore.put(this.typescript.getInitial());

            const blocklyStore = db.createObjectStore('blockly', { keyPath: 'id', autoIncrement: true });
            blocklyStore.createIndex('by_title', 'title', { unique: true });
            blocklyStore.createIndex('by_id', 'id', { unique: true });
            blocklyStore.createIndex('by_projectId', 'projectId', { unique: false });
            blocklyStore.put(this.blockly.getInitial());

        };

        request.onsuccess = () => {
            const db = request.result;
            this.sharedDbContext.db = db;
            subject.next();
            subject.complete();
        };
        return subject;
    }

}
