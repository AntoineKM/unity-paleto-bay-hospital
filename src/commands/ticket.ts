import {
  ChannelType,
  GuildTextBasedChannel,
  SlashCommandBuilder,
} from "discord.js";
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
            interaction.reply("✅ - Fermeture du ticket dans 5 secondes");
            setTimeout(async () => {
              await TicketController.closeTicket(
                interaction.user,
                interaction.channel as GuildTextBasedChannel
              );
            }, 5000);
          } else {
            interaction.reply(MESSAGES.ERROR.COMMAND_NOT_AVAILABLE_IN_CHANNEL);
          }
          return;
      }
    }

    setTimeout(async () => {
      await interaction.deleteReply();
    }, 5000);
  },
};

export default TicketCommand;
