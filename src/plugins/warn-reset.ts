import { DiscordPlugin } from "../types/plugin";
import schedule from "node-schedule";
import CHANNELS from "../constants/channels";
import { TextChannel } from "discord.js";
import WarnController from "../controllers/warn";

const WarnReset: DiscordPlugin = (client) => {
  // each 1st of the month, reset the warn count of each user
  schedule.scheduleJob("0 0 1 * *", async () => {
    // delete all messages in the warn channel
    const warnChannel = client.channels.cache.get(
      CHANNELS.INFORMATIONS_EMS.AVERTISSEMENTS
    ) as TextChannel;

    const messages = await warnChannel.messages.fetch();
    // dont use forEach because it's async and we need to wait for the result, so use map
    await Promise.all(
      messages.map(async (message) => {
        await message.delete();
      })
    );

    await WarnController.resetAll();

    const warnEmbed = {
      ...WarnController.baseEmbed,
      description: "Les avertissements ont été réinitialisés pour ce mois-ci.",
    };

    await warnChannel.send({ embeds: [warnEmbed] });
  });
};

export default WarnReset;
