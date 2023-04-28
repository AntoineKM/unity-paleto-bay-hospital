import { ChannelType, TextChannel } from "discord.js";
import schedule from "node-schedule";

import CHANNELS from "../constants/channels";
import WorktimeController from "../controllers/worktime";
import Worktime from "../models/Worktime";
import { DiscordPlugin } from "../types/plugin";

const WorktimeLeadboardPlugin: DiscordPlugin = (client) => {
  // every friday at midday
  schedule.scheduleJob("0 12 * * 0", async () => {
    // send the leaderboard embed to CHANNELS.ONRUNTIME.TEAM.INFORMATION.LEADERBOARD
    const channel = client.channels.cache.get(
      CHANNELS.INFORMATIONS_EMS.CLASSEMENT
    );

    if (!channel) return;
    // if channel is guildtext channel
    if (channel.type === ChannelType.GuildText) {
      const textChannel = channel as TextChannel;

      // send the leaderboard embed
      textChannel.send({
        embeds: [await WorktimeController.getLeaderboardEmbed()],
      });
    }

    // remove all worktimes from the database
    await Worktime.deleteMany({});
  });
};

export default WorktimeLeadboardPlugin;
