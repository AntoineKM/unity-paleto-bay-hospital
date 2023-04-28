import {
  ChannelType,
  Collection,
  Events,
  GuildMember,
  VoiceChannel,
} from "discord.js";

import CHANNELS from "../constants/channels";
import ROLES from "../constants/roles";
import { DiscordPlugin } from "../types/plugin";

const AutoMovePlugin: DiscordPlugin = (client) => {
  client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    if (oldState.channelId === newState.channelId) return;
    if (newState.channelId === CHANNELS.SERVICE.SECRETARIAT) return;

    await client.channels.fetch(CHANNELS.SERVICE.SECRETARIAT);
    const secretariatChannel = (await client.channels.cache.get(
      CHANNELS.SERVICE.SECRETARIAT
    )) as VoiceChannel;
    if (!secretariatChannel) return;

    const frequencyChannels = client.channels.cache.filter(
      (channel) =>
        channel.type === ChannelType.GuildVoice &&
        channel.name.includes("ғʀᴇ́ᴏ̨ᴜᴇɴᴄᴇ")
    ) as Collection<string, VoiceChannel>;

    const secretariatChannelMembers: Collection<string, GuildMember> =
      secretariatChannel.members.filter((member) => {
        member.fetch();
        return member.roles.cache.has(ROLES.EMERGENCY);
      });

    const frequencyChannelsMembers: Collection<string, GuildMember> =
      frequencyChannels
        .map((channel) =>
          channel.members.filter((member) => {
            member.fetch();
            return member.roles.cache.has(ROLES.EMERGENCY);
          })
        )
        .reduce(
          (acc, curr) => acc.concat(curr),
          new Collection<string, GuildMember>()
        );

    if (frequencyChannelsMembers.size === 0) return;
    if (secretariatChannelMembers.size > 1) return;

    if (secretariatChannelMembers.size === 0) {
      const candidate = frequencyChannelsMembers.first();
      if (!candidate) return;
      await candidate.voice.setChannel(secretariatChannel);
    }
  });
};

export default AutoMovePlugin;
