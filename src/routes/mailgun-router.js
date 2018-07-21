const express = require('express');
const router = express.Router();
const mailgun = require('mailgun-js')({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });

router.post('/messages', (req, res, next) => {
  const receivedEmail = {
    senderEmail: req.body.sender,
    recipient: req.body.recipient,
    subject: req.body.subject,
    bodyPlain: req.body['body-plain']
  }

  res.sendStatus(204);
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

module.exports = router;
