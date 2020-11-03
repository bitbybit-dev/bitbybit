import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit, AfterViewInit {

    loaded = false;
    constructor() { }

    ngOnInit(): void {
    }

    getStarted(): void {
        window.open('https://bitbybit.dev');
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.loaded = true;
        }, 1000);
    }


}
