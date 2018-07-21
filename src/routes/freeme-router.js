const express = require('express');
const router = express.Router();
// const WebClient = require('@slack/client').WebClient;
// const createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter;
// const bot_token = process.env.SLACK_BOT_TOKEN || '';
// const auth_token = process.env.SLACK_AUTH_TOKEN || '';
// const slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN);
// const web = new WebClient(auth_token);
// const bot = new WebClient(bot_token);
const axios = require('axios');
const qs = require('qs');

router.post('/', (req, res) => {
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
      }),
    };

    // open the dialog by calling dialogs.open method and sending the payload
    axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
      .then((result) => {
        console.log('dialog.open: %o', result.data);
        res.send('');
      }).catch((err) => {
        console.log('dialog.open call failed: %o', err);
        res.sendStatus(500);
      });
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

        // `team_join` is fired whenever a new user (incl. a bot) joins the team
        // check if `event.is_restricted == true` to limit to guest accounts
        if (event.type === 'team_join' && !event.is_bot) {
          const { team_id, id } = event.user;
          onboard.initialMessage(team_id, id);
        }
        res.sendStatus(200);
      } else { res.sendStatus(500); }
      break;
    }
    default: { res.sendStatus(500); }
  }
});

/*
 * Endpoint to receive events from interactive message on Slack. Checks the
 * verification token before continuing.
 */
router.post('/interactive-message', (req, res) => {
  const { token, user, team } = JSON.parse(req.body.payload);
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    // simplest case with only a single button in the application
    // check `callback_id` and `value` if handling multiple buttons
    onboard.accept(user.id, team.id);
    res.send({ text: 'Thank you! The Terms of Service have been accepted.' });
  } else { res.sendStatus(500); }
});

module.exports = router;
