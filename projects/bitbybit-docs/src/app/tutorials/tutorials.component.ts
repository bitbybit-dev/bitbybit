import { Component, OnInit } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';

@Component({
    selector: 'app-tutorials',
    templateUrl: './tutorials.component.html',
    styleUrls: ['./tutorials.component.scss']
})
export class TutorialsComponent implements OnInit {

    sideNavOpen = true;
    treeControl = new NestedTreeControl<TutorialNode>(node => node.children);
    dataSource = new MatTreeNestedDataSource<TutorialNode>();

    constructor() {
        this.dataSource.data = TREE_DATA;
    }

    hasChild = (_: number, node: TutorialNode) => !!node.children && node.children.length > 0;
    ngOnInit() {
    }

    toggleSidenav() {
        this.sideNavOpen = !this.sideNavOpen;
    }
}

/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
interface TutorialNode {
    name: string;
    link?: string;
    children?: TutorialNode[];
}

const TREE_DATA: TutorialNode[] = [
    {
        name: 'Tutorials',
        link: '/tutorials',
    },
    {
        name: 'Getting Started',
        children: [
            { name: 'Introduction to UI', link: 'getting-started/introduction-to-ui' },
        ]
    }
];
