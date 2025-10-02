import {
  Client,
  Message,
  Collection,
  TextChannel,
  ChannelLogsQueryOptions,
} from "discord.js-selfbot-v13";
import * as fs from "fs";
import * as path from "path";
import { dumpMessage } from "./utils";

async function fetchAllMessagesPaginated(
  channel: TextChannel,
  totalCap?: number,
  cutoffTimestamp?: number
): Promise<Message[]> {
  const max = totalCap && totalCap > 0 ? totalCap : 10_000;
  const collected: Message[] = [];
  let before: string | undefined;

  while (collected.length < max) {
    const pageSize = Math.min(100, max - collected.length);
    const opts: ChannelLogsQueryOptions = before
      ? { limit: pageSize, before }
      : { limit: pageSize };
    const page: Collection<string, Message> = await channel.messages.fetch(
      opts
    );
    if (page.size === 0) break;

    for (const msg of page.values()) {
      if (
        cutoffTimestamp !== undefined &&
        msg.createdTimestamp < cutoffTimestamp
      ) {
        collected.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
        return collected;
      }
      collected.push(msg);
      if (collected.length >= max) break;
    }

    const last = page.last();
    if (!last) break;
    before = last.id;
    if (page.size < pageSize) break;
  }

  collected.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
  return collected;
}

export async function collectChannelHistory(
  client: Client,
  channelId: string,
  minutesBack?: number,
  outputDir: string = "./history",
  maxMessages?: number
): Promise<{ channelId: string; total: number; file: string | null }> {
  ensureDir(outputDir);
  console.log(
    `[history] Fetching channel ${channelId}` +
      (minutesBack !== undefined
        ? ` (last ${minutesBack} minutes)`
        : " (no cutoff)")
  );
  const channel = await client.channels
    .fetch(channelId as any)
    .catch((e: any) => {
      throw new Error(
        `Unable to fetch channel ${channelId}: ${e?.message || e}`
      );
    });
  const cutoffTs =
    minutesBack !== undefined
      ? Date.now() - minutesBack * 60 * 1000
      : undefined;

  const messages = await fetchAllMessagesPaginated(
    channel as TextChannel,
    maxMessages,
    cutoffTs
  );

  if (messages.length === 0) {
    return { channelId, total: 0, file: null };
  }

  const file = path.join(outputDir, `${channelId}.jsonl`);
  writeMessagesJsonl(messages, file);
  console.log(
    `[history] Wrote ${messages.length} messages to ${file}` +
      (cutoffTs ? ` (cutoff >= ${new Date(cutoffTs).toISOString()})` : "")
  );
  return { channelId, total: messages.length, file };
}

function writeMessagesJsonl(messages: Message[], filePath: string): void {
  ensureDir(path.dirname(filePath));
  const lines = messages.map((m) => dumpMessage(m));
  fs.writeFileSync(filePath, lines.join("\n") + "\n", { encoding: "utf8" });
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
