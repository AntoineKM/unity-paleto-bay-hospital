import { ChartOptions, ChartData } from "chart.js";
import ChartJsImage from "chartjs-to-image";
import dayjs from "dayjs";
import fr from "dayjs/locale/fr";
import customParseFormat from "dayjs/plugin/customParseFormat";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
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
  StageChannel,
  User,
  VoiceChannel,
} from "discord.js";
import * as sd from "simple-duration";

import ReportController from "./report";
import APP from "../constants/app";
import CHANNELS from "../constants/channels";
import QUOTAS from "../constants/quotas";
import ROLES from "../constants/roles";
import { workChannelNames } from "../constants/worktime";
import Worktime from "../models/Worktime";
import capitalize from "../utils/capitalize";
import { getMembersWithRole, getTextChannel } from "../utils/discord";
import Log from "../utils/log";
import pad from "../utils/pad";
import progressIndicator from "../utils/progressIndicator";

dayjs.extend(customParseFormat);
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
        icon_url: APP.LOGO,
      },
    };

    const messages = await channel.messages.fetch();

    const messagesWithSameContent = messages.filter(
      (message) =>
        message.embeds[0]?.description === instructionEmbed.description &&
        message.embeds[0]?.title === instructionEmbed.title,
    );

    if (messagesWithSameContent.size === 0) {
      await Promise.all(
        messages.map(async (message) => await message.delete()),
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

  public static async start(user: User): Promise<APIEmbed> {
    const currentWorktime = await Worktime.findOne({
      userId: user.id,
      endAt: null,
    });

    let embed: APIEmbed = {
      ...this.baseEmbed,
    };

    if (currentWorktime) {
      embed = {
        ...this.baseEmbed,
        color: Colors.Red,
        description: `Vous avez déjà commencé votre service à <t:${Math.floor(
          currentWorktime.startAt.getTime() / 1000,
        )}:t>`,
      };

      user
        .send({
          embeds: [embed],
        })
        .catch((e) => Log.error(user, e));
    } else {
      await Worktime.create({
        startAt: new Date(),
        userId: user.id,
      });

      embed = {
        ...this.baseEmbed,
        color: Colors.Green,
        description: `Votre prise de service a été validée à <t:${Math.floor(
          Date.now() / 1000,
        )}:t>`,
      };

      user
        .send({
          embeds: [embed],
        })
        .catch((e) => Log.error(user, e));

      Log.info(
        `✅ - Prise de service validée à <t:${Math.floor(
          Date.now() / 1000,
        )}:t> par ${user}`,
      );
    }

    return embed;
  }

  public static async end(user: User): Promise<APIEmbed> {
    const currentWorktime = await Worktime.findOne({
      userId: user.id,
      endAt: null,
    });

    let embed: APIEmbed = {
      ...this.baseEmbed,
    };

    if (!currentWorktime) {
      embed = {
        ...this.baseEmbed,
        color: Colors.Red,
        description: "Vous n'avez pas commencé votre service aujourd'hui",
      };
      user
        .send({
          embeds: [embed],
        })
        .catch((e) => Log.error(user, e));
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

      embed = {
        ...this.baseEmbed,
        color: Colors.Green,
        description: `Votre fin de service a été validée à <t:${Math.floor(
          Date.now() / 1000,
        )}:t>\n\n**Temps de travail cette semaine:** ${pad(
          Math.floor(totalWorktime / 1000 / 60 / 60),
          2,
        )}h${pad(
          Math.floor((totalWorktime / 1000 / 60) % 60),
          2,
        )}\n**Progression:** ${
          degree
            ? progressIndicator(percentage)
            : "Vous n'avez pas de rôle d'employé, pensez à le demander."
        }`,
      };

      user
        .send({
          embeds: [embed],
        })
        .catch((e) => Log.error(user, e));

      Log.info(
        `✅ - Fin de service validée à <t:${Math.floor(
          Date.now() / 1000,
        )}:t> par ${user} - ${pad(
          Math.floor(totalWorktime / 1000 / 60 / 60),
          2,
        )}h${pad(Math.floor((totalWorktime / 1000 / 60) % 60), 2)}min - ${
          // percentage of total work based on totalWorktime and QUOTAS[getUserStatus(user)],
          degree
            ? progressIndicator(percentage)
            : "Vous n'avez pas de rôle d'employé, pensez à le demander."
        }`,
      );

      // check if the current worktime is less than 30 minutes
      if (
        currentWorktime.endAt.getTime() - currentWorktime.startAt.getTime() <
        30 * 60 * 1000
      ) {
        const reportChannel = await getTextChannel(
          user.client,
          CHANNELS.DIRECTION.REPORTS,
        );

        reportChannel.send({
          embeds: [
            {
              ...ReportController.baseEmbed,
              description: `${user} vient de faire un service de ${Math.floor(
                (currentWorktime.endAt.getTime() -
                  currentWorktime.startAt.getTime()) /
                  1000 /
                  60,
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

    return embed;
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

      target
        .send({
          embeds: [
            {
              ...this.baseEmbed,
              color: Colors.Red,
              description: "Votre prise de service a été annulée.",
            },
          ],
        })
        .catch((e) => Log.error(target, e));

      if (sender) {
        Log.info(
          `✅ - La prise de service de ${target} a été annulée par ${sender}.`,
        );
        sender
          .send(`✅ - La prise de service de ${target.username} a été annulée.`)
          .catch((e) => Log.error(sender, e));
      } else {
        Log.info(`✅ - La prise de service de ${target} a été annulée.`);
      }
    } else {
      if (sender) {
        sender
          .send(`❌ - ${target.username} n'a pas de prise de service en cours.`)
          .catch((e) => Log.error(sender, e));
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
      } au temps de travail de ${target}.`,
    );
  }

  public static async remove(target: User, duration: string): Promise<void> {
    await this.add(target, `-${duration}`);
  }

  public static async delete(target: User, worktimeId: string): Promise<void> {
    const worktime = await Worktime.findOne({
      _id: worktimeId,
    });

    if (worktime && worktime.endAt) {
      await Worktime.deleteOne({
        _id: worktimeId,
      });

      target
        .send({
          embeds: [
            {
              ...this.baseEmbed,
              color: Colors.Red,
              description:
                `Le service du <t:${Math.floor(
                  worktime.startAt.getTime() / 1000,
                )}:f>
                 (${Math.floor(
                   (worktime.endAt.getTime() - worktime.startAt.getTime()) /
                     1000 /
                     60,
                 )} min) a été supprimé.\n\nSi vous pensez que c'est une erreur veuillez contacter la direction.\n\n` +
                (await (
                  await this.getInformationEmbed(target, true)
                ).description),
            },
          ],
        })
        .catch((e) => Log.error(target, e));

      Log.info(
        `✅ - Le service du ${dayjs(worktime.startAt).format(
          "DD/MM/YYYY à HH:mm",
        )} de ${target} a été supprimé.`,
      );
    }
  }

  public static async isInWorkVoiceChannel(
    member: GuildMember,
  ): Promise<boolean> {
    const { guild } = member;
    const channels = await guild.channels.fetch();
    if (!channels) return false;
    const workChannels = channels.filter((c) => {
      if (!c) return false;
      if (
        c.type !== ChannelType.GuildVoice &&
        c.type !== ChannelType.GuildStageVoice
      )
        return false;
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
      }),
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
    client: Client<boolean>,
  ): Promise<GuildMember[]> {
    await client.guilds.fetch();
    const guilds = client.guilds.cache;
    const results: GuildMember[] = [];

    await Promise.all(
      guilds.map(async (guild) => {
        const channels = await guild.channels.fetch();

        if (channels instanceof Collection) {
          const workChannels = channels.filter(
            (channel) =>
              (channel?.type === ChannelType.GuildVoice ||
                channel?.type === ChannelType.GuildStageVoice) &&
              workChannelNames.some((name) => channel?.name.includes(name)),
          );

          await Promise.all(
            workChannels.map(async (channel) => {
              if (
                channel instanceof VoiceChannel ||
                channel instanceof StageChannel
              ) {
                const members = channel.members;
                members.map((member) => {
                  if (!results.includes(member)) results.push(member);
                });
              }
            }),
          );
        }
      }),
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
          if (roles.has(ROLES.RESIDENT)) {
            result = await guild.roles.fetch(ROLES.RESIDENT);
            return;
          }
          if (roles.has(ROLES.MEDECIN)) {
            result = await guild.roles.fetch(ROLES.MEDECIN);
            return;
          }
          if (roles.has(ROLES.ASSITANT_MEDECIN)) {
            result = await guild.roles.fetch(ROLES.ASSITANT_MEDECIN);
            return;
          }
          if (roles.has(ROLES.CLINICIEN)) {
            result = await guild.roles.fetch(ROLES.CLINICIEN);
            return;
          }
          if (roles.has(ROLES.INTERNE)) {
            result = await guild.roles.fetch(ROLES.INTERNE);
            return;
          }
          if (roles.has(ROLES.EXTERNE)) {
            result = await guild.roles.fetch(ROLES.EXTERNE);
            return;
          }
          if (roles.has(ROLES.INFIRMIER)) {
            result = await guild.roles.fetch(ROLES.INFIRMIER);
            return;
          }
          if (roles.has(ROLES.PRATICIEN)) {
            result = await guild.roles.fetch(ROLES.PRATICIEN);
            return;
          }
          if (roles.has(ROLES.AMBULANCIER)) {
            result = await guild.roles.fetch(ROLES.AMBULANCIER);
            return;
          }
          if (roles.has(ROLES.SECOURISTE)) {
            result = await guild.roles.fetch(ROLES.SECOURISTE);
            return;
          }
          if (roles.has(ROLES.STAGIAIRE)) {
            result = await guild.roles.fetch(ROLES.STAGIAIRE);
          }
        }
      }),
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
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
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
          totalWorktime + dayjs(worktime.endAt).diff(dayjs(worktime.startAt)),
        );
      }),
    );

    // sort the map by total worktime
    const sortedWorktimeMap = new Map(
      [...worktimeMap.entries()].sort((a, b) => b[1] - a[1]),
    );

    // calculate additional statistics
    const statsWorktimesCount = worktimes.length;
    const statsWorktimesDuration = [...worktimeMap.values()].reduce(
      (a, b) => a + b,
      0,
    );

    // create a map of the number of users working at each hour
    const hourMap = new Map<string, number>();
    endWorktimes.forEach((worktime) => {
      const startHour = dayjs(worktime.startAt).hour();
      const endHour = worktime.endAt
        ? dayjs(worktime.endAt).hour()
        : dayjs().hour();
      for (let i = startHour; i < endHour; i++) {
        hourMap.set(i.toString(), (hourMap.get(i.toString()) || 0) + 1);
      }
    });

    // find the busiest and quietest hour
    const statsBusiestHour = dayjs(
      `1970-01-01T${
        [...hourMap.entries()].sort((a, b) => b[1] - a[1])[0][0]
      }:00.000`,
    ).format("HH:mm");
    const statsQuietestHour = dayjs(
      `1970-01-01T${
        [...hourMap.entries()].sort((a, b) => a[1] - b[1])[0][0]
      }:00.000`,
    ).format("HH:mm");

    // create a map of the number of users working on each day
    const dayMap = new Map<string, number>();
    endWorktimes.forEach((worktime) => {
      const day = dayjs(worktime.startAt).format("YYYY-MM-DD");
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
    });

    // find the busiest and quietest day
    const statsBusiestDay = dayjs(
      [...dayMap.entries()].sort((a, b) => b[1] - a[1])[0][0],
    ).format("dddd");
    const statsQuietestDay = dayjs(
      [...dayMap.entries()].sort((a, b) => a[1] - b[1])[0][0],
    ).format("dddd");

    const totalHours =
      (nowTimestamp - firstWorktimeTimestamp) / (1000 * 60 * 60);
    const totalUsers = [...sortedWorktimeMap.keys()].length;
    const statsAverageUserCountPerHour = totalHours / totalUsers;

    const dayAndHourMap = new Map<string, number>();
    endWorktimes.forEach((worktime) => {
      for (
        let i =
          Math.floor(new Date(worktime.startAt).getTime() / (3600 * 1000)) *
          3600 *
          1000;
        i <= new Date(worktime.endAt as Date).getTime();
        i += 3600 * 1000
      ) {
        const dayAndHour = dayjs(i).format("DD/MM/YYYY HH");
        dayAndHourMap.set(dayAndHour, (dayAndHourMap.get(dayAndHour) || 0) + 1);
      }
    });

    const chart = new ChartJsImage();
    const labels: string[] = [];
    for (
      let i = Math.floor(firstWorktimeTimestamp / (3600 * 1000)) * 3600 * 1000;
      i <= nowTimestamp;
      i += 3600 * 1000
    ) {
      labels.push(dayjs(i).format("DD/MM/YYYY HH"));
    }
    const chartData: ChartData = {
      // 7 days and 24 hours
      labels,
      datasets: [
        {
          label: "EMS par heure",
          data: labels.map((label) => {
            return dayAndHourMap.get(label) || 0;
          }),
          borderColor: "rgb(88, 101, 242)",
          tension: 0.8,
          fill: false,
          pointRadius: 0,
          backgroundColor: "rgba(88, 101, 242, 0.2)",
        },
        {
          label: "Moyenne d'EMS par heure",
          data: labels.map(() => statsAverageUserCountPerHour),
          borderColor: "rgb(235, 69, 158)",
          pointRadius: 0,
        },
      ],
    };
    const chartOptions: ChartOptions = {
      color: "white",
      borderColor: "white",
      // disable legend and enable title
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "EMS par heure",
          color: "white",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "white",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
        x: {
          ticks: {
            color: "white",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
        },
      },
    };
    const chartConfig = {
      type: "line",
      data: chartData,
      options: chartOptions,
    };
    chart.setConfig(chartConfig);
    chart.setBackgroundColor("rgb(47, 49, 54)");
    chart.setChartJsVersion("4");

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
                2,
              )}h${pad(
                Math.floor((totalWorktime / 1000 / 60) % 60),
                2,
              )}\` - <@${userId}>`,
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
            2,
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
      image: {
        url: await chart.getShortUrl(),
      },
    };

    return leaderboardEmbed;
  }

  public static async getInformationEmbed(
    user: User,
    me = false,
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
      0,
    );
    const lastStartWorktime = worktimes[worktimes.length - 1].startAt;
    const lastEndWorktime = worktimes[worktimes.length - 1].endAt!;
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
      }\n\n**Dernière prise de service**\n<t:${Math.floor(
        lastStartWorktime.getTime() / 1000,
      )}:f>\n\n**Dernière fin de service**\n${
        currentlyWorking
          ? "En cours"
          : `<t:${Math.floor(lastEndWorktime.getTime() / 1000)}:f>`
      }\n\n**Temps de travail cette semaine**\n${pad(
        Math.floor(totalWorktime / 1000 / 60 / 60),
        2,
      )}h${pad(
        Math.floor((totalWorktime / 1000 / 60) % 60),
        2,
      )}\n\n**Progression**\n${
        degree
          ? progressIndicator(percentage)
          : "Vous n'avez pas de rôle d'employé, pensez à le demander."
      }`,
    };

    return informationEmbed;
  }

  // list of users absent for the last x days
  public static async getAbsentees(
    client: Client,
    days = 2,
  ): Promise<GuildMember[] | null> {
    const members = await getMembersWithRole(client, ROLES.EMERGENCY);

    const interims = await getMembersWithRole(client, ROLES.INTERIMAIRE);

    const membersWithoutInterims = members.filter((member) => {
      return !interims.find((interim) => interim.id === member.id);
    });

    const absentees = await Promise.all(
      membersWithoutInterims.map(async (member) => {
        const lastWorktime = await Worktime.findOne({
          userId: member.id,
        }).sort({
          startAt: -1,
        });

        if (!lastWorktime) {
          return member;
        }

        const lastWorktimeDate = lastWorktime.startAt;
        const lastWorktimeDaysAgo = dayjs().diff(lastWorktimeDate, "day");

        if (lastWorktimeDaysAgo >= days) {
          return member;
        }

        return null;
      }),
    );

    const result = absentees.filter(
      (member) => member !== null,
    ) as GuildMember[];

    return result;
  }
}

export default WorktimeController;
