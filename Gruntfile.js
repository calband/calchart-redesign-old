var path = require("path");

module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-webpack");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.initConfig({
        webpack: {
            build: {
                entry: {
                    editor: "./src/editor.js",
                    wiki: "./src/wiki.js",
                },
                output: {
                    path: path.resolve("calchart/static/js/"),
                    filename: "[name].js",
                },
                // set import paths relative to src/ directory
                resolve: {
                    modules: [
                        path.resolve("./src")
                    ],
                },
                module: {
                    loaders: [
                        // convert ES6 to ES5
                        {
                            test: /\.js$/,
                            include: ["./src"],
                            loader: "babel-loader",
                            query: {
                                presets: ["es2015"],
                                plugins: [
                                    ["babel-plugin-transform-builtin-extend", {
                                        globals: ["Error"],
                                    }],
                                ],
                                minified: true,
                                comments: false,
                                cacheDirectory: true,
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
