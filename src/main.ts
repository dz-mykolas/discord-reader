import { Client, Message } from "discord.js-selfbot-v13";
import { loadConfig, getToken } from "./config";
import { isAllowed, dumpMessage } from "./utils";
import * as dotenv from "dotenv";
import { collectChannelHistory } from "./history";

dotenv.config();

async function main(): Promise<void> {
  const token = getToken();
  const config = loadConfig();

  const client: Client = new Client();

  client.on("ready", () => {
    console.log(`Logged in as ${client.user?.username ?? "Unknown"}`);

    (async () => {
      try {
        console.log("Starting historical collection...");
        const result = await collectChannelHistory(
          client,
          "YOUR_CHANNEL_ID_HERE",
          60 * 24 * 14 // 14 days
        );
        console.log("Result:", result);
      } catch (err) {
        console.error("Historical collection failed", err);
      }
    })();
  });

  client.on("messageCreate", (message: Message) => {
    if (!isAllowed(message, config)) return;
    console.log(dumpMessage(message));
  });

  await client.login(token);
  console.log("Press Ctrl+C to stop...");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
