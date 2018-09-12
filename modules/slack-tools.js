const cp = require('child_process');

function postToSlack(m2sOutput, settings){
  console.log("done the stills--now prepping payload and sending to Slack---IF you entered a webhook url OR have a $SLACK_WEBHOOK_URL environment variable set, that is");
  var theMessage = ""
  m2sOutput.forEach(file => theMessage= (theMessage + file.stillFileName + "\n"));
  // TODO: be sure to add
  // the user's name
  // slack webhook url
  // emoji
  // slack channel
  var thePayload = 'payload={"channel": "#ll-tests", "username": "theworkflow-bot", "text": "<@marlon>: new stills have been exported: ' + theMessage + ' ", "icon_emoji": ":camera:"}'
  cp.spawnSync("curl", ['-X', 'POST', '--data-urlencode', thePayload, settings.slackWebhookUrl]);
  console.log("done");
}

module.exports.postToSlack = postToSlack;
