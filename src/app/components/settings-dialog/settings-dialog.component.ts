import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Xml } from 'blockly';
import { constantsModel } from 'src/app/models/constants.model';
import { assembleBlocks } from 'src/blocks/assemble-blocks';
import { languagesEnum, ResourcesInterface, ResourcesService } from 'src/resources';
import { SettingsService } from '../../shared/setting.service';

@Component({
    selector: 'app-settings-dialog',
    styleUrls: ['./settings-dialog.component.scss'],
    templateUrl: './settings-dialog.component.html',
})
export class SettingsDialogComponent implements OnInit {
    constants = constantsModel;
    resources: ResourcesInterface;
    selected: languagesEnum;
    languagesEnum = languagesEnum;

    constructor(
        public dialogRef: MatDialogRef<SettingsDialogComponent>,
        private settingsService: SettingsService,
        private changeDetectorRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit() {
        this.resources = ResourcesService.getResources();
    }

    onClose(): void {
        this.dialogRef.close();
    }

    save() {
       this.settingsService.setLanguage(this.selected, this.data.workspace, this.changeDetectorRef);
    }

}
