const path = require("path");

module.exports = function override(config, env) {
    //do stuff with the webpack config...
    config.resolve.alias = {
        ...config.resolve.alias,
        "@": path.resolve(__dirname, "src"),
        "@@": path.resolve(__dirname, "src/components"),
    };

    config.module.rules.push({
        test: /\.m?js/,
        resolve: {
            fullySpecified: false,
        },
    });

    return config;
}