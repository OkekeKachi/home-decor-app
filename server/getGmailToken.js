import "dotenv/config";
import { google } from "googleapis";
import http from "http";
import { URL } from "url";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const scopes = ["https://mail.google.com/"];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  prompt: "consent",
});

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost:3001");

    if (url.pathname !== "/api/auth/google/callback") {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const code = url.searchParams.get("code");

    if (!code) {
      res.writeHead(400);
      res.end("No authorization code received.");
      return;
    }

    console.log("\nAuthorization code received. Exchanging for tokens...\n");

    const { tokens } = await oauth2Client.getToken(code);

    console.log("SUCCESS!\n");
    console.log("Refresh token:");
    console.log(tokens.refresh_token);

    res.writeHead(200, {
      "Content-Type": "text/html",
    });

    res.end(`
            <h2>Gmail authorization successful!</h2>
            <p>You can close this tab and return to your terminal.</p>
        `);

    server.close();
  } catch (error) {
    console.error(
      "Error getting tokens:",
      error.response?.data || error.message
    );

    res.writeHead(500);
    res.end("Something went wrong. Check your terminal.");

    server.close();
  }
});

server.listen(3001, () => {
  console.log("\nGmail OAuth setup started.");
  console.log("\nOpen this URL in your browser:\n");
  console.log(authUrl);
  console.log("\nWaiting for Google callback...\n");
});