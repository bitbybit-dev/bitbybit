import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AboutDialogComponent } from './components/about-dialog/about-dialog.component';
import { AlertDialogComponent } from './components/alert-dialog/alert-dialog.component';
import { ExamplesDialogComponent } from './components/examples-dialog/examples-dialog.component';
import { PrintSaveDialogComponent } from './components/print-save-dialog/print-save-dialog.component';
import { PromptDialogComponent } from './components/prompt-dialog/prompt-dialog.component';
import { SettingsDialogComponent } from './components/settings-dialog/settings-dialog.component';
import { SponsorsDialogComponent } from './components/sponsors-dialog/sponsors-dialog.component';
import { ExamplesService } from './examples/example-service';
import { SettingsService } from './shared/setting.service';
import { TagService } from './tags/tag.service';
import { BitbybitAppComponent } from './bitbybit-app.component';
import { BitbybitAppRoutingModule } from './bitbybit-app-routing.module';
import { CommonModule } from '@angular/common';
import { BitbybitCanDeativate } from './bitbybit-app-can-deactivate.service';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { EnterMonacoDialogComponent } from './components/enter-monaco-dialog/enter-monaco-dialog.component';
import { EnterBlocklyDialogComponent } from './components/enter-blockly-dialog/enter-blockly-dialog.component';
import { DialogService } from './shared/dialog.service';
import { DatabaseService } from './database/database.service';
import { ProjectsDb } from './database/projects.db';
import { AssetsDb } from './database/assets.db';
import { SharedDbContextService } from './database/shared-db-context';
import { TypeScriptDb } from './database/typescript.db';
import { BlocklyDb } from './database/blockly.db';
import { ProjectsComponent } from './projects/projects.component';
import { DatabaseResolver } from './database/db-resolver';
import { AssetAddComponent } from './projects/assets/asset-add/asset-add.component';
import { ProjectsOverviewComponent } from './projects/projects-overview/projects-overview.component';
import { BlocklyAddComponent } from './projects/blockly/blockly-add/blockly-add.component';
import { BlocklyEditComponent } from './projects/blockly/blockly-edit/blockly-edit.component';
import { TypescriptAddComponent } from './projects/typescript/typescript-add/typescript-add.component';
import { TypescriptEditComponent } from './projects/typescript/typescript-edit/typescript-edit.component';
import { ProjectCreateComponent } from './projects/project-create/project-create.component';
import { ProjectEditComponent } from './projects/project-edit/project-edit.component';

@NgModule({
    declarations: [
        BitbybitAppComponent,
        ExamplesDialogComponent,
        AboutDialogComponent,
        SponsorsDialogComponent,
        AlertDialogComponent,
        SettingsDialogComponent,
        PrintSaveDialogComponent,
        PromptDialogComponent,
        EnterMonacoDialogComponent,
        EnterBlocklyDialogComponent,
        ProjectsComponent,
        AssetAddComponent,
        ProjectsOverviewComponent,
        BlocklyAddComponent,
        BlocklyEditComponent,
        TypescriptAddComponent,
        TypescriptEditComponent,
        ProjectCreateComponent,
        ProjectEditComponent,
   ],
    imports: [
        CommonModule,
        BitbybitAppRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        MatTabsModule,
        MatTooltipModule,
        MatSidenavModule,
        MatToolbarModule,
        MatIconModule,
        MatDividerModule,
        MatGridListModule,
        MatDialogModule,
        MatButtonModule,
        MatMenuModule,
        MatCardModule,
        MatSelectModule,
        MatExpansionModule,
        MatInputModule,
        MonacoEditorModule,
        MatProgressSpinnerModule,

    ],
    providers: [
        ExamplesService,
        SettingsService,
        TagService,
        DialogService,
        DatabaseService,
        ProjectsDb,
        AssetsDb,
        TypeScriptDb,
        BlocklyDb,
        SharedDbContextService,
        BitbybitCanDeativate,
        DatabaseResolver,
    ],
})
export class BitbybitAppModule { }
