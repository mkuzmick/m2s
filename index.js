global.__basedir = __dirname;
// var mongoose = require('mongoose');
// const _ = require('lodash');
const m2sf = require("./modules/m2s").fcpxmlFileToStills;
const slackTools = require("./modules/slack-tools");
// var db = mongoose.connection;


exports.run = function(settings){
  var m2sOutput = m2sf(settings);
  if (settings.slack==true && settings.slackWebhookUrl) {
    slackIt(m2sOutput, settings)
  }
}



// }
//
// if (args.m2sf){
//   var m2sfOutput = m2sf(args.m2sf);
//   console.log("done the stills--now prepping payload and sending to Slack");
//   var theMessage = ""
//   m2sfOutput.forEach(file => theMessage= (theMessage + file.stillFileName + "\n"));
//   var thePayload = 'payload={"channel": "#ll-tests", "username": "theworkflow-bot", "text": "<@marlon>: new stills have been exported: ' + theMessage + ' ", "icon_emoji": ":camera:"}'
//   cp.spawnSync("curl", ['-X', 'POST', '--data-urlencode', thePayload, process.env.SLACK_WEBHOOK_URL]);
//   console.log("done");
// }
//
//




//

//
// router.get('/', function(req, res, next) {
//   var folderPath = "/Users/mk/Development/test_materials/_readyToTest/m2s_fcpxml";
//   res.render('tools/m2s_form', { tabTitle: 'm2s Entry Form', title: 'The m2s Form', theFolderPath: folderPath });
// });
//
//
// router.get('/test', function(req, res, next) {
//   res.render('tools/m2s_form', { tabTitle: 'test here', title: 'The m2s test Form' });
// });
//
//
// router.post('/run_m2s', function(req, res, next){
//   console.log(JSON.stringify(req.body, null, 4));
//   if (req.body.webexport == "yes") {
//     // var folderPath = "/Users/mk/Development/test_materials/_readyToTest/m2s_fcpxml";
//     // var theResult = m2s(folderPath);
//     var folderPath = req.body.fcpxmlPath;
//     var theResult = m2sf(req.body.fcpxmlPath);
//     var theNewResult = _.sortBy(theResult, ['tcNumber']);
//     res.render('tools/m2s_result', { tabTitle: 'm2s Result', title: 'The m2s Result for ', stillArray: theNewResult, theFolderPath: folderPath });
//   }
//   else {
//     res.send('why did you bother opening up thelocalworkflow then?')
//   }
// });
//
//
// module.exports = router;
