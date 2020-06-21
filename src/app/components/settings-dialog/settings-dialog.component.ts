import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Xml } from 'blockly';
import { constantsModel } from 'src/app/models/constants.model';
import { assembleBlocks } from 'src/blocks/assemble-blocks';
import { languagesEnum, ResourcesInterface, ResourcesService } from 'src/resources';

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
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit() {
        this.resources = ResourcesService.getResources();
    }

    onClose(): void {
        this.dialogRef.close();
    }

    save() {
        const litLan = import(`src/assets/blockly-languages/${this.selected}.js`);
        litLan.then(
            s => {
                s.activateLanguage();
                ResourcesService.setLanguage(this.selected);
                assembleBlocks();
                const xml = Xml.workspaceToDom(this.data.workspace);
                this.data.workspace.clear();
                Xml.domToWorkspace(xml, this.data.workspace);
            });
    }
}
