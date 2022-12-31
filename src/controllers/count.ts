import { Guild, GuildMember, VoiceChannel } from "discord.js";
import CLIENTS from "../constants/clients";
import ROLES from "../constants/roles";

class CountController {
  public static async getMembersCount(guild: Guild): Promise<number> {
    const members = await guild.members.fetch();
    return members.size;
  }

  public static async getPlayersCount(
    member: GuildMember
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
    member: GuildMember
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
    channel: VoiceChannel
  ): Promise<void> {
    // channel name gonna be "<custom name> (<member count>)"
    const memberCount = await this.getMembersCount(guild);
    // if channel name doest not contain "(" or ")", we add it
    if (!channel.name.includes("(") || !channel.name.includes(")")) {
      await channel.setName(`${channel.name} (${memberCount})`);
    } else {
      await channel.setName(
        channel.name.replace(/\(([^)]+)\)/, `(${memberCount})`)
      );
    }
    console.log("updated members count");
  }

  public static async updatePlayersCountChannel(
    guild: Guild,
    channel: VoiceChannel
  ): Promise<void> {
    // channel name gonna be "<custom name> (<member count>/<max member count>)"
    const bot = await guild.members.fetch(CLIENTS.UNITYRP_GTA_RP_BOT);
    const playersCount = (await this.getPlayersCount(bot)) || "-";
    const maxPlayersCount = (await this.getMaxPlayersCount(bot)) || "-";
    console.log("@updatePlayersCountChannel", playersCount, maxPlayersCount);
    // if channel name doest not contain "(" or ")", we add it
    if (!channel.name.includes("(") || !channel.name.includes(")")) {
      await channel.setName(
        `${channel.name} (${playersCount}/${maxPlayersCount})`
      );
    } else {
      await channel.setName(
        channel.name.replace(
          /\(([^)]+)\)/,
          `(${playersCount}/${maxPlayersCount})`
        )
      );
    }
    console.log("updated players count");
  }

  public static async updateEMSCountChannel(
    guild: Guild,
    channel: VoiceChannel
  ): Promise<void> {
    // channel name gonna be "<custom name> (<member count>/<max member count>)"
    const emsCount = "-";
    const maxEmsCount = (await this.getMaxEMSCount(guild)) || "-";
    // if channel name doest not contain "(" or ")", we add it
    if (!channel.name.includes("(") || !channel.name.includes(")")) {
      await channel.setName(`${channel.name} (${emsCount}/${maxEmsCount})`);
    } else {
      await channel.setName(
        channel.name.replace(/\(([^)]+)\)/, `(${emsCount}/${maxEmsCount})`)
      );
    }
    console.log("updated ems count");
  }
}

export default CountController;
