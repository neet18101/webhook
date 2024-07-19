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
              Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjZhYWQzMGMxODAyNjMzODRhZmFiYWViYzc2NGM3NTcxMjNkNzk1ODE5NzZhMDllNGY1YmMwMjIzZjljZjkyMDNlY2E2MmI0MWQ3ZGY2ZjM0In0.eyJhdWQiOiI4NDUyN2E0NjkxMjY4Y2U3YzlhMmFlOGFhZmQxNTljNiIsImp0aSI6IjZhYWQzMGMxODAyNjMzODRhZmFiYWViYzc2NGM3NTcxMjNkNzk1ODE5NzZhMDllNGY1YmMwMjIzZjljZjkyMDNlY2E2MmI0MWQ3ZGY2ZjM0IiwiaWF0IjoxNzIxMzY2NDUwLCJuYmYiOjE3MjEzNjY0NTAsImV4cCI6MTcyMTM3MDA1MCwic3ViIjoiIiwic2NvcGVzIjpbXSwidXNlciI6eyJpZCI6ODc3NTcxOCwiZ3JvdXBfaWQiOm51bGwsInBhcmVudF9pZCI6bnVsbCwiY29udGV4dCI6eyJhY2NsaW0iOiIwIn0sImFyZWEiOiJyZXN0IiwiYXBwX2lkIjpudWxsfX0.jV0T8rr2adI1n410rXlxTSqg0Y1qxSVgeG6tpng5IY2XL5UgSCgPGgzcL1gXcw0b2dI35sGLuBah885QUuGVa_X3eLH4sLmufUzps8raPRex-9EYfNvKQI75TT7M5gX6JzzM6MUp9gdQFIemOleFDCpzssqCnDZATk7eFSNV4QJDOl3rPFODnaS86Od4UlZK7BVe95vKYZ0eMY6FzEQz9VP4ALIBkfRZLDVL3Nor0f8Ep6bLR8cL_KdtOJBNoznFHJyzQ1EIu5Aa6Tb2EM-1mgLR0e7Jz_tulxJvI5fZqm0EiQww5-6Pj6zcbOM9_TXtQ-FyvufNKXCsaMhZNkpaGg`,
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
    console.log(data);

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
