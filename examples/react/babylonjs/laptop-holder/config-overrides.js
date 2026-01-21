module.exports = {
    webpack: (config) => {
        config.module.rules.find(k => k.oneOf !== undefined).oneOf.unshift(
            {
                test: /\.wasm$/,
                type: "javascript/auto",
                loader: "file-loader",
                options: {
                    name: "static/js/[name].[contenthash:8].[ext]",
                },
            }
        );
        config.resolve.fallback =
        {
            fs: false,
            perf_hooks: false,
            os: false,
            path: false,
            worker_threads: false,
            crypto: false,
            stream: false,
            module: false
        }
        //this is needed for the bitbybit-occt modules
        config.module.rules.push({
            test: /\.m?js/,
            type: "javascript/auto",
        })
        config.module.rules.push({
            test: /\.m?js/,
            resolve: {
                fullySpecified: false,
            },
        })
        return config;
    },
};
