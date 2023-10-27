import { ButtonStyle } from "discord.js";
import schedule from "node-schedule";

import CHANNELS from "../constants/channels";
import ReportController from "../controllers/report";
import WorktimeController from "../controllers/worktime";
import { DiscordPlugin } from "../types/plugin";
import { getTextChannel } from "../utils/discord";

const ReportAbsenteesPlugin: DiscordPlugin = (client) => {
  schedule.scheduleJob("59 11 * * 2-7", async () => {
    // schedule.scheduleJob("* * * * *", async () => {
    const reportChannel = await getTextChannel(
      client,
      CHANNELS.DIRECTION.REPORTS,
    );

    const absentees = await WorktimeController.getAbsentees(client);
    if (!absentees || absentees.length === 0) return;

    absentees.forEach(async (absentee) => {
      const embed = {
        ...ReportController.baseEmbed,
        description: `**${absentee.user}** est absent depuis plus de 2 jours.`,
      };

      await reportChannel.send({
        embeds: [embed],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: ButtonStyle.Danger,
                label: "Avertir",
                custom_id: `warn_add:${absentee.user.id}`,
              },
              {
                type: 2,
                style: ButtonStyle.Secondary,
                label: "Ignorer",
                custom_id: "report_cancel",
              },
            ],
          },
        ],
      });
    });
  });
};

export default ReportAbsenteesPlugin;
