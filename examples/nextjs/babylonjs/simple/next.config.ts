import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    
    webpack: (config, { isServer, webpack }) => {
        config.module.rules.find((k: any) => k.oneOf !== undefined).oneOf.unshift(
            {
                test: /\.wasm$/,
                type: "javascript/auto",
                loader: "file-loader",
                options: {
                    name: "static/js/[name].[contenthash:8].[ext]",
                },
            }
        );

        //this is needed for the bitbybit-occt modules
        config.module.rules.push({
            test: /\.json/,
            type: 'asset/resource'
        });
        
        return config;
    },
};

export default nextConfig;
