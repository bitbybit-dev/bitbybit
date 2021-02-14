import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '../../../database/database.service';
import { Project } from '../../../database/models/project';
import { TypeScript } from '../../../database/models/typescript-script';

@Component({
  selector: 'app-typescript-edit',
  templateUrl: './typescript-edit.component.html',
  styleUrls: ['./typescript-edit.component.scss']
})
export class TypescriptEditComponent implements OnInit {

    project: Project;
    typescript: TypeScript;
    typescriptIdParam = 'typescriptId';
    projectIdParam = 'projectId';

    form: FormGroup;
    fileExtensionsConsistent = true;

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
    ) { }

    ngOnInit(): void {
        const typescriptId = +this.route.snapshot.params[this.typescriptIdParam];
        const projectId = +this.route.snapshot.params[this.projectIdParam];
        this.databaseService.typescript.getById(typescriptId).subscribe(t => {
            this.typescript = t;
            this.form = new FormGroup({
                title: new FormControl(t.title, [Validators.required]),
            });
        });
        this.databaseService.projects.getById(projectId).subscribe(p => {
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
            this.databaseService.typescript.update(
                {
                    title: this.form.value.title,
                }, this.typescript.id
            );
            this.router.navigate(['../../../../'], {
                relativeTo: this.route,
                queryParams: { projectId: this.project.id, success: 'typescriptEdit' }
            });
        }
    }
}
