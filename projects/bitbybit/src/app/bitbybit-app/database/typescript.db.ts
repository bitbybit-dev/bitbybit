import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { TypeScript } from './models/typescript-script';
import { SharedDbContextService } from './shared-db-context';

@Injectable()
export class TypeScriptDb {

    constructor(
        private readonly sharedDbContext: SharedDbContextService,
    ){}

    getInitial(): TypeScript{
        const currentDate = Date.now();
        return {
            projectId: 1,
            title: 'Initial Script',
            script: '',
            date: currentDate,
            lastEditedDate: currentDate,
        };
    }

    getByIds(ids: number[]): Observable<TypeScript[]> {
        return this.sharedDbContext.getByIds<TypeScript>(ids, 'typescript');
    }

    getById(id: number): Observable<TypeScript> {
        return this.sharedDbContext.getById(id, 'typescript');
    }

    getByProjectId(id: number): Observable<TypeScript[]> {
        return this.sharedDbContext.getAll('by_projectId', id, 'typescript');
    }

    create(asset: TypeScript): Observable<TypeScript> {
        return this.sharedDbContext.createOrUpdate<TypeScript>(asset, 'typescript');
    }

    update(asset: TypeScript, id): Observable<TypeScript> {
        return this.sharedDbContext.createOrUpdate<TypeScript>(asset, 'typescript', id);
    }

    delete(id: number): Observable<TypeScript> {
        return this.sharedDbContext.delete(id, 'typescript');
    }

    deleteIds(ids: number[]): Observable<TypeScript[]> {
        return forkJoin(
            ids.map(id => this.sharedDbContext.delete<TypeScript>(id, 'typescript'))
        );
    }
}
