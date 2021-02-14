import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../../../database/database.service';
import { Project } from '../../../database/models/project';

@Component({
  selector: 'app-typescript-add',
  templateUrl: './typescript-add.component.html',
  styleUrls: ['./typescript-add.component.scss']
})
export class TypescriptAddComponent implements OnInit {


    project: Project;
    projectIdParam = 'projectId';

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
        this.databaseService.projects.getById(+this.route.snapshot.params[this.projectIdParam]).subscribe((p) => {
            this.project = p;
        });
    }

    getErrorMessage(): string {
        let result = '';
        if (this.form.controls.title.hasError('required')) {
            result = 'You must enter a value';
        }
        return result;
    }

    submit(): void {
        if (this.form.valid) {
            this.databaseService.typescript.create(
                {
                    projectId: this.project.id,
                    title: this.form.value.title,
                    script: '',
                    date: Date.now(),
                    lastEditedDate: Date.now()
                }
            );
            this.router.navigate(['../../../'], {
                relativeTo: this.route,
                queryParams: { projectId: this.project.id, success: 'typescriptAdd' }
            });
        }
    }
}
