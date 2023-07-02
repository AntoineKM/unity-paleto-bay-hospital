import { DixtPluginReactOptions } from "dixt-plugin-react";

import CHANNELS from "../constants/channels";
import EMOJIS from "../constants/emojis";

const dixtPluginReactOptions: DixtPluginReactOptions = {
  channels: [
    {
      id: CHANNELS.INFORMATIONS_EMS.ANNONCES,
      emoji: EMOJIS.VERIFIED,
    },
    {
      id: CHANNELS.INFORMATIONS_EMS.ANNONCES,
      emoji: EMOJIS.SUPPORT,
      matchs: ["réunion"],
    },
    {
      id: CHANNELS.INFORMATIONS_EMS.ANNONCES,
      emoji: EMOJIS.UNVERIFIED,
      matchs: ["réunion", "besoin"],
    },
    {
      id: CHANNELS.INFORMATIONS_EMS.CLASSEMENT,
      emoji: "👏",
    },
    {
      id: CHANNELS.DIRECTION.TACHES,
      emoji: EMOJIS.VERIFIED,
    },
    {
      id: CHANNELS.INFORMATIONS.ANNONCES,
      emoji: EMOJIS.VERIFIED,
    },
    {
      id: CHANNELS.SALLE_DE_PAUSE.CR_REUNION,
      emoji: EMOJIS.VERIFIED,
    },
  ],
};

export default dixtPluginReactOptions;
