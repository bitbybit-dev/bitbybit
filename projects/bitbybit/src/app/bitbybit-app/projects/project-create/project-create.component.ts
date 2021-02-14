import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../../database/database.service';
import { Project } from '../../database/models/project';

@Component({
    selector: 'app-project-create',
    templateUrl: './project-create.component.html',
    styleUrls: ['./project-create.component.scss']
})
export class ProjectCreateComponent implements OnInit {

    form = new FormGroup({
        title: new FormControl('', [Validators.required]),
        description: new FormControl(''),
    });

    fileExtensionsConsistent = true;

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
    ) { }

    ngOnInit(): void {
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
            this.databaseService.projects.create(
                {
                    title: this.form.value.title,
                    description: this.form.value.description,
                    date: Date.now(),
                    lastEditedDate: Date.now()
                }
            ).subscribe(p => {
                this.router.navigate(['../'], {
                    relativeTo: this.route,
                    queryParams: { projectId: p.id, success: 'projectAdd' }
                });
            });
        }
    }
}
