import { Events } from "discord.js";

import { DiscordPlugin } from "../types/plugin";

const ReportPlugin: DiscordPlugin = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith("report_")) return;
    if (!interaction.guild) return;
    if (!interaction.member || !interaction.member.user) return;

    switch (interaction.customId) {
      case "report_cancel":
        await interaction.deferReply();
        await interaction.message.delete();
        break;
    }

    await interaction.deleteReply();
  });
};

export default ReportPlugin;
