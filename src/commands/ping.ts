import { SlashCommandBuilder } from "discord.js";
import { Log } from "dixt";

import { DiscordCommand } from "../types/command";

const PingCommand: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Répond pong!"),
  execute(interaction) {
    return interaction
      .deferReply()
      .then(() => {
        interaction.editReply("Pong!");
      })
      .catch(Log.error);
  },
};

export default PingCommand;
