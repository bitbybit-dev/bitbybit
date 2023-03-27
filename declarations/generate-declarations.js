var fs = require('fs');

var walkPathOCCTWorker = 'node_modules/bitbybit-occt-worker/lib/api';
var walkPathBase = './declarations/generated-dec/bitbybit/lib/api/bitbybit';
var walkPathInputs = './declarations/generated-dec/bitbybit/lib/api/inputs';
var walkPathOCCTInputs = 'node_modules/bitbybit-occt/lib/api/inputs';

let completeDeclarations = '';

var walk = function (dir, done) {
    fs.readdir(dir, function (error, list) {
        console.log(dir);
        console.log(list);
        if (error) {
            return done(error);
        }

        var i = 0;

        (function next() {
            var file = list[i++];

            if (!file) {
                return done(null);
            }

            file = dir + '/' + file;

            fs.stat(file, function (error, stat) {

                if (stat && stat.isDirectory()) {
                    walk(file, function (error) {
                        next();
                    });
                } else {
                    // do stuff to file here
                    if (file.includes('.d.ts')){
                        try {
                            var data = fs.readFileSync(file, 'utf8');
                            completeDeclarations += simplifyDeclaration(data.toString());

                        } catch (e) {
                            console.log('Error:', e.stack);
                        }
                    }
                    next();
                }
            });
        })();
    });
};


walk(walkPathOCCTWorker, () => {
    fs.writeFileSync('./declarations/declarationsOCCTWorker.ts', `export const occtWorkerDeclarations = \`${completeDeclarations}\`;
    `, 'utf8', () => {
    });
    completeDeclarations = '';

    walk(walkPathBase, () => {
        fs.writeFileSync('./declarations/declarationsBase.ts', `export const baseDeclarations = \`${completeDeclarations}\`;
`, 'utf8', () => {
        });
        completeDeclarations = '';

        walk(walkPathInputs, () => {
            fs.writeFileSync('./declarations/declarationsInputs.ts', `export const inputDeclarations = \`${completeDeclarations}\`;
    `, 'utf8', () => {
            });
            completeDeclarations = '';

            walk(walkPathOCCTInputs, () => {
                fs.writeFileSync('./declarations/declarationsOCCTInputs.ts', `export const inputOCCTDeclarations = \`${completeDeclarations}\`;
        `, 'utf8', () => {
                });
                completeDeclarations = '';
            });
        });
    });
});


function simplifyDeclaration(declaration) {
    // declaration files for monaco don't need to export anything
    declaration = declaration.replace(/export /g, '');
    // remove all html image data
    const arrayOfLines = declaration.match(/[^\r\n]+/g);
    const noHtml = arrayOfLines.filter(line =>
        !(line.includes('<div>') || line.includes('<img') || line.includes('</div>') || line.includes('import') || line.includes('export ')|| line.includes('* from'))
    );
    const remainder = noHtml.join('\n');
    return remainder;
}