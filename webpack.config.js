const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const IS_TEST = process.env.NODE_ENV === 'test';

const src = path.resolve(__dirname, 'src');
const static = path.resolve(__dirname, 'calchart', 'static');

/**** LOADER OPTIONS ****/

const babelLoaderOptions = {
    minified: true,
    comments: false,
    cacheDirectory: true, // faster compilation
    presets: [
        // general transpiler for general browser compatability
        ['env', {
            targets: {
                browsers: ['last 2 versions'],
            },
        }],
    ],
    plugins: [
        // allow spread operator
        'transform-object-rest-spread',
    ],
};

const cssLoader = {
    loader: 'css-loader',
    options: {
        url: false,
    },
};

let resourcesDir = path.resolve(src, 'scss')
let resources = fs.readdirSync(resourcesDir)
    .filter(s => s.startsWith('_') && s.endsWith('.scss'));
const sassResourcesLoaderOptions = {
    resources: resources.map(s => path.resolve(resourcesDir, s)),
};

// https://vue-loader.vuejs.org/en/configurations/advanced.html
const vueLoaderOptions = {
    loaders: {
        js: [
            {
                loader: 'babel-loader',
                options: babelLoaderOptions,
            },
        ],
        scss: ExtractTextPlugin.extract([
            cssLoader,
            'sass-loader',
            {
                loader: 'sass-resources-loader',
                options: sassResourcesLoaderOptions,
            },
        ]),
        'context-menu': require.resolve('vue-ctxmenu/loader'),
    },
    preserveWhitespace: false,
};

/**** WEBPACK CONFIG ****/

const aliases = {};

if (IS_TEST) {
    aliases['vue$'] = 'vue/dist/vue.esm.js';
}

webpackConfig = {
    context: src,
    entry: {
        calchart: path.resolve(src, 'calchart.js'),
    },
    output: {
        path: static,
        filename: '[name].js',
    },
    resolve: {
        extensions: ['.js', '.vue'],
        alias: aliases,
        modules: [
            src,
            path.resolve(__dirname, 'node_modules'),
        ],
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: {
                    loader: 'vue-loader',
                    options: vueLoaderOptions
                },
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: babelLoaderOptions
                },
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract([
                    cssLoader,
                ]),
            },
        ],
    },
    plugins: [
        new CopyWebpackPlugin([
            'static',
        ], {
            ignore: [
                '.DS_Store',
            ],
        }),
        new ExtractTextPlugin({
            filename: '[name].css',
            allChunks: true,
        }),
    ],
    devtool: 'source-map',
    stats: 'normal',
    devServer: {
        host: '0.0.0.0',
        port: 4200,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    },
};

if (IS_TEST) {
    webpackConfig.externals = [nodeExternals({
        whitelist: [/\.css/],
    })];
    webpackConfig.devtool = 'inline-cheap-module-source-map';
    webpackConfig.resolve.modules.push(path.resolve(__dirname));
}

module.exports = webpackConfig;
