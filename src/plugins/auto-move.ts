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

    const paletoChannels = client.channels.cache.filter(
      (channel) =>
        channel.type === ChannelType.GuildVoice &&
        channel.name.includes("ᴘᴀʟᴇᴛᴏ")
    ) as Collection<string, VoiceChannel>;
    paletoChannels;

    const sandyChannels = client.channels.cache.filter(
      (channel) =>
        channel.type === ChannelType.GuildVoice &&
        channel.name.includes("sᴀɴᴅʏ")
    ) as Collection<string, VoiceChannel>;
    sandyChannels;

    const southChannels = client.channels.cache.filter(
      (channel) =>
        channel.type === ChannelType.GuildVoice && channel.name.includes("sᴜᴅ")
    ) as Collection<string, VoiceChannel>;
    southChannels;

    const secretariatChannelMembers: Collection<string, GuildMember> =
      secretariatChannel.members.filter((member) => {
        member.fetch();
        return member.roles.cache.has(ROLES.EMERGENCY);
      });

    const paletoChannelsMembers: Collection<string, GuildMember> =
      paletoChannels
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

    const sandyChannelsMembers: Collection<string, GuildMember> = sandyChannels
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

    const southChannelsMembers: Collection<string, GuildMember> = southChannels
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

    const frequencyChannelsMembers: Collection<string, GuildMember> =
      paletoChannelsMembers
        .concat(sandyChannelsMembers)
        .concat(southChannelsMembers);

    if (frequencyChannelsMembers.size === 0) return;
    if (
      secretariatChannelMembers.size > 1 &&
      paletoChannelsMembers.size > 1 &&
      sandyChannelsMembers.size > 1
    )
      return;

    if (secretariatChannelMembers.size === 0) {
      const candidate = frequencyChannelsMembers.first();
      if (!candidate) return;
      await candidate.voice.setChannel(secretariatChannel);
      return;
    }

    if (paletoChannelsMembers.size === 0 && frequencyChannelsMembers.size > 0) {
      const candidate = frequencyChannelsMembers.first();
      if (!candidate) return;
      await candidate.voice.setChannel(CHANNELS.SERVICE.PALETO_BAY_1);
      return;
    }

    if (sandyChannelsMembers.size === 0 && frequencyChannelsMembers.size > 1) {
      const candidate = frequencyChannelsMembers.first();
      if (!candidate) return;
      await candidate.voice.setChannel(CHANNELS.SERVICE.SANDY_SHORE_1);
      return;
    }
  });
};

export default AutoMovePlugin;
