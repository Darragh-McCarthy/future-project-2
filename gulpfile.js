'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var pagespeed = require('psi');
var reload = browserSync.reload;
var debug = require('gulp-debug');
//var rev = require('gulp-rev');

var AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

gulp.task('jshint', function() {
    return gulp.src([
        'app/**/*.module.js',
        'app/**/*.controller.js',
        'app/**/*.factory.js',
        'app/**/*.service.js',
        'app/**/*.config.js'
    ])
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

gulp.task('images', function() {
    return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
        progressive: true,
        interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe(gulp.dest('.tmp/images'))
    .pipe($.size({title: 'images'}));
});

gulp.task('copy', function() {
    return gulp.src([
        '!app/*.html',
        'app/*',
        'app/bower_components/**/*',
        'app/styles/fonts/*',
        'app/images/**/*'
    ], {
        base: 'app/',
        dot: true
    }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}));
});

gulp.task('fonts', function() {
    return gulp.src(['app/fonts/**'])
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size({title: 'fonts'}));
});

gulp.task('styles', function() {
    // For best performance, don't add Sass partials to `gulp.src`
    return gulp.src([
        '!app/bower_components/**/*',
        'app/styles/main.scss'
        //'app/styles/components/components.scss'
    ])
    .pipe(debug())
    .pipe($.sourcemaps.init())
    .pipe($.changed('.tmp/styles', {extension: '.css'}))
    .pipe($.sass({
        precision: 10,
        onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe($.autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.csso()))
    .pipe(gulp.dest('dist/styles'))
    .pipe($.size({title: 'styles'}));
});

gulp.task('html', function () {
    var assets = $.useref.assets({searchPath: '{.tmp,app}'});

    return gulp.src([
        'app/**/*.html',
        '!app/bower_components/**/*'
    ])
    .pipe(assets)
    // Concatenate and minify JavaScript
    .pipe($.if('*.js', $.uglify({preserveComments: 'some'})))
    // Remove any unused CSS
    // Note: if not using the Style Guide, you can delete it from
    //       the next line to only include styles your project uses.
    .pipe($.if('*.css', $.uncss({
        html: [
        'app/index.html',
        'app/styleguide.html'
        ],
        // CSS Selectors for UnCSS to ignore
        ignore: [
        /.navdrawer-container.open/,
        /.app-bar.open/
        ]
    })))
    // Concatenate and minify styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    // Update production Style Guide paths
    .pipe($.replace('components/components.css', 'components/main.min.css'))
    // Minify any HTML
    .pipe($.if('*.html', $.minifyHtml()))
    // Output files
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'html'}));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist/*', '!dist/.git'], {dot: true}));

gulp.task('serve', ['styles', 'images'], function() {
    browserSync({
        notify: false,
        logPrefix: 'WSK',
        // Note: this uses an unsigned certificate which on first access
        //       will present a certificate warning in the browser.
        // https: true,
        server: ['.tmp', 'app']
    });

    gulp.watch([
        'app/**/*.html',
        'app/images/**/*'
        ], reload
    );
    gulp.watch(['app/**/*.scss'], ['styles', reload]);
    gulp.watch(['app/**/*.js'], ['jshint']);
});

gulp.task('serve:dist', ['default'], function() {
    browserSync({
        notify: false,
        logPrefix: 'WSK',
        //Run as an https by uncommenting 'https: true'
        //Note: this uses an unsigned certificate which on first access
        //will present a certificate warning in the browser.
        //https: true,
        server: 'dist'
    });
});

gulp.task('default', ['clean'], function(cb) {
    runSequence('styles', ['jshint', 'html', 'images', 'fonts', 'copy'], cb);
});

// Run PageSpeed Insights
// Update `url` below to the public URL for your site
gulp.task('pagespeed', pagespeed.bind(null, {
    // By default, we use the PageSpeed Insights
    // free (no API key) tier. You can use a Google
    // Developer API key if you have one. See
    // http://goo.gl/RkN0vE for info key: 'YOUR_API_KEY'
    url: 'https://example.com',
    strategy: 'mobile'
}));

// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) {}
