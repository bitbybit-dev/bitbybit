import { Injectable } from '@angular/core';
import { ExamplesModel } from './models/examples.model';
import { ExampleInterface } from './interfaces/example.interface';

@Injectable()
export class ExamplesService {
    private readonly examples = new ExamplesModel();
    private readonly flatExamples: ExampleInterface[];

    constructor() {
        this.flatExamples = [...this.examples.basic, ...this.examples.middle, ...this.examples.advanced];
    }

    getExampleXml(example: string): string {
        if (example === 'advanced-lines-between-two-surfaces') {
            example = 'mid-lines-between-two-surfaces';
        }
        const exampleFound = this.flatExamples.find(s => s.queryParam === example);
        return exampleFound ? exampleFound.xml : undefined;
    }

    getExamples(): ExamplesModel{
        return this.examples;
    }
}
