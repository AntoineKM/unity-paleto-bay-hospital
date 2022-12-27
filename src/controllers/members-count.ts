import { CategoryChannel, Guild } from "discord.js";

class MemberCountController {
  public static async getMemberCount(guild: Guild): Promise<number> {
    const members = await guild.members.fetch();
    return members.size;
  }

  public static async updateMemberCountChannel(
    guild: Guild,
    channel: CategoryChannel
  ): Promise<void> {
    // channel name gonna be "<custom name> (<member count>)"
    const memberCount = await this.getMemberCount(guild);
    // if channel name doest not contain "(" or ")", we add it
    if (!channel.name.includes("(") || !channel.name.includes(")")) {
      await channel.setName(`${channel.name} (${memberCount})`);
    } else {
      await channel.setName(
        channel.name.replace(/\(([^)]+)\)/, `(${memberCount})`)
      );
    }
  }
}

export default MemberCountController;
