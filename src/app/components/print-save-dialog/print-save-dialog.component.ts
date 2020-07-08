import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PrintSaveInterface } from '../../../blocks/_shared/models/print-save.model';
import { ResourcesInterface, ResourcesService } from '../../../resources';
import { constantsModel } from '../../models/constants.model';
import { FormBuilder } from '@angular/forms';

@Component({
    selector: 'app-print-save-dialog',
    styleUrls: ['./print-save-dialog.component.scss'],
    templateUrl: './print-save-dialog.component.html',
})
export class PrintSaveDialogComponent implements OnInit {
    constants = constantsModel;
    resources: ResourcesInterface;
    printSaveForm;

    constructor(
        public dialogRef: MatDialogRef<PrintSaveDialogComponent>,
        private readonly formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: PrintSaveInterface) { }

    ngOnInit(): void {
        this.resources = ResourcesService.getResources();
        this.printSaveForm = this.formBuilder.group({
            text: this.data.text,
            fileName: this.resources.app_default_file_name,
            extension: this.resources.app_default_file_extension,
          });
    }

    onClose(): void {
        this.dialogRef.close();
    }

    onSubmit(): void {
        const blob = new Blob([this.printSaveForm.value.text], { type: 'text' });
        const blobUrl = URL.createObjectURL(blob);

        const fileLink = document.createElement('a');
        fileLink.href = blobUrl;
        fileLink.target = '_self';
        fileLink.download = `${this.printSaveForm.value.fileName}.${this.printSaveForm.value.extension}`;
        fileLink.click();
        fileLink.remove();
    }

}
