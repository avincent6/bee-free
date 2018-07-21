const express = require('express');
const router = express.Router();
const axios = require('axios');
const qs = require('qs');

router.post('/', async (req, res, next) => {
  const { token, text, trigger_id } = req.body;

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

router.post('/events', (req, res) => {
  switch (req.body.type) {
    case 'url_verification': {
      // verify Events API endpoint by returning challenge if present
      res.send({ challenge: req.body.challenge });
      break;
    }
    case 'event_callback': {
      if (req.body.token === process.env.SLACK_VERIFICATION_TOKEN) {
        const event = req.body.event;


module.exports = router;
