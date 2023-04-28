import { Events } from "discord.js";

import WarnController from "../controllers/warn";
import { DiscordPlugin } from "../types/plugin";

const WarnPlugin: DiscordPlugin = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("warn_")) return;
    if (!interaction.guild) return;
    if (!interaction.member || !interaction.member.user) return;

    if (interaction.customId.startsWith("warn_add")) {
      const reason = "Absence de plus de 2 jours non justifiée";
      const [, userId] = interaction.customId.split(":");
      const member = await interaction.guild.members.fetch(userId);
      const target = member?.user;
      if (!member) return;
      await WarnController.add(target, reason, interaction.user, interaction);

      setTimeout(async () => {
        await interaction.deleteReply();
        await interaction.message.delete();
      }, 5000);
    }
  });
};

export default WarnPlugin;
