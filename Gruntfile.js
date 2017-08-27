var path = require("path");
var eslint = require("eslint");

// https://vue-loader.vuejs.org/en/configurations/advanced.html
var vueLoaderOptions = {
    // TODO: https://vue-loader.vuejs.org/en/configurations/extract-css.html
    loaders: {
        scss: [
            "vue-style-loader",
            "css-loader",
            "sass-loader",
            {
                loader: "sass-resources-loader",
                options: {
                    resources: [
                        path.resolve(__dirname, 'calchart/static/sass/partials/_vars.scss'),
                        path.resolve(__dirname, 'calchart/static/sass/partials/_mixins.scss'),
                    ],
                },
            },
        ],
    },
};

module.exports = function(grunt) {
    grunt.loadNpmTasks("grunt-webpack");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.initConfig({
        webpack: {
            build: {
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
                                options: vueLoaderOptions,
                            },
                        },
                        {
                            test: /\.js$/,
                            exclude: /node_modules/,
                            use: {
                                loader: "babel-loader",
                                options: {
                                    minified: true,
                                    comments: false,
                                    // faster compilation
                                    cacheDirectory: true,
                                },
                            },
                        },
                    ],
                },
                // emit source maps
                devtool: "source-map",
                // control output
                stats: "normal",
            },
        },
        sass: {
            dist: {
                options: {
                    style: "compressed",
                },
                files: [{
                    expand: true,
                    cwd: "calchart/static/sass",
                    src: "*.scss",
                    dest: "calchart/static/css",
                    ext: ".css",
                }],
            },
        },
        watch: {
            // for non-Vue SASS files
            sass: {
                files: "calchart/static/sass/*.scss",
                tasks: "sass",
            },
            sass_partials: {
                files: "calchart/static/sass/partials/*.scss",
                tasks: "build",
            },
            js: {
                files: ["vue_src/**/*.js", "vue_src/**/*.vue"],
                tasks: "webpack:build",
            },
        },
    });

    grunt.registerTask("build", ["sass", "webpack:build"]);
    grunt.registerTask("default", ["build", "watch"]);

    // // our custom task for linting
    // grunt.registerTask("lint", "Run the ESLint linter.", function() {
    //     var engine = new eslint.CLIEngine();
    //     var report = engine.executeOnFiles(["src/"]);
    //     var formatter = engine.getFormatter();
    //     var output = formatter(report.results);

    //     if (report.errorCount + report.warningCount > 0) {
    //         grunt.log.writeln(output);
    //         grunt.fail.warn("Linting failed.");
    //     } else {
    //         grunt.log.writeln("No linting errors.");
    //     }
    // });
};
