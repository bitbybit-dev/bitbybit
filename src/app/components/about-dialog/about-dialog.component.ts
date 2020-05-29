import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { constantsModel } from 'src/app/models/constants.model';

@Component({
    selector: 'about-dialog',
    styleUrls: ['./about-dialog.component.scss'],
    templateUrl: './about-dialog.component.html',
})
export class AboutDialogComponent {
    constants = constantsModel;
    constructor(
        public dialogRef: MatDialogRef<AboutDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

}