const mvdir = require('mvdir');

mvdir('blockly-images/', 'ts-api-docs/assets/images/blockly-images/', { copy: true }).then(err => {
    if (!err) console.log('done.');
});