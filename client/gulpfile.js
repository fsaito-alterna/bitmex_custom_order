const gulp = require('gulp');
// const gutil = require('gulp-util');
const eslint = require('gulp-eslint');
const runSequence = require('run-sequence');
const exec = require('child_process').exec;

const jsFilesPattern = 'js/**/*.js';
const jsTestFilesPattern = 'test/**/*.js';

gulp.task('default', (done) => {
  runSequence('build_node_env_production', 'test', done);
});

gulp.task('lint', () => {
  return gulp.src([jsFilesPattern, jsTestFilesPattern])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('build_node_env_production', (done) => {
  // you can't use gulp-env
  // gulp-env doesn't set process.env.NODE_ENV
  exec('npm run webpack_node_env_production', (err, stdout, stderr) => {
    console.log(stdout);
    if (stderr) {
      console.error(stderr);
    }
    if (err) {
      // throw new gutil.PluginError('build_node_env_production', err);
      console.error(err);
    }
    done();
  });
});

gulp.task('test', (done) => {
  exec('npm test', (err, stdout, stderr) => {
    console.log(stdout);
    if (stderr) {
      console.error(stderr);
    }
    if (err) {
      // throw new gutil.PluginError('test', err);
      console.error(err);
    }
    done();
  });
});
