export interface Texts {
    menu: { about: string, contact: string, app: string };
    head: { title: string, listElements: string[] };
    definition: string;
    startTheAppButton: string;
    startTheAppExplanation: string;
    about: { title: string, paragraphs: string[] };
    contact: { title: string, explanation: string, dl: { dt: string, dd: string }[], formExplanation: string };
}

export function texts(): Texts {
    return {
        menu: {
            about: 'About',
            contact: 'Contact',
            app: 'App',
        },
        head: {
            title: 'Value Education',
            listElements: [
                'To our community we provide the most valuable asset class in the world - knowledge.',
                'We give our users powerful design & coding tools that empower to learn & teach others by making things.',
                'We combine Science, Technology, Engineering, the Arts and Mathematics (STEAM) in our tools & our teaching methodology.',
            ]
        },
        definition: `The "Bit by bit developers" company build tools that are free, open-source & available for the individuals, schools, coding bootcamps & government institutions responsible for education. Our frictionless products can be adapted in many STEAM based programs. Get in touch if you would like to learn more, integrate our applciation in your curriculum or get personalised training.`,
        startTheAppButton: 'Start the Applciation!',
        startTheAppExplanation: 'Learn to code through visual programming of geometry. Start your journey by launching our web application, it is completely FREE.',
        about: {
            title: 'About',
            paragraphs: [
                '"Bit by bit developers" LLC is based in Lithuania (EU). We provide the 3D visual programming platform, tools, educational STEAM based material & consulting services to individuals and our partners.',
                'By treating education and knowledge as the most valuable assets of society we are committed to enrich EdTech environment with practical, accessible, easy to use solutions that work accross devices and operating systems.',
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
            formExplanation: 'To submit this form you need to have mail client app on your computer configured. Otherwise just contact us on',
        }
    };
}
