import { DixtPluginJoinOptions } from "dixt-plugin-join";

import CHANNELS from "../constants/channels";

const dixtPluginJoinOptions: DixtPluginJoinOptions = {
  channel: CHANNELS.INFORMATIONS.ARRIVANTS,
  messages: {
    content: "🛬 **%member%** viens d'arriver !",
    line2: "Bienvenue à l'hopital de Paleto Bay",
    line3: "%memberCount% membres",
  },
  background: "https://i.goopics.net/y5cqpl.png",
};

export default dixtPluginJoinOptions;
