import { Events } from "discord.js";

import CommandsController from "../controllers/commands";
import { DiscordPlugin } from "../types/plugin";

const CommandsPlugin: DiscordPlugin = async (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands?.get(interaction.commandName);

    if (!command) return;

    await interaction.deferReply({
      ephemeral: true,
    });

    try {
      await (command as any).execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: "There was an error while executing this command!",
      });
    }
  });

  await CommandsController.deployCommands(client);
};

export default CommandsPlugin;
