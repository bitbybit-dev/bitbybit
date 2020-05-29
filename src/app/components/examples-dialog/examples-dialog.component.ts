import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
    selector: 'examples-dialog',
    templateUrl: './examples-dialog.component.html',
  })
  export class ExamplesDialogComponent {
  
    constructor(
      public dialogRef: MatDialogRef<ExamplesDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any) {}
  
    onNoClick(): void {
      this.dialogRef.close();
    }
  
  }