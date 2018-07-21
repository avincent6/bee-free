const express = require('express');
const router = express.Router();
const axios = require('axios');
const qs = require('qs');
var unassignedUsers;

router.post('/', async (req, res, next) => {

  const { token, text, trigger_id } = req.body;
  console.log('hey');
  const sawyer = roundRobin();
  const name = 'Sawyer';
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    console.log('sendConfirmation');
     axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
       token: process.env.SLACK_AUTH_TOKEN,
       channel: 'UBMJE3QDQ',
       text: `Bzz! Bzz! Hey ${name}, you've been assigned an email`,
       attachments: JSON.stringify([{
        "text": "Subject",
              "fallback": "Sorry you were unable to reply",
              "callback_id": "wopr_game",
              "color": "#FEE224",
              "attachment_type": "default",
              "actions": [
                  {
                      "name": "reply",
                      "text": "Reply",
                      "type": "button",
                      "value": "reply"
                  }
              ]
          }
       ]),
   })).then((result) => {
     console.log('sendConfirmation: %o', result.data);
   }).catch((err) => {
     console.log('sendConfirmation error: %o', err);
     console.error(err);
   });
 }

});

// Take in a user list and
function roundRobin() {
  if (unassignedUsers === undefined || unassignedUsers.length == 0) {
    // Reset unassignedUsers!
    const channelID = 'CBUAADA1Y';
    const tokenWithChannel = {
      token: process.env.SLACK_AUTH_TOKEN,
      channel: channelID
    };
    unassignedUsers = (await axios.post('https://slack.com/api/channels.info', qs.stringify(tokenWithChannel))).data.channel.members;
  }
  // Do the Round Robin:
  return unassignedUsers[Math.floor((Math.random() * unassignedUsers.length) + 1)];
};

const msg = {
    "text": "Hi friend! Bzz Bzz. You've been assigned an email!",
    "attachments": [
        {
            "text": "Choose something you need help with:",
            "fallback": "You are unable to choose a task",
            "callback_id": "wopr_game",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "qa",
                    "text": "Question/Answer",
                    "type": "button",
                    "value": "qa"
                },
				{
                    "name": "code",
                    "text": "Code Snippet",
                    "type": "button",
                    "value": "code"
                },
				{
                    "name": "url",
                    "text": "URL",
                    "type": "button",
                    "value": "url"
                }
            ]
        }
    ]
}


module.exports = router;
