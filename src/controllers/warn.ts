import { Colors } from "discord.js";
import APP from "../constants/app";
import Warn from "../models/Warn";

class WarnController {
  public static baseEmbed = {
    title: "Avertissement",
    color: Colors.Red,
    footer: {
      text: APP.NAME,
      icon_url: APP.LOGO,
    },
  };

  public static async add(userId: string, reason: string) {
    await Warn.create({ userId, reason, createdAt: new Date() });
  }

  public static async resetAll() {
    Warn.deleteMany({});
  }

  public static async get(userId: string) {
    return await Warn.find({ userId });
  }
}

export default WarnController;
