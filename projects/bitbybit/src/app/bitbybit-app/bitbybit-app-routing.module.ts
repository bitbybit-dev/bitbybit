import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BitbybitAppComponent } from './bitbybit-app.component';
import { BitbybitCanDeativate } from './bitbybit-app-can-deactivate.service';


const routes: Routes = [
    {
        path: '',
        component: BitbybitAppComponent,
        canDeactivate: [BitbybitCanDeativate],
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BitbybitAppRoutingModule { }
