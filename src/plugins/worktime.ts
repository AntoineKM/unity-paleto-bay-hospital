import { Colors, Events, GuildMember, User } from "discord.js";

import CHANNELS from "../constants/channels";
import MESSAGES from "../constants/messages";
import WorktimeController from "../controllers/worktime";
import { DiscordPlugin } from "../types/plugin";

const WorktimePlugin: DiscordPlugin = (client) => {
  client.on(Events.ClientReady, async () => {
    const worktimeChannel = await client.channels.cache.get(
      CHANNELS.SERVICE.POINTEUSE,
    );
    if (!worktimeChannel) return;

    WorktimeController.initialize(worktimeChannel);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("worktime_")) return;
    if (!interaction.guild) return;
    if (!interaction.member || !interaction.member.user) return;

    await interaction.deferReply({ ephemeral: true });

    if (interaction.customId.startsWith("worktime_delete")) {
      const [, userId, worktimeId] = interaction.customId.split(":");
      const member = await interaction.guild.members.fetch(userId);
      if (!member) return;
      await WorktimeController.delete(member.user, worktimeId);
      await interaction.editReply({
        embeds: [
          {
            ...WorktimeController.baseEmbed,
            color: Colors.Green,
            description: "Temps de travail supprimé avec succès",
          },
        ],
      });
      await interaction.deleteReply();
      await interaction.message.delete();
      return;
    }

    switch (interaction.customId) {
      case "worktime_start":
        if (
          await WorktimeController.isInWorkVoiceChannel(
            interaction.member as GuildMember,
          )
        ) {
          try {
            const embed = await WorktimeController.start(
              interaction.member.user as User,
            );
            await interaction.editReply({
              embeds: [embed],
            });
          } catch (e) {
            await interaction.editReply({
              embeds: [
                {
                  ...WorktimeController.baseEmbed,
                  color: Colors.Red,
                  description: `${interaction.member}, ${MESSAGES.ERROR.DM_BLOCKED}`,
                },
              ],
            });
          }
        } else {
          await interaction.editReply({
            embeds: [
              {
                ...WorktimeController.baseEmbed,
                description: `Vous devez être connecté à un salon vocal **Fréquence** pour pouvoir pointer votre arrivée (<#${CHANNELS.SERVICE.PALETO_BAY_1}>).`,
                color: Colors.Red,
              },
            ],
          });
        }
        break;
      case "worktime_end":
        try {
          const embed = await WorktimeController.end(
            interaction.member.user as User,
          );
          await interaction.editReply({
            embeds: [embed],
          });
        } catch (e) {
          await interaction.editReply({
            embeds: [
              {
                ...WorktimeController.baseEmbed,
                color: Colors.Red,
                description: `${interaction.member}, ${MESSAGES.ERROR.DM_BLOCKED}`,
              },
            ],
          });
        }
        break;
    }
  });
};

export default WorktimePlugin;
