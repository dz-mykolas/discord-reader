# discord-reader

Monitor messages in selected Discord channels using a configurable allow/deny list per server.

Warning: Using a selfbot (user token) is against Discord's Terms of Service and may lead to account termination. Prefer a bot token and the official discord.js client if possible.

## Setup

1. Create a `.env` file with your token:
	 - `DISCORD_USER_TOKEN=...`

2. Copy `config.example.json` to `config.json` and edit:
	 ```json
	 {
		 "servers": [
			 {
				 "id": "<guildId>",
				 "includeChannels": ["<channelId1>", "<channelId2>"],
				 "excludeChannels": ["<channelId3>"]
			 }
		 ]
	 }
	 ```
		- If `includeChannels` is empty or omitted, all channels in that guild are allowed except those in `excludeChannels`.
		- If `excludeChannels` is empty or omitted, no channels are excluded.

3. Install and run:
	 - `npm install`
	 - `npm start`

The app reads `config.json` and prints messages from allowed channels per server rules.

## Notes

- Use Ctrl+C to stop.
- If `config.json` is missing or invalid, the app exits with an error.
