import { Colors, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import MESSAGES from "../constants/messages";
import ROLES from "../constants/roles";
import WorktimeController from "../controllers/worktime";
import WorktimeIgnoreReminder from "../models/WortimeIgnore";
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
            name: "Afficher le classement des heures",
            value: "leaderboard",
          },
          {
            name: "Obtenir des informations sur le temps de travail",
            value: "info",
          },
          {
            name: "Annuler la prise de service d'un utilisateur",
            value: "cancel",
          },
          {
            name: "Ajouter du temps de travail à un utilisateur",
            value: "add",
          },
          {
            name: "Retirer du temps de travail à un utilisateur",
            value: "remove",
          },
          {
            name: "Ignorer les rappels",
            value: "ignore",
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
    const duration = interaction.options.getString("duration");

    if (!interaction.inCachedGuild()) {
      interaction.reply({
        content: MESSAGES.ERROR.COMMAND_NOT_AVAILABLE_IN_DM,
      });
      setTimeout(async () => {
        await interaction.deleteReply();
      }, 5000);
      return;
    } else {
      await interaction.member.fetch();
      switch (command) {
        case "ignore": {
          const hasIgnored = await WorktimeIgnoreReminder.findOne({
            userId: interaction.user.id,
          });

          if (hasIgnored) {
            await WorktimeIgnoreReminder.deleteOne({
              userId: interaction.user.id,
            });
            await interaction.reply({
              embeds: [
                {
                  title: "✅ - Rappels activés",
                  description:
                    "Vous recevrez à nouveau les rappels de prise de service.",
                  color: Colors.Green,
                },
              ],
              ephemeral: true,
            });
          } else {
            await WorktimeIgnoreReminder.create({
              userId: interaction.user.id,
            });
            await interaction.reply({
              embeds: [
                {
                  title: "✅ - Rappels désactivés",
                  description:
                    "Vous ne recevrez plus les rappels de prise de service.",
                  color: Colors.Green,
                },
              ],
              ephemeral: true,
            });
          }
          return;
          break;
        }
        case "leaderboard":
          // check if user has the role ROLES.EMERGENCY
          if (!interaction.member.roles.cache.has(ROLES.EMERGENCY)) {
            await interaction.reply({
              content: MESSAGES.ERROR.COMMAND_NO_PERMISSION,
            });
          } else {
            await interaction.reply({
              embeds: [await WorktimeController.getLeaderboardEmbed()],
              ephemeral: true,
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
        case "add":
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
              if (duration) {
                try {
                  await WorktimeController.add(target, duration);
                  await interaction.reply({
                    ephemeral: true,
                    embeds: [
                      {
                        ...WorktimeController.baseEmbed,
                        description:
                          `Vous avez ajouté \`${duration}\` au temps de travail de ${target}.\n\n` +
                          (await (
                            await WorktimeController.getInformationEmbed(
                              target,
                              false
                            )
                          ).description),
                      },
                    ],
                  });
                  return;
                } catch (error) {
                  await interaction.reply({
                    embeds: [
                      {
                        ...WorktimeController.baseEmbed,
                        color: Colors.Red,
                        description: `${error.message}\n\nHere are the possible units:
y - A Julian year, which means 365.25 days.
d - 24 hours.
h - 60 minutes.
m - 60 seconds.
s - A second according to the SI.
ms - 10e-3 seconds.
µs - 10e-6 seconds.
ns - 10e-9 seconds.

Simple example: \`1d 10h 2m 30s\``,
                      },
                    ],
                  });
                }
              } else {
                await interaction.reply({
                  embeds: [
                    {
                      ...WorktimeController.baseEmbed,
                      color: Colors.Red,
                      description: "Veuillez spécifier une durée.",
                    },
                  ],
                });
              }
            } else {
              await interaction.reply({
                content: MESSAGES.ERROR.COMMAND_NO_TARGET,
              });
            }
          }
          break;
        case "remove":
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
              if (duration) {
                try {
                  await WorktimeController.remove(target, duration);
                  await interaction.reply({
                    ephemeral: true,
                    embeds: [
                      {
                        ...WorktimeController.baseEmbed,
                        description:
                          `Vous avez retiré \`${duration}\` au temps de travail de ${target}.\n\n` +
                          (await (
                            await WorktimeController.getInformationEmbed(
                              target,
                              false
                            )
                          ).description),
                      },
                    ],
                  });
                  return;
                } catch (error) {
                  await interaction.reply({
                    embeds: [
                      {
                        ...WorktimeController.baseEmbed,
                        color: Colors.Red,
                        description: `${error.message}\n\nHere are the possible units:
y - A Julian year, which means 365.25 days.
d - 24 hours.
h - 60 minutes.
m - 60 seconds.
s - A second according to the SI.
ms - 10e-3 seconds.
µs - 10e-6 seconds.
ns - 10e-9 seconds.

Simple example: \`1d 10h 2m 30s\``,
                      },
                    ],
                  });
                }
              } else {
                await interaction.reply({
                  embeds: [
                    {
                      ...WorktimeController.baseEmbed,
                      color: Colors.Red,
                      description: "Veuillez spécifier une durée.",
                    },
                  ],
                });
              }
            } else {
              await interaction.reply({
                content: MESSAGES.ERROR.COMMAND_NO_TARGET,
              });
            }
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
