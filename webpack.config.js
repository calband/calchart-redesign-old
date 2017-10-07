// project paths
const path = require("path");
const src = path.resolve(__dirname, "vue_src");
const static = path.resolve(__dirname, "calchart", "static");

const babelLoaderOptions = {
    minified: true,
    comments: false,
    // faster compilation
    cacheDirectory: true,
};

const partials = path.resolve(static, "sass", "partials");
const sassResourcesLoaderOptions = {
    resources: [
        path.resolve(partials, "_vars.scss"),
        path.resolve(partials, "_mixins.scss"),
        path.resolve(partials, "_functions.scss"),
    ],
};

// https://vue-loader.vuejs.org/en/configurations/advanced.html
const vueLoaderOptions = {
    loaders: {
        js: [
            {
                loader: "babel-loader",
                options: babelLoaderOptions,
            },
        ],
        // TODO: https://vue-loader.vuejs.org/en/configurations/extract-css.html
        scss: [
            "vue-style-loader",
            "css-loader",
            "sass-loader",
            {
                loader: "sass-resources-loader",
                options: sassResourcesLoaderOptions,
            },
        ],
        // our custom context-menu section
        "context-menu": path.resolve(src, "loaders", "context-menu-loader.js"),
    },
};

module.exports = {
    entry: {
        calchart: "calchart.js",
    },
    output: {
        path: path.resolve("calchart/static/js/"),
        filename: "[name].js",
    },
    resolve: {
        extensions: [".js", ".vue"],
        alias: {
            "vue": "vue/dist/vue.esm.js",
        },
        modules: [
            src,
            path.resolve(__dirname, "node_modules"),
        ],
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: {
                    loader: "vue-loader",
                    options: vueLoaderOptions
                },
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: babelLoaderOptions
                },
            },
        ],
    },
    devtool: "source-map",
    stats: "normal",
    devServer: {
        host: "0.0.0.0",
        port: 4200,
        contentBase: path.join(__dirname, "calchart", "static"),
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    },
};
