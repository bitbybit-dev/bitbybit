import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from '@babylonjs/core';
import { DatabaseService } from './database.service';

@Injectable({ providedIn: 'root' })
export class DatabaseResolver implements Resolve<any> {
  constructor(private readonly databaseSevice: DatabaseService) {}

  resolve(
  ): Observable<any>|Promise<any>|any {
    return this.databaseSevice.initiate();
  }
}
