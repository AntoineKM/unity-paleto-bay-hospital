import { VoiceChannel } from "discord.js";
import schedule from "node-schedule";
import CHANNELS from "../constants/channels";
import CountController from "../controllers/count";
import { DiscordPlugin } from "../types/plugin";

const MemberCountPlugin: DiscordPlugin = (client) => {
  schedule.scheduleJob("* * * * *", async () => {
    client.guilds.cache.forEach(async (guild) => {
      const membersCountchannel = (await guild.channels.cache.get(
        CHANNELS.COUNT_MEMBERS
      )) as VoiceChannel;
      const playersCountchannel = (await guild.channels.cache.get(
        CHANNELS.COUNT_PLAYERS
      )) as VoiceChannel;
      const emsCountchannel = (await guild.channels.cache.get(
        CHANNELS.COUNT_EMS
      )) as VoiceChannel;

      console.log(
        "updating count",
        !!membersCountchannel,
        !!playersCountchannel,
        !!emsCountchannel
      );

      if (!membersCountchannel || !playersCountchannel || !emsCountchannel) {
        return;
      }

      CountController.updateMembersCountChannel(guild, membersCountchannel);
      CountController.updatePlayersCountChannel(guild, playersCountchannel);
      CountController.updateEMSCountChannel(guild, emsCountchannel);
      console.log("updated count");
    });
  });
};

export default MemberCountPlugin;
