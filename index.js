const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());
var sendpulse = require("sendpulse-api");

// Initialize Supabase client
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ynbhzepfkimfgmmsumbb.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluYmh6ZXBma2ltZmdtbXN1bWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg0NDc0NDAsImV4cCI6MjAxNDAyMzQ0MH0.vgtE8S-eEMykRsZBCKCpQ5E3pm49YWenakZWb4dNiG4";
const supabase = createClient(supabaseUrl, supabaseKey);

// get access token
const clientId = "84527a4691268ce7c9a2ae8aafd159c6";
const clientSecret = "a910cc36f1022c54f569a3ce28238fb4";

const getToken = async () => {
  try {
    const response = await axios.post(
      "https://api.sendpulse.com/oauth/access_token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = response.data.access_token;
    console.log("Access Token:", accessToken);
    return accessToken;
  } catch (error) {
    console.error("Error obtaining access token:", error);
    throw error; // Re-throw error to be handled by the caller
  }
};

async function callAnotherApi(userData) {
  console.log("Starting callAnotherApi with userData:", userData);

  try {
    if (!isNaN(userData.lastMessage)) {
      console.log("lastMessage is a number, proceeding with Supabase query.");

      const { data: user, error } = await supabase
        .from("channels")
        .select("*")
        .eq("channel_name", userData?.username)
        .eq("otp", userData?.lastMessage);

      if (error) {
        console.error("Error fetching user from Supabase:", error.message);
        return error.message;
      }

      console.log("Supabase query result:", user);

      if (!user || user.length === 0) {
        const postData = {
          contact_id: userData.contact_id,
          messages: [
            {
              type: "text",
              message: {
                text: "Account not verified. Please make sure that the verification code and Instagram account are connected.",
              },
            },
          ],
          sent_by: "my_system" // Custom field to indicate the source
        };

        console.log("postData to be sent to SendPulse:", postData);

        const sendPulseAccessToken = await getToken();
        const sendResponse = await axios.post(
          "https://api.sendpulse.com/instagram/contacts/send",
          postData,
          {
            headers: {
              Authorization: `Bearer ${sendPulseAccessToken}`,
              "Content-Type": "application/json",
            },
            timeout: 10000 // 10 seconds timeout
          }
        );

        console.log("Response from SendPulse API:", sendResponse.data);
        return true;
      }

      return false;
    } else {
      console.log("lastMessage is not a number, skipping Supabase query.");
      return false;
    }
  } catch (error) {
    console.error("Error in callAnotherApi:", error);
    return error.message;
  }
}

// store data from webhook
function storeData(data) {
  const username = data[0]?.contact.username;
  const lastMessage = data[0]?.contact.last_message;
  const contact_id = data[0]?.contact.id;
  const sent_by = data[0]?.contact.sent_by;

  return { username, lastMessage, contact_id, sent_by };
}

// Endpoint to receive incoming messages
app.post("/webhook/incoming", async (req, res) => {
  try {
    const data = req.body;
    const userData = storeData(data);
    console.log("Received userData:", userData);

    // Ignore requests sent by your own system
    if (userData.sent_by === "my_system") {
      console.log("Ignoring request from my_system");
      return res.send("No action taken");
    }

    const result = await callAnotherApi(userData);
    if (result === true) {
      console.log("Message sent to SendPulse successfully.");
      return res.send("Message sent");
    } else if (result === false) {
      console.log("No action taken.");
      return res.send("No action taken");
    } else {
      console.log("Error occurred:", result);
      return res.status(500).send(result);
    }
  } catch (error) {
    console.error("Error in webhook incoming:", error);
    res.status(500).send(error.message);
  }
});

// Endpoint to send outgoing messages
app.post("/webhook/outgoing", async (req, res) => {
  const data = req.body;
  console.log(data, "neet");
  return res.sendStatus(200); // Corrected to use sendStatus
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
