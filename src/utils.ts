import { Message } from "discord.js-selfbot-v13";
import { AppConfig } from "./config";
import * as util from "util";

export function isAllowed(message: Message, cfg: AppConfig): boolean {
  const guildId = message.guild?.id ?? null;
  if (guildId) {
    const s = cfg.servers.find((v) => v.id === guildId);
    if (!s) return false;
    const ch = message.channel.id;
    const inInclude =
      s.includeChannels && s.includeChannels.length > 0
        ? s.includeChannels.includes(ch)
        : true;
    const inExclude = s.excludeChannels?.includes(ch) ?? false;
    return inInclude && !inExclude;
  }
  const ch = message.channel.id;
  const anyInclude = cfg.servers.some((v) =>
    (v.includeChannels ?? []).includes(ch)
  );
  const anyExclude = cfg.servers.some((v) =>
    (v.excludeChannels ?? []).includes(ch)
  );
  return anyInclude && !anyExclude;
}

export function dumpMessage(message: Message): string {
  return util.inspect(message, {
    depth: null,
    getters: true,
    showHidden: false,
  });
}
