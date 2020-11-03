import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    title = 'bitbybit-docs';

    constructor(private readonly router: Router) {
    }

    ngOnInit(): void {
        this.router.events.subscribe(event => {
            if (event instanceof onanimationend) {
                window.scroll({ top: 0 });
            };
        });
    }

    documentation(): void {
        this.router.navigate(['documentation']);
    }

    tutorials(): void {
        this.router.navigate(['tutorials']);
    }

    home(): void {
        this.router.navigate(['/']);
    }

}
