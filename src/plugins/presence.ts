import { ActivityType } from "discord.js";
import schedule from "node-schedule";

import CountController from "../controllers/count";
import { DiscordPlugin } from "../types/plugin";

const PresencePlugin: DiscordPlugin = async (client) => {
  // every 15 seconds
  schedule.scheduleJob("*/15 * * * * *", async () => {
    const count = (await CountController.getEMSCount()) || 0;
    await client.user?.setPresence({
      status: count > 0 ? "online" : "idle",
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
