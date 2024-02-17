import { Colors } from "discord.js";
import schedule from "node-schedule";

import CHANNELS from "../constants/channels";
import ROLES from "../constants/roles";
import WorktimeController from "../controllers/worktime";
import Worktime from "../models/Worktime";
import WorktimeIgnoreReminder from "../models/WortimeIgnore";
import { DiscordPlugin } from "../types/plugin";
import Log from "../utils/log";

const WorktimeReminderPlugin: DiscordPlugin = (client) => {
  schedule.scheduleJob("*/10 * * * *", async () => {
    const members =
      await WorktimeController.getMembersInWorkVoiceChannel(client);
    const worktimeReminderIgnoreList = await WorktimeIgnoreReminder.find();
    await Promise.all(
      members.map(async (member) => {
        if (
          member.roles.cache.has(ROLES.EMERGENCY) &&
          !worktimeReminderIgnoreList.find((m) => m.userId === member.user.id)
        ) {
          const worktime = await Worktime.findOne({
            userId: member.user.id,
            endAt: null,
          });
          if (!worktime) {
            Log.info(
              `Sent reminder to ${member.user} for not starting worktime`,
            );
            try {
              member
                .send({
                  embeds: [
                    {
                      ...WorktimeController.baseEmbed,
                      color: Colors.Red,
                      description: `Vous semblez avoir oublié de pointer votre arrivée aujourd'hui (<#${CHANNELS.SERVICE.POINTEUSE}>)`,
                    },
                  ],
                })
                .catch((e) => Log.error(member, e));
            } catch (e) {
              Log.error(e);
            }
          }
        }
      }),
    );
  });

  schedule.scheduleJob("*/10 * * * *", async () => {
    const members =
      await WorktimeController.getMembersInWorkVoiceChannel(client);
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
      }),
    );
  });
};

export default WorktimeReminderPlugin;
