"use strict"
//Подкюченные gulp-библиотеки
const {src, dest} = require('gulp');
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const imagemin = require('gulp-imagemin');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const panini = require('panini');
const del = require('del');
const cssbeautify = require('gulp-cssbeautify');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const notify = require('gulp-notify');

//Пути
const srcPath = "src/";
const distPath = "dist/";

const path = {
    build: {
        html:   distPath,
        css:    distPath + "assets/css",
        js:     distPath + "assets/js/",
        images: distPath + "assets/images/",
        fonts:  distPath + "assets/fonts/"
    },
    src: {
        html:   srcPath + "*.html",
        css:    srcPath + "assets/sass/*.scss",
        js:     srcPath + "assets/js/*.js",
        images: srcPath + "assets/images/**/*.*",
        fonts:  srcPath + "assets/fonts/*.*"
    },
    watch: {
        html:   srcPath + "**/*.html",
        css:    srcPath + "assets/sass/**/*.scss",
        js:     srcPath + "assets/js/**/*.js",
        images: srcPath + "assets/images/**/*.*",
        fonts:  srcPath + "assets/fonts/**/*.*"
    },
    clean: "./" + distPath
};

function server() {
    browserSync.init({
        server: {
            baseDir: "./" + distPath
        }
    })
};

function html() {
    panini.refresh()
    return src(path.src.html, {base: srcPath})
        .pipe(plumber({
            errorHandler: function(err) {
                notify.onError({
                    title:      "HTML Error",
                    message:    "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(panini({
            root:       srcPath,
            layouts:    srcPath + 'template/layouts/',
            partials:   srcPath + 'template/partials/',
            helpers:    srcPath + 'template/helpers/',
            data:       srcPath + 'template/data/'
          }))
        .pipe(dest(path.build.html))
        .pipe(browserSync.reload({stream: true}));
};

function css() {
    return src(path.src.css, {base: srcPath + "assets/sass/"})
        .pipe(plumber({
            errorHandler: function(err) {
                notify.onError({
                    title:      "SCSS Error",
                    message:    "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(cssbeautify())
        .pipe(dest(path.build.css))
        .pipe(cssnano({zindex: false, discardComments: {removeAll: true}}))
        .pipe(cleanCSS())
        .pipe(rename({suffix: '.min', prefix: '', extname: ".css"}))
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({stream: true}));
};

function js() {
    return src(path.src.js, {base: srcPath + "assets/js/"})
        .pipe(plumber({
            errorHandler: function(err) {
                notify.onError({
                    title:      "JS Error",
                    message:    "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(concat("script.js"))
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({suffix: ".min", extname: ".js"}))
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({stream: true}));
};

function images() {
    return src(path.src.images, {base: srcPath + "assets/images/"})
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 80, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}), /* 0 - 7 level */
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest(path.build.images))
        .pipe(browserSync.reload({stream: true}));
};

function clean() {
    return del(path.clean)
};

function fonts() {
    return src(path.src.fonts, {base: srcPath + "assets/fonts/"})
    .pipe(browserSync.reload({stream: true}));
};

function watchFiles() {
    gulp.watch([path.watch.html], html)
    gulp.watch([path.watch.css], css)
    gulp.watch([path.watch.js], js)
    gulp.watch([path.watch.images], images)
    gulp.watch([path.watch.fonts], fonts)
};


const build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts));
const watch = gulp.parallel(build, watchFiles, server);

//Отдельные таски
exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.clean = clean;

//Сборки
exports.build = build;
exports.watch = watch;

//Готовая сборка по умолчанию
exports.default = watch;