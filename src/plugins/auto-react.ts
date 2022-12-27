import { Events } from "discord.js";
import CHANNELS from "../constants/channels";
import { DiscordPlugin } from "../types/plugin";

const AutoReactPlugin: DiscordPlugin = (client) => {
  client.on(Events.MessageCreate, (message) => {
    if (message.channel.id === CHANNELS.INFORMATIONS_EMS.ANNONCES) {
      message.react("893126048110227506");

      if (message.content.toLowerCase().includes("réunion")) {
        // add reaction to message
        message.react("893125779821576232");
      }
    }
  });
};

export default AutoReactPlugin;
