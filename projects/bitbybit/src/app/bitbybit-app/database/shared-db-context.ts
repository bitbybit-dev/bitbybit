import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DefaultEntity } from './models/default-entity';

@Injectable()
export class SharedDbContextService {

    db: IDBDatabase;

    constructor(
    ) { }

    getByIds<T>(ids: number[], storeName: string): Observable<T[]> {
        const { store, subject } = this.getSubjectStoreAndTransaction<T>(storeName, 'readonly');
        const results = [];
        ids.forEach((id) => {
            const request = store.get(id);
            request.onsuccess = (e) => {
                results.push((e.target as any).result);
                if (results.length === ids.length) {
                    subject.next(results);
                    subject.complete();
                }
            };
            request.onerror = (e) => {
                results.push(undefined);
                if (results.length === ids.length) {
                    subject.next(results);
                    subject.complete();
                }
            };
        });
        return subject.asObservable();
    }

    getById<T>(id: number, storeName: string): Observable<T> {
        const { store, subject, tx } = this.getSubjectStoreAndTransaction<T>(storeName, 'readonly');
        const request = store.get(id);
        return this.handleStates<T>(request, subject, tx);
    }


    getAll<T>(indexName: string, value: any, storeName: string): Observable<T> {
        const { store, subject, tx } = this.getSubjectStoreAndTransaction<T>(storeName, 'readonly');
        const index = store.index(indexName);
        const request = index.getAll(value);
        return this.handleStates<T>(request, subject, tx);
    }

    createOrUpdate<T>(object: T, storeName: string, id?: number): Observable<T> {
        const { store, subject, tx } = this.getSubjectStoreAndTransaction<T>(storeName, 'readwrite');
        let request;
        if (id !== undefined) {
            const r = store.get(id);
            r.onsuccess = (e) => {
                const item = (e.target as any).result;
                (object as DefaultEntity).lastEditedDate = Date.now();
                const objToUpdate = { ...item, ...object };
                request = store.put(objToUpdate);
                this.setUpHandles(request, subject, tx);
            };
            r.onerror = (err) => {
                subject.error(err);
                subject.complete();
            };
        } else {
            request = store.put(object);
            this.setUpHandles(request, subject, tx);
        }
        return subject.asObservable();
    }

    delete<T>(id: number, storeName: string): Observable<T> {
        const { store, subject, tx } = this.getSubjectStoreAndTransaction<T>(storeName, 'readwrite');
        const request = store.delete(id);
        return this.handleStates<T>(request, subject, tx);
    }

    private handleStates<T>(request: IDBRequest<IDBValidKey>, subject: Subject<T>, tx: IDBTransaction): Observable<T> {
        this.setUpHandles(request, subject, tx);
        return subject.asObservable();
    }

    private setUpHandles(request: any, subject: Subject<any>, tx: IDBTransaction): void {
        request.onsuccess = (e: Event) => {
            subject.next((e.target as any).result);
            subject.complete();
        };

        request.onerror = (event: Event) => {
            subject.error((event.target as any).error);
            subject.complete();
        };

        tx.onabort = () => {
            subject.error('aborted');
            subject.complete();
        };
    }
    private getSubjectStoreAndTransaction<T>(storeName: string, mode: 'readwrite' | 'readonly'): 
    { subject: Subject<any>, tx: IDBTransaction, store: IDBObjectStore } {
        const subject = new Subject<T>();
        const tx = this.db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        return { store, subject, tx };
    }
}
