import { ButtonStyle, Events } from "discord.js";

import CHANNELS from "../constants/channels";
import ReportController from "../controllers/report";
import { DiscordPlugin } from "../types/plugin";
import { getTextChannel } from "../utils/discord";

const ReportLinkPlugin: DiscordPlugin = (client) => {
  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.member || !message.member.user) return;

    const regex = /https:\/\/discord.gg\/[a-zA-Z0-9]+/g;
    const matches = message.content.match(regex);

    if (!matches) return;

    const embed = {
      ...ReportController.baseEmbed,
      description: `${message.author} à envoyé un lien d'invitation discord (${matches[0]}) dans le salon ${message.channel}`,
    };

    const reportChannel = await getTextChannel(
      client,
      CHANNELS.DIRECTION.REPORTS
    );

    await reportChannel.send({
      embeds: [embed],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: ButtonStyle.Secondary,
              label: "Ok",
              custom_id: "report_cancel",
            },
          ],
        },
      ],
    });
  });
};

export default ReportLinkPlugin;
