import { Colors, Events, GuildMember, User } from "discord.js";
import CHANNELS from "../constants/channels";
import WorktimeController from "../controllers/worktime";
import { DiscordPlugin } from "../types/plugin";

const WorktimePlugin: DiscordPlugin = (client) => {
  client.on(Events.ClientReady, async () => {
    const worktimeChannel = await client.channels.cache.get(
      CHANNELS.SERVICE.POINTEUSE
    );
    if (!worktimeChannel) return;

    WorktimeController.initialize(worktimeChannel);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("worktime_")) return;
    if (!interaction.guild) return;
    if (!interaction.member || !interaction.member.user) return;

    if (interaction.customId.startsWith("worktime_delete")) {
      const [, userId, worktimeId] = interaction.customId.split(":");
      const member = await interaction.guild.members.fetch(userId);
      if (!member) return;
      await WorktimeController.delete(member.user, worktimeId);
      await interaction.reply({
        embeds: [
          {
            ...WorktimeController.baseEmbed,
            color: Colors.Green,
            description: "Temps de travail supprimé avec succès",
          },
        ],
      });
      setTimeout(async () => {
        await interaction.deleteReply();
        await interaction.message.delete();
      }, 5000);
      return;
    }

    switch (interaction.customId) {
      case "worktime_start":
        if (
          await WorktimeController.isInWorkVoiceChannel(
            interaction.member as GuildMember
          )
        ) {
          await interaction.deferReply();
          await WorktimeController.start(interaction.member.user as User);
        } else {
          await interaction.reply(
            "❌ - Vous devez être connecté à un salon vocal **Fréquence**"
          );

          setTimeout(async () => {
            await interaction.deleteReply();
          }, 5000);
          return;
        }
        break;
      case "worktime_end":
        await interaction.deferReply();
        await WorktimeController.end(interaction.member.user as User);
        break;
    }

    await interaction.deleteReply();
  });
};

export default WorktimePlugin;
