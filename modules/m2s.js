const fs = require("fs-extra");
const path = require("path");
const xml2js = require('xml2js');
const parseXmlString = require('xml2js').parseString;
const cp = require('child_process');

// const destinationFolder = (process.env.ROOT_DIR + "/public/images")
// const logFolder = (process.env.ROOT_DIR + "/tools/logs");
var psBoost001 = "curves=psfile='" + __basedir + "/curves/boost.acv'";
var gh4Boost_001 = "curves=psfile='" + __basedir + "/curves/boost.acv'";
//
function Still(tsElements, videoFilePath, settings){
  this.tsElements = tsElements
  this.videoFilePath = videoFilePath;
  this.tcString = tc_from_frames(this.tsElements.frames).tc_string;
  this.tcNumber = tc_from_frames(this.tsElements.frames).tc_forFilename;
  this.fileExtension = path.extname(videoFilePath);
  this.stillFileName = (path.basename(videoFilePath, this.fileExtension) + "_" + this.tcNumber + ".png");
  this.stillFilePath = path.join(settings.jobStillsDir, this.stillFileName);
  this.eightDigitDate = this.stillFileName.split("_")[0];
  console.log(this.eightDigitDate);
  this.newDateString = (this.eightDigitDate + this.tcNumber.substring(0,4))
  if (this.videoFilePath.includes('GH4')) {
    console.log("about to run command:");
    console.log(settings.ffmpegPath + " -ss " + this.tsElements.seconds + " -i " + videoFilePath + " -vframes 1 " + this.stillFilePath);
    cp.spawnSync(settings.ffmpegPath, ['-ss', this.tsElements.seconds, '-i', videoFilePath, '-vframes', '1', '-vf', gh4Boost_001, this.stillFilePath]);
    console.log("used the GH4 boost on " + this.stillFilePath);
    cp.spawnSync('touch', ['-t', this.newDateString, this.stillFilePath]);
    }
  else {
    console.log("about to run command:");
    console.log(settings.ffmpegPath + " -ss " + this.tsElements.seconds + " -i " + videoFilePath + " -vframes 1 " + this.stillFilePath);
    cp.spawnSync(settings.ffmpegPath, ['-ss', this.tsElements.seconds, '-i', videoFilePath, '-vframes', '1', this.stillFilePath]);
    cp.spawnSync('touch', ['-t', this.newDateString, this.stillFilePath]);
    }
  console.log("\n\n\n\n\n\n\n\n\ngoing to try to log newDateString");
  console.log(this.newDateString);
}

// function toMongo(stillArray){
//   MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
//     assert.equal(null, err);
//     stillArray.forEach(function(still){
//       db.collection('stills').insertOne({still});
//     });
//     db.close();
//     });
//   }

function findStillsProject(result){
  var theProject = ""
  for (var i = 0; i < result.fcpxml.library[0].event[0].project.length; i++) {
    // TODO: change this to a regex
    if (result.fcpxml.library[0].event[0].project[i].$.name.includes("till")) {
      theProject = result.fcpxml.library[0].event[0].project[i];
    }
  }
  return theProject
}

function parseTheStuff(settings, result, stillArray, theProject){
  if (theProject.sequence[0].spine[0]["asset-clip"]) {
    console.log("there is an asset-clip");
    for (var i = 0; i < theProject.sequence[0].spine[0]["asset-clip"].length; i++) {
      var videoFileName = theProject.sequence[0].spine[0]["asset-clip"][i].$.name;
      var videoFileStartTs = "0/24000s";
      if (theProject.sequence[0].spine[0]["asset-clip"][i].$.start) {
          videoFileStartTs = theProject.sequence[0].spine[0]["asset-clip"][i].$.start;
        }
      console.log("videoFileStartTs for " + videoFileName + " is " + videoFileStartTs);
      var theClip = result.fcpxml.resources[0].asset.filter(function(clip){
        return clip.$.id === theProject.sequence[0].spine[0]["asset-clip"][i].$.ref
      });
      var videoFilePath = theClip[0].$.src.replace('file:///','/');
      // determine start for this camera
      findMarkers(theProject.sequence[0].spine[0]["asset-clip"][i], videoFilePath, stillArray, videoFileStartTs, settings);
    }
  }
  if (theProject.sequence[0].spine[0].hasOwnProperty('clip')) {
    console.log("there is a clip");
    console.log("and its name is " + theProject.sequence[0].spine[0].clip[0].$.name);
    console.log("length of clip array is " + theProject.sequence[0].spine[0]["clip"].length);
    for (var i = 0; i < theProject.sequence[0].spine[0]["clip"].length; i++) {
      console.log("step " + i);
      var videoFileName = theProject.sequence[0].spine[0]["clip"][i].$.name;
      var videoFileStartTs = "0/24000s";
      if (theProject.sequence[0].spine[0]["clip"][i].$.start){
          console.log("this clip has as start time: " + theProject.sequence[0].spine[0]["clip"][i].$.start);
          videoFileStartTs = theProject.sequence[0].spine[0]["clip"][i].$.start;
      }
      var theClip = result.fcpxml.resources[0].asset.filter(function(possibleClip){
        return possibleClip.$.id === theProject.sequence[0].spine[0].clip[i].video[0].$.ref
      });
      console.log(JSON.stringify(theClip, null, 5));
      var videoFilePath = theClip[0].$.src.replace('file:///','/');
      // determine start for this camera
      findMarkers(theProject.sequence[0].spine[0].clip[i], videoFilePath, stillArray, videoFileStartTs, settings);
    }
  }
}

function fcpxmlFileToStills(settings){
  var now = new Date();
  var stillArray = [];
  console.log("the path I'm trying to read as xml is " + settings.fcpxml);
  var xmlString=parseXmlString(fs.readFileSync(settings.fcpxml, 'UTF-8'), (err, result)=>{
    if (err) {
      console.log(err);
    }
    else {
      settings.jobId = path.basename(settings.fcpxml, '.fcpxml');
      settings.jobDir = path.join(settings.outputDir, (settings.jobId + "_m2s"));
      settings.jobStillsDir = path.join(settings.jobDir, "stills");
      settings.htmlOutputStart = "<style>"
        + settings.css
        + "</style><body><h1>your stills</h1>"
      settings.htmlOutputEnd = "</body>"
      fs.ensureDir(settings.jobDir);
      fs.ensureDir(settings.jobStillsDir);
      fs.writeFileSync(path.join(settings.jobDir, (settings.jobId + "_m2sSequenceObject.json")),
        JSON.stringify(result, null, 4));
      var theProject = findStillsProject(result);
      parseTheStuff(settings, result, stillArray, theProject);
    }
  })
  console.log(JSON.stringify(stillArray, null, 4));
  var newHtml = ""
  stillArray.forEach((still)=>{
    console.log("adding " + still.stillFilePath);
    newHtml+=`<p>still: ${still.stillFilePath}</p><img src="${still.stillFilePath}"></img>`;
    cp.spawnSync('touch', ['-t', this.newDateString, this.stillFilePath]);
  })
  var theHtmlOutput = settings.htmlOutputStart + newHtml + settings.htmlOutputEnd;
  settings.htmlOutputUrl = path.join(settings.jobDir, (settings.jobId + ".html"));
  console.log("done writing html");
  fs.writeFileSync(settings.htmlOutputUrl, theHtmlOutput);
  return settings;

        // toMongo(stillArray);
      // return stillArray;
}

function tc_from_frames(frames){
  var the_frames=(frames % 24);
  var seconds = (frames-the_frames)/24;
  var the_seconds=(seconds%60);
  var minutes = (seconds-the_seconds)/60;
  var the_minutes = minutes%60;
  var the_hours = (minutes-the_minutes)/60;
  var theTc_string = ((("00" + the_hours).slice(-2))+(("00" + the_minutes).slice(-2))+(("00" + the_seconds).slice(-2))+(("00" + the_frames).slice(-2)));
  var theTc_colon_string = ((("00" + the_hours).slice(-2))+ ":" + (("00" + the_minutes).slice(-2))+ ":" + (("00" + the_seconds).slice(-2))+ ":" + (("00" + the_frames).slice(-2)));
  return {tc_forFilename: theTc_string, tc_string:theTc_colon_string};
};

function fcpxmlStartToSeconds(fcpxmlStart, videoFileStartTs){
  console.log("videoFileStartTs is" + videoFileStartTs);
  var thisNumerator = fcpxmlStart.split('/')[0];
  var thisDenominator = fcpxmlStart.split('/')[1].replace('s','');
  var thisFrames = ((24000/thisDenominator)*thisNumerator)/1001;
  var thisFileStartTsNumerator = videoFileStartTs.split('/')[0];
  var thisFileStartTsDenominator = videoFileStartTs.split('/')[1].replace('s','');
  var thisStartFrames = ((24000/thisFileStartTsDenominator)*thisFileStartTsNumerator)/1001;
  var theSecondsStart = thisFileStartTsNumerator/thisFileStartTsDenominator;
  var theSecondsMarker = thisNumerator/thisDenominator;
  var theSeconds = theSecondsMarker - theSecondsStart;
  console.log(theSecondsMarker + " - " + theSecondsStart + " = " + theSeconds);
  return {numerator: thisNumerator, denominator: thisDenominator, seconds: theSeconds, frames: thisFrames, fileStartFrames: thisStartFrames, fcpxmlFileStart: videoFileStartTs};
}

function findMarkers(projectAssetClip, videoFilePath, stillArray, videoFileStartTs, settings){
  console.log("in findMarkers for " + projectAssetClip.$.name);
  if (projectAssetClip.marker) {
    projectAssetClip.marker.forEach(function(marker, index){
      console.log("logging marker.$.start"+JSON.stringify(marker.$.start, null, 2));
      var tsElements = fcpxmlStartToSeconds(marker.$.start, videoFileStartTs);
      console.log("timestampSeconds is " + tsElements.seconds +" and the frames are " + tsElements.frames);
      var thisStill = new Still(tsElements, videoFilePath, settings);
      stillArray.push(thisStill);
    });
  }
};

module.exports.fcpxmlFileToStills = fcpxmlFileToStills;
