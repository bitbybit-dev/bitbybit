import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { constantsModel } from '../../models/constants.model';

@Component({
    selector: 'app-about-dialog',
    styleUrls: ['./about-dialog.component.scss'],
    templateUrl: './about-dialog.component.html',
})
export class AboutDialogComponent implements OnInit {
    constants = constantsModel;
    resources: ResourcesInterface;

    constructor(
        public dialogRef: MatDialogRef<AboutDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit(): void {
        this.resources = ResourcesService.getResources();
    }

    onClose(): void {
        this.dialogRef.close();
    }

}
