module.exports = {
    module: {
        rules: [
            {
                test: /\.wasm$/,
                type: "javascript/auto",
                loader: "file-loader",
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
        ]
    },
    resolve: {
        fallback: {
            fs: false,
            path: false,
            crypto: false
        }
    }
};
