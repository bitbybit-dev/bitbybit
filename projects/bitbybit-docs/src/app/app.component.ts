import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'bitbybit-docs';

    constructor(private readonly router: Router) {
    }

    ngOnInit() {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                window.scroll({top: 0});
            };
        });
    }

    documentation() {
        this.router.navigate(['documentation']);
    }

    tutorials() {
        this.router.navigate(['tutorials']);
    }

    home() {
        this.router.navigate(['/']);
    }
}
