import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { constantsModel } from '../../models/constants.model';

@Component({
    selector: 'app-sponsors-dialog',
    styleUrls: ['./sponsors-dialog.component.scss'],
    templateUrl: './sponsors-dialog.component.html',
})
export class SponsorsDialogComponent implements OnInit {
    constants = constantsModel;
    resources: ResourcesInterface;

    constructor(
        public dialogRef: MatDialogRef<SponsorsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit(): void {
        this.resources = ResourcesService.getResources();
    }

    onClose(): void {
        this.dialogRef.close();
    }

}
