import { Events, TextChannel } from "discord.js";
import CHANNELS from "../constants/channels";
import { DiscordPlugin } from "../types/plugin";

const JoinLeavePlugin: DiscordPlugin = async (client) => {
  client.on(Events.GuildMemberAdd, async (member) => {
    const channel = (await member.guild.channels.fetch(
      CHANNELS.INFORMATIONS.ARRIVANTS
    )) as TextChannel;

    channel.send(
      `🛬 **${member.user.username}#${member.user.discriminator}** viens d'arriver !`
    );
  });

  client.on(Events.GuildMemberRemove, async (member) => {
    const channel = (await member.guild.channels.fetch(
      CHANNELS.INFORMATIONS.ARRIVANTS
    )) as TextChannel;

    channel.send(
      `🛫 **${member.user.username}#${member.user.discriminator}** viens de partir !`
    );
  });
};

export default JoinLeavePlugin;
