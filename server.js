const express = require("express");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// التحقق من Webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// استقبال رسائل Messenger
app.post("/webhook", async (req, res) => {
  console.log("Messenger event:", JSON.stringify(req.body));

  if (req.body.object === "page") {
    for (const entry of req.body.entry || []) {
      for (const event of entry.messaging || []) {
        if (event.message && event.message.text) {
          console.log("رسالة:", event.message.text);
          console.log("من المستخدم:", event.sender.id);
        }
      }
    }
  }

  res.status(200).send("EVENT_RECEIVED");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Mo Chat is running on port ${PORT}`);
});
