const express = require("express");
const app = express();
app.use(express.json());

// Initialize Supabase client
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = "https://ynbhzepfkimfgmmsumbb.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluYmh6ZXBma2ltZmdtbXN1bWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg0NDc0NDAsImV4cCI6MjAxNDAyMzQ0MH0.vgtE8S-eEMykRsZBCKCpQ5E3pm49YWenakZWb4dNiG4";
const supabase = createClient(supabaseUrl, supabaseKey);

// Endpoint to receive incoming messages
app.post("/webhook/incoming", async (req, res) => {
  const data = req.body;
  //   console.log(data[0])
  console.log(data);

  // const username = data[0].contact.username;
  // const lastMessage = data[0].contact.last_message;
  // console.log("Username:", username);
  // console.log("Last Message:", lastMessage);
  return res.status(200).send();

  // Check if the username and last message exist in the Supabase database
  const { data: user, error } = await supabase
    .from("channels")
    .select("*")
    .eq("channel_name", username)
    .eq("otp", lastMessage);
  if (error) {
    console.log("Error fetching user:", error.message);
    return res.status(500).json({ status: "error", error: error.message });
  }

  if (!user || user.length === 0) {
    return res.status(404).json({ status: "error", message: "User not found" });
  }

  // Process the incoming message here
  console.log("User found:", JSON.stringify(user));
  return res
    .status(200)
    .json({ status: "success", data: user, message: "User found in database" });
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

const PORT = process.env.PORT || 8090;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Mock function to send a message to Instagram
async function sendOutgoingMessage(to, body) {
  // Replace with your actual implementation to send a message to Instagram
  console.log(`Sending message to ${to}: ${body}`);
  return { to, body };
}
