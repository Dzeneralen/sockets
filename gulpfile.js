"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var ts = require("gulp-typescript");
var autoprefixer = require("gulp-autoprefixer");
var rimraf = require("rimraf");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var runSequence = require('run-sequence');
var browserSync = require("browser-sync");
var server = require("gulp-develop-server");

//
// Configuration
//

var paths = {
    source: "./src/",
    output: "./www/"
};


var build = {
    input: {
        files: {
            // Source to compile
            ts: [
                paths.source + '**/*.ts',
                paths.source + '**/*.tsx'
            ],
            
            tsconfig: "./tsconfig.json",
            
            // Styles
            sass: [paths.source + "styles/*.scss", "!" + paths.source + "styles/_*.scss"],
            
            
            // Scripts
            scripts: paths.source + "scripts/**/*.js",
            vendor_js: [
                'react',
                'react-dom',
            ],
            
            // Miscellaneous files to copy
            images: [paths.source + 'images/**/*.{jpg,png}'],
            html: paths.source + "**/*.html",
            secrets: paths.source + "secrets.json",
            svg: paths.source + "**/*.svg",
            data: paths.source + "data/**.json",
        }
    },
    output: {
        files: {
            sass: paths.output + "styles",
            html: paths.output,
            scripts: paths.output + "scripts/site.js",
            svg: paths.output,
            secrets: paths.output,
        },
        dirs: {
            ts: paths.output,
            images: paths.output + 'images',
            styles: paths.output + 'styles',
            scripts: paths.output + 'scripts',
            data: paths.output + "data",
        }
    },
    // Sjekk denna
    other: {
        // An intermediate file; output from tsx, input to bundle.
        client_js: [paths.output + 'scripts/main.js']
    }
};

// Create typescript project
var tsProject = ts.createProject(build.input.files.tsconfig);


gulp.task("clean:scripts", function (cb) {
    rimraf(build.output.files.scripts, cb);
});

gulp.task("clean:styles", function (cb) {
    rimraf(build.output.files.sass, cb);
});

gulp.task("clean:output", function (cb) {
    rimraf(paths.output, cb);
});

gulp.task("clean", [ "clean:output" ]);


gulp.task("sass", function() {
   return gulp.src(build.input.files.sass)
        .pipe(sass().on("error", sass.logError))
        .pipe(autoprefixer({
            browsers: ["last 5 versions"]
        }))
        .pipe(gulp.dest(build.output.files.sass))
        .pipe(browserSync.stream()); 
});

gulp.task("typescript", function() {
    var tsResult = gulp.src(build.input.files.ts)
        .pipe(ts(tsProject));
        
    return tsResult.js
        .pipe(gulp.dest(build.output.dirs.ts));
});

gulp.task("html", function() {
   return gulp.src(build.input.files.html)
        .pipe(gulp.dest(build.output.files.html))
        .on("change", browserSync.reload);
});

gulp.task("secrets", function() {
   return gulp.src(build.input.files.secrets)
    .pipe(gulp.dest(build.output.files.secrets)); 
});

gulp.task("data", function() {
   return gulp.src(build.input.files.data)
    .pipe(gulp.dest(build.output.dirs.data)); 
});

gulp.task("svg", function() {
   return gulp.src(build.input.files.svg)
    .pipe(gulp.dest(build.output.files.svg)); 
});

gulp.task("app", ["typescript"], function() {
   
   return browserify({
       insertGlobals: true,
       entries: build.other.client_js
       })
       .require(build.input.files.vendor_js)
       .bundle().on("error", console.error.bind(console))
       .pipe(source("bundle.js"))
       .pipe(gulp.dest(build.output.dirs.scripts));
})

gulp.task("rebuild", function(cb) {
    runSequence(["clean"], ["html", "app", "sass", "secrets", "data", "svg"], cb);
})

gulp.task("watch", ["rebuild"], function() {
   gulp.watch(build.input.files.ts, ["app"]); 
   gulp.watch(build.input.files.sass, ["sass"]); 
   gulp.watch(build.input.files.html, ["html"]);
});

// gulp.task("serve", ["watch"], function() {
//     server.listen( { path: './www/server.js' } );
// });

gulp.task("livereload", ["watch"], function() {
   browserSync.create();
   
   browserSync.init({
       proxy: {
           target: "http://localhost:8080",
           ws: true
       },
       port: 3002
   });
   
   gulp.watch(build.output.files.html).on("change", browserSync.reload);
});

