const express = require('express');
const router = express.Router();
const axios = require('axios');
const mailgun = require('mailgun-js')({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });
const qs = require('qs');
var unassignedUsers;

router.post('/messages', async (req, res, next) => {
  const receivedEmail = {
    senderEmail: req.body.sender,
    recipient: req.body.recipient,
    subject: req.body.subject,
    bodyPlain: req.body['body-plain']
  }

  const assignee = await roundRobin();
  const name = 'Sawyer';
  axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
     token: process.env.SLACK_AUTH_TOKEN,
     channel: assignee,
     text: `Bzz! Bzz! Hey, you've been assigned an email`,
     attachments: JSON.stringify([{
        "text": receivedEmail.subject + '\n\n' + receivedEmail.bodyPlain,
        "fallback": "Sorry you were unable to reply",
        "callback_id": "wopr_game",
        "color": "#FEE224",
        "attachment_type": "default",
        "actions": [
            {
                "name": "reply",
                "text": "Custom Reply",
                "type": "button",
                "value": req.body.sender + '----' + req.body.recipient + '----' + req.body.subject + '----'
                    + req.body['body-plain'] + '---- '
            },
            {
                "name": "reply",
                "text": "Underage",
                "type": "button",
                "value": req.body.sender + '----' + req.body.recipient + '----' + req.body.subject + '----'
                    + req.body['body-plain'] + '----age'
            },
            {
                "name": "reply",
                "text": "Time",
                "type": "button",
                "value": req.body.sender + '----' + req.body.recipient + '----' + req.body.subject + '----'
                    + req.body['body-plain'] + '----time'
            }
        ]
     }
     ]),
  })).then((result) => {
    console.log('sendConfirmation: %o', result.data);
    res.sendStatus(204);
  }).catch((err) => {
    console.error(err);
    res.sendStatus(500);
  });
});


router.post('/send', async (req, res, next) => {
  const senderEmail = req.body.senderEmail;
  const subject = req.body.subject;
  const bodyPlain = req.body.bodyPlain;
  const recipientFirstName = req.body.recipientFirstName;
  const sendBody = req.body.sendBody;

  const content = `<p>Hi ${recipientFirstName},</p><p>${sendBody}</p><p>Thanks,</p><p>BoilerMake Team</p><br/>-------<br/>Original Message:<br/>${bodyPlain}`;

  let data = {
    from: 'Support <support@boilermake.org>',
    to: senderEmail,
    subject: 'Re: ' + subject,
    html: content,
    'o:tracking': 'False'
  };

  try {
    const result = await mailgun.messages().send(data);
    res.sendStatus(204);
  } catch(err) {
    console.log(err);
    res.sendStatus(500);
  }
});

function getTheUser() {
  const user = unassignedUsers[Math.floor((Math.random() * unassignedUsers.length) + 1)];
  if (unassignedUsers.length === 1) {
    unassignedUsers = '';
    return unassignedUsers[0];
  }
  unassignedUsers = unassignedUsers.filter(function(el) {
    return el !== user;
  })
  return user;
}

async function roundRobin() {
  if (unassignedUsers === undefined || unassignedUsers.length == 0) {
    // Reset unassignedUsers!
    const channelID = 'CBUAADA1Y';
    const tokenWithChannel = {
      token: process.env.SLACK_AUTH_TOKEN,
      channel: 'CBUAADA1Y'
    };
    try {
      unassignedUsers = (await axios.post('https://slack.com/api/channels.info', qs.stringify(tokenWithChannel))).data.channel.members;
      return getTheUser();
    } catch (error) {
      console.log('error', error);
    }
  } else {
    return getTheUser();
  }
  // Do the Round Robin:

};

module.exports = router;
