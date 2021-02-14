import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourcesInterface, ResourcesService } from 'projects/bitbybit/src/resources';
import { forkJoin } from 'rxjs';
import { DatabaseService } from '../../database/database.service';
import { Project } from '../../database/models/project';

@Component({
    selector: 'app-projects-overview',
    templateUrl: './projects-overview.component.html',
    styleUrls: ['./projects-overview.component.scss']
})
export class ProjectsOverviewComponent implements OnInit {
    resources: ResourcesInterface;
    projects: Project[];
    activeProjectId: number;
    activeProjectTitle: string;

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly router: Router,
        private readonly route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.databaseService.projects.getFullProjects().subscribe(projects => {
            this.projects = projects;
        });
        this.resources = ResourcesService.getResources();
    }

    projectNew(): void {
        this.router.navigate(['add'], { relativeTo: this.route });
    }

    projectEdit(id: number, event: Event): void {
        event.stopPropagation();
        this.router.navigate([id, 'edit'], { relativeTo: this.route });
    }

    projectDelete(id: number, event: Event): void {
        event.stopPropagation();
        // first remove all assets and scripts
        const project = this.projects.find(p => p.id === id);
        const assetIds = project.assets.map(a => a.id);
        const blocklyIds = project.blockly.map(b => b.id);
        const typescriptIds = project.typescript.map(t => t.id);

        const observables = [];
        if (assetIds.length > 0) {
            observables.push(this.databaseService.assets.deleteIds(assetIds));
        }
        if (blocklyIds.length > 0) {
            observables.push(this.databaseService.blockly.deleteIds(blocklyIds));
        }
        if (typescriptIds.length > 0) {
            observables.push(this.databaseService.typescript.deleteIds(typescriptIds));
        }

        if (observables.length > 0) {
            forkJoin(observables).subscribe(s => {
                this.databaseService.projects.delete(id).subscribe(() => {
                    this.projects = this.projects.filter(p => p.id !== id);
                });
            });
        } else {
            // project is empty
            this.databaseService.projects.delete(id).subscribe(() => {
                this.projects = this.projects.filter(p => p.id !== id);
            });
        }
    }

    blocklyAdd(projectId: number): void {
        this.router.navigate([projectId, 'blockly', 'add'], { relativeTo: this.route });
    }

    blocklyLaunch(projectId: number, blocklyId: number): void {
        this.router.navigate(['../'], { queryParams: { project: projectId, blockly: blocklyId }, relativeTo: this.route });
    }

    blocklyEdit(projectId: number, blocklyId: number): void {
        this.router.navigate([projectId, 'blockly', blocklyId, 'edit'], { relativeTo: this.route });
    }

    blocklyDelete(id: number, projectId: number): void {
        this.databaseService.blockly.delete(id).subscribe(() => {
            const project = this.projects.find(p => p.id === projectId);
            this.databaseService.projects.getProjectBlocklyScripts(projectId).subscribe(blockly => {
                project.blockly = blockly;
            });
        });
    }

    typescriptAdd(projectId: number): void {
        this.router.navigate([projectId, 'typescript', 'add'], { relativeTo: this.route });
    }

    typescriptLaunch(projectId: number, typescriptId: number): void {
        this.router.navigate(['../'], { queryParams: { project: projectId, blockly: typescriptId, editor: 'ts' }, relativeTo: this.route });
    }

    typescriptEdit(projectId: number, typescriptId: number): void {
        this.router.navigate([projectId, 'typescript', typescriptId, 'edit'], { relativeTo: this.route });
    }

    typescriptDelete(id: number, projectId: number): void {
        this.databaseService.typescript.delete(id).subscribe(() => {
            const project = this.projects.find(p => p.id === projectId);
            this.databaseService.projects.getProjectTypescriptScripts(projectId).subscribe(typescript => {
                project.typescript = typescript;
            });
        });
    }

    assetAdd(projectId: number): void {
        this.router.navigate([projectId, 'assets', 'add'], { relativeTo: this.route });
    }

    assetDelete(id: number, projectId: number): void {
        this.databaseService.assets.delete(id).subscribe(() => {
            const project = this.projects.find(p => p.id === projectId);
            this.databaseService.projects.getProjectAssets(projectId).subscribe(assets => {
                project.assets = assets;
            });
        });
    }
}
