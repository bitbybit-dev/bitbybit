import { Injectable } from '@angular/core';
import { PromptInterface } from 'projects/bitbybit/src/blocks/_shared/models/prompt.interface';
import { EnterMonacoDialogComponent } from '../components/enter-monaco-dialog/enter-monaco-dialog.component';
import { monacoDialogResultEnum } from '../models/monaco-dialog-result.enum';
import { AboutDialogComponent } from '../components/about-dialog/about-dialog.component';
import { AlertDialogComponent } from '../components/alert-dialog/alert-dialog.component';
import { ExamplesDialogComponent } from '../components/examples-dialog/examples-dialog.component';
import { PrintSaveDialogComponent } from '../components/print-save-dialog/print-save-dialog.component';
import { PromptDialogComponent } from '../components/prompt-dialog/prompt-dialog.component';
import { SettingsDialogComponent } from '../components/settings-dialog/settings-dialog.component';
import { SponsorsDialogComponent } from '../components/sponsors-dialog/sponsors-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { EnterBlocklyDialogComponent } from '../components/enter-blockly-dialog/enter-blockly-dialog.component';
import { Workspace } from 'blockly';
import { PrintSaveInterface } from 'projects/bitbybit-core/src/public-api';
import { Observable } from 'rxjs';

@Injectable()
export class DialogService {

    constructor(
        public dialog: MatDialog,
    ){}

    openEnterMonacoDialog(): Observable<monacoDialogResultEnum> {
        const dialogRef = this.dialog.open(EnterMonacoDialogComponent,
            {
                width: '600px',
                height: 'auto',
                maxHeight: 'calc(100vh - 20px)',
                autoFocus: false,
            });
        return dialogRef.afterClosed();
    }

    openEnterBlocklyDialog(): Observable<monacoDialogResultEnum> {
        const dialogRef = this.dialog.open(EnterBlocklyDialogComponent,
            {
                width: '600px',
                height: 'auto',
                maxHeight: 'calc(100vh - 20px)',
                autoFocus: false,
            });
        return dialogRef.afterClosed();
    }

    openAlertDialog(error: { title: string, details: string, message: string }): void {
        this.dialog.open(AlertDialogComponent, {
            width: '600px',
            height: 'auto',
            maxHeight: 'calc(100vh - 20px)',
            autoFocus: false,
            data: error,
        });
    }

    openExamplesDialog(): void {
        this.dialog.open(ExamplesDialogComponent, {
            width: '600px',
            height: 'auto',
            maxHeight: 'calc(100vh - 20px)',
            autoFocus: false
        });
    }

    openAboutDialog(): void {
        this.dialog.open(AboutDialogComponent, {
            width: '600px',
            height: 'auto',
            maxHeight: 'calc(100vh - 20px)',
            autoFocus: false
        });
    }

    openSponsorsDialog(): void {
        this.dialog.open(SponsorsDialogComponent, {
            width: '700px',
            height: 'auto',
            maxHeight: 'calc(100vh - 20px)',
            autoFocus: false
        });
    }

    openSettingsDialog(workspace: Workspace): void {
        this.dialog.open(SettingsDialogComponent, {
            width: '500px',
            height: 'auto',
            maxHeight: 'calc(100vh - 20px)',
            autoFocus: false,
            data: {
                workspace
            }
        });
    }

    openPrintSaveDialog(prompt: PrintSaveInterface): void {
        this.dialog.open(PrintSaveDialogComponent, {
            width: '500px',
            height: 'auto',
            maxHeight: 'calc(100vh - 20px)',
            autoFocus: false,
            data: prompt
        });
    }

    openPromptDialog(prompt: PromptInterface): void {
        const dialogRef = this.dialog.open(PromptDialogComponent, {
            width: '500px',
            height: 'auto',
            maxHeight: 'calc(100vh - 20px)',
            autoFocus: false,
            data: prompt
        });

        dialogRef.afterClosed().subscribe(result => {
            prompt.callback(null);
        });
    }


}
