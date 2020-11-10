import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import {MatSelectModule} from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
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
        MatInputModule,
    ],
    providers: [ExamplesService, SettingsService, TagService, BitbybitCanDeativate],
})
export class BitbybitAppModule { }
