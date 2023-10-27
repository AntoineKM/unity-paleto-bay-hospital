import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

import MESSAGES from "../constants/messages";
import ROLES from "../constants/roles";
import WarnController from "../controllers/warn";
import { DiscordCommand } from "../types/command";

const WarnCommand: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Avertir un membre")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("La commande à exécuter")
        .setRequired(true)
        .addChoices(
          {
            value: "add",
            name: "Ajouter un avertissement à un membre",
          },
          {
            value: "remove",
            name: "Réinitialiser les avertissements d'un membre",
          },
          {
            value: "list",
            name: "Liste des avertissements en cours",
          },
        ),
    )
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Le membre à qui appliquer la commande")
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("La raison de l'avertissement")
        .setRequired(false),
    ),
  async execute(interaction) {
    const command = interaction.options.getString("command");
    const target = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason") || "Privée";

    if (!interaction.inCachedGuild()) {
      interaction.reply({
        content: MESSAGES.ERROR.COMMAND_NOT_AVAILABLE_IN_DM,
        ephemeral: true,
      });
    } else {
      switch (command) {
        case "add": {
          if (
            !interaction.member.roles.cache.has(ROLES.DIRECTION) &&
            !interaction.memberPermissions?.has(
              PermissionFlagsBits.Administrator,
            )
          ) {
            await interaction.reply({
              embeds: [
                {
                  ...WarnController.baseEmbed,
                  description: MESSAGES.ERROR.COMMAND_NO_PERMISSION,
                },
              ],
            });
          } else {
            if (target && reason) {
              await WarnController.add(
                target,
                reason,
                interaction.user,
                interaction,
              );
            } else {
              await interaction.reply({
                embeds: [
                  {
                    ...WarnController.baseEmbed,
                    description: MESSAGES.ERROR.COMMAND_NO_TARGET,
                  },
                ],
              });
            }
          }
          break;
        }
        case "remove": {
          if (
            !interaction.member.roles.cache.has(ROLES.DIRECTION) &&
            !interaction.memberPermissions?.has(
              PermissionFlagsBits.Administrator,
            )
          ) {
            await interaction.reply({
              embeds: [
                {
                  ...WarnController.baseEmbed,
                  description: MESSAGES.ERROR.COMMAND_NO_PERMISSION,
                },
              ],
            });
          } else {
            if (target) {
              await WarnController.remove(
                target,
                interaction.user,
                interaction,
              );
            } else {
              await interaction.reply({
                embeds: [
                  {
                    ...WarnController.baseEmbed,
                    description: MESSAGES.ERROR.COMMAND_NO_TARGET,
                  },
                ],
              });
            }
          }
          break;
        }
        case "list": {
          if (
            !interaction.member.roles.cache.has(ROLES.DIRECTION) &&
            !interaction.memberPermissions?.has(
              PermissionFlagsBits.Administrator,
            )
          ) {
            await interaction.reply({
              embeds: [
                {
                  ...WarnController.baseEmbed,
                  description: MESSAGES.ERROR.COMMAND_NO_PERMISSION,
                },
              ],
            });
          } else {
            await WarnController.list(interaction);
          }
          break;
        }
      }
    }
  },
};

export default WarnCommand;
