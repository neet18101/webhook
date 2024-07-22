const axios = require("axios");
require("dotenv").config();

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET; // Replace with your actual client secret
const token_url = "https://api.sendpulse.com/oauth/access_token";

let token = null;
let tokenExpiry = null;

// Function to request a new token
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

// Function to ensure a valid token
async function ensureValidToken() {
  if (!token || Date.now() >= tokenExpiry) {
    await getNewToken();
  }
}

// Function to send a response using the valid token
async function sendResponse(postData) {
  await ensureValidToken();

  const url = "https://api.sendpulse.com/instagram/contacts/send";

  try {
    const response = await axios.post(url, postData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error sending response:", error);
  }
}

module.exports = {
  ensureValidToken,
};
