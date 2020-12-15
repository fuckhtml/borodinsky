const browser = require("browser-sync").create();

const gulp = require("gulp");

const rename = require("gulp-rename");
const clean = require("gulp-clean");

const imagemin = require("gulp-imagemin");
const svgstore = require("gulp-svgstore");
const webp = require("gulp-webp");

const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");

const sass = require("gulp-sass");
const plumber = require("gulp-plumber");
const autoprefixer = require("gulp-autoprefixer");
const csso = require("gulp-csso");
const sourcemaps = require("gulp-sourcemaps");

// --

const cleanup = () => {
  return gulp.src("./build/**/*.*")
    .pipe(clean());
}

const fonts = () => {
  return gulp.src("./source/fonts/**/*", {base: "./source/fonts"})
    .pipe(gulp.dest("./build/fonts"));
}

// --

// const compressimages = () => {
//   return gulp.src("./source/images/**/*.{jpeg,jpg,png,gif,svg}", {base: "./source/images"})
//     .pipe(imagemin([
//       imagemin.gifsicle({interlaced: true}),
//       imagemin.mozjpeg({quality: 75, progressive: true}),
//       imagemin.optipng({optimizationLevel: 5}),
//       // imagemin.svgo({plugins: [{removeViewBox: true},{cleanupIDs: false}]})
//     ]))
//     .pipe(gulp.dest("./source/images"))
//     .pipe(webp())
//     .pipe(gulp.dest("./source/images"));
// }

// How to convert without quality loss?
const convertwebp = () => {
  return gulp.src("./source/images/**/*", {base: "./source/images"})
    .pipe(webp())
    .pipe(gulp.dest("./source/images"));  
}

const sprite = () => {
  return gulp.src("./source/images/icons/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("./source/images"));
}

const copyimages = () => {
  return gulp.src([
    "./source/images/**/*",
    "!./source/images/icons/**/*",
    ], {base: "./source/images"})
    .pipe(gulp.dest("./build/images"))
}

// --

const html = () => {
  return gulp.src("./source/*.html")
    .pipe(posthtml([include()]))
    .pipe(gulp.dest("./build"))
    .pipe(browser.stream());
}

const scss = () => {
  return gulp.src("./source/scss/main.scss")
    .pipe(plumber())
    .pipe(sourcemaps.init())

    .pipe(sass())
    .pipe(autoprefixer("last 3 versions"))
    .pipe(gulp.dest("./build/css"))
    .pipe(browser.stream())

    // .pipe(csso())
    // .pipe(sourcemaps.write("."))
    // .pipe(rename("main.min.css"))
    // .pipe(gulp.dest("./build/css"));

}

const js = () => {
  return gulp.src("./source/js/**/*", {base: "./source/js"})
    .pipe(gulp.dest("./build/js"));
}

// --

const sync = (done) => {
  browser.init({
    server: {
      baseDir: "./build",
      proxy: "test"
    }
  })

  gulp.watch("./source/fonts/**.*", gulp.series(fonts, browser.reload));
  gulp.watch("./source/images/**/*", gulp.series(images, html, browser.reload));
  gulp.watch("./source/js/**/*", gulp.series(js, browser.reload));
  gulp.watch("./source/scss/**/*", gulp.series(scss));
  gulp.watch("./source/*.html").on("change", gulp.series(html, browser.reload));

  done();
}

// --

const images = gulp.series(
  //compressimages, convertwebp, 
  sprite, copyimages
);
exports.images = images;

const build = gulp.series(cleanup, gulp.parallel(fonts, images), js, html, scss);
exports.build = build;

exports.default = gulp.series(build, sync);
