import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExamplesDialogComponent } from './components/examples-dialog/examples-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { SponsorsDialogComponent } from './components/sponsors-dialog/sponsors-dialog.component';
import { AlertDialogComponent } from './components/alert-dialog/alert-dialog.component';



@NgModule({
    declarations: [
        AppComponent,
        ExamplesDialogComponent,
        SponsorsDialogComponent,
        AlertDialogComponent,
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
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
