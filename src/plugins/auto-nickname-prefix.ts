import { Events } from "discord.js";
import ROLES, { ROLES_PREFIX } from "../constants/roles";
import { DiscordPlugin } from "../types/plugin";
import reduceString from "../utils/reduceString";

const AutoNicknamePrefix: DiscordPlugin = (client) => {
  client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    if (oldMember.roles.cache.size === newMember.roles.cache.size) return;
    if (newMember.user.bot) return;

    // if the member get the role stagiaire he need to be rename <nickname> to [ROLES_PREFIX[ROLES.STAGIAIRE]] <nickname>

    // get his highest role
    const roles = newMember.roles.cache;
    if (roles.size === 0) return;
    // check if ROLES contain the roles[0].id else check if it contains the roles[1].id, etc...
    const highestRole = roles
      .sort((a, b) => b.position - a.position)
      .find((role) => {
        return Object.values(ROLES).includes(role.id);
      });
    const highestRoleKey = Object.keys(ROLES).find(
      (key) => ROLES[key] === highestRole?.id
    );
    if (!highestRole || !highestRoleKey) return;
    const rolePrefix =
      ROLES_PREFIX[highestRoleKey as keyof typeof ROLES_PREFIX];
    if (!rolePrefix) return;
    const name = newMember.nickname || newMember.user.username;
    if (!name.includes("[") && !name.includes("]")) {
      await newMember.setNickname(reduceString(`[${rolePrefix}] ${name}`, 30));
    } else {
      const newName = name.replace(/\[.*\]/, `[${rolePrefix}]`);
      await newMember.setNickname(reduceString(newName, 30));
    }
  });
};

export default AutoNicknamePrefix;
