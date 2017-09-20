const path = require("path");

const babelLoaderOptions = {
    minified: true,
    comments: false,
    // faster compilation
    cacheDirectory: true,
};

const sassResourcesLoaderOptions = {
    resources: [
        path.resolve(__dirname, 'calchart/static/sass/partials/_vars.scss'),
        path.resolve(__dirname, 'calchart/static/sass/partials/_mixins.scss'),
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
        alias: {
            "vue": "vue/dist/vue.esm.js",
        },
        modules: [
            path.resolve(__dirname, "vue_src"),
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
        contentBase: path.join(__dirname, "calchart"),
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    },
};
