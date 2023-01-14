import {
  APIEmbed,
  ButtonStyle,
  Channel,
  ChannelType,
  Client,
  Collection,
  Colors,
  GuildChannel,
  GuildMember,
  Role,
  User,
} from "discord.js";
import APP from "../constants/app";
import Worktime from "../models/Worktime";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import fr from "dayjs/locale/fr";
import Log from "../utils/log";
import { workChannelNames } from "../constants/worktime";
import ROLES from "../constants/roles";
import QUOTAS from "../constants/quotas";
import progressIndicator from "../utils/progressIndicator";
import pad from "../utils/pad";
import * as sd from "simple-duration";
import CHANNELS from "../constants/channels";
import { getTextChannel } from "../utils/discord";
import ReportController from "./report";
import capitalize from "../utils/capitalize";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale(fr);

class WorktimeController {
  public static baseEmbed = {
    title: "Pointeuse",
    color: Colors.White,
    footer: {
      text: APP.NAME,
      icon_url: APP.LOGO,
    },
  };

  public static async initialize(channel: Channel): Promise<void> {
    if (channel?.type !== ChannelType.GuildText) return;

    const instructionEmbed = {
      ...this.baseEmbed,
      description:
        "Pointage des heures des membres de l'équipe.\n\n" +
        "**Prise de service**\n" +
        "Appuyez sur le bouton **Prise de service** pour pointer votre arrivée.\n\n" +
        "**Fin de service**\n" +
        "Appuyez sur le bouton **Fin de service** pour pointer votre départ.\n\n" +
        "**Attention**\n" +
        "Veillez à bien vous connecter à un salon vocal **Fréquence** pour que votre prise de service soit bien prise en compte.",
      footer: {
        text: `Merci à vous et bon courage - ${APP.NAME}`,
      },
    };

    const messages = await channel.messages.fetch();

    const messagesWithSameContent = messages.filter(
      (message) =>
        message.embeds[0]?.description === instructionEmbed.description &&
        message.embeds[0]?.title === instructionEmbed.title
    );

    if (messagesWithSameContent.size === 0) {
      await Promise.all(
        messages.map(async (message) => await message.delete())
      );

      await channel.send({
        embeds: [instructionEmbed],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: ButtonStyle.Primary,
                label: "✨ Prise de service",
                custom_id: "worktime_start",
              },
              {
                type: 2,
                style: ButtonStyle.Danger,
                label: "🚪 Fin de service",
                custom_id: "worktime_end",
              },
            ],
          },
        ],
      });
    }
  }

  public static async start(user: User): Promise<void> {
    const currentWorktime = await Worktime.findOne({
      userId: user.id,
      endAt: null,
    });

    if (currentWorktime) {
      user.send({
        embeds: [
          {
            ...this.baseEmbed,
            color: Colors.Red,
            description: `Vous avez déjà commencé votre service à ${dayjs(
              currentWorktime.startAt
            )
              .tz(APP.TIMEZONE)
              .format("HH:mm")}`,
          },
        ],
      });
      return;
    } else {
      await Worktime.create({
        startAt: new Date(),
        userId: user.id,
      });

      user.send({
        embeds: [
          {
            ...this.baseEmbed,
            color: Colors.Green,
            description: `Votre prise de service a été validée à ${dayjs()
              .tz(APP.TIMEZONE)
              .format("HH:mm")}`,
          },
        ],
      });
      Log.info(
        `✅ - Prise de service validée à ${dayjs()
          .tz(APP.TIMEZONE)
          .format("HH:mm")} par **${user.username}#${user.discriminator}**`
      );
    }
  }

  public static async end(user: User): Promise<void> {
    const currentWorktime = await Worktime.findOne({
      userId: user.id,
      endAt: null,
    });

    if (!currentWorktime) {
      await user.send({
        embeds: [
          {
            ...this.baseEmbed,
            color: Colors.Red,
            description: "Vous n'avez pas commencé votre service aujourd'hui",
          },
        ],
      });
      return;
    } else {
      currentWorktime.endAt = new Date();
      await currentWorktime.save();

      const worktimes = await Worktime.find({
        userId: user.id,
      });

      let totalWorktime = 0;
      worktimes.forEach((worktime) => {
        if (worktime.startAt && worktime.endAt) {
          totalWorktime +=
            worktime.endAt.getTime() - worktime.startAt.getTime();
        }
      });

      const degree = await this.getDegree(user);
      // convert totalWorktime to hours
      const totalWorktimeInHours = totalWorktime / 1000 / 60 / 60;
      // percentage of the totalWorktimeInHours compared to the quota
      const percentage = degree
        ? (totalWorktimeInHours / QUOTAS[degree.id]) * 100
        : 0;

      user.send({
        embeds: [
          {
            ...this.baseEmbed,
            color: Colors.Green,
            description: `Votre fin de service a été validée à ${dayjs()
              .tz(APP.TIMEZONE)
              .format("HH:mm")}\n\n**Temps de travail cette semaine:** ${pad(
              Math.floor(totalWorktime / 1000 / 60 / 60),
              2
            )}h${pad(
              Math.floor((totalWorktime / 1000 / 60) % 60),
              2
            )}\n**Progression:** ${
              degree
                ? progressIndicator(percentage)
                : "Vous n'avez pas de rôle d'employé, pensez à le demander."
            }`,
          },
        ],
      });

      Log.info(
        `✅ - Fin de service validée à ${dayjs()
          .tz(APP.TIMEZONE)
          .format("HH:mm")} par **${user.username}#${
          user.discriminator
        }** - ${pad(Math.floor(totalWorktime / 1000 / 60 / 60), 2)}h${pad(
          Math.floor((totalWorktime / 1000 / 60) % 60),
          2
        )}min - ${
          // percentage of total work based on totalWorktime and QUOTAS[getUserStatus(user)],
          degree
            ? progressIndicator(percentage)
            : "Vous n'avez pas de rôle d'employé, pensez à le demander."
        }`
      );

      // check if the current worktime is less than 30 minutes
      if (
        currentWorktime.endAt.getTime() - currentWorktime.startAt.getTime() <
        30 * 60 * 1000
      ) {
        const reportChannel = await getTextChannel(
          user.client,
          CHANNELS.DIRECTION.RAPPORTS
        );

        reportChannel.send({
          embeds: [
            {
              ...ReportController.baseEmbed,
              description: `${user} vient de faire un service de ${Math.floor(
                (currentWorktime.endAt.getTime() -
                  currentWorktime.startAt.getTime()) /
                  1000 /
                  60
              )} minutes voulez vous lui supprimer ?`,
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: ButtonStyle.Danger,
                  label: "Oui",
                  custom_id: `worktime_delete:${user.id}:${currentWorktime.id}`,
                },
                {
                  type: 2,
                  style: ButtonStyle.Secondary,
                  label: "Non",
                  custom_id: "report_cancel",
                },
              ],
            },
          ],
        });
      }
    }
  }

  public static async cancel(target: User, sender?: User): Promise<void> {
    const worktimes = await Worktime.find({
      userId: target.id,
      endAt: null,
    });

    if (worktimes.length > 0) {
      await Worktime.deleteMany({
        userId: target.id,
        endAt: null,
      });

      await target.send({
        embeds: [
          {
            ...this.baseEmbed,
            color: Colors.Red,
            description: "Votre prise de service a été annulée.",
          },
        ],
      });

      if (sender) {
        Log.info(
          `✅ - La prise de service de **${target.username}#${target.discriminator}** a été annulée par **${sender.username}#${sender.discriminator}**.`
        );
        await sender.send(
          `✅ - La prise de service de ${target.username} a été annulée.`
        );
      } else {
        Log.info(
          `✅ - La prise de service de **${target.username}#${target.discriminator}** a été annulée.`
        );
      }
    } else {
      if (sender) {
        await sender.send(
          `❌ - ${target.username} n'a pas de prise de service en cours.`
        );
      }
    }
  }

  public static async add(target: User, duration: string): Promise<void> {
    const durationInSeconds = sd.parse(duration);
    if (!durationInSeconds) return;

    await Worktime.create({
      userId: target.id,
      startAt: new Date(Date.now() - durationInSeconds * 1000),
      endAt: new Date(),
    });

    Log.info(
      `✅ - ${duration} ${
        durationInSeconds >= 0 ? "ajouté" : "retiré"
      } au temps de travail de **${target.username}#${target.discriminator}**.`
    );
  }

  public static async remove(target: User, duration: string): Promise<void> {
    await this.add(target, `-${duration}`);
  }

  public static async delete(target: User, worktimeId: string): Promise<void> {
    const worktime = await Worktime.findOne({
      _id: worktimeId,
    });

    if (worktime) {
      // await Worktime.deleteOne({
      //   userId: target.id,
      //   id: worktimeId,
      // });

      target.send({
        embeds: [
          {
            ...this.baseEmbed,
            color: Colors.Red,
            description:
              `Le service du ${dayjs(worktime.startAt)
                .tz(APP.TIMEZONE)
                .format(
                  "DD/MM/YYYY à HH:mm"
                )} a été supprimé.\n\nSi vous pensez que c'est une erreur veuillez contacter la direction.\n\n` +
              (await (
                await this.getInformationEmbed(target, true)
              ).description),
          },
        ],
      });

      Log.info(
        `✅ - Le service du ${dayjs(worktime.startAt)
          .tz(APP.TIMEZONE)
          .format("DD/MM/YYYY à HH:mm")} de **${target.username}#${
          target.discriminator
        }** a été supprimé.`
      );
    }
  }

  public static async isInWorkVoiceChannel(
    member: GuildMember
  ): Promise<boolean> {
    const { guild } = member;
    const channels = await guild.channels.fetch();
    if (!channels) return false;
    const workChannels = channels.filter((c) => {
      if (!c) return false;
      if (c.type !== ChannelType.GuildVoice) return false;
      if (workChannelNames.map((n) => c.name.includes(n)).includes(true)) {
        return true;
      }
      return false;
    }) as Collection<string, GuildChannel>;

    if (!workChannels) return false;

    const results = await Promise.all(
      workChannels.map(async (channel) => {
        if (!channel) return false;
        const members = channel.members as Collection<string, GuildMember>;
        const m = members.get(member.id);
        if (m) return true;
        return false;
      })
    );
    return results.includes(true);
  }

  public static async isWorking(user: User): Promise<boolean> {
    const worktimes = await Worktime.find({
      userId: user.id,
      endAt: null,
    });
    if (worktimes.length > 0) {
      return true;
    }
    return false;
  }

  public static async getMembersInWorkVoiceChannel(
    client: Client<boolean>
  ): Promise<GuildMember[]> {
    await client.guilds.fetch();
    const guilds = client.guilds.cache;
    const results: GuildMember[] = [];

    await Promise.all(
      guilds.map(async (guild) => {
        await guild.channels.fetch();
        const channels = guild.channels.cache;
        if (!channels) return;
        const workChannels = channels.filter(
          (channel) =>
            channel.type === ChannelType.GuildVoice &&
            workChannelNames.some((name) => channel.name.includes(name))
        );
        if (!workChannels) return;

        await Promise.all(
          workChannels.map(async (channel) => {
            const members = channel.members as Collection<string, GuildMember>;
            members.map((member) => {
              if (!results.includes(member)) results.push(member);
            });
          })
        );
      })
    );

    return results;
  }

  public static async getDegree(user: User): Promise<Role | null> {
    const { client } = user;
    await client.guilds.fetch();
    const guilds = client.guilds.cache;
    let result: Role | null = null;
    await Promise.all(
      guilds.map(async (guild) => {
        const member = await guild.members.fetch(user.id);
        if (!member) return;
        const roles = member.roles.cache;
        await user.client.guilds.fetch();
        if (roles.has(ROLES.EMERGENCY)) {
          if (roles.has(ROLES.DIRECTEUR)) {
            result = await guild.roles.fetch(ROLES.DIRECTEUR);
            return;
          }
          if (roles.has(ROLES.CO_DIRECTEUR)) {
            result = await guild.roles.fetch(ROLES.CO_DIRECTEUR);
            return;
          }
          if (roles.has(ROLES.CADRE_SANTE)) {
            result = await guild.roles.fetch(ROLES.CADRE_SANTE);
            return;
          }
          if (roles.has(ROLES.CHEF_DE_SERVICE)) {
            result = await guild.roles.fetch(ROLES.CHEF_DE_SERVICE);
            return;
          }
          if (roles.has(ROLES.MEDECIN_CHEF)) {
            result = await guild.roles.fetch(ROLES.MEDECIN_CHEF);
            return;
          }
          if (roles.has(ROLES.MEDECIN)) {
            result = await guild.roles.fetch(ROLES.MEDECIN);
            return;
          }
          if (roles.has(ROLES.INTERNE)) {
            result = await guild.roles.fetch(ROLES.INTERNE);
            return;
          }
          if (roles.has(ROLES.INFIRMIER)) {
            result = await guild.roles.fetch(ROLES.INFIRMIER);
            return;
          }
          if (roles.has(ROLES.AMBULANCIER)) {
            result = await guild.roles.fetch(ROLES.AMBULANCIER);
            return;
          }
          if (roles.has(ROLES.STAGIAIRE)) {
            result = await guild.roles.fetch(ROLES.STAGIAIRE);
            return;
          }
        }
      })
    );
    return result;
  }

  public static async getLeaderboardEmbed(): Promise<APIEmbed> {
    const now = new Date();
    const nowTimestamp = now.getTime();

    // get all worktimes
    const worktimes = await Worktime.find();

    // set endAt to now if it's null
    const endWorktimes = worktimes.map((worktime) => {
      if (!worktime.endAt) {
        worktime.endAt = now;
      }
      return worktime;
    });

    const firstWorktime = worktimes.sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    )[0];
    const firstWorktimeTimestamp = new Date(firstWorktime.startAt).getTime();

    // create a map with the total worktime of each user
    const worktimeMap = new Map<string, number>();
    // dont use forEach because it's async and we need to wait for the result, so use map
    await Promise.all(
      endWorktimes.map(async (worktime) => {
        const totalWorktime = worktimeMap.get(worktime.userId) || 0;
        worktimeMap.set(
          worktime.userId,
          totalWorktime + dayjs(worktime.endAt).diff(dayjs(worktime.startAt))
        );
      })
    );

    // sort the map by total worktime
    const sortedWorktimeMap = new Map(
      [...worktimeMap.entries()].sort((a, b) => b[1] - a[1])
    );

    // calculate additional statistics
    const statsWorktimesCount = worktimes.length;
    const statsWorktimesDuration = [...worktimeMap.values()].reduce(
      (a, b) => a + b,
      0
    );

    // create a map of the number of users working at each hour
    const hourMap = new Map<string, number>();
    endWorktimes.forEach((worktime) => {
      const hour = dayjs(worktime.startAt).format("HH");
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });

    // find the busiest and quietest hour
    const statsBusiestHour = `${pad(
      Number([...hourMap.entries()].sort((a, b) => b[1] - a[1])[0][0]),
      2
    )}h${pad(
      Number([...hourMap.entries()].sort((a, b) => b[1] - a[1])[0][1]),
      2
    )}`;
    const statsQuietestHour = `${pad(
      Number([...hourMap.entries()].sort((a, b) => a[1] - b[1])[0][0]),
      2
    )}h${pad(
      Number([...hourMap.entries()].sort((a, b) => a[1] - b[1])[0][1]),
      2
    )}`;

    // create a map of the number of users working on each day
    const dayMap = new Map<string, number>();
    endWorktimes.forEach((worktime) => {
      const day = dayjs(worktime.startAt).format("YYYY-MM-DD");
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
    });

    // find the busiest and quietest day
    const statsBusiestDay = dayjs(
      [...dayMap.entries()].sort((a, b) => b[1] - a[1])[0][0]
    ).format("dddd");
    const statsQuietestDay = dayjs(
      [...dayMap.entries()].sort((a, b) => a[1] - b[1])[0][0]
    ).format("dddd");

    const totalHours =
      (nowTimestamp - firstWorktimeTimestamp) / (1000 * 60 * 60);
    const totalUsers = new Set(worktimes.map((worktime) => worktime.userId))
      .size;
    const statsAverageUserCountPerHour = totalUsers / totalHours;

    const leaderboardEmbed: APIEmbed = {
      ...this.baseEmbed,
      title: "Classement",
      description:
        `Voici le classement des membres de l'équipe pour la semaine du ${dayjs()
          .subtract(1, "week")
          .format("DD/MM/YYYY")} au ${dayjs().format("DD/MM/YYYY")}\n\n` +
        [...sortedWorktimeMap.entries()]
          .map(
            ([userId, totalWorktime], index) =>
              `\`${pad(index + 1, 2)}. ${pad(
                Math.floor(totalWorktime / 1000 / 60 / 60),
                2
              )}h${pad(
                Math.floor((totalWorktime / 1000 / 60) % 60),
                2
              )}\` - <@${userId}>`
          )
          .join("\n") +
        "\n\n**Statistiques**",
      fields: [
        {
          name: "Nombre de prises de services",
          value: `${statsWorktimesCount}`,
          inline: true,
        },
        {
          name: "Temps total de travail",
          inline: true,
          value: `${pad(
            Math.floor(statsWorktimesDuration / 1000 / 60 / 60),
            2
          )}h${pad(Math.floor((statsWorktimesDuration / 1000 / 60) % 60), 2)}`,
        },
        {
          name: "Moyenne d'EMS par heure",
          inline: true,
          value: `${statsAverageUserCountPerHour.toFixed(2)}`,
        },
        {
          name: "Heure d'affluence",
          value: statsBusiestHour,
          inline: true,
        },
        {
          name: "Heure de carence",
          value: statsQuietestHour,
          inline: true,
        },
        {
          name: "Jour d'affluence",
          value: capitalize(statsBusiestDay),
          inline: true,
        },
        {
          name: "Jour de carence",
          value: capitalize(statsQuietestDay),
          inline: true,
        },
      ],
    };

    return leaderboardEmbed;
  }

  public static async getInformationEmbed(
    user: User,
    me = false
  ): Promise<APIEmbed> {
    const worktimes = await Worktime.find({
      userId: user.id,
    });

    if (!worktimes || worktimes.length === 0) {
      return {
        ...this.baseEmbed,
        color: worktimes.length > 0 ? this.baseEmbed.color : Colors.Red,
        title: `${this.baseEmbed.title} - Informations`,
        description: `${me ? "Vous" : `<@${user.id}>`} n'${
          me ? "avez" : "a"
        } pas encore pris de service.`,
      };
    }

    const totalWorktime = worktimes.reduce(
      (total, worktime) =>
        total +
        (worktime.endAt
          ? worktime.endAt.getTime() - worktime.startAt.getTime()
          : Date.now() - worktime.startAt.getTime()),
      0
    );
    const lastStartWorktime = worktimes[worktimes.length - 1].startAt;
    const lastEndWorktime = worktimes[worktimes.length - 1].endAt;
    const currentlyWorking = !worktimes[worktimes.length - 1].endAt;

    const degree = await WorktimeController.getDegree(user);
    const totalWorktimeInHours = totalWorktime / 1000 / 60 / 60;
    const percentage = degree
      ? (totalWorktimeInHours / QUOTAS[degree.id]) * 100
      : 0;

    const informationEmbed: APIEmbed = {
      ...this.baseEmbed,
      color: worktimes.length > 0 ? this.baseEmbed.color : Colors.Red,
      title: `${this.baseEmbed.title} - Informations`,
      description: `Voici les informations concernant ${
        me ? "votre profil" : `<@${user.id}>`
      }\n\n**Dernière prise de service**\n${dayjs(lastStartWorktime).format(
        "DD/MM/YYYY à HH:mm"
      )}\n\n**Dernière fin de service**\n${
        currentlyWorking
          ? "En cours"
          : dayjs(lastEndWorktime).format("DD/MM/YYYY à HH:mm")
      }\n\n**Temps de travail cette semaine**\n${pad(
        Math.floor(totalWorktime / 1000 / 60 / 60),
        2
      )}h${pad(
        Math.floor((totalWorktime / 1000 / 60) % 60),
        2
      )}\n\n**Progression**\n${
        degree
          ? progressIndicator(percentage)
          : "Vous n'avez pas de rôle d'employé, pensez à le demander."
      }`,
    };

    return informationEmbed;
  }
}

export default WorktimeController;
