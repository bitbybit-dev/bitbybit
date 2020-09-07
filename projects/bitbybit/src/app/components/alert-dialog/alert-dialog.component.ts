import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { constantsModel } from '../../models/constants.model';

@Component({
    selector: 'alert-dialog',
    styleUrls: ['./alert-dialog.component.scss'],
    templateUrl: './alert-dialog.component.html',
})
export class AlertDialogComponent {
    constants = constantsModel;
    constructor(
        public dialogRef: MatDialogRef<AlertDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    onClose(): void {
        this.dialogRef.close();
    }

}