import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DatabaseService } from '../../../database/database.service';
import { Project } from '../../../database/models/project';

@Component({
    selector: 'app-asset-add',
    templateUrl: './asset-add.component.html',
    styleUrls: ['./asset-add.component.scss']
})
export class AssetAddComponent implements OnInit, OnDestroy {

    project: Project;

    currentAssetFiles: File[] = [];
    filesFinishedReading = new Subject<File[]>();
    formSubmitted = false;

    form = new FormGroup({
        title: new FormControl('', [Validators.required]),
    });

    fileExtensionsConsistent = true;

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
    ) { }

    ngOnInit(): void {
        // tslint:disable-next-line: no-string-literal
        this.databaseService.projects.getById(+this.route.snapshot.params['projectId']).subscribe((p) => {
            this.project = p;

            setTimeout(() => {
                const inputFileElement = document.getElementById('assetFileUpload') as HTMLInputElement;
                inputFileElement.onchange = (e) => {
                    this.currentAssetFiles = [];
                    const files = inputFileElement.files;

                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        if (file) {
                            this.currentAssetFiles.push(file);
                        }
                    }
                    this.filesFinishedReading.next(this.currentAssetFiles);
                };
            });
        });

        this.filesFinishedReading.subscribe(files => {
            this.fileExtensionsConsistent = this.areExtensionsConsistent(this.currentAssetFiles);
        });
    }

    ngOnDestroy(): void {
        this.filesFinishedReading.complete();
    }

    getErrorMessage(): string {
        let result = '';
        if (this.form.controls.title.hasError('required')) {
            result = 'You must enter a value';
        }
        return result;
    }

    submit(): void {
        this.formSubmitted = true;
        if (this.form.valid && this.currentAssetFiles.length > 0 && this.fileExtensionsConsistent) {
            this.databaseService.assets.create(
                {
                    projectId: this.project.id,
                    title: this.form.value.title,
                    files: this.currentAssetFiles,
                    extension: this.getExtension(this.currentAssetFiles[0]),
                    date: Date.now(),
                    lastEditedDate: Date.now()
                }
            );
            this.formSubmitted = false;
            this.router.navigate(['../../../'], {
                relativeTo: this.route,
                queryParams: { projectId: this.project.id, success: 'assetAdd' }
            });
        }
    }

    areExtensionsConsistent(assetFiles: File[]): boolean {
        const firstExtension = this.getExtension(assetFiles[0]);
        return !assetFiles.some(file => this.getExtension(file) !== firstExtension);
    }

    getExtension(file: File): string {
        if (file && file.name && file.name.includes('.')) {
            return file.name.split('.').pop().toLowerCase();
        } else {
            return '';
        }
    }

}
