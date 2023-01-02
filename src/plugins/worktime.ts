import { Events, GuildMember, User } from "discord.js";
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
    }

    await interaction.deleteReply();
  });
};

export default WorktimePlugin;
