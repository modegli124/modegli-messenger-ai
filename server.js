const express = require("express");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "modegli_verify_2026";

// Meta Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Receive Messenger events
app.post("/webhook", (req, res) => {
  console.log("Messenger event:", JSON.stringify(req.body));

  res.status(200).send("EVENT_RECEIVED");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`MODEGLI Messenger AI running on port ${PORT}`);
});
