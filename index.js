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
console.log(getToken());

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

        console.log("postData", postData);

        const sendResponse = await axios.post(
          "https://api.sendpulse.com/instagram/contacts/send",
          postData,
          {
            headers: {
              Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImM2MTRlYjZiMzMyNjM2OTdlZWU1Yzg5MDJhYjc4YzU5NTNlZTQ2ZjEwYjk4ZDRhNDBiMmFlYzY0MDIzZTkyOWNiOWY5ZDYyZmM1YmRmZGFhIn0.eyJhdWQiOiI4NDUyN2E0NjkxMjY4Y2U3YzlhMmFlOGFhZmQxNTljNiIsImp0aSI6ImM2MTRlYjZiMzMyNjM2OTdlZWU1Yzg5MDJhYjc4YzU5NTNlZTQ2ZjEwYjk4ZDRhNDBiMmFlYzY0MDIzZTkyOWNiOWY5ZDYyZmM1YmRmZGFhIiwiaWF0IjoxNzIxMzA5NjU2LCJuYmYiOjE3MjEzMDk2NTYsImV4cCI6MTcyMTMxMzI1Niwic3ViIjoiIiwic2NvcGVzIjpbXSwidXNlciI6eyJpZCI6ODc3NTcxOCwiZ3JvdXBfaWQiOm51bGwsInBhcmVudF9pZCI6bnVsbCwiY29udGV4dCI6eyJhY2NsaW0iOiIwIn0sImFyZWEiOiJyZXN0IiwiYXBwX2lkIjpudWxsfX0.yRp-kI4j2JZR7S2pyA1cyd890WktHY4quWk9caM8e9euk-7DJ3znVvytmGbdXcDvipSh5MxqUEOF70sL33g3uaJvh4WPrvu1MAKJr4T72n7pnz3eu6UOkYiB26KLSGGjw4X4zqV6ih8WFJjg4lMCywefVx8w9XxBpQdovdXhDU0jiHkLj-D4GOGVpCojL_1I5B9hwXw8igRt1sqw3yp2yKp8_O4yw2vm2Tlwph8dAAogHSQphSJos90VrUuVAYrJevv4C6dIHnQPjmqIKyG9_9oa7rUqask7sYAyQt9NgjgofpdX52yQ9mb1I0j0gvX4pieiL6AG8OpqIXv0o3OLZw`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Response from SendPulse API:", sendResponse.data);
        return response.data;
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

  return { username, lastMessage, contact_id };
}

// Endpoint to receive incoming messages
app.post("/webhook/incoming", async (req, res) => {
  try {
    const data = req.body;
    const userData = storeData(data);
    console.log("xxx");

    // console.log(userData, "neet");

    // Call another API with the stored data
    const a = await callAnotherApi(userData);
    if (a) {
      return res.send("message gone");
    }
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
