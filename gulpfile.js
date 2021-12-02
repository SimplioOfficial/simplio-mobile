var gulp = require('gulp');
const terser = require('gulp-terser');
var plumberNotifier = require('gulp-plumber-notifier');
var sourcemaps = require('gulp-sourcemaps');
const fs = require('fs-extra');
const readline = require('readline');
var exec = require('child_process').exec;

const iosProject = 'ios/App/App.xcodeproj/project.pbxproj';

config = {};
let version;

gulp.task('compressapp', function () {
  return gulp
    .src(['src/api/api.js', 'src/api/bitcore.js', 'src/api/bitgo.js', 'src/api/web3.js', 'src/api/coins.js'])
    .pipe(plumberNotifier())
    .pipe(
      terser({
        ecma: 6,
        keep_fnames: false,
        mangle: true,
        toplevel: true
      })
    )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('src/api/uglify'));
});

gulp.task('getversion', async () => {
  // Get latest commit hash
  //exec git command to get the hash of the current commit
  await getIosVersions();
  await exec('git rev-parse HEAD', async function (err, stdout, stderr) {
    config['commitHash'] = stdout.trim().substr(0, 7);
    config['version'] = version;
    config['updated'] = new Date();
    fs.writeJsonSync('./src/assets/appConfig.json', config, 'utf8');
    // resolve();
  });
  // return new Promise(function (resolve) {
  // })
});

gulp.task('copy-bitcore', function () {
  // return gulp.src('./src/api/bitcore.min.js').pipe(rename('bitcore.js')).pipe(gulp.dest('./src/assets/js'));
});

gulp.task('copy-bitgo', function () {
  // return gulp.src('./src/api/bitgo.min.js').pipe(rename('bitgo.js')).pipe(gulp.dest('./src/assets/js'));
});

gulp.task('copy-slpsdk', function () {
  // return gulp.src('./src/api/slpsdk.min.js').pipe(rename('slpsdk.js')).pipe(gulp.dest('./src/assets/js'));
});

gulp.task('copy-node-patches', function () {
  return gulp.src('./patches/**/*').pipe(gulp.dest('.'));
});

async function getIosVersions() {
  const fileStream = fs.createReadStream(iosProject);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    if (line.indexOf('CURRENT_PROJECT_VERSION') > -1) {
      version = line.split('=')[1].trim().slice(0, -1);
    }
  }
}

// gulp.task('ionicVersionUpdate', function() {
//   return gulp.src(['./config.xml'])
//     // .pipe(cheerio(function($, file) {
//     //     // get the version number from package.json
//     //     $('widget').attr('version', config['version']);

//     //     // in development launch the app with a different html file
//     //     //$('content').attr('src', process.env.NODE_ENV == 'development' ? 'debug.html' : 'index.html');
//     //   }))
//     .pipe(cheerio({
//       run: function($) {
//         var json = JSON.parse(fs.readFileSync('./package.json'));
//         $('widget').attr('version', json.version);
//       },
//       parserOptions: {
//         xmlMode: true,
//       },
//     }))
//     .pipe(gulp.dest("./"));
// });
