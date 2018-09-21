var pkg = require('../package.json');
var Configstore = require('configstore');
var conf = new Configstore(pkg.name);
const chalk = require('chalk');
var fs = require('fs');
var commandExists = require('command-exists').sync;
var reFcpxml = /fcpxml$/;
var path = require("path");

exports.configure = function(yargs){

  var defaultSettings = {
    valid: false,
    ffmpegPath: false,
    html: false,
    outputDir: false,
    fcpxml: false,
    css: fs.readFileSync(path.join(__basedir, "styles", "default.css"), "utf-8")
  }
  var settings = {...defaultSettings, ...conf.all, ...yargs};
  if (reFcpxml.test(settings.fcpxml)) {
    console.log("valid fcpxml found");
  } else if (reFcpxml.test(settings._[0])) {
    console.log("valid fcpxml found");
    settings.fcpxml = settings._[0]
  } else {
    console.log("no valid fcpxml");
    settings.fcpxml = false;
  }
  if (!settings.fcpxml || !settings.outputDir || !settings.ffmpegPath) {
    console.log("there's at least one problem with the settings for this job");
    settings.valid = false;
  } else {
    settings.valid = true;
  }
  console.log("about to return settings");
  return settings;
}

exports.setDefaults = function(yargs){
  console.log("conf:");
  console.log(chalk.cyan(JSON.stringify(conf.all, null, 4)));
  console.log("yargs:");
  console.log(chalk.cyan(JSON.stringify(yargs, null, 4)));
  var settings = {...conf.all, ...yargs};
  if (yargs.outputDir) {
    conf.set('outputDir', yargs.outputDir)
  }
  if (yargs.css) {
    conf.set('css', yargs.css)
  }
  if (yargs.paperSize) {
    conf.set('paperSize', yargs.paperSize)
  }
  if (yargs.pdf) {
    if (yargs.pdf=="true" || yargs.pdf==true) {
      conf.set('pdf', true)
    } else if (yargs.pdf=="false" || yargs.pdf==false) {
      conf.set('pdf', false)
    } else { console.log(yargs.pdf + " doesn't seem to be a valid value for --pdf.  Try again?");}
  }
  if (yargs.ffmpegPath) {
    conf.set('ffmpegPath', yargs.ffmpegPath)
  } else if (commandExists('ffmpeg')){
    conf.set('ffmpegPath', 'ffmpeg')
  } else {
    console.log("no ffmpeg declared and none found on your system.  Make sure that it is in your PATH, or specify the path to it with --ffmpegPath=path/to/your/ffmpeg");
  }
  if (yargs.ffprobePath) {
    conf.set('ffprobePath', yargs.ffprobePath)
  } else if (commandExists('ffprobe')){
    conf.set('ffprobePath', 'ffprobe')
  } else {
    console.log("no ffprobe declared and none found on your system.  Make sure that it is in your PATH, or specify the path to it with --ffprobePath=path/to/your/ffprobe");
  }
  if (yargs.html) {
    if (yargs.html=="true" || yargs.html==true) {
      conf.set('html', true)
    } else if (yargs.html=="false" || yargs.html==false) {
      conf.set('html', false)
    } else { console.log(yargs.html + " doesn't seem to be a valid value for --html.  Try again?");}
  }
  console.log("Here are your current defaults.");
  console.log(chalk.cyan(JSON.stringify(conf.all, null, 4)));
  console.log("To change any of these, run print with the --settings flag along with --key=value args for anything you'd like to set");
}
