import { DixtPluginTwitchOptions } from "dixt-plugin-twitch";
import CHANNELS from "../constants/channels";
import ROLES from "../constants/roles";

const dixtPluginTwitchOptions: DixtPluginTwitchOptions = {
  channel: CHANNELS.INFORMATIONS.STREAMS,
  roles: [ROLES.EMERGENCY],
};

export default dixtPluginTwitchOptions;
