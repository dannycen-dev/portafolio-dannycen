#!/usr/bin/env node
/**
 * One-time helper: open Google OAuth and print a refresh token.
 * Authorization MUST use dannycen.dev@gmail.com (calendar + Gmail sender).
 *
 * Usage:
 *   node scripts/get-google-refresh-token.mjs <CLIENT_ID> <CLIENT_SECRET>
 */
import { createServer } from "node:http";
import { exec } from "node:child_process";

const clientId = process.argv[2];
const clientSecret = process.argv[3];
const port = 8765;
// Desktop OAuth clients allow localhost / 127.0.0.1 loopback on any port.
const redirectUri = `http://localhost:${port}/oauth2callback`;
const scopes = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/gmail.send",
].join(" ");
const loginHint = "dannycen.dev@gmail.com";

if (!clientId || !clientSecret) {
  console.error("Usage: node scripts/get-google-refresh-token.mjs <CLIENT_ID> <CLIENT_SECRET>");
  process.exit(1);
}

const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.searchParams.set("client_id", clientId);
authUrl.searchParams.set("redirect_uri", redirectUri);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("scope", scopes);
authUrl.searchParams.set("access_type", "offline");
authUrl.searchParams.set("prompt", "consent select_account");
authUrl.searchParams.set("login_hint", loginHint);

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
    if (url.pathname !== "/oauth2callback") {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const err = url.searchParams.get("error");
    if (err) throw new Error(err);
    const code = url.searchParams.get("code");
    if (!code) throw new Error("Missing code");

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const data = await tokenRes.json();
    if (!tokenRes.ok) {
      throw new Error(JSON.stringify(data));
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      "<h1>Listo</h1><p>Ya puedes cerrar esta pestaña y volver a la terminal.</p>",
    );

    console.log("\n=== Pega esto en Wrangler / .dev.vars ===\n");
    console.log(`GOOGLE_CLIENT_ID=${clientId}`);
    console.log(`GOOGLE_CLIENT_SECRET=${clientSecret}`);
    console.log(`GOOGLE_REFRESH_TOKEN=${data.refresh_token || "(NO VINO refresh_token — revoca acceso y reintenta con prompt=consent)"}`);
    console.log("\nSi no hay refresh_token: https://myaccount.google.com/permissions → quita la app y vuelve a correr el script.\n");
    server.close();
    process.exit(data.refresh_token ? 0 : 1);
  } catch (e) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(String(e));
    console.error(e);
    server.close();
    process.exit(1);
  }
});

server.listen(port, "localhost", () => {
  console.log("\n1) Abre esta URL en ventana de INCóGNITO:");
  console.log(authUrl.toString());
  console.log("\n2) Elige / inicia sesión como: dannycen.dev@gmail.com");
  console.log("   (NO uses danny@lynna.mx)\n");
  exec(`open '${authUrl.toString()}'`);
});
