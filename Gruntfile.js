var fs = require("fs");
var path = require("path");

var getEntryPoints = function() {
    var dir = "calchart/static/src";
    var javascriptFiles = {};
    fs.readdirSync(dir, function(e, files) {
        if (e) {
            throw new Error(e);
        }
        files.forEach(function(file) {
            var match = file.match(/(.*)\.js$/);
            if (match !== null) {
                javascriptFiles[match[1]] = path.join(dir, file);
            }
        });
    });
    return javascriptFiles;
};

module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-contrib-sass");
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
                }
            }
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
