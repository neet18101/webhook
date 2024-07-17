const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Endpoint to receive incoming messages
app.post("/webhook/incoming", (req, res) => {
  const data = req.body;
  console.log(`Received message from ${data.from}: ${data.body}`);
  // Process the incoming message here
  res.status(200).json({ status: "success" });
});

// Endpoint to send outgoing messages
app.post("/webhook/outgoing", (req, res) => {
  const { to, body } = req.body;
  // Logic to send the message via Sendplus
  sendOutgoingMessage(to, body)
    .then((response) => {
      res.status(200).json({ status: "success", response });
    })
    .catch((error) => {
      res.status(500).json({ status: "error", error });
    });
});

// Function to send outgoing message
function sendOutgoingMessage(to, body) {
  return new Promise((resolve, reject) => {
    // Replace with your Sendplus API integration
    console.log(`Sending message to ${to}: ${body}`);
    // Simulate async operation
    setTimeout(() => {
      resolve({ message: "Message sent successfully" });
    }, 1000);
  });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
