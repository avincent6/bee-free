const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const axios = require('axios');
const qs = require('qs');


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
  console.log('TOKEN!!!',token);
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    const dialog = {
      token: process.env.SLACK_AUTH_TOKEN,
      trigger_id,
      dialog: JSON.stringify({
        title: 'Submit a helpdesk ticket',
        callback_id: 'submit-ticket',
        submit_label: 'Submit',
        elements: [
          {
            label: 'Title',
            type: 'text',
            name: 'title',
            value: text,
            hint: '30 second summary of the problem',
          },
          {
            label: 'Description',
            type: 'textarea',
            name: 'description',
            optional: true,
          },
          {
            label: 'Urgency',
            type: 'select',
            name: 'urgency',
            options: [
              { label: 'Low', value: 'Low' },
              { label: 'Medium', value: 'Medium' },
              { label: 'High', value: 'High' },
            ],
          },
        ],
      })
    }

    try {
      let result = await axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog));
      console.log('dialog.open: %o', result.data);
      res.send('');
    } catch(err) {
      console.log('dialog.open call failed: %o', err);
      res.sendStatus(500);
    }
  } else {
    console.log('Verification token mismatch');
    res.sendStatus(500);
  }

});


module.exports = app;
