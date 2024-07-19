const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());
var sendpulse = require("sendpulse-api");
require("dotenv").config();

// Initialize Supabase client
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// get access token
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
let token = null;
let tokenExpiry = null;

async function getNewToken() {
  try {
    const response = await axios.post(token_url, {
      grant_type: "client_credentials",
      client_id: client_id,
      client_secret: client_secret,
    });

    token = response.data.access_token;
    tokenExpiry = Date.now() + response.data.expires_in * 1000;
    console.log("New token obtained:", token);
  } catch (error) {
    console.error("Error obtaining token:", error);
  }
}
async function ensureValidToken() {
  if (!token || Date.now() >= tokenExpiry) {
    await getNewToken();
  }
}

async function callAnotherApi(userData) {
  try {
    if (!isNaN(userData.lastMessage)) {
      const { data: user, error } = await supabase
        .from("channels")
        .select("*")
        .eq("channel_name", userData?.username)
        .eq("otp", userData?.lastMessage);

      if (error) {
        console.error("Error fetching user:", error.message);
        return error.message;
      }

      if (!user || user.length === 0) {
        const postData = {
          contact_id: userData.contact_id,
          messages: [
            {
              type: "text",
              message: {
                text: "Account not verified. please make sure that the verification code and Instagram account are connected",
              },
            },
          ],
        };

        await ensureValidToken();

        const sendResponse = await axios.post(
          process.env.SEND_INSTAGRAM_MESSAGE_URL,
          postData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Response from SendPulse API:", sendResponse.data);
        return true;
      } else {
        const postData = {
          contact_id: userData.contact_id,
          messages: [
            {
              type: "text",
              message: {
                text: "Otp Verified Successful 🎉🎉",
              },
            },
          ],
        };

        // console.log("postData", postData);

        const sendResponse = await axios.post(
          process.env.SEND_INSTAGRAM_MESSAGE_URL,
          postData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        return true;
      }
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error calling another API:", error);
    return error.message;
  }
}

// store data from webhook
function storeData(data) {
  const username = data[0]?.contact.username;
  const lastMessage = data[0]?.contact.last_message;
  const contact_id = data[0]?.contact.id;
  const date = data[0]?.date;
  console.log(data ?? [], "data ");
  return { username, lastMessage, contact_id, date };
}

const inComingDetails = [];

// Endpoint to receive incoming messages
app.post("/webhook/incoming", async (req, res) => {
  try {
    const data = req.body;
    // console.log(data);
    const userData = storeData(data);
    const check = await inComingDetails.find(
      (obj) =>
        obj.contact_id === userData.contact_id &&
        obj.lastMessage === userData.lastMessage
    );
    // console.log(check, "neet", userData, inComingDetails);
    if (check) {
      return res.sendStatus(200);
    } else {
      inComingDetails.push(userData);
      await callAnotherApi(userData);
    }
    // console.log(userData, "neet");
    // Call another API with the stored data

    return res.sendStatus(200); // Corrected to use sendStatus
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
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
