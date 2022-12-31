import fs from "fs";
import path from "path";
import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv-flow";
import DiscordApplication from "./services/discord";
import { ClientWithCommands } from "./types/command";
import Log from "./utils/log";

const main = async () => {
  dotenv.config({
    default_node_env: "development",
    silent: true,
  });
  Log.info(`current env ${process.env.NODE_ENV}`);

  dotenv
    .listDotenvFiles(".", process.env.NODE_ENV)
    .forEach((file) => Log.info(`loaded env from ${file}`));

  const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
  ];

  const client: ClientWithCommands = new Client({
    intents,
  });

  try {
    fs.readdirSync(path.join(__dirname, "plugins"))
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
      .forEach((file) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const plugin = require(path.join(__dirname, "plugins", file)).default;
        plugin(client);
        Log.ready(`loaded plugin ${file}`);
      });

    client.login(DiscordApplication.bot.token);
  } catch (error) {
    Log.error(error);
  }
};

main();
