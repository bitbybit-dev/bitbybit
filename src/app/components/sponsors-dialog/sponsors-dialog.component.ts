import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { constantsModel } from 'src/app/models/constants.model';

@Component({
    selector: 'sponsors-dialog',
    styleUrls: ['./sponsors-dialog.component.scss'],
    templateUrl: './sponsors-dialog.component.html',
})
export class SponsorsDialogComponent {
    constants = constantsModel;
    constructor(
        public dialogRef: MatDialogRef<SponsorsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

}