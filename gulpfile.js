"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var ts = require("gulp-typescript");
var autoprefixer = require("gulp-autoprefixer");
var sourcemaps = require("gulp-sourcemaps");
var rimraf = require("rimraf");
var browserSync = require("browser-sync");

var tsProject = ts.createProject("./src/app/tsconfig.json");

gulp.task("compile:sass", function() {
   return gulp.src(["./src/styles/**/*.scss", "!./src/styles/**/_*.scss"])
        .pipe(sass().on("error", sass.logError))
        .pipe(autoprefixer({
            browsers: ["last 5 versions"]
        }))
        .pipe(gulp.dest("./dist/styles"))
        .pipe(browserSync.stream()); 
});

gulp.task("compile:ts", function() {
    var tsResult = gulp.src("./src/app/**/*.ts")
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject));
        
    return tsResult.js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("./dist/app"));
});

gulp.task("copy:html", function() {
   return gulp.src("./src/**/*.html")
        .pipe(gulp.dest("./dist"))
        .on("change", browserSync.reload);
        
});

gulp.task("clean:all", function(callback) {
    rimraf("./dist", callback);
});

gulp.task("compile:all", ["compile:ts", "compile:sass", "copy:html"]);

gulp.task("watch", ["compile:all"], function() {
   gulp.watch("./src/app/**/*.ts", ["compile:ts"]); 
   gulp.watch("./src/styles/**/*.scss", ["compile:sass"]); 
   gulp.watch("./src/**/*.html", ["copy:html"]);
});

gulp.task("serve", ["watch"], function() {
   browserSync.create();
   
   browserSync.init({
      server: "./dist" 
   });
   
   gulp.watch("./dist/*.html").on("change", browserSync.reload);
    
});