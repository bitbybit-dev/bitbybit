import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { languagesEnum, ResourcesInterface, ResourcesService } from '../../../../resources';
import { constantsModel } from '../../models/constants.model';
import { localStorageKeysEnum } from '../../shared/local-storage-keys.enum';
import { SettingsService } from '../../shared/setting.service';

@Component({
    selector: 'app-settings-dialog',
    styleUrls: ['./settings-dialog.component.scss'],
    templateUrl: './settings-dialog.component.html',
})
export class SettingsDialogComponent implements OnInit {
    constants = constantsModel;
    resources: ResourcesInterface;
    selectedLanguage: languagesEnum;
    languagesEnum = languagesEnum;
    browserStorage = window.localStorage;

    constructor(
        public dialogRef: MatDialogRef<SettingsDialogComponent>,
        private settingsService: SettingsService,
        private changeDetectorRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit() {
        this.resources = ResourcesService.getResources();
        this.selectedLanguage = this.browserStorage.getItem(localStorageKeysEnum.settingsLanguage) as languagesEnum;
    }

    onClose(): void {
        this.dialogRef.close();
    }

    save() {
        this.settingsService.setLanguage(this.selectedLanguage, this.data.workspace, this.changeDetectorRef);
        this.browserStorage.setItem(localStorageKeysEnum.settingsLanguage, this.selectedLanguage);
        this.dialogRef.close();
    }

}
