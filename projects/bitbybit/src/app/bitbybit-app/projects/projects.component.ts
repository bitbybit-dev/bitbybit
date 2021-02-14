import { Component, OnInit } from '@angular/core';
import { ResourcesInterface, ResourcesService } from 'projects/bitbybit/src/resources';


@Component({
    selector: 'app-projects',
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

    resources: ResourcesInterface;

    constructor(
    ) { }

    ngOnInit(): void {
        this.resources = ResourcesService.getResources();
    }
}
