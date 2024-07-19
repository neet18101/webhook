const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());
var sendpulse = require("sendpulse-api");
const { v4: uuidv4 } = require("uuid");
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
    // console.log("Access Token:", accessToken);
    return accessToken;
  } catch (error) {
    console.error("Error obtaining access token:", error);
    throw error; // Re-throw error to be handled by the caller
  }
};
// console.log(getToken());

// store data from webhook
function storeData(data) {
  const username = data[0]?.contact.username;
  const lastMessage = data[0]?.contact.last_message;
  const contact_id = data[0]?.contact.id;

  return { username, lastMessage, contact_id };
}

// Endpoint to receive incoming messages
app.post("/webhook/incoming", async (req, res) => {
  const data = req.body;
  const userData = storeData(data);
  
  try {
    if (!isNaN(userData.lastMessage)) {
      const { data: user, error } = await supabase
        .from("channels")
        .select("channel_name, otp")
        .eq("channel_name", userData?.username)
        .eq("otp", userData?.lastMessage);
      
      if (!user || user.length === 0) {
        const postData = {
          contact_id: userData.contact_id,
          messages: [
            {
              type: "text",
              message: {
                text: "Account not verified. Please make sure that the verification code and Instagram account are connected🙁🙁",
              },
            },
          ],
        };
        
        const sendResponse = await axios.post(
          "https://api.sendpulse.com/instagram/contacts/send",
          postData,
          {
            headers: {
              Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjY1OWM4YWM4MTdiMjNkYWQwMTQ5ZTk5MzQ1NDI0Y2RiYTBkYmVlM2EyNzJkOWUzNzJkY2YxZDNiNWEzNTczMjBlN2Q3OWU2ZTkxNGQ4YTg2In0.eyJhdWQiOiI4NDUyN2E0NjkxMjY4Y2U3YzlhMmFlOGFhZmQxNTljNiIsImp0aSI6IjY1OWM4YWM4MTdiMjNkYWQwMTQ5ZTk5MzQ1NDI0Y2RiYTBkYmVlM2EyNzJkOWUzNzJkY2YxZDNiNWEzNTczMjBlN2Q3OWU2ZTkxNGQ4YTg2IiwiaWF0IjoxNzIxMzcxNzcwLCJuYmYiOjE3MjEzNzE3NzAsImV4cCI6MTcyMTM3NTM3MCwic3ViIjoiIiwic2NvcGVzIjpbXSwidXNlciI6eyJpZCI6ODc3NTcxOCwiZ3JvdXBfaWQiOm51bGwsInBhcmVudF9pZCI6bnVsbCwiY29udGV4dCI6eyJhY2NsaW0iOiIwIn0sImFyZWEiOiJyZXN0IiwiYXBwX2lkIjpudWxsfX0.G3lao0NDbc5bdO1mQ5BcYOXAk_aqK0K8utdvyASQfzDXUMrCE_MZkRQLm6PmEJ3OwJOKsKd7EnKsos-Tw5CRR_e48DyQBm6Cq-exmOt7ZSHSE3wxvXRQ9aSBzudvWrJ1syfwd_i4rtQshF6cnhvpAVasQa_bXJPaXPD11br_G0Ur9Vrvy7pHQb27xrplF_tCIMzPXBqUOcvf5QZRBSSfMx6htLgyBXlFQRdt7JYcEgazZPVrPeSJYbOIdDStfjwGHZnjfub3oXhe-N9VaKauvqGETyd9z1H6yaBfCIWqVpw3hFqxJc_428Qk1ZerFeWe65ivIyJ1_7WFpr4i45HTrg`,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }
    res.sendStatus(200); // Send a response back to the client
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Send an error response back to the client in case of failure
  }
});

// Endpoint to send outgoing messages
app.post("/webhook/outgoing", async (req, res) => {
  const data = req.body;
  // console.log(data, "neet");
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
