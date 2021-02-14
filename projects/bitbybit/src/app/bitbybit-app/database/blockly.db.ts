import { Injectable } from '@angular/core';
import { forkJoin, Observable, Subject } from 'rxjs';
import { BlocklyScript } from './models/blockly-script';
import { SharedDbContextService } from './shared-db-context';

@Injectable()
export class BlocklyDb {

    constructor(
        private readonly sharedDbContext: SharedDbContextService,
    ){}

    getInitial(): BlocklyScript {
        const currentDate = Date.now();
        return {
            projectId: 1,
            title: 'Initial Script',
            script: '',
            date: currentDate,
            lastEditedDate: currentDate,
        };
    }

    getByIds(ids: number[]): Observable<BlocklyScript[]> {
        return this.sharedDbContext.getByIds<BlocklyScript>(ids, 'blockly');
    }

    getById(id: number): Observable<BlocklyScript> {
        return this.sharedDbContext.getById(id, 'blockly');
    }

    getByProjectId(id: number): Observable<BlocklyScript[]> {
        return this.sharedDbContext.getAll('by_projectId', id, 'blockly');
    }

    create(asset: BlocklyScript): Observable<BlocklyScript> {
        return this.sharedDbContext.createOrUpdate<BlocklyScript>(asset, 'blockly');
    }

    update(asset: BlocklyScript, id): Observable<BlocklyScript> {
        return this.sharedDbContext.createOrUpdate<BlocklyScript>(asset, 'blockly', id);
    }

    delete(id: number): Observable<BlocklyScript> {
        return this.sharedDbContext.delete(id, 'blockly');
    }

    deleteIds(ids: number[]): Observable<BlocklyScript[]> {
        return forkJoin(
            ids.map(id => this.sharedDbContext.delete<BlocklyScript>(id, 'blockly'))
        );
    }

}
