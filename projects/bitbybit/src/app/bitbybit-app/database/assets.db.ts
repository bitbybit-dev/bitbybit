import { Injectable } from '@angular/core';
import { forkJoin, Observable, Subject } from 'rxjs';
import { Asset } from './models/asset';
import { SharedDbContextService } from './shared-db-context';

@Injectable()
export class AssetsDb {

    constructor(
        private readonly sharedDbContext: SharedDbContextService,
    ) { }

    getByIds(ids: number[]): Observable<Asset[]> {
        return this.sharedDbContext.getByIds<Asset>(ids, 'assets');
    }

    getByTitle(title: string): Observable<Asset> {
        return this.sharedDbContext.getAll('by_title', title, 'assets');
    }

    getById(id: number): Observable<Asset> {
        return this.sharedDbContext.getById(id, 'assets');
    }

    getByProjectId(id: number): Observable<Asset[]> {
        return this.sharedDbContext.getAll('by_projectId', id, 'assets');
    }

    create(asset: Asset): Observable<Asset> {
        return this.sharedDbContext.createOrUpdate<Asset>(asset, 'assets');
    }

    update(asset: Asset, id): Observable<Asset> {
        return this.sharedDbContext.createOrUpdate<Asset>(asset, 'assets', id);
    }

    delete(id: number): Observable<Asset> {
        return this.sharedDbContext.delete(id, 'assets');
    }

    deleteIds(ids: number[]): Observable<Asset[]> {
        return forkJoin(
            ids.map(id => this.sharedDbContext.delete<Asset>(id, 'assets'))
        );
    }
}
