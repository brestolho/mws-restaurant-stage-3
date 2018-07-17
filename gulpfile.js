const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const minify = require('gulp-minify');
 
gulp.task('default', () =>
	console.log("this is gulp tool")
);

gulp.task('styles', () =>
    gulp.src('css/**/*.scss')
    	.pipe(sass({
			outputStyle: 'compressed',
			indentType: 'tab',
			indentWidth: 1
		}).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/css/'))
);

gulp.task('scripts', function() {
    return gulp.src([
        'js/idb.js',
        'js/init.js',
        'js/dbhelper.js',
        'js/main.js',
        'js/restaurant_info.js'
    ])
    .pipe(minify({
			noSource: true,
			ext: {min: '.js'}
		}))
    .pipe(rename({ suffix: '.min' }))
    //.pipe(concat('main.min.js'))
    .pipe(gulp.dest('dist/js/'))
});