import {
  ChannelType,
  Events,
  NonThreadGuildBasedChannel,
  VoiceChannel,
} from "discord.js";
import CHANNELS from "../constants/channels";
import ROLES from "../constants/roles";
import { DiscordPlugin } from "../types/plugin";

const AutoMovePlugin: DiscordPlugin = (client) => {
  // on VoiceStateUpdate if no one is in the channel CHANNELS.SERVICE.SECRETARIAT, and if someone is in a channel with channel name that include "ғʀᴇ́ᴏ̨ᴜᴇɴᴄᴇ" or "ʜᴀᴜᴛᴇ ᴀʟᴛɪᴛᴜᴅᴇ", move the user in CHANNELS.SERVICE.SECRETARIAT
  client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    if (oldState.channelId === newState.channelId) return;
    if (newState.channelId === CHANNELS.SERVICE.SECRETARIAT) return;

    const secretariatChannel = (await client.channels.fetch(
      CHANNELS.SERVICE.SECRETARIAT
    )) as VoiceChannel;
    if (!secretariatChannel) return;
    const secretariatEmergencyMembers = secretariatChannel.members.filter(
      (member) => member.roles.cache.has(ROLES.EMERGENCY)
    );

    const sandyshoreChannel = (await client.channels.fetch(
      CHANNELS.SERVICE.SANDYSHORE
    )) as VoiceChannel;
    if (!sandyshoreChannel) return;
    const sandyshoreEmergencyMembers = sandyshoreChannel.members.filter(
      (member) => member.roles.cache.has(ROLES.EMERGENCY)
    );

    if (
      secretariatEmergencyMembers.size > 0 &&
      sandyshoreEmergencyMembers.size > 0
    )
      return;

    // check if someone is in a channel with channel name that include "ғʀᴇ́ᴏ̨ᴜᴇɴᴄᴇ" or "ʜᴀᴜᴛᴇ ᴀʟᴛɪᴛᴜᴅᴇ"
    const channels = await newState.guild.channels.fetch();
    if (!channels) return;

    const channelsWithAvailableMembers = channels.filter(
      (c) =>
        c &&
        c.type === ChannelType.GuildVoice &&
        c.members.size > 0 &&
        (c.name.includes("ғʀᴇ́ᴏ̨ᴜᴇɴᴄᴇ") || c.name.includes("ʜᴀᴜᴛᴇ ᴀʟᴛɪᴛᴜᴅᴇ"))
    );
    if (channelsWithAvailableMembers.size === 0) return;

    const availableMembers = channelsWithAvailableMembers.reduce(
      (a, c) => [...a, ...(c as NonThreadGuildBasedChannel).members.values()],
      [] as any[]
    );

    if (availableMembers.length === 0) return;
    const firstAvailableMember = availableMembers[0];
    if (!firstAvailableMember) return;
    if (secretariatEmergencyMembers.size < 1) {
      await firstAvailableMember.voice.setChannel(secretariatChannel);
      return;
    }
    if (
      sandyshoreEmergencyMembers.size < 1 &&
      secretariatEmergencyMembers.size > 0 &&
      availableMembers.length >= 2
    ) {
      await firstAvailableMember.voice.setChannel(sandyshoreChannel);
      return;
    }
  });
};

export default AutoMovePlugin;
