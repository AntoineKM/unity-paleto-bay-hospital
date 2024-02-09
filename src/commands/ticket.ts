import {
  ChannelType,
  GuildTextBasedChannel,
  SlashCommandBuilder,
} from "discord.js";

import MESSAGES from "../constants/messages";
import ROLES from "../constants/roles";
import TicketController from "../controllers/ticket";
import { DiscordCommand } from "../types/command";
import { getMembersWithRole } from "../utils/discord";

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
          {
            value: "reroll",
            name: "Réattribuer le ticket",
          },
        ),
    )
    .addStringOption((option) =>
      option
        .setName("prefix")
        .setDescription("Le nouveau préfixe du ticket")
        .setRequired(false),
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("Le rôle de la personne")
        .setRequired(false),
    ),
  async execute(interaction) {
    const command = interaction.options.getString("command");
    const prefix = interaction.options.getString("prefix");
    const role = interaction.options.getRole("role");

    if (!interaction.inCachedGuild()) {
      interaction.editReply({
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
            interaction.editReply("✅ - Fermeture du ticket dans 5 secondes");
            setTimeout(async () => {
              await TicketController.closeTicket(
                interaction.user,
                interaction.channel as GuildTextBasedChannel,
              );
            }, 5000);
          } else {
            interaction.editReply(
              MESSAGES.ERROR.COMMAND_NOT_AVAILABLE_IN_CHANNEL,
            );
          }
          return;
        case "reroll":
          if (!interaction.member.roles.cache.has(ROLES.EMERGENCY)) {
            interaction.editReply({
              content: MESSAGES.ERROR.COMMAND_NO_PERMISSION,
            });
          } else {
            if (
              interaction.channel &&
              interaction.channel.type === ChannelType.GuildText &&
              (await TicketController.isTicket(interaction.channel))
            ) {
              if (!role) {
                interaction.editReply({
                  embeds: [
                    {
                      ...TicketController.baseEmbed,
                      description: "❌ - Vous devez spécifier un rôle",
                    },
                  ],
                });
                return;
              }
              interaction.editReply({
                embeds: [
                  {
                    ...TicketController.baseEmbed,
                    description: "Réattribution du ticket...",
                  },
                ],
              });

              const managers = await getMembersWithRole(
                interaction.client,
                role.id,
                [
                  ROLES.DIRECTION,
                  ROLES.CADRE_SANTE,
                  ROLES.CHEF_DE_SERVICE,
                  ROLES.INTERIMAIRE,
                ],
              );

              if (managers.length === 0) {
                interaction.editReply({
                  embeds: [
                    {
                      ...TicketController.baseEmbed,
                      description: "❌ - Aucun manager trouvé",
                    },
                  ],
                });
                return;
              }

              const manager =
                managers[Math.floor(Math.random() * managers.length)];

              interaction.channel.send(
                `La prise en charge a été réattribué à ${manager}`,
              );
            } else {
              interaction.editReply(
                MESSAGES.ERROR.COMMAND_NOT_AVAILABLE_IN_CHANNEL,
              );
            }
          }
          return;
        case "prefix":
          if (!interaction.member.roles.cache.has(ROLES.EMERGENCY)) {
            interaction.editReply({
              content: MESSAGES.ERROR.COMMAND_NO_PERMISSION,
            });
          } else {
            if (!prefix) {
              interaction.editReply("❌ - Vous devez spécifier un `prefix`");
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
                await interaction.editReply("✅ - Prefix du ticket mis à jour");
              } else {
                interaction.editReply(
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
