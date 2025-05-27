module.exports = {
    webpack: (config) => {
        config.resolve.fallback =
        {
            fs: false,
            perf_hooks: false,
            os: false,
            path: false,
            worker_threads: false,
            crypto: false,
            stream: false
        }
        config.module.rules.push({
            test: /\.m?js/,
            type: "javascript/auto",
        })
        config.module.rules.push({
            test: /\.m?js/,
            resolve: {
                fullySpecified: false,
            },
        });
        return config;
    },
};
