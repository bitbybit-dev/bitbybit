There are some problems with the "fs", "path" and other node type modules with latest angular vite, and there are difference between how serve and build commands work. Use this angular.json to build for production:
Another option is to use optimization: true in development configuration and always use this configuration (but this slows down rebuilds and isn't veyr convenient).

{
    "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
    "cli": {
        "analytics": "1e1de97b-a744-405a-8b5a-0397bb3d01ce"
    },
    "newProjectRoot": "projects",
    "projects": {
        "demo": {
            "architect": {
                "build": {
                    "builder": "@angular/build:application",
                    "configurations": {
                        "development": {
                            "extractLicenses": false,
                            "namedChunks": true,
                            "optimization": false,
                            "sourceMap": true
                        },
                        "production": {
                            "aot": true,
                            "extractLicenses": true,
                            "namedChunks": false,
                            "optimization": true,
                            "outputHashing": "all",
                            "sourceMap": false
                        }
                    },
                    "options": {
                        "assets": [],
                        "index": "src/index.html",
                        "browser": "src/main.ts",
                        "outputPath": "dist/demo",
                        "polyfills": [
                            "zone.js"
                        ],
                        "scripts": [],
                        "styles": [
                            "src/global_styles.css"
                        ],
                        "tsConfig": "tsconfig.app.json",
                        "externalDependencies": [
                            "fs",
                            "module",
                            "path",
                            "crypto"
                        ]
                    }
                },
                "serve": {
                    "builder": "@angular/build:dev-server",
                    "configurations": {
                        "development": {
                            "buildTarget": "demo:build:development"
                        },
                        "production": {
                            "buildTarget": "demo:build:production"
                        }
                    },
                    "defaultConfiguration": "development"
                }
            },
            "prefix": "app",
            "projectType": "application",
            "root": "",
            "schematics": {},
            "sourceRoot": "src"
        }
    },
    "version": 1
}