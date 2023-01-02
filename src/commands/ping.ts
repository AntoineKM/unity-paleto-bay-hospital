import { SlashCommandBuilder } from "discord.js";
import { DiscordCommand } from "../types/command";

const PingCommand: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Répond pong!"),
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
};

export default PingCommand;
