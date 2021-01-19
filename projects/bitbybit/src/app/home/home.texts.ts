export interface Texts {
    menu: { about: string, contact: string, app: string, school: string, docs: string };
    head: { title: string, listElements: string[] };
    definition: string;
    startTheAppButton: string;
    startTheAppExplanation: string;
    about: { title: string, paragraphs: string[] };
    school: { title: string, paragraphs: string[] };
    contact: { title: string, explanation: string, dl: { dt: string, dd: string }[], formExplanation: string };
}

export function texts(): Texts {
    return {
        menu: {
            about: 'About',
            contact: 'Contact',
            app: 'App',
            school: 'School',
            docs: 'API'
        },
        head: {
            title: 'Creative Coding',
            listElements: [
                'Design parametric 3D models',
                'Make data visualizations',
                'Create time based 3D simulations',
                'Learn programming through art',
                'Educate next generation of creators',
            ]
        },
        definition: `The "Bit by bit developers" company builds open-source tools and teaches courses that are available for the individuals, schools, coding bootcamps and government institutions involved in education. Our frictionless products can be adapted in many STEAM based programs. Get in touch if you would like to learn more, integrate our application in your curriculum or get personalised training.`,
        startTheAppButton: 'Start the Application!',
        startTheAppExplanation: 'Learn to code geometry. Start your journey by launching our web application, it is completely FREE.',
        about: {
            title: 'About',
            paragraphs: [
                '"Bit by bit developers" LLC is based in Lithuania. We provide the 3D visual programming platform, tools, educational STEAM based material and consulting services to individuals and our partners.',
                'By treating education and knowledge as the most valuable assets of society we are committed to enrich the EdTech environment with practical, accessible, easy to use solutions that work across devices and operating systems.',
            ]
        },
        school: {
            title: 'School',
            paragraphs: [
                '"Bit by bit developers school" is the place where you can learn programming, parametric design and modern manufacturing techniques.',
                'Purchase the course for yourself, for your family members, students or friends and experience the joy of creation together.',
            ]
        },
        contact: {
            title: 'Contact',
            explanation: 'Fill in the contact form to get a quote if you are',
            dl: [
                {
                    dt: 'Individual',
                    dd: 'Wanting to buy our online courses or order private online lessons.'
                }, {
                    dt: 'School Representative',
                    dd: 'Who needs support when integrating our tools in their educational institutions and preparing the staff.'
                }, {
                    dt: 'Government Institution',
                    dd: 'Willing to integrate new digital tools in education and enrich existing curriculum used in public schools.'
                }
            ],
            formExplanation: 'To submit this form you need to have the mail client app on your computer configured. Otherwise just contact us on',
        }
    };
}
