import { ChannelType, Client, TextChannel } from "discord.js";

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
