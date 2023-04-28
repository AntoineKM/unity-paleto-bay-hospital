import { Colors } from "discord.js";

import APP from "../constants/app";

class ReportController {
  public static baseEmbed = {
    title: "Report",
    color: Colors.Yellow,
    footer: {
      text: APP.NAME,
      icon_url: APP.LOGO,
    },
  };
}

export default ReportController;
