import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'bitbybit-docs';

    constructor(private readonly router: Router){
    }

    documentation(){
        this.router.navigate(['documentation']);
    }

    tutorials(){
        this.router.navigate(['tutorials']);
    }

    home(){
        this.router.navigate(['/']);
    }
}
