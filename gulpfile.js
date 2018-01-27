// Example gulpfile
const gulp = require('gulp')
const textureMapper = require('./gulp-texturemapper')
const folders = require('gulp-folders')
const path = require('path')

gulp.task('texture-atlas', folders('assets', function (folder) {
  return gulp.src(path.join('assets', folder, '*.png'))
    .pipe(textureMapper(folder + '.png'))
    .pipe(gulp.dest('dist'))
}))

