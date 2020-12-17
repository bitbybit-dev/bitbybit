import { BitbybitAppComponent } from './bitbybit-app.component';
import { CanDeactivate } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class BitbybitCanDeativate implements CanDeactivate<BitbybitAppComponent>{
    canDeactivate(component: BitbybitAppComponent): boolean {
        return confirm('Warning: The script you were working on will be lost. Be sure to save changes first. Proceed?');
    }
}