var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('default', buildApp);
gulp.task('watch', watch);

	var clientApp = "./public/js/app";
	var files = [
		clientApp + "**/*.module.js",
		clientApp + "**/*.js"
	];

function buildApp() {
	
	var stream = gulp.src(files)
	.pipe(concat('app.js'))
	.pipe(gulp.dest('./public/js/dist'));
	
	return stream;
};

function watch() {
	gulp.watch(files, ['default'])
}