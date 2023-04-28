import { Events } from "discord.js";

import { ClientWithCommands } from "../types/command";
import { DiscordPlugin } from "../types/plugin";

const ServerPlugin: DiscordPlugin = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
      // command handling
    } else if (interaction.isAutocomplete()) {
      const command = (interaction.client as ClientWithCommands).commands?.get(
        interaction.commandName
      );

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await (command as any).autocomplete(interaction);
      } catch (error) {
        console.error(error);
      }
    }
  });
};

export default ServerPlugin;
