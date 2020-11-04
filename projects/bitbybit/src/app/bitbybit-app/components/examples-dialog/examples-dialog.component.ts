import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ResourcesInterface, ResourcesService } from '../../../../resources';
import { ExamplesService } from '../../examples/example-service';
import { ExampleInterface } from '../../examples/interfaces/example.interface';
import { ExamplesModel } from '../../examples/models/examples.model';

@Component({
    selector: 'app-examples-dialog',
    styleUrls: ['./examples-dialog.component.scss'],
    templateUrl: './examples-dialog.component.html',
})
export class ExamplesDialogComponent implements OnInit {

    basicExamples: ExampleInterface[];
    mediumExamples: ExampleInterface[];
    advancedExamples: ExampleInterface[];
    resources: ResourcesInterface;

    constructor(
        public dialogRef: MatDialogRef<ExamplesDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit(): void {
        this.resources = ResourcesService.getResources();
        const examples = new ExamplesModel();
        this.basicExamples = examples.basic;
        this.mediumExamples = examples.middle;
        this.advancedExamples = examples.advanced;
    }

    onClose(): void {
        this.dialogRef.close();
    }

}
