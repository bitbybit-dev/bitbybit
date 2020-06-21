import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AboutDialogComponent } from './components/about-dialog/about-dialog.component';
import { AlertDialogComponent } from './components/alert-dialog/alert-dialog.component';
import { ExamplesDialogComponent } from './components/examples-dialog/examples-dialog.component';
import { SettingsDialogComponent } from './components/settings-dialog/settings-dialog.component';
import { SponsorsDialogComponent } from './components/sponsors-dialog/sponsors-dialog.component';
import { ExamplesService } from './examples/example-service';
import {MatSelectModule} from '@angular/material/select';



@NgModule({
    declarations: [
        AppComponent,
        ExamplesDialogComponent,
        AboutDialogComponent,
        SponsorsDialogComponent,
        AlertDialogComponent,
        SettingsDialogComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        MatTabsModule,
        BrowserAnimationsModule,
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
    ],
    providers: [ExamplesService],
    bootstrap: [AppComponent]
})
export class AppModule { }
