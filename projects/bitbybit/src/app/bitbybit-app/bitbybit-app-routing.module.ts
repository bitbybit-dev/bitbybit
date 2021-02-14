import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BitbybitAppComponent } from './bitbybit-app.component';
import { BitbybitCanDeativate } from './bitbybit-app-can-deactivate.service';
import { ProjectsComponent } from './projects/projects.component';
import { AssetAddComponent } from './projects/assets/asset-add/asset-add.component';
import { DatabaseResolver } from './database/db-resolver';
import { ProjectsOverviewComponent } from './projects/projects-overview/projects-overview.component';
import { BlocklyAddComponent } from './projects/blockly/blockly-add/blockly-add.component';
import { BlocklyEditComponent } from './projects/blockly/blockly-edit/blockly-edit.component';
import { TypescriptAddComponent } from './projects/typescript/typescript-add/typescript-add.component';
import { TypescriptEditComponent } from './projects/typescript/typescript-edit/typescript-edit.component';
import { ProjectCreateComponent } from './projects/project-create/project-create.component';
import { ProjectEditComponent } from './projects/project-edit/project-edit.component';


const routes: Routes = [
    {
        path: '',
        component: BitbybitAppComponent,
        canDeactivate: [BitbybitCanDeativate],
        resolve: {
            db: DatabaseResolver
        },
    },
    {
        path: 'projects',
        component: ProjectsComponent,
        resolve: {
            db: DatabaseResolver
        },
        children: [
            {
                path: '',
                component: ProjectsOverviewComponent
            },
            {
                path: ':projectId/assets/add',
                component: AssetAddComponent
            },
            {
                path: ':projectId/blockly/add',
                component: BlocklyAddComponent
            },
            {
                path: ':projectId/blockly/:blocklyId/edit',
                component: BlocklyEditComponent
            },
            {
                path: ':projectId/typescript/add',
                component: TypescriptAddComponent
            },
            {
                path: ':projectId/typescript/:typescriptId/edit',
                component: TypescriptEditComponent
            },
            {
                path: 'add',
                component: ProjectCreateComponent
            },
            {
                path: ':projectId/edit',
                component: ProjectEditComponent
            },
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BitbybitAppRoutingModule { }
