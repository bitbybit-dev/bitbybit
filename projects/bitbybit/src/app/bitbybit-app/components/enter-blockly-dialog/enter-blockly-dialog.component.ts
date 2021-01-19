import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { constantsModel } from '../../models/constants.model';
import { monacoDialogResultEnum } from '../../models/monaco-dialog-result.enum';

@Component({
    selector: 'app-enter-blockly',
    styleUrls: ['./enter-blockly-dialog.component.scss'],
    templateUrl: './enter-blockly-dialog.component.html',
})
export class EnterBlocklyDialogComponent implements OnInit {
    constants = constantsModel;
    resources: ResourcesInterface;

    constructor(
        public dialogRef: MatDialogRef<EnterBlocklyDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit(): void {
        this.resources = ResourcesService.getResources();
    }

    onSaveAndContinue(): void {
        this.dialogRef.close(monacoDialogResultEnum.saveAndContinue);
    }

    onContinue(): void {
        this.dialogRef.close(monacoDialogResultEnum.continue);
    }

    onCancel(): void {
        this.dialogRef.close(monacoDialogResultEnum.cancel);
    }

}
