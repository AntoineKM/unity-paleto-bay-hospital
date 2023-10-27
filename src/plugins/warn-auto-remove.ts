import schedule from "node-schedule";

import ROLES from "../constants/roles";
import Warn from "../models/Warn";
import { DiscordPlugin } from "../types/plugin";
import { getMembersWithRole } from "../utils/discord";
import Log from "../utils/log";

const WarnAutoRemovePlugin: DiscordPlugin = (client) => {
  schedule.scheduleJob("* * * * *", async () => {
    //  find the warn list
    const warns = await Warn.find();
    // find members with emergency role
    const emergencyMembers = await getMembersWithRole(client, ROLES.EMERGENCY);
    // we want that if a member of the warn list doesn't have the emergency role, we remove it from the warn list
    // so we filter the warn list to keep only the members that have the emergency role
    const filteredWarns = warns.filter((warn) =>
      emergencyMembers.find((member) => member.id === warn.userId),
    );
    // we remove the members that have the emergency role from the warn list
    await Warn.deleteMany({
      userId: { $nin: filteredWarns.map((warn) => warn.userId) },
    });

    if (warns.length - filteredWarns.length > 0) {
      Log.info(
        `**${warns.length - filteredWarns.length}** avertissement${
          warns.length - filteredWarns.length > 1 ? "s" : ""
        } ont été supprimés.`,
      );
    }
  });
};

export default WarnAutoRemovePlugin;
