let gulp = require('gulp');
let zip = require('gulp-zip');
let del = require('del');
let webpack = require('webpack');
let gutil = require('gulp-util');
let path = require('path');
let webserver = require('gulp-webserver');

let subProjectDirs = (function () {
  let glob = require('glob');
  let ret = glob.sync(path.join(__dirname, '/*/$project.js'))
    .map(f => {
      let projectPath = path.dirname(path.relative(__dirname, f));
      return {
        path: projectPath,
        project: require(f)
      };
    });
  return ret;
})();
// console.log('process.argv', process.argv);
let options = { dev: process.argv.indexOf('production') < 0 && process.env.NODE_ENV !== 'production' };
// let project = require(path.join(__dirname, '$project.js'));

// process.env.NODE_ENV = options.dev ? 'development' : 'production';

gulp.task('test', function (cb) {
});

gulp.task('package-clean', function (cb) {
  return del([
    'temp/**/*',
    'dist/**/*',
    'natives/**/*',
  ], cb);
});

function getWebpackConfig(dirs, dev, configObject = true) {
  let configFile = dev ? 'webpack-dev.config.js' : 'webpack-prod.config.js';
  return dirs.map(function (d) {
    let dir = path.join(__dirname, d, 'build', configFile);
    if (configObject) {
      let c = require(dir);
      if (typeof c === 'function') c = c({ root: __dirname });
      return c;
    } return dir;
  });
}
function packTarget(target, path) {
  return target === '#{dir}' ? path : target;
}
function copyFiles(dir, target, done) {
  if (target === undefined) return done && done();
  if (target) target += '/';
  console.log('copyFiles', dir, target);
  gulp.src(dir + '/**/*').pipe(gulp.dest('dist/' + target)).on('end', function () {
    setTimeout(function () {
      done && done();
    }, 3000);
  });
}
function build(dirs, dev, copy, done) {
  if (typeof dirs === 'string') dirs = dirs.includes('|') ?  dirs.split('|').reverse() : [dirs];
  let doned = false;
  webpack(getWebpackConfig(dirs, dev), function (err, stats) {
    if (err || stats.hasErrors()) throw new gutil.PluginError('webpack-cluster', err || stats.toString({ colors: true }));
    if (doned) return;
    doned = true;
    gutil.log('[webpack][' + dirs.join('|') + ']', stats.toString({ colors: true }));
    gutil.log('打包完成，耗时：' + ((stats.endTime - stats.startTime) / 1000).toFixed(2) + 's， hash:' + stats.hash);
    if (copy) dirs.forEach(function (dir, index) {
      let subProject = require(path.join(__dirname, dir, '$project.js'));
      copyFiles(path.join(__dirname, dir, subProject.dist.dir), packTarget(subProject.public, dir), function () {
        if (index >= dirs.length - 1) done && done();
      });
    });
  });
}
// function parallelBuild (dirs, dev, copy, done) {
//   if (typeof dirs === 'string') dirs = dirs.includes('|') ?  dirs.split('|').reverse() : [dirs];
//   const WebpackCluster = require('webpack-cluster').default;
//   const webpackCluster = new WebpackCluster({
//     dryRun: false,
//     concurrency: 10,
//     failures: {
//       sysErrors: true,
//       errors: true,
//       warnings: true
//     }
//   });
//   webpackCluster.run(getWebpackConfig(dirs, dev, false)).then(function(err, stats){
//     if (copy) dirs.forEach(function (dir, index) {
//       let subProject = path.dirname(path.relative(__dirname, dir, '$project.js'));
//       copyFiles(dir, packTarget(subProject.public, dir), function(){
//         if (index >= dirs.length - 1) done && done();
//       });
//     });
//   }).catch(err => {
//     done(new gutil.PluginError('webpack-cluster', err));
//   });
// }

function copyDirs(dirs, index, done) {
  let dir = dirs[index];
  if (!dir) return done && done();
  let project = dir.project;
  if (!project || !project.pack) return copyDirs(dirs, ++index, done);
  let distDir = path.join(__dirname, dir.path, project.dist.dir);
  console.log('copy ' + path.join(__dirname, dir.path, project.dist.dir));
  copyFiles(distDir, packTarget(project.public, dir.path), () => copyDirs(dirs, ++index, done));
}
function doZip(zipFiles, filename, done) {
  gulp.src(zipFiles)
    .pipe(zip(filename))
    .pipe(gulp.dest('temp')).on('end', done);
}
function doPackage(dev, done) {
  let projects = subProjectDirs.filter(d => d.project.webpack && d.project.pack);
  let otherProjects = subProjectDirs.filter(d => !d.project.webpack && d.project.pack);
  if (!projects.length && !otherProjects.length) return done && done();
  let projectDirs = projects.map(function (d) { return d.path; });
  let zipPackage = function (done) {
    doZip(['dist/**/**/**/**/*'], 'iit-xinsb' + (dev ? '' : '-prod') + '.zip', function () {
      doZip(['natives/**/**/**/*'], 'natives.zip', done);
    });
  };
  console.log('build ' + projectDirs.join('|')
    + (otherProjects.length ? '|' + otherProjects.map(function (d) { return d.path; }).join('|') : ''));
  if (projectDirs.length) {
    build(projectDirs, dev, true, function () {
      if (otherProjects.length) copyDirs(otherProjects, 0, function () { zipPackage(done); });
      else zipPackage(done);
    });
  } else {
    copyDirs(otherProjects, 0, function () { zipPackage(done); });
  }
}

gulp.task('package', ['package-clean'], function (done) {
  doPackage(options.dev, done);
});

function deploy(done, projectDir) {
  if (!projectDir) projectDir = __dirname;
  let project = require(path.join(projectDir, '$project.js'));
  let sftp = require('gulp-sftp');
  let _conf = options.dev ? project.ftpServer : project.ftpDevServer;
  return gulp.src(path.resolve(__dirname, (project.deploy ? project.deploy.dir : project.dist.dir)) + '/**/**/**/*')
    .pipe(sftp(_conf)).on('end', done);
}

gulp.task('package-deploy', ['package'], function (done) {
  deploy(done);
});


// 以下任务是针对单个项目的
function getRootDir() {
  let i = process.argv.indexOf('--rootpath');
  if (i < 0) throw new Error('--rootpath params is required!');
  return process.argv[i + 1];
}
function getProjectDir(dir) {
  let root = path.resolve(__dirname, getRootDir());
  if (!root) throw new Error('rootpath is empty!');
  if (!dir) return root;
  return require(path.join(root, '$project.js'))[dir].dir;
}
// build
gulp.task('build', function (done) {
  build(getRootDir(), options.dev, false, done);
});
// deploy dist to remote server
gulp.task('deploy', function (done) {
  deploy(done, getProjectDir());
});

gulp.task('webserver', function () {
  let projectDir = getProjectDir();
  let project = require(path.join(projectDir, '$project.js'));
  let src = path.join(projectDir, project.src.dir);
  gulp.src(src)
    .pipe(webserver({
      host: project.webserver.host,
      port: project.webserver.port,
      path: project.webserver.path,
      livereload: project.webserver.hot,
      directoryListing: {
        enable: project.webserver.hot,
        path: src,
        options: undefined
      },
      open: false,
      fallback: 'index.html',
      https: project.webserver.https,
    }));
});
