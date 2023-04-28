import { Collection } from "discord.js";
import dixt from "dixt";
import dixtPluginAffix from "dixt-plugin-affix";
import dixtPluginJoin from "dixt-plugin-join";
import dixtPluginLogs from "dixt-plugin-logs";
import dixtPluginReact from "dixt-plugin-react";
import dixtPluginTwitch from "dixt-plugin-twitch";
import dotenv from "dotenv-flow";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";

import dixtPluginAffixOptions from "./options/affix";
import dixtPluginJoinOptions from "./options/join";
import dixtPluginReactOptions from "./options/react";
import dixtPluginTwitchOptions from "./options/twitch";
import { databaseUri } from "./services/mongodb";
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

  const instance = new dixt({
    application: {
      name: "Paleto Bay Hospital",
      logo: "https://cdn.discordapp.com/avatars/1057033412977885265/5f743bd6c50f3fb03d08ffbf370e9c04.webp",
    },
    plugins: [
      dixtPluginLogs,
      [dixtPluginAffix, dixtPluginAffixOptions],
      [dixtPluginJoin, dixtPluginJoinOptions],
      [dixtPluginReact, dixtPluginReactOptions],
      [dixtPluginTwitch, dixtPluginTwitchOptions],
    ],
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
