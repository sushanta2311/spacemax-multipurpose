// General
var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    watch = require('gulp-watch'),
    sass = require('gulp-sass'),
    sourceMaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create(),
    header = require('gulp-header'),
    rename = require('gulp-rename'),
    eslint = require('gulp-eslint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    codekit = require('gulp-codekit'),
    sequence = require('run-sequence');
    package = require('./package.json'),
    fs = require('fs');
    paths = package.paths;
    sass.compiler = require('node-sass');

var banner = [
    '/*!\n' +
    ' * Name: <%= package.name %>\n' +
    ' * Title: <%= package.title %>\n' +
    ' * Version: <%= package.version %>\n' +
    ' * Author: <%= package.author %>\n' +
    ' * <%= package.url %>\n' +
    ' * ©Copyright ' + new Date().getFullYear() + '. <%= package.license%> licensed.\n' +
    '*/',
    '\n'
].join('');

gulp.task('html', function () {
    return gulp.src('*.html');
});

// main style (app.scss)
gulp.task('styles', function () {
    return gulp.src(['scss/app.scss'])
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(sourceMaps.init())
        .pipe(sass({
            outputStyle: 'expanded'
        }))
        .pipe(autoprefixer())
        .pipe(sourceMaps.write(undefined, {
            sourceRoot: null
        }))
        .pipe(gulp.dest(paths.css))
        .pipe(browserSync.stream());
});
// plugins style (plugins.scss)

gulp.task('stylesPlugins', function () {
    return gulp.src('scss/plugins.scss')
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        // .pipe(sourceMaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(autoprefixer())
        .pipe(sourceMaps.write(undefined, {
            sourceRoot: null
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.css))
        .pipe(browserSync.stream());
});

// gulp main style minified
gulp.task('styles:prod', function () {
    return gulp.src(['scss/app.scss'])
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(sass({
            outputStyle: 'expanded'
        }))
        .pipe(autoprefixer())
        .pipe(header(banner, {
            package: package
        }))
        .pipe(gulp.dest(paths.css))
});

// gulp script app
gulp.task('scripts', function () {
    gulp.src('./js/app.js')
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(sourceMaps.init())
        .pipe(codekit())
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(concat('app.js'))
        .pipe(gulp.dest(paths.js))
        .pipe(browserSync.stream());

});

// gulp script plugins
gulp.task('scriptsPlugins', function () {
    gulp.src('./js/src/plugins.js')
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(sourceMaps.init())
        .pipe(codekit())
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(sourceMaps.write(undefined, {
            sourceRoot: null
        }))
        .pipe(concat('plugins.js'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.js))
        .pipe(browserSync.stream());

});
// gulp plugins JS minified
gulp.task('scriptsPlugins:prod', function () {
    gulp.src('./js/src/plugins.js')
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(codekit())
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(concat('plugins.js'))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.js));
});

// task: watch
gulp.task('watch', function () {
    gulp.watch('*.html', ['watch-html']);
    gulp.watch(paths.cssdev + '/**/*.scss', ['styles', 'stylesPlugins']);
    gulp.watch('js/app.js', ['scripts']);
    gulp.watch(paths.jsdev + '/**/*.js', ['scriptsPlugins']);
    browserSync.init({
        notify: false,
        injectChanges: true,
        server: {
            baseDir: "./"
        },
    });

});


// html
gulp.task('watch-html', ['html'], function (done) {
    browserSync.reload();
    done();
});

// task: production
gulp.task('prod', ['styles:prod','scriptsPlugins:prod']);

// task: default
gulp.task('default', ['watch']);

// task: build
gulp.task('build', function () {
    sequence('html', 'styles', 'stylesPlugins', 'scripts', 'scriptsPlugins');
});