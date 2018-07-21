const express = require('express');
const router = express.Router();

router.get('/', async (req, res, next) => {
  res.sendStatus(204);
});

/*
 * Endpoint to receive events from Slack's Events API.
 * Handles:
 *   - url_verification: Returns challenge token sent when present.
 *   - event_callback: Confirm verification token & handle `team_join` event.
 */

router.post('/', (req, res) => {
    console.log(req.body);
    res.json({
      challenge: req.body.challenge
    });
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
