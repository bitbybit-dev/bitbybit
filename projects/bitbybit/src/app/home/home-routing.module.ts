import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { DocumentationComponent } from './documentation/documentation.component';
import { TutorialsComponent } from './tutorials/tutorials.component';
import { TutorialsHomeComponent } from './tutorials/tutorials-home/tutorials-home.component';
import { IntroductionToUiComponent } from './tutorials/introduction-to-ui/introduction-to-ui.component';
import { ExplanationOfAlgorithmsComponent } from './tutorials/explanation-of-algorithms/explanation-of-algorithms.component';
import { LandingPageComponent } from './landing-page/landing-page.component';

const routes: Routes = [
    {
        path: '', component: HomeComponent,
        children: [
            {
                path: '',
                component: LandingPageComponent
            }
        ]
    },
    { path: 'documentation', component: DocumentationComponent },
    {
        path: 'tutorials',
        component: TutorialsComponent,
        children: [
            {
                path: '',
                component: TutorialsHomeComponent
            },
            {
                path: 'getting-started',
                children: [
                    {
                        path: 'introduction-to-ui',
                        component: IntroductionToUiComponent
                    },
                    {
                        path: 'explanation-of-algorithms',
                        component: ExplanationOfAlgorithmsComponent
                    }
                ]
            },
        ]

    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class HomeRoutingModule { }
