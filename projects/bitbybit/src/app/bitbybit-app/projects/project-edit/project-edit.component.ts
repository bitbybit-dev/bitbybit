import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../../database/database.service';
import { Project } from '../../database/models/project';

@Component({
  selector: 'app-project-edit',
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.scss']
})
export class ProjectEditComponent implements OnInit {

    project: Project;
    projectIdParam = 'projectId';

    form: FormGroup;

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
    ) { }

    ngOnInit(): void {
        const projectId = +this.route.snapshot.params[this.projectIdParam];
        this.databaseService.projects.getById(projectId).subscribe(p => {
            this.project = p;
            this.form = new FormGroup({
                title: new FormControl(p.title, [Validators.required]),
                description: new FormControl(p.description),
            });
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
            this.databaseService.projects.update(
                {
                    title: this.form.value.title,
                    description: this.form.value.description,
                }, this.project.id
            );
            this.router.navigate(['../../'], {
                relativeTo: this.route,
                queryParams: { projectId: this.project.id, success: 'blocklyEdit' }
            });
        }
    }
}
