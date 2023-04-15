import fs from "fs";
import path from "path";
import { Collection } from "discord.js";
import dotenv from "dotenv-flow";
import { ClientWithCommands } from "./types/command";
import Log from "./utils/log";
import mongoose from "mongoose";
import { databaseUri } from "./services/mongodb";
import dixt from "dixt";
import dixtPluginLogs from "dixt-plugin-logs";
import dixtPluginTwitch from "dixt-plugin-twitch";
import dixtPluginTwitchOptions from "./options/twitch";

const main = async () => {
  dotenv.config({
    default_node_env: "development",
    silent: true,
  });
  Log.info(`current env ${process.env.NODE_ENV}`);

  dotenv
    .listDotenvFiles(".", process.env.NODE_ENV)
    .forEach((file) => Log.info(`loaded env from ${file}`));

  const instance = new dixt({
    application: {
      name: "Paleto Bay Hospital",
      logo: "https://cdn.discordapp.com/avatars/1057033412977885265/5f743bd6c50f3fb03d08ffbf370e9c04.webp",
    },
    plugins: [dixtPluginLogs, [dixtPluginTwitch, dixtPluginTwitchOptions]],
  });

  const client: ClientWithCommands = instance.client;

  try {
    await mongoose.connect(databaseUri);
    Log.ready("connected to mongodb");

    client.commands = new Collection();
    fs.readdirSync(path.join(__dirname, "commands"))
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
      .forEach((file) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const command = require(path.join(__dirname, "commands", file)).default;
        client.commands?.set(command.data.name, command);
        Log.ready(`loaded command ${file}`);
      });

    fs.readdirSync(path.join(__dirname, "plugins"))
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"))
      .forEach((file) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const plugin = require(path.join(__dirname, "plugins", file)).default;
        plugin(client);
        Log.ready(`loaded plugin ${file}`);
      });

    instance.start();
  } catch (error) {
    Log.error(error);
  }
};

main();
