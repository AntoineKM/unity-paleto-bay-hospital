import { CategoryChannel } from "discord.js";
import schedule from "node-schedule";
import CHANNELS from "../constants/channels";
import MemberCountController from "../controllers/members-count";
import { DiscordPlugin } from "../types/plugin";

const MemberCountPlugin: DiscordPlugin = (client) => {
  schedule.scheduleJob("* * * * *", async () => {
    client.guilds.cache.forEach(async (guild) => {
      const channel = await guild.channels.cache.get(CHANNELS.INFORMATIONS._ID);
      if (!channel) return;

      await MemberCountController.updateMemberCountChannel(
        guild,
        channel as CategoryChannel
      );
    });
  });
};

export default MemberCountPlugin;
