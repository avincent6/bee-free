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
        title: 'Respond to the email below',
        callback_id: 'submit-email',
        submit_label: 'Submit',
        elements: [
          {
            label: 'From',
            type: 'text',
            name: 'from',
            value: from,
            hint: 'Person who sent the email',
          },
         {
            label: 'Subject',
            type: 'text',
            name: 'title',
            value: subject,
            hint: 'Subject of the email',
          },
          {
            label: 'Body',
            type: 'text',
            name: 'Body of email you were sent',
            value: bodyplain,
          },
          {
            label: 'Your response',
            type: 'textarea',
            name: 'Body of email you are composing',
            optional: true,
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




module.exports = router;
