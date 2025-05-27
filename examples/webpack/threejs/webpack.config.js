const path = require('path');
const version = "0.20.3";
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: "development",
    entry: {
        index: './src/index.ts',
        patterns: './src/code/patterns.ts',
        cupthree: './src/code/cup-three.ts',
        manifoldSlicedMesh: './src/code/manifold-sliced-mesh.ts',
        homepage: './src/code/homepage.ts',
    },
    devtool: 'inline-source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, 'src'),
        },
        compress: true,
        port: 9000,
        client: {
            overlay: {
                warnings: false,
                errors: true
            }
        }
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "./src/html", to: "./" },
            ],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /manifold.wasm$/,
                type: "javascript/auto",
                loader: "file-loader",
                options: {
                    name: "static/js/[name]-3-0-0.wasm",
                },
            },
            {
                test: /bitbybit-dev-occt.wasm$/,
                type: "javascript/auto",
                loader: "file-loader",
                options: {
                    name: "static/js/[name].[contenthash:8].[ext]",
                },
            },
            {
                test: /\.m?js/,
                type: "javascript/auto",
            },
            {
                test: /\.m?js/,
                resolve: {
                    fullySpecified: false,
                },
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        fallback: {
            fs: false,
            perf_hooks: false,
            os: false,
            path: false,
            worker_threads: false,
            crypto: false,
            stream: false,
            module: false,
        }
    },
    output: {
        filename: `[name].${version}.bundle.js`,
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
};