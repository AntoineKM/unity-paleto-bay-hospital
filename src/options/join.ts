import { DixtPluginJoinOptions } from "dixt-plugin-join";
import CHANNELS from "../constants/channels";

const dixtPluginJoinOptions: DixtPluginJoinOptions = {
  channel: CHANNELS.INFORMATIONS.ARRIVANTS,
  messages: {
    join: "🛬 %member% viens d'arriver !",
  },
};

export default dixtPluginJoinOptions;
