import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DocumentationComponent } from './documentation/documentation.component';
import { TutorialsComponent } from './tutorials/tutorials.component';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'documentation', component: DocumentationComponent },
    { path: 'tutorials', component: TutorialsComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
