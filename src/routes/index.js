const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const axios = require('axios');
const qs = require('qs');
const mailgun = require('mailgun-js')({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });


app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/freeme', require('./freeme-router'));
app.use('/direct', require('./receive-router'));
app.use('/api/digest', require('./digest-router'));
app.use('/mailgun', require('./mailgun-router'));

app.post('/', (req, res) => {
    res.json({
      challenge: req.body.challenge
    });
});

app.post('/interactive-message', async (req, res) => {
  console.log('req.body.payload', req.body.payload);
  const body = JSON.parse(req.body.payload);
  const token = body.token;
  const trigger_id = body.trigger_id;
  const text = "test";

  if(body.type === 'dialog_submission') {
    const submission = body.submission;
    const senderEmail = submission.from;
    const subject = submission.title;
    const bodyPlain = submission.body;
    const recipientFirstName = submission.greeting;
    const sendBody = submission.response;

    const content = `<p>${recipientFirstName}</p><p>${sendBody}</p><p>Thanks,</p><p>BoilerMake Team</p><br/>-------<br/>Original Message:<br/>${bodyPlain}`;

    let data = {
      from: 'Support <support@boilermake.org>',
      to: senderEmail,
      subject: 'Re: ' + subject,
      html: content,
      'o:tracking': 'False'
    };

    try {
      res.sendStatus(204);
      const result = await mailgun.messages().send(data);
      return console.log(result);
    } catch(err) {
      console.log(err);
      return res.sendStatus(500);
    }
  } else {
      const actions = body.actions[0];
      const email = actions.value.split('----');

      const responseObj = {
          label: 'Response',
          type: 'textarea',
          name: 'response',
          optional: false,
      }

      if(email[4] === 'age') {
        responseObj.value = 'You must be above 18 years old to attend this event. Please visit our website to learn more!';
      } else if(email[4] === 'time') {
        responseObj.value = 'The event starts at 8:00 pm';
      }

      if (token === process.env.SLACK_VERIFICATION_TOKEN) {
        const dialog = {
          token: process.env.SLACK_AUTH_TOKEN,
          trigger_id,
          dialog: JSON.stringify({
            title: 'Respond to the email',
            callback_id: 'submit-email',
            submit_label: 'Reply',
            elements: [
              {
                label: 'From',
                type: 'text',
                name: 'from',
                value: email[0],
              },
              {
                label: 'Subject',
                type: 'text',
                name: 'title',
                value: email[2],
              },
              {
                label: 'Email content',
                type: 'textarea',
                name: 'body',
                value: email[3],
              },
              {
                label: 'Greeting',
                type: 'text',
                name: 'greeting',
                optional: false,
              },
              responseObj
            ],
          })
        }

        try {
          let result = await axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog));
          console.log('dialog.open: %o', result.data);
          res.sendStatus('');
        } catch(err) {
          console.log('dialog.open call failed: %o', err);
          res.sendStatus(500);
        }
      } else {
        console.log('Verification token mismatch');
        res.sendStatus(500);
      }
  }



});


module.exports = app;
