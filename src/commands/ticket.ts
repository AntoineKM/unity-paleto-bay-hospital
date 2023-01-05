import { ChannelType, SlashCommandBuilder } from "discord.js";
import MESSAGES from "../constants/messages";
import TicketController from "../controllers/ticket";
import { DiscordCommand } from "../types/command";

const TicketCommand: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Intéragir avec les tickets")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("La commande à exécuter")
        .setRequired(true)
        .addChoices({
          value: "close",
          name: "Fermer un ticket",
        })
    ),
  async execute(interaction) {
    const command = interaction.options.getString("command");

    if (!interaction.inCachedGuild()) {
      interaction.reply({
        content: MESSAGES.ERROR.COMMAND_NOT_AVAILABLE_IN_DM,
      });
    } else {
      switch (command) {
        case "close":
          if (
            interaction.channel &&
            interaction.channel.type === ChannelType.GuildText &&
            (await TicketController.isTicket(interaction.channel))
          ) {
            interaction.reply("Fermeture du ticket dans 5 secondes");
            setTimeout(async () => {
              if (interaction.channel) {
                await interaction.channel.delete();
              }
            }, 5000);
          }
          return;
          break;
      }
    }

    setTimeout(async () => {
      await interaction.deleteReply();
    }, 5000);
  },
};

export default TicketCommand;
