import { ChannelType, Client, GuildMember, TextChannel } from "discord.js";

export const getTextChannel = (client: Client, channelID: string) => {
  client.channels.fetch(channelID);
  const channel = client.channels.cache.get(channelID) as TextChannel;
  if (!channel) {
    throw new Error("Channel not found");
  }
  if (channel.type !== ChannelType.GuildText) {
    throw new Error("Channel is not a text channel");
  }
  return channel;
};

export const getMembersWithRole = async (
  client: Client,
  roleID: string,
): Promise<GuildMember[]> => {
  await client.guilds.fetch();
  const guilds = client.guilds.cache;

  const guild = guilds.find((guild) => guild.roles.cache.has(roleID));

  if (!guild) {
    throw new Error("Guild not found");
  }

  const role = guild.roles.cache.get(roleID);

  if (!role) {
    throw new Error("Role not found");
  }

  const members = Array.from(role.members.values());

  return members;
};
