module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        uglify: {
            options: {
                mangle: false
            },
            my_target: {
                files: {
                    "./client/app/app.min.js": [
                        "./client/app/app.module.js",
                        "./client/app/app.routes.js",
                        "./client/app/app.controller.js",
                        "./client/app/components/*/controller.js"
                    ]
                }
            }
        },
        sass: {
            dist: {
                options: {
                    style: "compressed"
                },
                files: {
                    "./client/css/style.css": "./client/css/style.scss"
                }
            }
        }
    });
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.registerTask("build", ["uglify", "sass"]);
};
