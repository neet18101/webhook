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
  }
};
console.log(getToken());
// Endpoint to receive incoming messages
app.post("/webhook/incoming", async (req, res) => {
  const data = req.body;
  // console.log(data, "webhook");

  const username = data[0]?.contact.username;
  const lastMessage = data[0]?.contact.last_message;
  const contact_id = data[0]?.contact.id;

  console.log(username, lastMessage, contact_id);
  console.log(getToken());

  if (isNaN(lastMessage)) {
    return res
      .status(400)
      .json({ status: "error", message: "Last message is not numeric" });
  } else {
    const { data: user, error } = await supabase
      .from("channels")
      .select("*")
      .eq("channel_name", username)
      .eq("otp", lastMessage);

    if (!user || user.length === 0) {
      const postData = {
        contact_id: contact_id,
        messages: [
          {
            type: "text",
            message: {
              text: "Account not verified. please make sure that the verification code and instagram account are connect",
            },
          },
        ],
      };
      await axios.post(
        "https://api.sendpulse.com/instagram/contacts/send",
        postData,
        {
          headers: {
            Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjllNWE1NzY3OTIxZGI1Njk0ZGJhNDkyZGM4YWZlNzNhZTEzZjJmNjBkZmJlYTJhYjA3ZDVkZWNjNGQ4MDU5NTgwMzRkZGI5Mjk2MzUxZWQzIn0.eyJhdWQiOiI4NDUyN2E0NjkxMjY4Y2U3YzlhMmFlOGFhZmQxNTljNiIsImp0aSI6IjllNWE1NzY3OTIxZGI1Njk0ZGJhNDkyZGM4YWZlNzNhZTEzZjJmNjBkZmJlYTJhYjA3ZDVkZWNjNGQ4MDU5NTgwMzRkZGI5Mjk2MzUxZWQzIiwiaWF0IjoxNzIxMzAzMzk4LCJuYmYiOjE3MjEzMDMzOTgsImV4cCI6MTcyMTMwNjk5OCwic3ViIjoiIiwic2NvcGVzIjpbXSwidXNlciI6eyJpZCI6ODc3NTcxOCwiZ3JvdXBfaWQiOm51bGwsInBhcmVudF9pZCI6bnVsbCwiY29udGV4dCI6eyJhY2NsaW0iOiIwIn0sImFyZWEiOiJyZXN0IiwiYXBwX2lkIjpudWxsfX0.vKLCCqOIVbguvVOZoyLTf40FfzOeOrI63Dvtu-EGUld2kXKRaPvU_gBwCekdRqtuSaExfHnAxFJ-l8HWydUxnZ9GTUm5tutxq0UdUKWkJBkJSzWagzyxMocqceNyfumQU1PIZotfHLLsLToGYwBhoVrozpjSDUYUdepRuk12wXqVRyNUksSfEkGHFrhNMVwpm1TJsu1OSwljm_2YtkIdmX7_jM-oaj_Ej-QC2v84mEehzOxc05yK8aycwLRJIM62PNR3dIhUY90hsceJ-gmMAvD_rMp8jUXBuO0CxQf2Mj6yHHMbu8OBoNXG8qcF-PAPChkoYRH2HoXNPpUE20KV7Q`,
            "Content-Type": "application/json",
          },
        }
      );
      res.status(200).send();
      // console.log(response);
    }
  }
  // Check if the username and last message exist in the Supabase database

  // if (error) {
  //   console.log("Error fetching user:", error.message);
  //   return res.status(500).json({ status: "error", error: error.message });
  // }

  // Process the incoming message here
  // console.log("User found:", JSON.stringify(user));
  // return res
  //   .status(200)
  //   .json({ status: "success", data: user, message: "User found in database" });
});

// Endpoint to send outgoing messages
app.post("/webhook/outgoing", async (req, res) => {
  const data = req.body;
  console.log(data, "neet");
  return res.send().status(200);

  // const { to, body } = req.body;
  // try {
  //   const response = await sendOutgoingMessage(to, body);
  //   res.status(200).json({ status: "success", response });
  // } catch (error) {
  //   res.status(500).json({ status: "error", error: error.message });
  // }
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
