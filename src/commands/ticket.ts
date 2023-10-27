import {
  ChannelType,
  GuildTextBasedChannel,
  SlashCommandBuilder,
} from "discord.js";

import MESSAGES from "../constants/messages";
import ROLES from "../constants/roles";
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
        .addChoices(
          {
            value: "close",
            name: "Fermer un ticket",
          },
          {
            value: "prefix",
            name: "Changer le préfixe d'un ticket",
          },
        ),
    )
    .addStringOption((option) =>
      option
        .setName("prefix")
        .setDescription("Le nouveau préfixe du ticket")
        .setRequired(false),
    ),
  async execute(interaction) {
    const command = interaction.options.getString("command");
    const prefix = interaction.options.getString("prefix");

    if (!interaction.inCachedGuild()) {
      interaction.reply({
        content: MESSAGES.ERROR.COMMAND_NOT_AVAILABLE_IN_DM,
      });
    } else {
      interaction.member.fetch();
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
                interaction.channel as GuildTextBasedChannel,
              );
            }, 5000);
          } else {
            interaction.reply(MESSAGES.ERROR.COMMAND_NOT_AVAILABLE_IN_CHANNEL);
          }
          return;
        case "prefix":
          if (!interaction.member.roles.cache.has(ROLES.EMERGENCY)) {
            interaction.reply({
              content: MESSAGES.ERROR.COMMAND_NO_PERMISSION,
            });
          } else {
            if (!prefix) {
              interaction.reply("❌ - Vous devez spécifier un `prefix`");
            } else {
              if (
                interaction.channel &&
                interaction.channel.type === ChannelType.GuildText &&
                (await TicketController.isTicket(interaction.channel))
              ) {
                await TicketController.changePrefix(
                  interaction.channel as GuildTextBasedChannel,
                  prefix,
                );
                await interaction.reply("✅ - Prefix du ticket mis à jour");
              } else {
                interaction.reply(
                  MESSAGES.ERROR.COMMAND_NOT_AVAILABLE_IN_CHANNEL,
                );
              }
            }
          }
      }
    }

    setTimeout(async () => {
      await interaction.deleteReply();
    }, 5000);
  },
};

export default TicketCommand;
