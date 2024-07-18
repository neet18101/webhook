const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

// Initialize Supabase client
const { createClient } = require("@supabase/supabase-js");
const { default: axios } = require("axios");
const supabaseUrl = "https://ynbhzepfkimfgmmsumbb.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluYmh6ZXBma2ltZmdtbXN1bWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg0NDc0NDAsImV4cCI6MjAxNDAyMzQ0MH0.vgtE8S-eEMykRsZBCKCpQ5E3pm49YWenakZWb4dNiG4";
const supabase = createClient(supabaseUrl, supabaseKey);

// Endpoint to receive incoming messages
app.post("/webhook/incoming", async (req, res) => {
  const data = req.body;
  // console.log(data, "webhook");

  const username = data[0]?.contact.username;
  const lastMessage = data[0]?.contact.last_message;
  const contact_id = data[0]?.contact.id;

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
      try {
        const response = await axios.post(
          "https://api.sendpulse.com/instagram/contacts/send",
          {
            Headers: {
              "Content-Type": "application/json",
              Authorization:
                "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImFjNzQyMDNkMmM0OGFmOGQwNTE3ZDJmOWE3NDEwZDFjYWQ4MTk4NzUwMTQyNzBmY2ZiYjJlY2JhYWU2YzUzNWRiNmMwZDJlNjQ4MDQ0ZTFmIn0.eyJhdWQiOiI4NDUyN2E0NjkxMjY4Y2U3YzlhMmFlOGFhZmQxNTljNiIsImp0aSI6ImFjNzQyMDNkMmM0OGFmOGQwNTE3ZDJmOWE3NDEwZDFjYWQ4MTk4NzUwMTQyNzBmY2ZiYjJlY2JhYWU2YzUzNWRiNmMwZDJlNjQ4MDQ0ZTFmIiwiaWF0IjoxNzIxMjk1Nzg5LCJuYmYiOjE3MjEyOTU3ODksImV4cCI6MTcyMTI5OTM4OSwic3ViIjoiIiwic2NvcGVzIjpbXSwidXNlciI6eyJpZCI6ODc3NTcxOCwiZ3JvdXBfaWQiOm51bGwsInBhcmVudF9pZCI6bnVsbCwiY29udGV4dCI6eyJhY2NsaW0iOiIwIn0sImFyZWEiOiJyZXN0IiwiYXBwX2lkIjpudWxsfX0.CA473Pr5PnHQrErDZ4JXeC2qI7ofUOseK74ZRdQqDifDAvdY7Kz_pQgNNlyawjAmBQMoc1SHzuL0K3f9S_CefUJKTiQkBNaPZXklGC8IF4IJWkvYbdBW7NS4L7G50sKXcKfphVyncdM1f9f4dqZCAefvWpkqf1wjFtSOytUXrIJUmf-lILZ6XhykY6ARnzBlwEsDNHF6AOhJ-gRHprUwLHGTrDQwsP2N3iSUimC8W-19HxFzsdz_Eemp2L2C0JNUPe_0H6BGzaZYaycufktHio2OUHsm-SZp-1WIWGgPn5JybJzqZDbX0ZinDzptGIfVmbfCqUKDX4ZF0FHnm2kmkg",
            },
            body: {
              contact_id: contact_id,
              messages: [
                {
                  type: "text",
                  message: {
                    text: "Account not verified. Please make sure that the verification code and Instagram account are correct",
                  },
                },
              ],
            },
          }
        );
      } catch (error) {}
    }
  }
  // Check if the username and last message exist in the Supabase database

  if (error) {
    console.log("Error fetching user:", error.message);
    return res.status(500).json({ status: "error", error: error.message });
  }

  // Process the incoming message here
  console.log("User found:", JSON.stringify(user));
  return res
    .status(200)
    .json({ status: "success", data: user, message: "User found in database" });
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
