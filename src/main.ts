import { Client, Message } from "discord.js-selfbot-v13";
import { loadConfig, getToken } from "./config";
import { isAllowed, dumpMessage } from "./utils";
import * as dotenv from "dotenv";

dotenv.config();

async function main(): Promise<void> {
  const token = getToken();
  const config = loadConfig();

  const client: Client = new Client();

  client.on("ready", () => {
    console.log(`Logged in as ${client.user?.username ?? "Unknown"}`);
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
