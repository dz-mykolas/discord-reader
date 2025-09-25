import { Client, Message } from 'discord.js-selfbot-v13';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as util from 'util';

dotenv.config();

type ServerConfig = {
    id: string;
    includeChannels?: string[];
    excludeChannels?: string[];
};

type AppConfig = {
    servers: ServerConfig[];
};

function getToken(): string {
    const token = process.env.DISCORD_USER_TOKEN;
    if (!token) throw new Error('Set DISCORD_USER_TOKEN in .env');
    return token;
}

function loadConfig(cwd: string = process.cwd()): AppConfig {
    const file = path.resolve(cwd, 'config.json');
    if (!fs.existsSync(file)) throw new Error('Missing config.json. Copy config.example.json -> config.json');
    const raw = fs.readFileSync(file, 'utf8');
    const cfg = JSON.parse(raw) as AppConfig;
    if (!cfg.servers || !Array.isArray(cfg.servers)) throw new Error('config.json must contain { "servers": [...] }');
    return cfg;
}

function isAllowed(message: Message, cfg: AppConfig): boolean {
    const guildId = message.guild?.id ?? null;
    if (guildId) {
        const s = cfg.servers.find(v => v.id === guildId);
        if (!s) return false;
        const ch = message.channel.id;
        const inInclude = s.includeChannels && s.includeChannels.length > 0 ? s.includeChannels.includes(ch) : true;
        const inExclude = s.excludeChannels?.includes(ch) ?? false;
        return inInclude && !inExclude;
    }
    const ch = message.channel.id;
    const anyInclude = cfg.servers.some(v => (v.includeChannels ?? []).includes(ch));
    const anyExclude = cfg.servers.some(v => (v.excludeChannels ?? []).includes(ch));
    return anyInclude && !anyExclude;
}

function dumpMessage(message: Message): string {
    return util.inspect(message, { depth: null, getters: true, showHidden: false });
}

async function main(): Promise<void> {
    const token = getToken();
    const config = loadConfig();

    const client: Client = new Client();

    client.on('ready', () => {
        console.log(`Logged in as ${client.user?.username ?? 'Unknown'}`);
    });

    client.on('messageCreate', (message: Message) => {
        if (!isAllowed(message, config)) return;
        console.log(dumpMessage(message));
    });

    await client.login(token);
    console.log('Press Ctrl+C to stop...');
}

main().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
