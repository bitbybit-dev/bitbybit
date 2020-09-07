import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

    loaded = false;

    constructor() { }

    ngOnInit() {
    }

    getStarted() {
        window.open('https://bitbybit.dev');
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.loaded = true;
        }, 1000);
    }

}
