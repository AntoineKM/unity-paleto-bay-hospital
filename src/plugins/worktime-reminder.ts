import schedule from "node-schedule";
import { DiscordPlugin } from "../types/plugin";
import Worktime from "../models/Worktime";
import WorktimeController from "../controllers/worktime";
import CHANNELS from "../constants/channels";
import ROLES from "../constants/roles";
import Log from "../utils/log";

const WorktimeReminderPlugin: DiscordPlugin = (client) => {
  schedule.scheduleJob("*/10 * * * *", async () => {
    const members = await WorktimeController.getMembersInWorkVoiceChannel(
      client
    );
    await Promise.all(
      members.map(async (member) => {
        if (member.roles.cache.has(ROLES.EMERGENCY)) {
          const worktime = await Worktime.findOne({
            userId: member.user.id,
            endAt: null,
          });
          if (!worktime) {
            Log.info(
              `Sent reminder to ${member.user.username}#${member.user.discriminator} for not starting worktime`
            );
            await member.send(
              `❌ - Vous semblez avoir oublié de pointer votre arrivée aujourd'hui (<#${CHANNELS.SERVICE.POINTEUSE}>).`
            );
          }
        }
      })
    );
  });

  schedule.scheduleJob("*/10 * * * *", async () => {
    const members = await WorktimeController.getMembersInWorkVoiceChannel(
      client
    );
    const membersId = members.map((member) => member.user.id);
    const worktimes = await Worktime.find({
      endAt: null,
    });
    await Promise.all(
      worktimes.map(async (worktime) => {
        if (!membersId.includes(worktime.userId)) {
          const user = await client.users.fetch(worktime.userId);
          if (!user) return;
          await WorktimeController.end(user);
        }
      })
    );
  });
};

export default WorktimeReminderPlugin;
