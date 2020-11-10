import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ViewportScroller } from '@angular/common';
import { texts, Texts } from './home.texts';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    title = 'bitbybit-docs';
    menuOpen = false;
    contactForm;
    sentMail = false;

    texts: Texts;

    constructor(
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private viewportScroller: ViewportScroller) {
        this.contactForm = this.formBuilder.group({
            name: '',
            surname: '',
            message: '',
        });
    }

    ngOnInit(): void {


        this.route.queryParamMap.subscribe(param => {
            const exampleParam = param.get('examples');
            if (exampleParam) {
                this.router.navigate(['app?examples=' + param]);
            }
        });

        this.texts = texts();
    }

    submit(event): void {
        const fileLink = document.createElement('a');
        fileLink.href = `mailto:info@bitbybit.dev?subject=Contact form of ${event.name} ${event.surname}&body=${encodeURIComponent(event.message)}`;
        fileLink.target = '_self';
        fileLink.click();
        fileLink.remove();
        this.sentMail = true;
    }

    resetContactForm() {
        this.contactForm.reset();
        this.sentMail = false;
    }

    scroll(element: string, event): void {
        this.viewportScroller.scrollToAnchor(element);
        event.preventDefault();
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

    toggleMenu() {
        this.menuOpen = !this.menuOpen;
    }

}
