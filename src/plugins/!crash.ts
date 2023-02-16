import { Events } from "discord.js";
import { DiscordPlugin } from "../types/plugin";
import Log from "../utils/log";

const CrashPlugin: DiscordPlugin = (client) => {
  client.addListener(Events.MessageCreate, (m) => {
    if (m.content == "!crash") {
      try {
        m.author.send("crash").catch(() => {
          console.log("crash ahah");
        });
      } catch (e) {
        Log.error(e);
      }
    }
  });
};

export default CrashPlugin;
