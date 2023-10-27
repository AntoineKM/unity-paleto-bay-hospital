import {
  ButtonInteraction,
  CacheType,
  ChannelType,
  ChatInputCommandInteraction,
  Colors,
  TextChannel,
  User,
} from "discord.js";

import APP from "../constants/app";
import CHANNELS from "../constants/channels";
import Warn from "../models/Warn";
import Log from "../utils/log";

class WarnController {
  public static baseEmbed = {
    title: "Avertissement",
    color: Colors.Red,
    footer: {
      text: APP.NAME,
      icon_url: APP.LOGO,
    },
  };

  public static async add(
    target: User,
    reason: string,
    moderator: User,
    interaction?:
      | ChatInputCommandInteraction<"cached">
      | ButtonInteraction<CacheType>,
  ) {
    await Warn.create({ userId: target.id, reason, createdAt: new Date() });

    const warns = await WarnController.get(target.id);

    if (interaction) {
      await interaction.reply({
        embeds: [
          {
            ...this.baseEmbed,
            description: `**${target}** a reçu un avertissement et à maintenant **${
              warns.length
            }** avertissement${warns.length > 1 ? "s" : ""}.\nRaison:\n ${warns
              .map((warn, i) => `${i + 1}. ${warn.reason}`)
              .join("\n")}`,
          },
        ],
        ephemeral: true,
      });
    }

    await target.client.guilds.fetch();
    // get the CHANNELS.ONRUNTIME.TEAM.INFORMATION.WARN channel
    const guilds = target.client.channels.cache;
    // dont use forEach because it's async and we need to wait for the result, so use map
    const channels = await Promise.all(
      guilds.map(async (guild) => {
        const channel = await guild.fetch();
        return channel;
      }),
    );
    // get the CHANNELS.ONRUNTIME.TEAM.INFORMATION.WARN channel
    const channel = channels.find(
      (channel) =>
        channel.id === CHANNELS.INFORMATIONS_EMS.AVERTISSEMENTS &&
        channel.type === ChannelType.GuildText,
    ) as TextChannel;

    const warnEmbed = {
      ...this.baseEmbed,
      description: `**${target}** a reçu un avertissement et à maintenant **${
        warns.length
      }** avertissement${warns.length > 1 ? "s" : ""}.\nRaison: *${reason}*`,
    };

    await channel.send({ embeds: [warnEmbed] });

    Log.info(
      `**${moderator.username}#${moderator.discriminator}** warned **${target.username}#${target.discriminator}** for "${reason}"`,
    );

    target
      .send({
        embeds: [
          {
            ...this.baseEmbed,
            description: `Vous avez été averti pour la raison suivante: **${reason}**\n*Si vous pensez que c'est une erreur ou pour en savoir plus sur la raison, merci de contacter un membre de la direction.*`,
          },
        ],
      })
      .catch((e) => Log.error(target, e));
  }

  public static async list(
    interaction?:
      | ChatInputCommandInteraction<"cached">
      | ButtonInteraction<CacheType>,
  ) {
    const warns = await Warn.find({});

    if (interaction) {
      await interaction.reply({
        embeds: [
          {
            ...this.baseEmbed,
            description: `**${warns.length}** avertissement${
              warns.length > 1 ? "s" : ""
            } ont été trouvés. Voici les avertissements actifs:\n\n
            ${warns
              .map(
                (warn, i) =>
                  `${i + 1}. **<@${warn.userId}>** - ${
                    warn.reason
                  } - <t:${Math.floor(warn.createdAt.getTime() / 1000)}:R>`,
              )
              .join("\n")}`,
          },
        ],
        ephemeral: true,
      });
    }
  }

  public static async remove(
    target: User,
    moderator: User,
    interaction?:
      | ChatInputCommandInteraction<"cached">
      | ButtonInteraction<CacheType>,
  ) {
    await Warn.deleteMany({ userId: target.id });

    if (interaction) {
      await interaction.reply({
        embeds: [
          {
            ...this.baseEmbed,
            description: `**${target}** a été réinitialisé.`,
          },
        ],
        ephemeral: true,
      });
    }

    Log.info(
      `**${moderator.username}#${moderator.discriminator}** à réinitialisé les avertissements de **${target.username}#${target.discriminator}**`,
    );

    target
      .send({
        embeds: [
          {
            ...this.baseEmbed,
            description: "Tous vos avertissements ont été réinitialisés.",
          },
        ],
      })
      .catch((e) => Log.error(target, e));
  }

  public static async resetAll() {
    Warn.deleteMany({});
  }

  public static async get(userId: string) {
    return await Warn.find({ userId });
  }
}

export default WarnController;
