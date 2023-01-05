import { Events } from "discord.js";
import CHANNELS from "../constants/channels";
import EMOJIS from "../constants/emojis";
import { DiscordPlugin } from "../types/plugin";

const AutoReactPlugin: DiscordPlugin = (client) => {
  client.on(Events.MessageCreate, async (message) => {
    if (message.channel.id === CHANNELS.INFORMATIONS_EMS.ANNONCES) {
      await message.react(EMOJIS.VERIFIED);

      if (message.content.toLowerCase().includes("réunion")) {
        // add reaction to message
        await message.react(EMOJIS.SUPPORT);
        await message.react(EMOJIS.UNVERIFIED);
      }
    }
    if (message.channel.id === CHANNELS.INFORMATIONS_EMS.CLASSEMENT) {
      // add reaction to message
      await message.react("👏");
    }
  });
};

export default AutoReactPlugin;
