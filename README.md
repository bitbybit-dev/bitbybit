# BitByBit
Platform for programming geometry on the browser.

Visit https://bitbybit.dev and start your journey.

# About
BitByBit is an open source, community-based, frictionless web platform that allows creators to program geometry through simple visual programming language. This tool is great for all ages and can fulfil many artistic, educational, and practical needs of its users. Through familiar programming interface used in tools such as Scratch and Blockly.Games we expose powerful 3D algorithms that make it easier to implement various parametric tasks. Our goal is to make it very simple for users to share their ideas and designs by just exporting and importing scripts, uploading designs, and participating in lively discussions on Discord. We want to encourage everyone to engage in the future of this tool.
## Development server

Programming language that was implemented in BitByBit platform consists of basic building blocks that can compose various 3D shapes. Starting from simple points, lines and going into NURBS curves and surfaces. This model allows creators to learn by experimenting. 3D environment that is integrated in the platform provides instant feedback and gratification, which inspires users to grow and innovate.
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

# Principles
BitByBit will always keep it's Core free and opensource for its users. Principles of minimalism and simplicity are reflected in all of the design decisions we make. Application itself is frictionless, users don't need to create accounts or install browser plugins. We could not find a better Home screen for the application than the application itself. Website immediately starts the empty canvas for your code and an empty 3D world. All Core algorithms will always remain opensource and will not require any backend based server  infrastructure. This will allow application to be used on various devices as a Progressive Web App (PWA). After the application is loaded on your devices, internet connectivitiy will not be required for it to function.

# Major Dependencies

Verbnurbs, BabylonJS, Blockly, CSG.JS

To include CSG.JS manual steps had to be taken to build browserified version. This requires cloning latest V2 branch, then in src folder making a file "export.js" that contains a line "window.CSG = require('./index.js');". Then browserify command "browserify export.js --outfile csg-generated.js" can be used to build csg-generated.js file. angular.json includes script and CSG can be then accessed in bitbybit codebase via window.CSG.