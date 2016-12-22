var fs = require("fs");
var path = require("path");

var getEntryPoints = function() {
    var dir = "calchart/static/src";
    var files = {};
    
    fs.readdirSync(dir).forEach(function(file) {
        var match = file.match(/(.*)\.js$/);
        if (match !== null) {
            files[match[1]] = "./" + dir + "/" + file;
        }
    });

    return files;
};

module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.loadNpmTasks("grunt-webpack");
    grunt.loadNpmTasks("grunt-contrib-watch");

    var entryPoints = getEntryPoints();

    grunt.initConfig({
        sass: {
            dist: {
                options: {
                    style: "compressed"
                },
                files: [{
                    expand: true,
                    cwd: "calchart/static/sass",
                    src: "**/*.scss",
                    dest: "calchart/static/css",
                    ext: ".css"
                }]
            }
        },
        webpack: {
            build: {
                entry: entryPoints,
                output: {
                    path: "calchart/static/js/",
                    filename: "[name].js"
                },
                resolve: {
                    root: [
                        path.resolve("./calchart/static/src")
                    ]
                }
            },
        },
        watch: {
            sass: {
                files: "calchart/static/sass/**/*.scss",
                tasks: "sass"
            },
            js: {
                files: ["calchart/static/src/**/*.js"],
                tasks: "webpack:build"
            }
        }
    });

    grunt.registerTask("build", ["sass", "webpack:build"]);
    grunt.registerTask("default", ["build", "watch"]);
};
