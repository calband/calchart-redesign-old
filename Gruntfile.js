var path = require("path");

module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-webpack");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.initConfig({
        webpack: {
            build: {
                entry: {
                    home: "./src/home.js",
                    editor: "./src/editor.js",
                    viewer: "./src/viewer.js",
                    wiki: "./src/wiki.js",
                },
                output: {
                    path: path.resolve("calchart/static/js/"),
                    filename: "[name].js",
                },
                resolve: {
                    modules: [
                        // set import paths relative to src/ directory
                        path.resolve("./src"),
                        // needed for babel-runtime
                        path.resolve("./node_modules"),
                    ],
                },
                module: {
                    rules: [
                        {
                            test: /\.js$/,
                            // include: path.resolve("./src"),
                            exclude: /node_modules/,
                            use: {
                                loader: "babel-loader",
                                options: {
                                    presets: [
                                        // converts ES6 to ES5
                                        "es2015",
                                    ],
                                    plugins: [
                                        // reduces size by taking out redundant helper functions
                                        "transform-runtime",
                                    ],
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
                    src: "**/*.scss",
                    dest: "calchart/static/css",
                    ext: ".css",
                }],
            },
        },
        watch: {
            sass: {
                files: "calchart/static/sass/**/*.scss",
                tasks: "sass",
            },
            js: {
                files: ["src/**/*.js"],
                tasks: "webpack:build",
            },
        },
    });

    grunt.registerTask("build", ["sass", "webpack:build"]);
    grunt.registerTask("default", ["build", "watch"]);
};
