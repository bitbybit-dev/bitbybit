import { Component } from '@angular/core';
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router
    ) {
    }

    ngOnInit() {
        if (window.location.search.includes('?examples=')) {
            this.router.navigateByUrl('app' + window.location.search);
        }
    }
}
