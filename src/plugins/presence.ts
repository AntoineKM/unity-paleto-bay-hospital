import { ActivityType } from "discord.js";
import { DiscordPlugin } from "../types/plugin";
import schedule from "node-schedule";
import CountController from "../controllers/count";

const PresencePlugin: DiscordPlugin = async (client) => {
  // every 15 seconds
  schedule.scheduleJob("*/15 * * * * *", async () => {
    const count = (await CountController.getEMSCount()) || 0;
    await client.user?.setPresence({
      activities: [
        {
          name: `${count > 0 ? count : "aucun"} ems en service`,
          type: ActivityType.Watching,
        },
      ],
    });
  });
};

export default PresencePlugin;
