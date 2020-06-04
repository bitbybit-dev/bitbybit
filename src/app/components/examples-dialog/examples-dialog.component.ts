import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ExamplesService } from 'src/app/examples/example-service';
import { ExampleInterface } from 'src/app/examples/interfaces/example.interface';

@Component({
    selector: 'app-examples-dialog',
    styleUrls: ['./examples-dialog.component.scss'],
    templateUrl: './examples-dialog.component.html',
})
export class ExamplesDialogComponent implements OnInit {

    basicExamples: ExampleInterface[];
    mediumExamples: ExampleInterface[];
    advancedExamples: ExampleInterface[];

    constructor(
        public dialogRef: MatDialogRef<ExamplesDialogComponent>,
        public readonly exampleService: ExamplesService,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit(): void {
        const examples = this.exampleService.getExamples();
        this.basicExamples = examples.basic;
        this.mediumExamples = examples.middle;
        this.advancedExamples = examples.advanced;
    }

    onClose(): void {
        this.dialogRef.close();
    }

}