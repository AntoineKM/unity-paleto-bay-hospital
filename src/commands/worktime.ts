import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import MESSAGES from "../constants/messages";
import ROLES from "../constants/roles";
import WorktimeController from "../controllers/worktime";

import { DiscordCommand } from "../types/command";

const WorktimeCommand: DiscordCommand = {
  data: new SlashCommandBuilder()
    .setName("worktime")
    .setDescription("Gestion du temps de travail")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("La commande à exécuter")
        .setRequired(true)
        .addChoices(
          {
            name: "Obtenir des informations sur le temps de travail",
            value: "info",
          },
          {
            name: "Annuler la prise de service d'un utilisateur",
            value: "cancel",
          },
          {
            name: "Augmenter le quota d'un utilisateur",
            value: "add",
          },
          {
            name: "Afficher le classement des heures",
            value: "leaderboard",
          }
        )
    )
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("Le membre à qui appliquer la commande")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("La durée du service")
        .setRequired(false)
    ),
  async execute(interaction) {
    const command = interaction.options.getString("command");
    const target = interaction.options.getUser("target");

    if (!interaction.inCachedGuild()) {
      interaction.reply({
        content: MESSAGES.ERROR.COMMAND_NOT_AVAILABLE_IN_DM,
      });
      setTimeout(async () => {
        await interaction.deleteReply();
      }, 5000);
      return;
    } else {
      interaction.member.fetch();
      switch (command) {
        case "leaderboard":
          // check if user has the role ROLES.EMERGENCY
          if (!interaction.member.roles.cache.has(ROLES.EMERGENCY)) {
            await interaction.reply({
              content: MESSAGES.ERROR.COMMAND_NO_PERMISSION,
            });
          } else {
            await interaction.reply({
              embeds: [await WorktimeController.getLeaderboardEmbed()],
            });
            return;
          }
          break;
        case "cancel":
          if (
            !interaction.member.roles.cache.has(ROLES.DIRECTION) &&
            !interaction.memberPermissions?.has(
              PermissionFlagsBits.Administrator
            )
          ) {
            await interaction.reply({
              content: MESSAGES.ERROR.COMMAND_NO_PERMISSION,
            });
          } else {
            if (target) {
              if (await WorktimeController.isWorking(target)) {
                await WorktimeController.cancel(target, interaction.user);
                await interaction.reply(
                  `✅ - Le service de ${target} a été annulée.`
                );
              } else {
                await interaction.reply(
                  `❌ - ${target} n'a pas de service en cours.`
                );
              }
            } else {
              await interaction.reply({
                content: MESSAGES.ERROR.COMMAND_NO_TARGET,
              });
            }
          }
          break;
        case "info":
          if (!interaction.member.roles.cache.has(ROLES.EMERGENCY)) {
            await interaction.reply({
              content: MESSAGES.ERROR.COMMAND_NO_PERMISSION,
            });
          } else {
            interaction.reply({
              embeds: [
                await WorktimeController.getInformationEmbed(
                  target || interaction.user,
                  !target || interaction.user.id === target?.id
                ),
              ],
              ephemeral: true,
            });
            return;
          }
          break;
      }
    }

    setTimeout(async () => {
      await interaction.deleteReply();
    }, 5000);
  },
};

export default WorktimeCommand;
