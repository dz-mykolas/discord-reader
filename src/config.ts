import * as fs from "fs";
import * as path from "path";

export type ServerConfig = {
  id: string;
  includeChannels?: string[];
  excludeChannels?: string[];
};

export type AppConfig = {
  servers: ServerConfig[];
};

export function getToken(): string {
  const token = process.env.DISCORD_USER_TOKEN;
  if (!token) throw new Error("Set DISCORD_USER_TOKEN in .env");
  return token;
}

export function loadConfig(cwd: string = process.cwd()): AppConfig {
  const file = path.resolve(cwd, "config.json");
  if (!fs.existsSync(file))
    throw new Error(
      "Missing config.json. Copy config.example.json -> config.json"
    );
  const raw = fs.readFileSync(file, "utf8");
  const cfg = JSON.parse(raw) as AppConfig;
  if (!cfg.servers || !Array.isArray(cfg.servers))
    throw new Error('config.json must contain { "servers": [...] }');
  return cfg;
}
