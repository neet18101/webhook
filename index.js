const express = require("express");

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint to receive incoming messages
app.post("/webhook/incoming", (req, res) => {
  const data = req.body;

  console.log(`Received message from ${data}: ${data}`);
  // Process the incoming message here
  res.send(200).json({ status: "success", data });
});

// Endpoint to send outgoing messages
app.post("/webhook/outgoing", async (req, res) => {
  const { to, body } = req.body;
  try {
    const response = await sendOutgoingMessage(to, body);
    res.status(200).json({ status: "success", response });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
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
