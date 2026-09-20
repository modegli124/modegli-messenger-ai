const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// 1. مسار التحقق من Webhook (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === VERIFY_TOKEN) {
    console.log("WEBHOOK_VERIFIED");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 2. مسار استقبال الرسائل من فيسبوك (POST)
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    res.status(200).send('EVENT_RECEIVED');

    for (const entry of body.entry) {
      if (!entry.messaging || entry.messaging.length === 0) continue;
      
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;

      if (webhook_event.message && webhook_event.message.text) {
        const userMessage = webhook_event.message.text;
        console.log(`رسالة جديدة من ${sender_psid}: ${userMessage}`);

        const replyText = `أهلاً بك! وصلتنا رسالتك: "${userMessage}"`;
        await sendTextMessage(sender_psid, replyText);
      }
    }
  } else {
    res.sendStatus(404);
  }
});

// دالة إرسال الرد المحدثة
async function sendTextMessage(sender_psid, responseText) {
  const request_body = {
    recipient: { id: sender_psid },
    message: { text: responseText }
  };

  try {
    await axios({
      method: 'POST',
      url: 'https://graph.facebook.com/v20.0/me/messages',
      params: { access_token: PAGE_ACCESS_TOKEN },
      data: request_body,
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('تم إرسال الرد بنجاح!');
  } catch (error) {
    console.error('Graph API Error:', error.response ? error.response.data : error.message);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
