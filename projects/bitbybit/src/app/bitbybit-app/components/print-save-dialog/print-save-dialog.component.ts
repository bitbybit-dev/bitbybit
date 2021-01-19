import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PrintSaveInterface } from 'projects/bitbybit-core/src/public-api';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { constantsModel } from '../../models/constants.model';

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
        if(Array.isArray(this.data.text)){
            this.data.text = this.data.text.map(txt => {
                return `${txt}
`;
            }).join('');
        }
        if (this.data.isJson) {
            this.printSaveForm = this.formBuilder.group({
                text: this.data.text,
                fileName: this.resources.app_default_file_name,
                extension: 'json',
            });
        } else {
            this.printSaveForm = this.formBuilder.group({
                text: this.data.text,
                fileName: this.resources.app_default_file_name,
                extension: this.resources.app_default_file_extension,
            });
        }
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
