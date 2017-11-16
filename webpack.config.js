const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const src = path.resolve(__dirname, 'vue_src');
const static = path.resolve(__dirname, 'calchart', 'static');

/**** ENTRYPOINTS ****/

var entryPoints = {
    calchart: path.resolve(src, 'calchart.js'),
};

fs.readdirSync(path.resolve(src, 'scss'))
    .filter(function(s) {
        return s.endsWith('.scss');
    })
    .forEach(function(file) {
        var name = path.basename(file, path.extname(file));
        entryPoints[name] = path.resolve(src, 'scss', file);
    });

/**** LOADER OPTIONS ****/

const babelLoaderOptions = {
    minified: true,
    comments: false,
    // faster compilation
    cacheDirectory: true,
};

const cssLoader = {
    loader: 'css-loader',
    options: {
        url: false,
    },
};

const partials = path.resolve(src, 'scss', 'partials');
const sassResourcesLoaderOptions = {
    resources: [
        path.resolve(partials, '_vars.scss'),
        path.resolve(partials, '_mixins.scss'),
        path.resolve(partials, '_functions.scss'),
    ],
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
};

/**** WEBPACK CONFIG ****/

webpackConfig = {
    context: src,
    entry: entryPoints,
    output: {
        path: static,
        filename: '[name].js',
    },
    resolve: {
        extensions: ['.js', '.vue'],
        alias: {
            'vue': 'vue/dist/vue.esm.js',
        },
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
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract([
                    cssLoader,
                    'sass-loader',
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

if (process.env.NODE_ENV === 'test') {
    webpackConfig.externals = [require('webpack-node-externals')()];
    webpackConfig.devtool = 'inline-cheap-module-source-map';
    webpackConfig.resolve.modules.push(path.resolve(__dirname));
}

module.exports = webpackConfig;
