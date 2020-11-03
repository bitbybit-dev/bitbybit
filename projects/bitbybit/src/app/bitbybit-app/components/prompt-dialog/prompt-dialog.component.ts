import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PromptInterface } from '../../../../blocks/_shared/models/prompt.interface';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { constantsModel } from '../../models/constants.model';

// based on https://blockly-demo.appspot.com/static/demos/custom-dialogs/custom-dialog.js
@Component({
    selector: 'app-prompt-dialog',
    styleUrls: ['./prompt-dialog.component.scss'],
    templateUrl: './prompt-dialog.component.html',
})
export class PromptDialogComponent implements OnInit {
    constants = constantsModel;
    resources: ResourcesInterface;
    promptForm;

    constructor(
        public dialogRef: MatDialogRef<PromptDialogComponent>,
        private readonly formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: PromptInterface) { }

    ngOnInit(): void {
        this.resources = ResourcesService.getResources();
        this.promptForm = this.formBuilder.group({
            promptValue: this.data.defaultValue,
          });
    }

    onClose(): void {
        this.dialogRef.close();
    }

    onSubmit(): void {
        this.data.callback(this.promptForm.value.promptValue);
        this.onClose();
    }

}
