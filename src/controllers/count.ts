import { Guild, GuildMember, VoiceChannel } from "discord.js";

import CLIENTS from "../constants/clients";
import ROLES from "../constants/roles";
import Worktime from "../models/Worktime";

class CountController {
  public static async getMembersCount(guild: Guild): Promise<number> {
    const members = await guild.members.fetch();
    return members.size;
  }

  public static async getPlayersCount(
    member: GuildMember,
  ): Promise<number | null> {
    if (!member) return null;
    const presence = await member.presence;
    if (!presence) return null;
    const activities = presence?.activities;
    if (!activities) return null;
    const activity = activities[0];
    if (!activity) return null;
    const name = activity.name;
    if (!name) return null;
    const playersCount = name.split(" ")[0];
    if (!playersCount) return null;
    return parseInt(playersCount);
  }

  public static async getMaxPlayersCount(
    member: GuildMember,
  ): Promise<number | null> {
    if (!member) return null;
    const presence = await member.presence;
    if (!presence) return null;
    const activities = presence?.activities;
    if (!activities) return null;
    const activity = activities[0];
    if (!activity) return null;
    const name = activity.name;
    if (!name) return null;
    const maxPlayersCount = name.split(" ")[2];
    if (!maxPlayersCount) return null;
    return parseInt(maxPlayersCount);
  }

  public static async getEMSCount(): Promise<number | null> {
    const worktimes = await Worktime.find({ endAt: null });
    if (!worktimes) return 0;
    return worktimes.length;
  }

  public static async getMaxEMSCount(guild: Guild): Promise<number | null> {
    // get members count from the role ROLES.EMERGENCY
    const emsRole = await guild.roles.fetch(ROLES.EMERGENCY);
    if (!emsRole) return null;
    const members = await emsRole.members;
    if (!members) return null;
    return members.size;
  }

  public static async updateMembersCountChannel(
    guild: Guild,
    channel: VoiceChannel,
  ): Promise<void> {
    const memberCount = await this.getMembersCount(guild);
    if (!channel.name.includes("(") || !channel.name.includes(")")) {
      await channel.setName(`${channel.name} (${memberCount})`);
    } else {
      const channelName = channel.name;
      const newChannelName = channelName.replace(
        /\(([^)]+)\)/,
        `(${memberCount})`,
      );
      if (channelName !== newChannelName) {
        await channel.setName(newChannelName);
      }
    }
  }

  public static async updatePlayersCountChannel(
    guild: Guild,
    channel: VoiceChannel,
  ): Promise<void> {
    const bot = await guild.members.fetch(CLIENTS.UNITYRP_GTA_RP_BOT);
    const playersCount = (await this.getPlayersCount(bot)) || "-";
    const maxPlayersCount = (await this.getMaxPlayersCount(bot)) || "-";
    if (!channel.name.includes("(") || !channel.name.includes(")")) {
      await channel.setName(
        `${channel.name} (${playersCount}/${maxPlayersCount})`,
      );
    } else {
      const channelName = channel.name;
      const newChannelName = channelName.replace(
        /\(([^)]+)\)/,
        `(${playersCount}/${maxPlayersCount})`,
      );
      if (channelName !== newChannelName) {
        await channel.setName(newChannelName);
      }
    }
  }

  public static async updateEMSCountChannel(
    guild: Guild,
    channel: VoiceChannel,
  ): Promise<void> {
    // channel name gonna be "<custom name> (<member count>/<max member count>)"
    const emsCount = (await this.getEMSCount()) || "-";
    const maxEmsCount = (await this.getMaxEMSCount(guild)) || "-";
    // if channel name doest not contain "(" or ")", we add it
    if (!channel.name.includes("(") || !channel.name.includes(")")) {
      await channel.setName(`${channel.name} (${emsCount}/${maxEmsCount})`);
    } else {
      const channelName = channel.name;
      const newChannelName = channelName.replace(
        /\(([^)]+)\)/,
        `(${emsCount}/${maxEmsCount})`,
      );
      if (channelName !== newChannelName) {
        await channel.setName(newChannelName);
      }
    }
  }
}

export default CountController;
