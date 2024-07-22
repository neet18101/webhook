const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());
const { IgApiClient } = require("instagram-private-api");

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

// get ads
const getNewMessages = async () => {
  const ig = new IgApiClient();
  ig.state.generateDevice("heystak.io");
  console.log("IG_USERNAME:", "heystak.io");
  console.log("IG_PASSWORD:", "Heystak12!" ? "Loaded" : "Not Loaded");

  await ig.account.login("heystak.io", "Heystak12!");

  const inboxFeed = ig.feed.directInbox();
  const threads = await inboxFeed.items();

  // A set to keep track of processed message IDs
  const processedMessageIds = new Set();

  // Load processed message IDs from storage (this is just an example)
  // In a real application, you would load this from a database or file
  // const processedMessageIds = new Set(loadProcessedMessageIdsFromStorage());

  threads.forEach((thread) => {
    thread.items.forEach((message) => {
      if (!processedMessageIds.has(message.fbid)) {
        // Process the new message
        console.log("New message:", message.item_type);
        if (message.item_type === "media_share") {
          const post_id = message?.media_share?.id;
          const brand_logo = message?.media_share?.user?.profile_pic_url;
          const brand_username = message?.media_share?.user?.username;
          const brand_fullname = message?.media_share?.user?.full_name;
          const caption_text = message?.media_share?.caption?.text;
          const ad_id = message?.media_share?.ad_id;
          const product_images = carousel_media.map(
            (item) => item.image_versions2.candidates[0].url
          );
          const product_link = carousel_media[0].link;
          console.log(
            post_id,
            brand_logo,
            brand_username,
            brand_fullname,
            caption_text,
            ad_id,
            product_images,
            product_link
          );
          console.log(JSON.stringify(message?.media_share));
        }

        // Add the message ID to the set of processed IDs
        processedMessageIds.add(message.fbid);

        // Save the processed message ID to storage (this is just an example)
        // In a real application, you would save this to a database or file
        // saveProcessedMessageIdToStorage(message.item_id);
      }
    });
  });
};
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

        const sendResponse = await axios.post(
          "https://api.sendpulse.com/instagram/contacts/send",
          postData,
          {
            headers: {
              Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjgzNmQzNDQxMWJhYmZjNTM5MDc1ODhhODExYTAwMzFkMDQwNWJmOWRiZWY3NDJlZTY2MWE5NWZkMDVmOWNjODlhZTA0YWYzNzM2ZmEzZjFkIn0.eyJhdWQiOiI4NDUyN2E0NjkxMjY4Y2U3YzlhMmFlOGFhZmQxNTljNiIsImp0aSI6IjgzNmQzNDQxMWJhYmZjNTM5MDc1ODhhODExYTAwMzFkMDQwNWJmOWRiZWY3NDJlZTY2MWE5NWZkMDVmOWNjODlhZTA0YWYzNzM2ZmEzZjFkIiwiaWF0IjoxNzIxMzkwOTI3LCJuYmYiOjE3MjEzOTA5MjcsImV4cCI6MTcyMTM5NDUyNywic3ViIjoiIiwic2NvcGVzIjpbXSwidXNlciI6eyJpZCI6ODc3NTcxOCwiZ3JvdXBfaWQiOm51bGwsInBhcmVudF9pZCI6bnVsbCwiY29udGV4dCI6eyJhY2NsaW0iOiIwIn0sImFyZWEiOiJyZXN0IiwiYXBwX2lkIjpudWxsfX0.XIdZyo8mGBdrYBwyds1f2vJKuvI5wAwBqrcmIlZqmyT6bsWqbzn1UoyVcZ6lrLEiEuaTUzclAXNsy-cefmkyUSR6s1PZ_uTaqTf-0U0y3Z6j015DYnEG5vliwbIL2jh139stVQ8UmtLUacL_KZpJeRx0QbFwz6qKK5R01RCEnQ2f805J2EvnVgw3lqrJfPrcpw7O3IZ6GjGwKbLRA-IZtSM0rN4_aKPcPVTJXylUKpBJvnUbklRnR_67aKMdUjWO7p7uxppRx1I7kRzwmdL7tsCYcpfjQ7PpYXTKBD_bHYn_ycKAnjlazp5nZauvMRBIXI7sP_FApYZRVKKLLwbhAw`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Response from SendPulse API:", sendResponse.data);
        return true;
      } else {
        const { data: user, error } = await supabase
          .from("channels")
          .select("id, is_verified")
          .eq("channel_name", userData?.username);

        if (user[0].is_verified) {
          return true;
        } else {
          console.log(user[0]?.id);
          const { data: updateUser, error } = await supabase
            .from("channels")
            .update({ is_verified: true })
            .eq("id", user[0].id);
          console.log(updateUser, error, "neetx");
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
          const sendResponse = await axios.post(
            "https://api.sendpulse.com/instagram/contacts/send",
            postData,
            {
              headers: {
                Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjgzNmQzNDQxMWJhYmZjNTM5MDc1ODhhODExYTAwMzFkMDQwNWJmOWRiZWY3NDJlZTY2MWE5NWZkMDVmOWNjODlhZTA0YWYzNzM2ZmEzZjFkIn0.eyJhdWQiOiI4NDUyN2E0NjkxMjY4Y2U3YzlhMmFlOGFhZmQxNTljNiIsImp0aSI6IjgzNmQzNDQxMWJhYmZjNTM5MDc1ODhhODExYTAwMzFkMDQwNWJmOWRiZWY3NDJlZTY2MWE5NWZkMDVmOWNjODlhZTA0YWYzNzM2ZmEzZjFkIiwiaWF0IjoxNzIxMzkwOTI3LCJuYmYiOjE3MjEzOTA5MjcsImV4cCI6MTcyMTM5NDUyNywic3ViIjoiIiwic2NvcGVzIjpbXSwidXNlciI6eyJpZCI6ODc3NTcxOCwiZ3JvdXBfaWQiOm51bGwsInBhcmVudF9pZCI6bnVsbCwiY29udGV4dCI6eyJhY2NsaW0iOiIwIn0sImFyZWEiOiJyZXN0IiwiYXBwX2lkIjpudWxsfX0.XIdZyo8mGBdrYBwyds1f2vJKuvI5wAwBqrcmIlZqmyT6bsWqbzn1UoyVcZ6lrLEiEuaTUzclAXNsy-cefmkyUSR6s1PZ_uTaqTf-0U0y3Z6j015DYnEG5vliwbIL2jh139stVQ8UmtLUacL_KZpJeRx0QbFwz6qKK5R01RCEnQ2f805J2EvnVgw3lqrJfPrcpw7O3IZ6GjGwKbLRA-IZtSM0rN4_aKPcPVTJXylUKpBJvnUbklRnR_67aKMdUjWO7p7uxppRx1I7kRzwmdL7tsCYcpfjQ7PpYXTKBD_bHYn_ycKAnjlazp5nZauvMRBIXI7sP_FApYZRVKKLLwbhAw`,
                "Content-Type": "application/json",
              },
            }
          );
        }

        return true;
      }
    } else {
      console.log(userData, "neet");
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
  return { username, lastMessage, contact_id, date };
}

const inComingDetails = [];

// Endpoint to receive incoming messages
app.post("/webhook/incoming", async (req, res) => {
  try {
    const data = req.body;
    console.log(data[0]?.info?.message, data);
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
      await getNewMessages();
      // await callAnotherApi(userData);
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

app.get("/messaging-webhook", (req, res) => {
  const VERIFY_TOKEN = "navneet123"; // Replace with your verify token

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      console.log(challenge);
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
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
